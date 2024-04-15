import { SlashCommandBuilder } from "discord.js";
const object = {
    'data': new SlashCommandBuilder()
        .setName('test_interactions')
        .setDescription('Test for slash commands'),
    'execute': async function(interaction) {
        await interaction.reply('Test succesfull!');
    }
};
export default object;