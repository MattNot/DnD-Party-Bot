import { SlashCommandBuilder } from "discord.js";
import { mongo_client } from 'app.js';

// Template of objects:
// interface User {
//     user_name: string,
//     user_id: string
// };
// interface Campaign {
//     _id:ObjectId,
//     name: string,
//     elements: {
//         dm: User,
//         players: Array<User>
//     }
// }

const object = {
    'data': new SlashCommandBuilder()
        .setName('test_interactions')
        .setDescription('Test for slash commands'),
    'execute': async function(interaction) {
        try {
            // Connect the client to the server	(optional starting in v4.7)
            await mongo_client.connect();
            
        } catch (error) {
            console.error(`[Mongo Connection] An error has occurred.\n${error}`);
        } finally {
            // Ensures that the client will close when you finish/error
            await mongo_client.close();
        }
    }
};
export default object;