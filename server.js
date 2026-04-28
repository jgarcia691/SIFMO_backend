require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Importar rutas
const userRoutes = require('./src/user/routes');
const areaRoutes = require('./src/area/routes');
const incidentRoutes = require('./src/incident/routes');
const workstationRoutes = require('./src/workstation/routes');
const marcaRoutes = require('./src/marca/routes');
const equipoRoutes = require('./src/equipo/routes');

app.use(cors());
app.use(express.json());

// Usar rutas
app.use('/api/users', userRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/incidentes', incidentRoutes);
app.use('/api/workstations', workstationRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/equipos', equipoRoutes);

// Migración automática de base de datos
const runMigrations = async () => {
    try {
        const db = await connectDB();
        console.log('Verificando base de datos...');
        
        // 1. Columna observacion en Incidente
        const incidentInfo = await db.all('PRAGMA table_info(Incidente)');
        if (!incidentInfo.some(c => c.name === 'observacion')) {
            console.log('Agregando "observacion" a Incidente...');
            await db.run('ALTER TABLE Incidente ADD COLUMN observacion TEXT');
        }

        // 2. Columna tipo y propietario_ficha en Equipo
        const equipoInfo = await db.all('PRAGMA table_info(Equipo)');
        if (!equipoInfo.some(c => c.name === 'tipo')) {
            console.log('Agregando "tipo" a Equipo...');
            await db.run('ALTER TABLE Equipo ADD COLUMN tipo TEXT');
        }
        if (!equipoInfo.some(c => c.name === 'propietario_ficha')) {
            console.log('Agregando "propietario_ficha" a Equipo...');
            await db.run('ALTER TABLE Equipo ADD COLUMN propietario_ficha INTEGER REFERENCES Usuario(ficha)');
        }

        // 3. Columna fmo en R_periferico
        const perifericoInfo = await db.all('PRAGMA table_info(R_periferico)');
        if (!perifericoInfo.some(c => c.name === 'fmo')) {
            console.log('Agregando "fmo" a R_periferico...');
            await db.run('ALTER TABLE R_periferico ADD COLUMN fmo INTEGER');
        }

        // 4. Columna area_id en Solicitud
        const solicitudInfo = await db.all('PRAGMA table_info(Solicitud)');
        if (!solicitudInfo.some(c => c.name === 'area_id')) {
            console.log('Agregando "area_id" a Solicitud...');
            await db.run('ALTER TABLE Solicitud ADD COLUMN area_id INTEGER');
        }

        console.log('Migraciones finalizadas.');
    } catch (err) {
        console.error('Error en migración:', err);
    }
};

app.get('/', (req, res) => {
  res.send('API SISTEMA DE INCIDENCIAS funcionando');
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
  await runMigrations();
});