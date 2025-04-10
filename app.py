import os
import logging
import discord
from discord.ext import commands
from dotenv import load_dotenv
import asyncio
import sys

load_dotenv()

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',filename='./bot.log', level=logging.INFO)

intents = discord.Intents.default()
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    logging.info(f"Logged in as {bot.user} (ID: {bot.user.id})")
    try:
        synced = await bot.tree.sync()
        logging.info(f"Synced {len(synced)} slash commands")
    except Exception as e:
        logging.error(f"Errore nel sincronizzare i comandi: {e}")

# Load of cogs
async def load_extensions():
    for filename in os.listdir('./commands'):
        if filename.endswith('.py'):    
            extension = f"commands.{filename[:-3]}"
            try:
                await bot.load_extension(extension)
                logging.info(f"Loaded extension {extension}")
            except Exception as e:
                logging.error(f"Failed to load extension {extension}: {e}")

async def main():
    async with bot:
        await load_extensions()
        await bot.start(os.getenv("DISCORD_TOKEN"))

# Run bot, run!
if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Bot interrotto manualmente")
        sys.exit()
