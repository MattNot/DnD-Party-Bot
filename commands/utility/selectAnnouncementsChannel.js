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
            interaction.guild.scheduledEvents.fetch(createdScheduledEventUrl).then((scheduledEvent) => {
                // Add id to fetch messages? Related to complexity doubts for update
                interaction.channel.send(`Hey @everyone, è stata programmata una sessione! :eyes:\n"${scheduledEvent.name}"\nTenetevi pronti per ${new Intl.DateTimeFormat('it-IT', {weekday: 'long', day: 'numeric', month: 'long'}).format(scheduledEvent.scheduledStartAt)}! La sessione avrà inizio alle ore ${new Intl.DateTimeFormat('it-IT', {hour: 'numeric', minute: 'numeric'}).format(scheduledEvent.scheduledStartAt)}`);
            });
        });
        // Update event listenr
        interaction.client.on(Events.GuildScheduledEventUpdate, async (editedScheduledEventUrl) => {
            // TODO: too much complexity?
            // console.log(`Edit on ScheduledEvent - ${editedScheduledEventUrl}`);
            // interaction.guild.scheduledEvents.fetch(editedScheduledEventUrl).then((scheduledEvent) => {
            //     interaction.channel.messages.fetch().then((messages) => {
            //         messages.forEach(message => {
            //             message.content.includes(scheduledEvent.id);
            //         });
            //     });
            // });
            interaction.guild.scheduledEvents.fetch(editedScheduledEventUrl).then((oldScheduledEvent, newScheduledEvent) => {
                interaction.channel.send(`Cambio di programmi @everyone! La sessione ${oldScheduledEvent.name} si terrà alle ore ${new Intl.DateTimeFormat('it-IT', {hour: 'numeric', minute: 'numeric'}).format(newScheduledEvent.scheduledStartAt)} di ${new Intl.DateTimeFormat('it-IT', {weekday: 'long', day: 'numeric', month: 'long'}).format(newScheduledEvent.scheduledStartAt)}`);
            });
        });
        // Delete event listenr
        interaction.client.on(Events.GuildScheduledEventDelete, async (deleteScheduledEventUrl) => {
            interaction.guild.scheduledEvents.fetch(deleteScheduledEventUrl).then((scheduledEvent) => {
                interaction.channel.send(`@everyone, mi dispiace informarvi che la sessione ${scheduledEvent.name} è stata cancellata`);
            });
        });
        // FIXME: Can't understand why it's converting circular structure to BSON
        await mongo_client.connect();
        let ann = mongo_client.db(process.env.MONGO_DB_NAME).collection(process.env.MONGO_A_COLLECTION_NAME);
        try {
            await ann.updateOne({guild: interaction.guild}, { $set: {channel: interaction.channel} }, {upsert: true});
        } catch (error) {
            console.error(`[MONGODB ERROR] Error on inserting announcement channel in db\n${error}`);
        }
        mongo_client.close();
        // Resolve of the interaction
        interaction.reply('Channel succesfully selected');
    }
};