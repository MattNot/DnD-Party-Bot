import { REST, Routes } from "discord.js";

const rest = new REST().setToken(process.env.DISCORD_TOKEN)

(async () => {
    try {
        console.log('Deploying (/) commands');

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.APP_ID, process.env.SERVER_ID),
            {body: commands},
        );

        console.log('Depoloyed (/) commands');
    } catch (error) {
        console.error(error);
    }
})();