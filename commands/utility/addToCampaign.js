import { SlashCommandBuilder } from "discord.js";
import { mongo_client } from "../../app.js";

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
const locales = {
    it: {
        'user_added': 'L\'utente è stato inserito nella campagna',
        'user_alreafy': `L'utente ${interaction.options.get('user')} è già stato inserito!`,
    }
};
export default {
    'data': new SlashCommandBuilder()
        .setName('add')
        .setNameLocalizations({
            it:'aggiungi',
        })
        .setDescription('Add a user to your campaign')
        .setDescriptionLocalizations({
            it:'Aggiungi un utente alla tua campagna',
        })
        .addStringOption(option => {
            return option.setName('name')
            .setNameLocalizations({
                it:'nome',
            })
            .setDescription('Name of your campaign')
            .setDescriptionLocalizations({
                it:'Nome della tua campagna',
            })
            .setRequired(true);
        })
        .addUserOption(option => {
            return option.setName('user')
            .setNameLocalizations({
                it:'utente',
            })
            .setDescription('User to add')
            .setDescriptionLocalizations({
                it:'Utente da aggiungere',
            })
            .setRequired(true);
        }),
        async execute(interaction) {
            interaction.deferReply();
            await mongo_client.connect();
            let campaigns = mongo_client.db(process.env.MONGO_DB_NAME).collection(process.env.MONGO_COLLECTION_NAME);
            let c_n = interaction.options.get('name');
            console.log('[INFO] - Trying to add a user to a campaign');
            let re = await campaigns.findOne({name:c_n}, async (result) => {
                console.log('[INFO] - Finding a campaign');                
                if (result) {
                    let n = result;
                    n['elements']['players'].push(interaction.options.get('user'));
                    interaction?.member.roles.add(guild.roles.cache.find(role => role.name === `${c_n}_Player`));
                    console.log(`[INFO : ${guild.name}] - Player Role assigned`);
                    await campaigns.updateOne({name:cn}, n);
                    interaction.editReply({
                        content: locales[interaction.locale]['user_added'] ?? 'User was added to the campaign',
                        ephemeral: false,
                    });
                } else {
                    interaction.editReply({
                        content: locales[interaction.locale]['user_already'] ?? `User ${interaction.option.get('user')} was already added!`,
                        ephemeral: false,
                    });
                }
            });
            console.log('[INFO] - A user was added to a campaign');
        }
};