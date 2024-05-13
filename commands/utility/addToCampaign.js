import { SlashCommandBuilder } from "discord.js";
import { mongo_client } from "../../app.js";

// Template of objects:
// interface User look up https://discord.js.org/docs/packages/discord.js/14.14.1/User:Class
// interface Campaign {
//     _id:ObjectId,
//     name: string,
//     elements: {
//         dm: User,
//         players: Array<User>
//     }
// }
export default {
    'data': new SlashCommandBuilder()
        .setName('add')
        .setNameLocalizations({
            it:'aggiungi',
        })
        .setDescription('Add a user to your campaign')
        .setDescriptionLocalizations({
            it:'Aggiungi un utente alla tua campagna',
        })
        .addStringOption(option => {
            option.setName('name')
            .setNameLocalizations({
                it:'nome',
            })
            .setDescription('Name of your campaign')
            .setDescriptionLocalizations({
                it:'Nome della tua campagna',
            })
            .setRequired(true);
        })
        .addUserOption(option => {
            option.setName('user')
            .setNameLocalizations({
                it:'utente',
            })
            .setDescription('User to add')
            .setDescriptionLocalizations({
                it:'Utente da aggiungere',
            })
            .setRequired(true);
        }),
    'execute': async function(interaction) {
        await mongo_client.connect();
        let campaigns = mongo_client.db(process.env.MONGO_DB_NAME).collection(process.env.MONGO_COLLECTION_NAME);
        let c_n = interaction.options.get('name');
        
        campaigns.findOne({name:c_n}, async (err, result) => {
            if (err) throw err;
            
            if (result) {
                let n = result;
                n['elements']['players'].push(interaction.options.get('user'));
                // TODO: Setup the roles properly
                campaigns.updateOne({name:cn}, n);
            }
        });
    }
};