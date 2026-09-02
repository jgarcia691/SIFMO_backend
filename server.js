require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { initDatabase } = require('./config/initDB');
const { verifyConnection } = require('./src/utils/mailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Importar rutas
const userRoutes = require('./src/user/routes');
const areaRoutes = require('./src/area/routes');
const incidentRoutes = require('./src/incident/routes');
const workstationRoutes = require('./src/workstation/routes');
const marcaRoutes = require('./src/marca/routes');
const equipoRoutes = require('./src/equipo/routes');
const sylviaRoutes = require('./src/sylvia/routes');

app.use(cors());
app.use(express.json());

// Middleware para registrar todas las solicitudes importantes en consola
app.use((req, res, next) => {
  const methodColors = {
    GET: '\x1b[32m',    // Verde
    POST: '\x1b[34m',   // Azul
    PUT: '\x1b[33m',    // Amarillo
    DELETE: '\x1b[31m', // Rojo
    PATCH: '\x1b[35m'   // Magenta
  };
  const resetColor = '\x1b[0m';
  const color = methodColors[req.method] || resetColor;
  
  const hasBody = req.body && Object.keys(req.body).length > 0;
  const hasQuery = req.query && Object.keys(req.query).length > 0;
  
  // Solo imprimir si hay datos en el body o en los query parameters
  if (hasBody || hasQuery) {
    console.log(`\n${color}[${new Date().toLocaleString()}] ${req.method} ${req.url}${resetColor}`);
    
    if (hasBody) {
      const safeBody = { ...req.body };
      if (safeBody.password) safeBody.password = '[OCULTO POR SEGURIDAD]';
      console.log(`${color}➜ Datos recibidos (Body):${resetColor}`, safeBody);
    }
    
    if (hasQuery) {
      console.log(`${color}➜ Parámetros (Query):${resetColor}`, req.query);
    }
  }
  
  next();
});

// Usar rutas
app.use('/api/users', userRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/incidentes', incidentRoutes);
app.use('/api/workstations', workstationRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/equipos', equipoRoutes);
app.use('/api/sylvia', sylviaRoutes);

app.get('/', (req, res) => {
  res.send('API SISTEMA DE INCIDENCIAS funcionando');
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
  // Inicialización automática de la base de datos
  await initDatabase();
  // Verificar conexión SMTP
  await verifyConnection();
});