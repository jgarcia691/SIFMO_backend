const { connectDB } = require('../../config/database');

async function createWorkstationRecord(db, id, data) {
    const { 
        cpu_fmo, tipo_falla, respaldo, ram, cant_ram, cpu, so, 
        disco, tarj_video, pila, fuente, motherboard, tarj_red, 
        observacion, usuario, password 
    } = data;

    await db.run(
        `INSERT INTO R_workstation (
            id, cpu_fmo, tipo_falla, respaldo, ram, cant_ram, cpu, so, 
            disco, tarj_video, pila, fuente, motherboard, tarj_red, 
            observacion, usuario, password
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id, cpu_fmo, tipo_falla, respaldo, ram, cant_ram, cpu, so, 
            disco, tarj_video, pila, fuente, motherboard, tarj_red, 
            observacion, usuario, password
        ]
    );
    return { id, ...data };
}

async function getWorkstations() {
    const db = await connectDB();
    const workstations = await db.all('SELECT * FROM R_workstation');
    return workstations;
}

async function getWorkstationById(id) {
    const db = await connectDB();
    const workstation = await db.get('SELECT * FROM R_workstation WHERE id = ?', [id]);
    return workstation;
}

async function updateWorkstation(id, data) {
    const db = await connectDB();
    const keys = Object.keys(data);
    if (keys.length === 0) return 0;

    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const result = await db.run(
        `UPDATE R_workstation SET ${setClause} WHERE id = ?`,
        values
    );
    return result.changes;
}

async function deleteWorkstation(id) {
    const db = await connectDB();
    const result = await db.run('DELETE FROM R_workstation WHERE id = ?', [id]);
    return result.changes;
}

module.exports = {
    createWorkstationRecord,
    getWorkstations,
    getWorkstationById,
    updateWorkstation,
    deleteWorkstation
};
