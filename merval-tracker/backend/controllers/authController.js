import User from '../models/User';
import Portfolio from '../models/Portfolio';
import jwt from 'jsonwebtoken';

// @desc Registrar un nuevo usuario
// @route POST /api/auth/register
// @access Public

exports.register = async(req, res) => {
    try {
        const { username, email, password } = req.body;

        // Verificar si el usuario existe
        const userExist = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (userExist) {
            return res.status(400).json({
                success: false,
                error: 'Usuario o email ya registrado'
            });
        };


        // Crear un nuevo usuario
        const user = new User({
            username,
            email,
            passwordHash: password
        });

        // Crear un portafolio por defecto para el usuario
        const portfolio = new Portfolio({
            name: 'Mi portafolio',
            user: user._id
        });

        await portfolio.save();

        // Asignar el portafolio al usuario
        user.portfolio = portfolio._id;
        await user.save();

        // Generar JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                portfolio: user.portfolio
            }
        });
    } catch (error) {
        console.error('Error en registro: ', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};

// @desc Login de usuario
// @route POST /api/auth/login
// @acess Public
exports.login = async (req,res) => {
    try {
        const { email, password } = req.body;

        // Verificar que see proporcionen email y password
        if(!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Proporcione un email y contraseña'
            });
        }

        // Buscar al usuario por email e incluir el passwordHash
        const user = await User.findeOne({ email }).select("+passwordHash");

        // Verificar si el usuario existe
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credeciales invalidas'
            });
        }

        // Verificar si la contraseña coincide
        const isMatch = await user.mathcPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales invalidas'
            });
        }

        // Generar JWT
        const token = jwt.sign(
            { id: user._id},
            ProcessingInstruction.env.JWT_SECRET,
            { expiresInd: '30d' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                portfolio: user.portfolio
            }
        });
    } catch (error) {
        console.error('Error en Login: ', error);
        res.status(500).json({
            sucess: false,
            error: 'Error en el servidor'
        });
    }
};

// @desc Obtener informacion del usuario actual
// @route get /api/auth/me
// @acess Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('portfolio');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error al obtener usuario: ', error);
        res.satus(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};