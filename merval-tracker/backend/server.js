import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import routes from './routes';

// Configuracion
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());

// Conexion a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log(`Conectado a MongoDB en entorno ${NODE_ENV}`))
    .catch(err => {
        console.error('Error conectando a MongoDB:', err);
        process.exit(1);
    });

// Montar rutas API
app.use('/api', routes);

// Servir frontend en producción
if (NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
}

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        error: NODE_ENV === 'production' ? 'Error en el servidor' : err.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT} en entorno ${NODE_ENV}`);
});