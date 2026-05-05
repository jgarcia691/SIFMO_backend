import sqlite3
import json

db_path = 'SIFMO_backend/SIFMO.db'
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

incident_query = """
    SELECT 
        i.id,
        u.nombre AS solicitante,
        u.correo AS solicitante_correo,
        u.numero AS solicitante_numero,
        u.id_area AS solicitante_extension,
        e.nombre AS encargado_nombre,
        e.correo AS encargado_correo,
        e.numero AS encargado_numero,
        e.id_area AS encargado_extension
    FROM Incidente i
    LEFT JOIN Usuario u ON i.cliente = u.ficha
    LEFT JOIN Usuario e ON i.encargado = e.ficha
    LIMIT 1
"""

cursor.execute(incident_query)
row = cursor.fetchone()
if row:
    print(json.dumps(dict(row), indent=2))
else:
    print("No incidents found")
conn.close()
