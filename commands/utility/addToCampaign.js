import { SlashCommandBuilder } from "discord.js";
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
            option.setName('name')
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
            option.setName('user')
            .setNameLocalizations({
                it:'utente',
            })
            .setDescription('User to add')
            .setDescriptionLocalizations({
                it:'Utente da aggiungere',
            })
            .setRequired(true);
        }),
    'execute': async function(interaction) {
        // TODO: Get the campaign from a mongodb add the user and setup the roles properly
    }
};