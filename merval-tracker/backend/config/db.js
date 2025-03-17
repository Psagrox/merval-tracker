import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carga de variable de entorno
const enviroment = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${enviroment}` });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB conectado en entorno: ${enviroment}`);
    } catch (err) {
        console.error('Error de conexion a MongoDB: ', err.message);
        process.exit(1);
    }
};

export default { connectDB };