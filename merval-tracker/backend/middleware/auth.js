import jwt from 'jsonwebtoken';
import User from '../models/User';

// Middleware para proteger rutas que requieran authenticación
exports.protect = async (req, res, next) => {
    let token;

    // Verificar si hay token en el header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Obtener el token del header
        token = req.header.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'No está autorizado para acceder a esta ruta'
        });
    }

    try {
        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Buscar al usuario por el ID en el token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        next();
    } catch (error) {
        console.error('Error de autenticacion: ', error);
        return res.status(401).json({
            success: false,
            error: 'No esta autorizado para acceder a esta ruta'
        });
    }
};