from discord import app_commands, Interaction
from discord.ext import commands
from dotenv import load_dotenv
from os import getenv
import sqlite3
import json

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
        # Prendi tutte le campagne dalla tabella
        cursor.execute("SELECT campaign, players FROM campaigns")
        rows = cursor.fetchall()
        conn.close()

        # Mappa nome->lista giocatori
        campaign_to_players = {
            campaign: json.loads(players) if players else []
            for campaign, players in rows
        }

        campaigns = list(campaign_to_players.keys())
        max_players = max((len(pl) for pl in campaign_to_players.values()), default=0)

        players_rows = []
        for i in range(max_players):
            row = [
                campaign_to_players[camp][i] if i < len(campaign_to_players[camp]) else ""
                for camp in campaigns
            ]
            players_rows.append(row)

        # Calcola larghezze
        col_widths = [
            max(len(str(r[i])) for r in [campaigns] + players_rows)
            for i in range(len(campaigns))
        ]

        def format_row(r):
            return "| " + " | ".join(
                f"{cell:<{col_widths[i]}}" for i, cell in enumerate(r)
            ) + " |"

        header = format_row(campaigns)
        separator = "|" + "|".join("-" * (w + 2) for w in col_widths) + "|"
        rows = [format_row(r) for r in players_rows]
        table = "\n".join([header, separator] + rows)

        await interaction.followup.send(f"```txt\n{table}\n```")

    async def campaign_autocomplete(self, interaction: Interaction, current: str):
        conn = get_connection()
        cursor = conn.cursor()
        # Suggerisci campagne esistenti
        cursor.execute(
            "SELECT campaign FROM campaigns WHERE campaign LIKE ?",
            (f"%{current}%",)
        )
        campaigns = [row[0] for row in cursor.fetchall()]
        conn.close()

        return [app_commands.Choice(name=c, value=c) for c in campaigns[:25]]

    @app_commands.command(
        name="join_campaign",
        description="Unisciti a una delle campagne speciali in programma"
    )
    @app_commands.describe(campaign="Il nome della campagna a cui vuoi unirti")
    @app_commands.autocomplete(campaign=campaign_autocomplete)
    async def join_campaign(self, interaction: Interaction, campaign: str):
        await interaction.response.defer(ephemeral=True)

        username = interaction.user.display_name
        conn = get_connection()
        cursor = conn.cursor()

        # Controlla esistenza campagna
        cursor.execute(
            "SELECT players FROM campaigns WHERE campaign = ?", (campaign,)
        )
        row = cursor.fetchone()
        if not row:
            await interaction.followup.send(f"❌ Campagna \"{campaign}\" non trovata.")
            conn.close()
            return

        players = json.loads(row[0]) if row[0] else []

        if username in players:
            await interaction.followup.send(f"⚠️ Sei già iscritto a \"{campaign}\"!")
        elif len(players) >= 5:
            await interaction.followup.send(f"🚫 La campagna \"{campaign}\" ha già raggiunto il limite massimo di 5 giocatori.")
        else:
            players.append(username)
            cursor.execute(
                "UPDATE campaigns SET players = ? WHERE campaign = ?",
                (json.dumps(players), campaign)
            )
            conn.commit()
            await interaction.followup.send(f"✅ Ti sei unito a \"{campaign}\"!")

        conn.close()

    async def campaign_autocomplete_leave(self, interaction: Interaction, current: str):
        conn = get_connection()
        cursor = conn.cursor()
        username = interaction.user.display_name

        cursor.execute("SELECT campaign, players FROM campaigns")
        choices = []
        for camp, players_json in cursor.fetchall():
            players = json.loads(players_json) if players_json else []
            if username in players and current.lower() in camp.lower():
                choices.append(app_commands.Choice(name=camp, value=camp))

        conn.close()
        return choices[:25]

    @app_commands.command(
        name="leave_campaign",
        description="Esci da una delle campagne a cui sei iscritto"
    )
    @app_commands.describe(campaign="Il nome della campagna da cui vuoi uscire")
    @app_commands.autocomplete(campaign=campaign_autocomplete_leave)
    async def leave_campaign(self, interaction: Interaction, campaign: str):
        await interaction.response.defer(ephemeral=True)

        username = interaction.user.display_name
        conn = get_connection()
        cursor = conn.cursor()

        # Controlla esistenza
        cursor.execute(
            "SELECT players FROM campaigns WHERE campaign = ?", (campaign,)
        )
        row = cursor.fetchone()
        if not row:
            await interaction.followup.send(f"❌ Campagna \"{campaign}\" non trovata.")
            conn.close()
            return

        players = json.loads(row[0]) if row[0] else []

        if username not in players:
            await interaction.followup.send(f"⚠️ Non sei iscritto a \"{campaign}\"!")
        else:
            players.remove(username)
            cursor.execute(
                "UPDATE campaigns SET players = ? WHERE campaign = ?",
                (json.dumps(players), campaign)
            )
            conn.commit()
            await interaction.followup.send(f"👋 Sei uscito da \"{campaign}\"!")

        conn.close()

# Cog setup
async def setup(bot: commands.Bot):
    await bot.add_cog(ListSpecialCampaign(bot))
