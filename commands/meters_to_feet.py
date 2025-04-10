import discord
from discord import app_commands
from discord.ext import commands
from math import ceil

class MetersToFeet(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(
        name="meters_to_feet",
        description="Convert meters to feet"
    )
    @app_commands.describe(meters="Amount to convert into feet")
    async def meters_to_feet(self, interaction: discord.Interaction, meters: float, approx: bool = True):
        if meters is None:
            await interaction.response.send_message("Invalid number inserted", ephemeral=True)
            return

        result = ceil(meters * 3.28084) if approx else meters * 3.28084

        await interaction.response.send_message(str(result))

    @app_commands.command(
        name="m2f",
        description="Convert to meters to feet"
    )
    @app_commands.describe(feet="Amount to convert into feet")
    async def f2m(self, interaction: discord.Interaction, feet: float, approx: bool = True):
        await self.feet_to_meters(interaction, feet, approx)

async def setup(bot: commands.Bot):
    await bot.add_cog(MetersToFeet(bot))
