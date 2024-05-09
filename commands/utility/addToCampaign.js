import { SlashCommandBuilder } from "discord.js";
const object = {
    'data': new SlashCommandBuilder()
        .setName('a')
        .setDescription('Add a user to your campaign')
        .addStringOption(option => {
            option.setName('name')
                .setDescription('Name of your campaign');
            })
        .addUserOption(option => {
            option.setName('user')
                .setDescription('User to add');
        }),
    'execute': async function(interaction) {
        // TODO: Get the campaign from a mongodb add the user and setup the roles properly
    }
};
export default object;