import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Configuracion
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexion a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado a Mongo'))
    .catch(err => console.error('Fallo la conexion a Mongo: ', err));

// Rutas
app.get('/', (req, res) => {
    res.send('API del portafolio de acciones funcionando');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en puerto: ${PORT}`)
})