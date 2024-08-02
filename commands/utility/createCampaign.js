import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from "discord.js";
import { mongo_client } from './../../app.js';

// Template of objects:
// interface User look up https://discord.js.org/docs/packages/discord.js/14.14.1/User:Class
// interface Campaign {
//     _id:ObjectId,
//     name: string,
//     elements: {
//         dm: User,
//         players: Array<User>
//     }
// }

// Util to localize responses
const locales = {
    it: {
        'already_exists': 'Il nome selezionato esiste già',
        'created_success': 'La campagna è stata creata correttamente',
        'Newbie':'Sei di livello troppo basso per creare una campagna!',
        'Paladin_already':'Hai già una campagna! Sali di livello per poterne creare delle altre!',
    },
};
// Util function
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    const hex_color = (r << 16) + (g << 8) + b;

    return hex_color;
}

export default {
    'data': new SlashCommandBuilder()
        .setName('create_campaign')
        .setNameLocalizations({
            it:'crea_campagna',
        })
        .setDescription('Create your DND campaign!')
        .setDescriptionLocalizations({
            it:'Crea la tua campagna di DND!',
        })
        .addStringOption(option =>
            option.setName('name')
            .setNameLocalizations({
                it:'nome',
            })
            .setDescription('Name of your campaign')
            .setDescriptionLocalizations({
                it:'Nome della tua campagna'
            })
            .setRequired(true)
        ),
    async execute(interaction) {
        interaction.deferReply();
        // Can create no campaign
        if (interaction.member.roles.cache.some(r => r.name === 'Newbie'))  {
            interaction.editReply({content:locales[interaction.locale]['Newbie'] ?? 'You are too low level to create a campaign!', ephemeral: false});
            return;
        }
        // Can create only one
        if (interaction.member.cache.some(r => r.name === 'Paladino del Sole'))   {
            try {
                await mongo_client.connect();
                let campaigns = mongo_client.db(process.env.MONGO_DB_NAME).collection(process.env.MONGO_COLLECTION_NAME);
                    
                console.log('[INFO] - Checking permission to create a campaign');
                // TODO: Check if it works otherwise, elements.dm
                const res = await campaigns.findOne({dm: interaction.user}).then(async function (result) {
                    if (!result)    {
                        interaction.editReply({content:locales[interaction.locale]['Paladin_already'] ?? 'You are too low level to create a campaign!', ephemeral: false});
                        return false;
                    } else {
                        return true;
                    }
                });
                if (!res)    {
                    return;
                }
            } catch (error) {
                console.error(error);
                interaction.editReply({content: 'An error has occurred', ephemeral: false});
            }
        }
        try {
            // Connect the client to the server	(optional starting in v4.7)
            await mongo_client.connect();
            let campaigns = mongo_client.db(process.env.MONGO_DB_NAME).collection(process.env.MONGO_COLLECTION_NAME);
            const c_n = interaction.options.get('name').value;
            const guild = await interaction?.guild;
            console.log('[INFO] - Trying to fetch a campaign');
            console.log(`[INFO] - GUILD : ${interaction?.guild}`);
            await campaigns.findOne({name:c_n}).then(async function (result) {  
                if (result) {
                    interaction.editReply({
                        content:locales[interaction.locale]['already_exists'] ?? 'The name selected already exists',
                        ephemeral: true,
                    });
                    console.log('[WARNING] - Campaign already existing');
                } else {
                    // Inserting the campaign in the db (initialized with only the dm, the one who create the campaign and no players. They need to be added later)
                    console.log('[INFO] - Trying to create a new Campaign');
                    await campaigns.insertOne({
                        name:c_n,
                        elements: {
                            dm: interaction.user,
                            players: []
                        },
                    });
                    // Creation of custom roles for the campaign
                    console.log(`[INFO : ${guild.name}] - Starting to create roles`);
                    const role_dm = await guild.roles.create({
                        name: `${c_n}_DM`,
                        color: getRandomColor(),
                        permissions: PermissionFlagsBits.ViewChannel | PermissionFlagsBits.MuteMembers,
                    });
                    const role_pl = await guild.roles.create({
                        name: `${c_n}_Player`,
                        color: getRandomColor(),
                        permissions: PermissionFlagsBits.ViewChannel,
                    });
                    // Creation of the custom category and attached channels
                    console.log(`[INFO : ${guild.name}] - Starting to create channels`);
                    const category = await guild.channels.create({
                        name: c_n,
                        type: ChannelType.GuildCategory,
                    });
                    await category.permissionOverwrites.create(role_dm, {
                        ViewChannel: true,
                        MuteMembers: true,
                    });
                    await category.permissionOverwrites.create(role_pl, {
                        ViewChannel: true,
                    });
                    console.log(`[INFO : ${guild.name}] - Roles created and deployed`);
                    interaction?.member.roles.add(guild.roles.cache.find(role => role.name === `${c_n}_DM`));
                    console.log(`[INFO : ${guild.name}] - DM Role assigned`);
                    await guild.channels.create({
                        name: `${c_n}_vocal`,
                        type: ChannelType.GuildStageVoice,
                        parent: category,
                    });
                    await guild.channels.create({
                        name: `${c_n}_text`,
                        type: ChannelType.GuildText,
                        parent: category,
                    });
                    await guild.channels.create({
                        name: `${c_n}_meme`,
                        type: ChannelType.GuildText,
                        parent: category,
                    });
                    await guild.channels.create({
                        name: `${c_n}_organize`,
                        type: ChannelType.GuildText,
                        parent: category,
                    });
                    console.log(`[INFO : ${guild.name}] - Channels created`);

                    interaction.editReply({
                        content:locales[interaction.locale]['created_success'] ?? 'Campaign created successfully',
                        ephemeral: false,
                    });
                    console.log('[INFO] - Campaign succesfully created');
                }
            });
        } catch (error) {
            console.error(`[CreateCampaign] An error has occurred:\n${error}`);
            interaction.editReply('[Mongo Connection] Connection closed due to an error');
        } finally {
            // Ensures that the client will close when you finish/error
            await mongo_client.close();
            console.log(`[Mongo Connection] Connection closed`);
        }
    }
};