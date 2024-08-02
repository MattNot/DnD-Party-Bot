import { SlashCommandBuilder, Events } from "discord.js";
import { mongo_client } from "../../app.js";

export default {
    'data': new SlashCommandBuilder()
        .setName('select_announcements_channel')
        .setNameLocalizations({
            it: 'seleziona_canale_annunci',
        })
        .setDescription('Select this channel as the announcements channel')
        .setDescriptionLocalizations({
            it:'Seleziona questo canale come canale per gli annunci',
        }),
    async execute(interaction)  {
        // Create event listener
        interaction.client.on(Events.GuildScheduledEventCreate, async (createdScheduledEventUrl) => {
            console.log(`ScheduledEvent created - ${createdScheduledEventUrl}`)
            // TODO: implement such that it's scalable with multiple languages
            // switch (interaction?.guild.locale) {
            //     case value:
                    
            //         break;
            
            //     default:
            //         break;
            // }
            interaction.channel.send(`Hey @everyone, è stata programmata una sessione! :eyes:\nTenetevi pronti per ${createdScheduledEvent.scheduledStartsAt}!`);
        });
        interaction.reply('Channel succesfully selected');
    }
};