const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function checkData() {
    const db = await open({
        filename: './SIFMO.db',
        driver: sqlite3.Database
    });

    console.log("--- USUARIOS ---");
    const users = await db.all("SELECT ficha, nombre, rol, numero, correo FROM Usuario WHERE ficha = 777");
    console.log(JSON.stringify(users, null, 2));

    console.log("\n--- INCIDENTES ---");
    const incidents = await db.all("SELECT id, encargado, cliente FROM Incidente WHERE encargado = 777");
    console.log(JSON.stringify(incidents, null, 2));

    console.log("\n--- QUERY TEST ---");
    const incidentQuery = `
    SELECT 
        i.id,
        i.encargado,
        e.nombre AS encargado_nombre,
        e.correo AS encargado_correo,
        e.numero AS encargado_numero
    FROM Incidente i
    LEFT JOIN Usuario e ON i.encargado = e.ficha
    WHERE i.encargado = 777
    `;
    const test = await db.all(incidentQuery);
    console.log(JSON.stringify(test, null, 2));
}

checkData();
