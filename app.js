import { config } from 'dotenv';
import { REST, Routes, Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
// FIXME: Need fixes for ES6 incompatibilities
// // Setting up the possible commands of the client
// client.commands = new Collection();
// // Getting all the commands in the path `commands/*`
// const foldersPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands');
// const commandFolders = readdirSync(foldersPath);
// // Actually loading each COMMAND.js inside the commands folder, making sure that each of them contains at least the `data` and `execute` property
// for (const folder of commandFolders)  {
//     const commandsPath = path.join(foldersPath, folder);
//     const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
//     for (const file of commandFiles)    {
//         const filePath = path.join(commandsPath, file);
//         const command = await import (filePath);
//         if ('data' in command && 'execute' in command)  {
//             client.command.set(command.data.name, command);
//         }   else    {
//             console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
//         }
//     }
// }

client.commands = new Collection();

client.commands.set(createCampaign.data.name, createCampaign);
// Accrocchio per testare
const rest = new REST().setToken(process.env.DISCORD_TOKEN)

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

module.exports = {mongo_client};