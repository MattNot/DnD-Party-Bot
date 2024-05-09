import { config } from 'dotenv';
import { REST, Routes, Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { commands } from './commands/commands.js';
import createCampaign from './commands/utility/createCampaign.js';

config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWD}@clusterdnd.qxfls1g.mongodb.net/?retryWrites=true&w=majority&appName=ClusterDnD`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const mongo_client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const client = new Client({intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds]});

client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}`);
});
// Setting up the possible commands of the client
client.commands = new Collection();

for (const name in commands)   {
    client.commands.set(name, commands[name]);
}

client.commands.set(createCampaign.data.name, createCampaign);
// FIXME: deploy all commands!
// Accrocchio per testare
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

async function deploy() {
    try {
        console.log('Deploying (/) commands');

        const data = await rest.post(
            Routes.applicationGuildCommands(process.env.APP_ID, process.env.SERVER_ID),
            {
                headers: {'content-type':'application/json'},
                body: createCampaign.data
            },
        );

        console.log('Depoloyed (/) commands');
    } catch (error) {
        console.error(error);
    }
};

deploy();
// Fine accrocchio

// Listener that execute interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command)   {
        console.error(`No command matching ${interaction.commandName} found`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred)    {
            await interaction.followUp({content: 'There was an error while executing this command!', ephemeral: true});
        }   else    {
            await interaction.reply({content: 'Thee was an error while executing this command!', ephemeral: true});
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

module.exports = {mongo_client, client};