const { connectDB } = require('./database');
const bcrypt = require('bcrypt');

const initDatabase = async () => {
    try {
        const db = await connectDB();
        console.log('--- Iniciando Verificación de Base de Datos ---');
        
        // 1. Crear Tablas Fundamentales si no existen
        await db.exec(`
            CREATE TABLE IF NOT EXISTS Marca (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL,
                tipo TEXT
            );

            CREATE TABLE IF NOT EXISTS Area_Departamento (
                id INTEGER PRIMARY KEY,
                nombre TEXT NOT NULL,
                telefono TEXT
            );

            CREATE TABLE IF NOT EXISTS Usuario (
                ficha INTEGER PRIMARY KEY,
                id_area INTEGER,
                nombre TEXT NOT NULL,
                rol TEXT,
                numero TEXT,
                correo TEXT,
                password TEXT,
                FOREIGN KEY (id_area) REFERENCES Area_Departamento(id)
            );

            CREATE TABLE IF NOT EXISTS Equipo (
                fmo INTEGER PRIMARY KEY,
                area_fk INTEGER,
                tipo TEXT,
                nombre TEXT,
                serial TEXT,
                marca_fk INTEGER,
                propietario_ficha INTEGER,
                cant_ram INTEGER,
                so TEXT,
                ram INTEGER,
                disco INTEGER,
                cpu INTEGER,
                tarj_video INTEGER,
                pila INTEGER,
                fuente INTEGER,
                motherboard INTEGER,
                tarj_red INTEGER,
                FOREIGN KEY (area_fk) REFERENCES Area_Departamento(id),
                FOREIGN KEY (marca_fk) REFERENCES Marca(id),
                FOREIGN KEY (propietario_ficha) REFERENCES Usuario(ficha)
            );

            CREATE TABLE IF NOT EXISTS Incidente (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                encargado INTEGER,
                cliente INTEGER,
                tipo TEXT,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT,
                observacion TEXT,
                FOREIGN KEY (encargado) REFERENCES Usuario(ficha),
                FOREIGN KEY (cliente) REFERENCES Usuario(ficha)
            );

            CREATE TABLE IF NOT EXISTS R_periferico (
                id INTEGER PRIMARY KEY,
                fmo INTEGER,
                falla TEXT,
                FOREIGN KEY (id) REFERENCES Incidente(id),
                FOREIGN KEY (fmo) REFERENCES Equipo(fmo)
            );

            CREATE TABLE IF NOT EXISTS R_workstation (
                id INTEGER PRIMARY KEY,
                cpu_fmo INTEGER,
                tipo_falla TEXT,
                respaldo INTEGER,
                observacion TEXT,
                usuario TEXT,
                password TEXT,
                FOREIGN KEY (id) REFERENCES Incidente(id),
                FOREIGN KEY (cpu_fmo) REFERENCES Equipo(fmo)
            );

            CREATE TABLE IF NOT EXISTS Solicitud (
                id INTEGER PRIMARY KEY,
                tipo_solicitud TEXT,
                descripcion TEXT,
                area_id INTEGER,
                FOREIGN KEY (area_id) REFERENCES Area_Departamento(id)
            );
        `);
        console.log('Estructura de tablas verificada/creada.');

        // 2. Migraciones Incrementales
        const incidentInfo = await db.all('PRAGMA table_info(Incidente)');
        if (!incidentInfo.some(c => c.name === 'observacion')) {
            await db.run('ALTER TABLE Incidente ADD COLUMN observacion TEXT');
        }

        const equipoInfo = await db.all('PRAGMA table_info(Equipo)');
        if (!equipoInfo.some(c => c.name === 'propietario_ficha')) {
            await db.run('ALTER TABLE Equipo ADD COLUMN propietario_ficha INTEGER REFERENCES Usuario(ficha)');
        }
        
        const usuarioInfo = await db.all('PRAGMA table_info(Usuario)');
        if (!usuarioInfo.some(c => c.name === 'password')) {
            await db.run('ALTER TABLE Usuario ADD COLUMN password TEXT');
        }

        // 3. Migraciones para mover atributos de hardware de R_workstation a Equipo
        const hardwareColumns = [
            { name: 'cant_ram', type: 'INTEGER' },
            { name: 'so', type: 'TEXT' },
            { name: 'ram', type: 'INTEGER' },
            { name: 'disco', type: 'INTEGER' },
            { name: 'cpu', type: 'INTEGER' },
            { name: 'tarj_video', type: 'INTEGER' },
            { name: 'pila', type: 'INTEGER' },
            { name: 'fuente', type: 'INTEGER' },
            { name: 'motherboard', type: 'INTEGER' },
            { name: 'tarj_red', type: 'INTEGER' }
        ];
        for (const col of hardwareColumns) {
            if (!equipoInfo.some(c => c.name === col.name)) {
                await db.run(`ALTER TABLE Equipo ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        // 3. Verificar si hay al menos un usuario Admin
        const adminUser = await db.get("SELECT * FROM Usuario WHERE rol = 'Administrador' LIMIT 1");
        if (!adminUser) {
            console.log('No se detectó Administrador. Creando usuario inicial...');
            
            // Crear departamento de Soporte Técnico si no existe
            await db.run("INSERT OR IGNORE INTO Area_Departamento (id, nombre) VALUES (1, 'Soporte Tecnico')");
            
            // Hash de la contraseña inicial
            const hashedPassword = await bcrypt.hash('admin', 10);
            
            await db.run(
                "INSERT INTO Usuario (ficha, id_area, nombre, rol, correo, password) VALUES (?, ?, ?, ?, ?, ?)",
                [1, 1, 'ADMINISTRADOR SISTEMA', 'Administrador', 'admin@ferrominera.com', hashedPassword]
            );
            console.log('Usuario Administrador inicial creado (Ficha: 1, Pass: admin)');
        }

        // 4. Poblar Marcas iniciales si la tabla está vacía
        const countMarcas = await db.get("SELECT COUNT(*) as count FROM Marca");
        if (countMarcas.count === 0) {
            console.log('Poblando marcas iniciales...');
            const marcas = [
                'Dell', 'Lenovo', 'Samsung', 'Cooler Master', 
                'HP', 'Toshiba', 'Acer', 'Asus', 'Microsoft'
            ];
            for (const marca of marcas) {
                await db.run("INSERT INTO Marca (nombre) VALUES (?)", [marca]);
            }
            console.log(`Se insertaron ${marcas.length} marcas.`);
        }

        console.log('--- Base de Datos Lista ---');
    } catch (err) {
        console.error('Error crítico inicializando base de datos:', err);
    }
};

module.exports = { initDatabase };
