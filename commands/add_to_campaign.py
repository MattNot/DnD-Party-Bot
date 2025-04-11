import os
import logging
from discord import app_commands, Interaction, User
from discord.ext import commands
from pymongo import MongoClient
from pymongo.collection import Collection
from dotenv import load_dotenv

load_dotenv()

locales = {
    "it": {
        "user_added": "L'utente è stato inserito nella campagna - ",
        "user_already": "L'utente è già stato inserito!",
        "player_role_not_found":"Il ruolo player non è stato trovato nel server!",
        "member_not_found":"L'utente non è stato trovato nel server!",
        "generic_error":"Errore verificatosi nel processo del comando.",
    },
    "eng": {
        "user_added": "User added to campaign - ",
        "user_already": " was already added!",
        "player_role_not_found":"Player role not found in the server!",
        "member_not_found":"User not found in the server!",
        "generic_error":"An error occurred while processing the command.",
    }
}

def get_campaigns_collection() -> "Collection":
    mongo_uri = f"mongodb+srv://{os.getenv('MONGO_USER')}:{os.getenv('MONGO_PASSWD')}@clusterdnd.qxfls1g.mongodb.net/?authSource=admin&retryWrites=true&w=majority&appName=ClusterDnD"
    client = MongoClient(mongo_uri)
    db = client[os.getenv("MONGO_DB_NAME")]
    return db[os.getenv("MONGO_COLLECTION_NAME")], client

class AddToCampaign(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(
        name="add",
        description="Add a user to your campaign"
    )
    async def add(self, interaction: "Interaction", name: str, user: "User"):
        locale = interaction.locale if interaction.locale in locales else "eng"

        await interaction.response.defer(ephemeral=False)

        logging.info("[INFO] - Trying to add a user to a campaign")
        campaigns, client_mongo = get_campaigns_collection()
        try:
            result = campaigns.find_one({"name": name})
            logging.info("[INFO] - Finding a campaign")
            guild = interaction.guild
            if result:
                member = guild.get_member(user.id)
                if member is None:
                    await interaction.followup.send(content=locales[locale]["member_not_found"])
                    return

                role = next((r for r in guild.roles if r.name == f"{name}_Player"), None)
                if role:
                    await member.add_roles(role)
                    logging.info(f"[INFO : {guild.name}] - Player Role assigned")
                    campaigns.update_one({"name": name}, {"$push": {"players": user.id}})
                    await interaction.followup.send(content=f"{locales[locale]['user_added']}{user.name}")
                else:
                    await interaction.followup.send(content=locales[locale]["player_role_not_found"])
            else:
                await interaction.followup.send(content=f"{user.name}{locales[locale]['user_already']}")
        except Exception as e:
            logging.error(f"[ERROR] - {e}")
            await interaction.followup.send(content=locales[locale]["generic_error"])
        finally:
            client_mongo.close()

    @add.autocomplete("name")
    async def add_name_autocomplete(self, interaction: "Interaction", current: str):
        return []

    @add.error
    async def add_error(self, interaction: "Interaction", error: Exception):
        logging.error(f"Error in add command: {error}")
        locale = interaction.locale if interaction.locale in locales else "eng"
        await interaction.followup.send(content=locales[locale]["generic_error"])

# Cog setup
async def setup(bot: commands.Bot):
    await bot.add_cog(AddToCampaign(bot))
