import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Por favor ingrese un nombre de usuario'],
        unique: [true, 'Ese usuario ya existe'],
        trim: true,
        minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres']
    },
    email: {
        type: String,
        required: [true, 'Por favor ingrese un email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor ingrese un mail válido'
        ]
    },
    passwordHash: {
        type: String,
        required: [true, 'Por favor ingrese una contraseña'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false //evitar incluirlo en las consultas por defectos
    },
    portfolio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Portfolio'
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para hashear contraseña
UserSchema.pre('save', async function(next) {
    // Solo hashear si la contraseña fue modificada
    if(!this.isModified('passwordHash')) {
        next();
        return;
    }

    // Generar salt
    const salt = await bcrypt.genSalt(10);

    // Hasehar la contraseña
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next()
});

// Metodo para comparar contraseñas
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
}

export default mongoose.model('User', UserSchema);