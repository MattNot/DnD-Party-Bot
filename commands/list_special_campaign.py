from discord import app_commands, Interaction
from discord.ext import commands
from pymongo import MongoClient
from pymongo.collection import Collection
from dotenv import load_dotenv
from os import getenv

load_dotenv(dotenv_path='./../.env')

def get_special_campaigns_collection() -> "Collection":
    mongo_uri = f"mongodb+srv://{getenv('MONGO_USER')}:{getenv('MONGO_PASSWD')}@clusterdnd.qxfls1g.mongodb.net/?authSource=admin&retryWrites=true&w=majority&appName=ClusterDnD"
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
    db = client[getenv("MONGO_DB_NAME")]
    return db[getenv("MONGO_SC_COLLECTION_NAME")], client

class ListSpecialCampaign(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(
        name="list_special_campaign",
        description="Guarda le prossime campagne GdR che stiamo preparando"
    )
    async def list_special_campaign(self, interaction: Interaction):
        await interaction.response.defer(ephemeral=False)

        specials, client_mongo = get_special_campaigns_collection()

        documents = list(specials.find({}))
        client_mongo.close()

        campaigns = []
        campaign_to_players = {}

        for doc in documents:
            for key, value in doc.items():
                if key == "_id":
                    continue
                campaigns.append(key)
                campaign_to_players[key] = [str(player) for player in value[0]] if value and isinstance(value[0], list) else []

        max_players = max((len(players) for players in campaign_to_players.values()), default=0)

        players_rows = []
        for i in range(max_players):
            row = []
            for camp in campaigns:
                players = campaign_to_players.get(camp, [])
                row.append(players[i] if i < len(players) else "")
            players_rows.append(row)

        col_widths = [max(len(str(row[i])) for row in [campaigns] + players_rows) for i in range(len(campaigns))]

        def format_row(row):
            return "| " + " | ".join(f"{cell:<{col_widths[i]}}" for i, cell in enumerate(row)) + " |"

        header = format_row(campaigns)
        separator = "|" + "|".join("-" * (w + 2) for w in col_widths) + "|"
        rows = [format_row(p) for p in players_rows]
        table = "\n".join([header, separator] + rows)

        await interaction.followup.send(f"```txt\n{table}\n```")

    async def campaign_autocomplete(self, interaction: Interaction, current: str):
        specials, client_mongo = get_special_campaigns_collection()

        campaigns = []
        for doc in specials.find():
            for key in doc.keys():
                if key != "_id" and current.lower() in key.lower():
                    campaigns.append(app_commands.Choice(name=key, value=key))

        client_mongo.close()
        return campaigns[:25]


    @app_commands.command(
        name="join_campaign",
        description="Unisciti a una delle campagne speciali in programma"
    )
    @app_commands.describe(campaign="Il nome della campagna a cui vuoi unirti")
    @app_commands.autocomplete(campaign=campaign_autocomplete)
    async def join_campaign(self, interaction: Interaction, campaign: str):
        await interaction.response.defer(ephemeral=False)

        specials, client_mongo = get_special_campaigns_collection()

        username = interaction.user.display_name

        doc = specials.find_one({campaign: {"$exists": True}})

        if not doc:
            await interaction.followup.send(f"❌ Campagna \"{campaign}\" non trovata.", ephemeral=True)
            client_mongo.close()
            return

        players = doc[campaign][0] if doc[campaign] else []

        if username in players:
            await interaction.followup.send(f"⚠️ Sei già iscritto a \"{campaign}\"!", ephemeral=True)
            client_mongo.close()
            return

        if len(players) >= 5:
            await interaction.followup.send(f"🚫 La campagna \"{campaign}\" ha già raggiunto il limite massimo di 5 giocatori.", ephemeral=True)
            client_mongo.close()
            return

        players.append(username)
        specials.update_one({"_id": doc["_id"]}, {"$set": {f"{campaign}": [players]}})
        await interaction.followup.send(f"✅ Ti sei unito a \"{campaign}\"!", ephemeral=True)

        client_mongo.close()


    async def campaign_autocomplete_leave(self, interaction: Interaction, current: str):
        specials, client_mongo = get_special_campaigns_collection()
        username = interaction.user.display_name

        campaigns = []
        for doc in specials.find():
            for key in doc.keys():
                if key == "_id":
                    continue
                players = doc[key][0] if doc[key] else []
                if username in players and current.lower() in key.lower():
                    campaigns.append(app_commands.Choice(name=key, value=key))

        client_mongo.close()
        return campaigns[:25]

    @app_commands.command(
        name="leave_campaign",
        description="Esci da una delle campagne a cui sei iscritto"
    )
    @app_commands.describe(campaign="Il nome della campagna da cui vuoi uscire")
    @app_commands.autocomplete(campaign=campaign_autocomplete_leave)
    async def leave_campaign(self, interaction: Interaction, campaign: str):
        await interaction.response.defer(ephemeral=False)

        specials, client_mongo = get_special_campaigns_collection()
        username = interaction.user.display_name

        doc = specials.find_one({campaign: {"$exists": True}})
        if not doc:
            await interaction.followup.send(f"❌ Campagna \"{campaign}\" non trovata.", ephemeral=True)
            client_mongo.close()
            return

        players = doc[campaign][0] if doc[campaign] else []

        if username not in players:
            await interaction.followup.send(f"⚠️ Non sei iscritto a \"{campaign}\"!", ephemeral=True)
            client_mongo.close()
            return

        players.remove(username)
        specials.update_one({"_id": doc["_id"]}, {"$set": {f"{campaign}": [players]}})
        await interaction.followup.send(f"👋 Sei uscito da \"{campaign}\"!", ephemeral=True)

        client_mongo.close()


# Cog setup
async def setup(bot: commands.Bot):
    await bot.add_cog(ListSpecialCampaign(bot))
