import { SlashCommandBuilder } from "discord.js";

export default  {
    'data': new SlashCommandBuilder()
    .setName('meters_to_feet')
    .setDescription('Convert meters to feet')
    .setDescriptionLocalizations({
        it:'Converti metri in carciofi'
    })
    .addNumberOption(option => {
        return option.setName('meters')
        .setNameLocalizations({
            it:'metri'
        })
        .setDescription('amount to convert into fEeT')
        .setDescriptionLocalizations({
            it:'quantità da convertire in piedi'
        })
        .setRequired(true);
    }),
    async execute(interaction)  {
        let n = Number(interaction.options.get('meters').value);
        if (!n)
            interaction.reply('Invalid number inserted');
        interaction.reply(Number(n/3.28084).toString());
    }
}