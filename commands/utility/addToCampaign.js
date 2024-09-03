import { SlashCommandBuilder } from "discord.js";
import { mongo_client } from "../../app.js";

const locales = {
    it: {
        'user_added': 'L\'utente è stato inserito nella campagna',
        'user_already': 'L\'utente è già stato inserito!',
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
        let c_n = interaction.options.get('name').value;
        console.log('[INFO] - Trying to add a user to a campaign');
        await campaigns.findOne({name:c_n}).then(async function (result) {
            console.log('[INFO] - Finding a campaign');
            const guild = await interaction?.guild;
            if (result) {
                // TODO: Check on user's roles return error if already with role
                await guild.roles.fetch();
                let member = await guild.members.fetch(interaction.options.get('user').value);
                member.roles.add(guild.roles.cache.find(role => role.name === `${c_n}_Player`));
                console.log(`[INFO : ${guild.name}] - Player Role assigned`);
                await campaigns.updateOne({name:c_n}, {$push: {'players':interaction.options.get('user').value}});
                // TODO: Add user's name to the reply?
                interaction.editReply({
                    content: locales[interaction.locale]['user_added'] ?? 'User was added to the campaign',
                    ephemeral: false,
                });
            } else {
                // FIXME: There is no campaign with this name, not that a user is already there!
                interaction.editReply({
                    content: locales[interaction.locale]['user_already'] ?? `User ${interaction.option.get('user')} was already added!`,
                    ephemeral: false,
                });
            }
        });
    }
};