from discord import app_commands, Interaction, Poll
from discord.ext import commands
from datetime import timedelta
from enum import Enum

class Duration(Enum):
    One = 1
    Four = 4
    Eight = 8
    Twelve = 12
    Twentyfour = 24
    TwoDays = 48
    ThreeDays = 76
    OneWeek = 168
    TwoWeek = 336
    def get_duration(dur: str):
        if dur == "1 Hour":
            return Duration.One.__get_deltatime_from_now()
        if dur == "4 Hours":
            return Duration.Four.__get_deltatime_from_now()
        if dur == "8 Hours":
            return Duration.Eight.__get_deltatime_from_now()
        if dur == "12 Hours":
            return Duration.Twelve.__get_deltatime_from_now()
        if dur == "24 Hours":
            return Duration.Twentyfour.__get_deltatime_from_now()
        if dur == "2 Days":
            return Duration.TwoDays.__get_deltatime_from_now()
        if dur == "3 Days":
            return Duration.ThreeDays.__get_deltatime_from_now()
        if dur == "1 Week":
            return Duration.OneWeek.__get_deltatime_from_now()
        if dur == "2 Week":
            return Duration.TwoWeek.__get_deltatime_from_now()
    def __get_deltatime_from_now(self):
        return timedelta(hours = self.value)
    
async def duration_autocomplete(self, interaction: Interaction) -> list[app_commands.Choice[str]]:
    choices = ["1 Hour", "4 Hours", "8 Hours", "12 Hours", "24 Hours", "2 Days", "3 Days", "1 Week", "2 Week"]
    return [ app_commands.Choice(name=choice, value=choice) for choice in choices ]

class CreateSurvey(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(
        name = "survey",
        description = "Crea un sondaggio per organizzare le tue sessioni!",
    )
    @app_commands.describe(
        question = "Question to ask for the survey",
        duration = "Duration of the survey",
        additional_message = "Optional additional message to add to the survey",
        mon = "Monday",
        tue = "Tuesday",
        wed = "Wednesday",
        thu = "Thursday",
        fri = "Friday",
        sat = "Saturday",
        sun = "Sunday"
    )
    @app_commands.autocomplete(duration=duration_autocomplete)
    async def create_survey(self, interaction: Interaction, question: str, duration: str, additional_message: str = '', mon: str = '', tue: str = '', wed: str = '', thu: str = '', fri: str = '', sat: str = '', sun: str = ''):
        if not (mon or tue or wed or thu or fri or sat or sun):
            interaction.response.send_message(content = "Nessun orario inserito" , ephemeral = True)
        p = Poll(question = question, multiple = True, duration = Duration.get_duration(duration))

        if mon:
            p.add_answer(text = mon)
        if tue:
            p.add_answer(text = tue)
        if wed:
            p.add_answer(text = wed)
        if thu:
            p.add_answer(text = thu)
        if fri:
            p.add_answer(text = fri)
        if sat:
            p.add_answer(text = sat)
        if sun:
            p.add_answer(text = sun)

        if additional_message != '':
            await interaction.response.send_message(content = additional_message, poll = p)
        else:
            await interaction.response.send_message(poll = p)


# Cog setup
async def setup(bot: commands.Bot):
    await bot.add_cog(CreateSurvey(bot))
