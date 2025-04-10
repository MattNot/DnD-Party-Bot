import discord
from discord import app_commands
from discord.ext import commands

class MetersToFeet(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(
        name="meters_to_feet",
        description="Convert meters to feet"
    )
    @app_commands.describe(meters="Amount to convert into feet")
    async def meters_to_feet(self, interaction: discord.Interaction, meters: float):
        if meters is None:
            await interaction.response.send_message("Invalid number inserted", ephemeral=True)
            return

        result = meters * 3.28084

        await interaction.response.send_message(str(result))

async def setup(bot: commands.Bot):
    await bot.add_cog(MetersToFeet(bot))
