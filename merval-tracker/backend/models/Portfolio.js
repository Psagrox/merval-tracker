import mongoose from "mongoose";

const PortfolioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor ingrese un nombre al portafolio'],
        trim: true,
        default: 'Mi portafolio'
    },
    actualTotalFound: {
        type: Number,
        default: 0
    },
    portfolioVaration: {
        type: Number,
        default: 0,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Campo virtual para obtener todas las transacciones asociadas a este portafolio
PortfolioSchema.virtual('transactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'portfolio',
    justOne: false
});

// Middleware para actualziar la fecha de modificacion
PortfolioSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
})

export default mongoose.model('Portafolio', PortfolioSchema);