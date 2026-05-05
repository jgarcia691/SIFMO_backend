import sqlite3
import os

db_path = 'SIFMO_backend/SIFMO.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT ficha, nombre, id_area FROM Usuario LIMIT 10")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    conn.close()
else:
    print("Database not found")
