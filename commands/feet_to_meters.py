import discord
from discord import app_commands
from discord.ext import commands
from math import ceil
from typing import Optional

locales = {
    "it":   {
        "invalid_number": "Numero inserito non valido",
    },
    "eng":  {
        "invalid_number": "Invalid number inserted",
    }
}

class FeetToMeters(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(
        name="feet_to_meters",
        description="Convert feet to meters"
    )
    @app_commands.describe(feet="Amount to convert into meters")
    async def feet_to_meters(self, interaction: discord.Interaction, feet: float, approx: Optional[bool] = True):
        if feet is None:
            locale = interaction.locale if interaction.locale in locales else "eng"
            await interaction.response.send_message(content=locales[locale]["invalid_number"], ephemeral=True)
            return

        result = ceil(feet / 3.28084) if approx else feet / 3.28084

        await interaction.response.send_message(str(result))
    
    @app_commands.command(
        name="f2m",
        description="Convert feet to meters"
    )
    @app_commands.describe(feet="Amount to convert into meters")
    async def f2m(self, interaction: discord.Interaction, feet: float, approx: Optional[bool] = True):
        await self.feet_to_meters(interaction, feet, approx)

async def setup(bot: commands.Bot):
    await bot.add_cog(FeetToMeters(bot))
