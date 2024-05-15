import { config } from 'dotenv';
import { REST, Routes, Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { commands } from './commands/commands.js';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

config();

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@clusterdnd.qxfls1g.mongodb.net/?retryWrites=true&w=majority&appName=ClusterDnD`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mongo_client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
console.log('[Mongo Connection] - Connection started');

const client = new Client({intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds]});

client.once(Events.ClientReady, readyClient => {
    console.log(`[INFO] - Logged in as ${readyClient.user.tag}`);
});
// Setting up the possible commands of the client
client.commands = new Collection();

for (const name in commands)   {
    await client.commands.set(name, commands[name].default);
}
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
// Deploy of commands
(async () => {
    try {
        console.log('[INFO] - Deploying (/) commands');

        client.commands.forEach(async element => {
            const data = await rest.post(
                Routes.applicationCommands(process.env.APP_ID),
                {
                    headers: {
                        'content-type':'application/json',
                        'Authorization':`Bot ${process.env.DISCORD_TOKEN}`,
                    },
                    body: await element.data.toJSON(),
                },
            );
        });

        console.log('[INFO] - Depoloyed (/) commands');
    } catch (error) {
        console.error(error);
    }
})();

// Listener that execute interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = await interaction.client.commands.get(interaction.commandName);

    if (!command)   {
        console.error(`[ERROR] - No command matching ${interaction.commandName} found`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred)    {
            await interaction.followUp({content: 'There was an error while executing this command!', ephemeral: true});
        }   else    {
            await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

export {mongo_client, client};