from dotenv import load_dotenv
from os import getenv
import sqlite3
import json

load_dotenv()

DB_PATH = getenv("SQLITE_DB_PATH", "campaigns.db")

def get_connection():
    return sqlite3.connect(DB_PATH)

MENU_MESSAGE = """
1) See all the db
2) Add person to campaign
3) Remove person from campaign
4) Exit
"""

def elaborate(choice: int):
    conn = get_connection()
    cursor = conn.cursor()

    if choice == 1:
        cursor.execute("SELECT campaign, players, master FROM campaigns")
        rows = cursor.fetchall()
        print(f"{campaign}\n{master}\n{players}\n\n" for campaign, players, master in rows)
    if choice == 2:
        campaign = input("Insert Campaign: ").strip()
        user = input("Insert User: ").strip()

        print(campaign)
        print(user)

        cursor.execute("SELECT players FROM campaigns WHERE campaign = ?", (campaign,))
        res = cursor.fetchone()
        if not res:
            print("No campaign exists with that name")
            return
        players = json.loads(res[0]) if res[0] else []

        if user in players:
            print("User already in campaign")
            return
        players.append(user)
        cursor.execute("UPDATE campaigns SET players = ? WHERE campaign = ?", (json.dumps(players), campaign))
        conn.commit()
        print("Player added")
    if choice == 3:
        campaign = input("Insert Campaign: ").strip()
        user = input("Insert User: ").strip()

        print(campaign)
        print(user)

        cursor.execute("SELECT players FROM campaigns WHERE campaign = ?", (campaign,))
        res = cursor.fetchone()
        if not res:
            print("No campaign exists with that name")
            return
        players = json.loads(res[0]) if res[0] else []

        if user not in players:
            print("User is not in campaign")
            return
        players.remove(user)
        cursor.execute("UPDATE campaigns SET players = ? WHERE campaign = ?", (json.dumps(players), campaign))
        conn.commit()
        print("Player removed")

    conn.close()


def main():
    inp = ''
    while True:
        inp = int(input(MENU_MESSAGE).strip())
        if inp == 4 :
            break
        elaborate(inp)

if __name__ == '__main__':
    main()