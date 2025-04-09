import { SlashCommandBuilder } from "discord.js";

export default  {
    'data': new SlashCommandBuilder()
    .setName('feet_to_meters')
    .setDescription('Convert feet to meters')
    .setDescriptionLocalizations({
        it:'Converti piedi in un unità di misura standardizzata'
    })
    .addNumberOption(option => {
        return option.setName('feet')
        .setNameLocalizations({
            it:'piedi'
        })
        .setDescription('amount to convert into meters')
        .setDescriptionLocalizations({
            it:'quantità da convertire in metri'
        })
        .setRequired(true);
    }),
    async execute(interaction)  {
        let n = Number(interaction.options.get('feet').value);
        if (!n)
            interaction.reply('Invalid number inserted');
        interaction.reply(Number(n*3.28084));
    }
}