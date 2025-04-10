import discord
from discord import app_commands
from discord.ext import commands

class FeetToMeters(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(
        name="feet_to_meters",
        description="Convert feet to meters"
    )
    @app_commands.describe(feet="Amount to convert into meters")
    async def feet_to_meters(self, interaction: discord.Interaction, feet: float):
        if feet is None:
            await interaction.response.send_message("Invalid number inserted", ephemeral=True)
            return

        result = feet / 3.28084

        await interaction.response.send_message(str(result))

async def setup(bot: commands.Bot):
    await bot.add_cog(FeetToMeters(bot))
