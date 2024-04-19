import { SlashCommandBuilder } from "discord.js";
const object = {
    'data': new SlashCommandBuilder()
        .setName('addToCampaign')
        .setDescription('Add a user to your campaign')
        .addStringOption('Name of your campaign')
        .addUserOption('User to add'),
    'execute': async function(interaction) {
        // TODO: Get the campaign from a mongodb add the user and setup the roles properly
    }
};
export default object;