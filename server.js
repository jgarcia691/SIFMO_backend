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

app.use(cors());
app.use(express.json());

// Usar rutas
app.use('/api/users', userRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/incidentes', incidentRoutes);

app.get('/', (req, res) => {
  res.send('API SISTEMA DE INCIDENCIAS funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});