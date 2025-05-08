import random
import re
from discord import app_commands, Interaction
from discord.ext import commands

locales = {
    "it": {
        "invalid_roll": "Roll richiesto invalido",
        "result": "Risultato: **{total}**\nDettagli:\n{breakdown}"
    },
    "eng": {
        "invalid_roll": "Invalid roll requested",
        "result": "Result: **{total}**\nBreakdown:\n{breakdown}"
    }
}

class RollADice(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(
        name="roll",
        description="Roll a dice! Roll20 style (e.g. '/roll 2d20+2+1d10')"
    )
    @app_commands.describe(
        roll="Roll expression like 2d20+2+1d10",
        adv="Roll twice and take the highest result",
        dis="Roll twice and take the lowest result"
    )
    async def roll(self, interaction: Interaction, roll: str, adv: bool = False, dis: bool = False):
        locale = interaction.locale if interaction.locale in locales else "eng"
        await interaction.response.defer(ephemeral=False)

        try:
            if adv and not dis:
                results = [self.roll_expression(roll) for _ in range(2)]
                chosen = max(results, key=lambda r: r[0])
            elif dis and not adv:
                results = [self.roll_expression(roll) for _ in range(2)]
                chosen = min(results, key=lambda r: r[0])
            else:
                chosen = self.roll_expression(roll)
                results = None

            total, breakdown = chosen
            if results is not None:
                nc = next(r[1] for r in results if r != chosen)
                breakdown = f"""```diff
+ {''.join(chosen[1])}
- {''.join(nc)}
```"""
            else:
                breakdown = f"""```
{''.join(breakdown)}
```"""
            response = locales[locale]["result"].format(
                total=total,
                breakdown=breakdown
            )
        except ValueError as e:
            interaction.followup.send(content=locales[locale]["invalid_roll"], ephemeral=True)

        await interaction.followup.send(response)

    def roll_expression(self, expr: str):
        expr = expr.replace(' ', '')

        pattern = re.compile(r'(?P<dice>(?P<diceSign>[+-]?)((?P<diceCount>\d+)?d(?P<diceType>4|6|8|10|12|20|100)))|(?P<constant>(?P<constantSign>[+-]?)\d+)')

        total = 0
        breakdown = []

        for match in pattern.finditer(expr):
            if match.group("dice"):
                sign = -1 if match.group("diceSign") == '-' else 1
                count = int(match.group("diceCount") or 1)
                sides = int(match.group("diceType"))
                rolls = [random.randint(1, sides) for _ in range(count)]
                subtotal = sum(rolls) * sign
                total += subtotal
                breakdown.append(f"{match.group('diceSign') or '+'}{count}d{sides} → {rolls} = {subtotal}")
            elif match.group("constant"):
                sign = -1 if match.group("constantSign") == '-' else 1
                value = int(match.group("constant")[1:] if match.group("constant")[0] in "+-" else match.group("constant"))
                subtotal = value * sign
                total += subtotal
                breakdown.append(f"{match.group('constantSign') or '+'}{value} = {subtotal}")

        if not breakdown:
            raise ValueError("Empty or invalid expression")

        return total, breakdown


# Cog setup
async def setup(bot: commands.Bot):
    await bot.add_cog(RollADice(bot))
