from discord import app_commands, Interaction
from discord.ext import commands
from dotenv import load_dotenv
from os import getenv
import sqlite3

load_dotenv()

DB_PATH = getenv("SQLITE_DB_PATH", "campaigns.db")

def get_connection():
    return sqlite3.connect(DB_PATH)

class ListSpecialCampaign(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(
        name="list_special_campaign",
        description="Guarda le prossime campagne GdR che stiamo preparando"
    )
    async def list_special_campaign(self, interaction: Interaction):
        await interaction.response.defer(ephemeral=False)

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        campaigns = [row[0] for row in cursor.fetchall()]

        campaign_to_players = {}
        for camp in campaigns:
            cursor.execute(f"SELECT player FROM '{camp}'")
            players = [row[0] for row in cursor.fetchall()]
            campaign_to_players[camp] = players

        conn.close()

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
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        campaigns = [row[0] for row in cursor.fetchall() if current.lower() in row[0].lower()]
        conn.close()

        return [app_commands.Choice(name=camp, value=camp) for camp in campaigns[:25]]

    @app_commands.command(
        name="join_campaign",
        description="Unisciti a una delle campagne speciali in programma"
    )
    @app_commands.describe(campaign="Il nome della campagna a cui vuoi unirti")
    @app_commands.autocomplete(campaign=campaign_autocomplete)
    async def join_campaign(self, interaction: Interaction, campaign: str):
        await interaction.response.defer(ephemeral=False)

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (campaign,))
        if not cursor.fetchone():
            await interaction.followup.send(f"❌ Campagna \"{campaign}\" non trovata.", ephemeral=True)
            conn.close()
            return

        username = interaction.user.display_name
        cursor.execute(f"SELECT player FROM '{campaign}'")
        players = [row[0] for row in cursor.fetchall()]

        if username in players:
            await interaction.followup.send(f"⚠️ Sei già iscritto a \"{campaign}\"!", ephemeral=True)
            conn.close()
            return

        if len(players) >= 5:
            await interaction.followup.send(f"🚫 La campagna \"{campaign}\" ha già raggiunto il limite massimo di 5 giocatori.", ephemeral=True)
            conn.close()
            return

        cursor.execute(f"INSERT INTO '{campaign}' (player) VALUES (?)", (username,))
        conn.commit()
        conn.close()
        await interaction.followup.send(f"✅ Ti sei unito a \"{campaign}\"!", ephemeral=True)

    async def campaign_autocomplete_leave(self, interaction: Interaction, current: str):
        conn = get_connection()
        cursor = conn.cursor()
        username = interaction.user.display_name
        campaigns = []

        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        for (camp,) in cursor.fetchall():
            cursor.execute(f"SELECT player FROM '{camp}'")
            players = [row[0] for row in cursor.fetchall()]
            if username in players and current.lower() in camp.lower():
                campaigns.append(app_commands.Choice(name=camp, value=camp))

        conn.close()
        return campaigns[:25]

    @app_commands.command(
        name="leave_campaign",
        description="Esci da una delle campagne a cui sei iscritto"
    )
    @app_commands.describe(campaign="Il nome della campagna da cui vuoi uscire")
    @app_commands.autocomplete(campaign=campaign_autocomplete_leave)
    async def leave_campaign(self, interaction: Interaction, campaign: str):
        await interaction.response.defer(ephemeral=False)

        conn = get_connection()
        cursor = conn.cursor()
        username = interaction.user.display_name

        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (campaign,))
        if not cursor.fetchone():
            await interaction.followup.send(f"❌ Campagna \"{campaign}\" non trovata.", ephemeral=True)
            conn.close()
            return

        cursor.execute(f"SELECT player FROM '{campaign}'")
        players = [row[0] for row in cursor.fetchall()]

        if username not in players:
            await interaction.followup.send(f"⚠️ Non sei iscritto a \"{campaign}\"!", ephemeral=True)
            conn.close()
            return

        cursor.execute(f"DELETE FROM '{campaign}' WHERE player = ?", (username,))
        conn.commit()
        conn.close()
        await interaction.followup.send(f"👋 Sei uscito da \"{campaign}\"!", ephemeral=True)


# Cog setup
async def setup(bot: commands.Bot):
    await bot.add_cog(ListSpecialCampaign(bot))