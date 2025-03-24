import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
    stockSymbol: {
        type: String,
        required: [true, 'Por favor ingrese el simbolo de la accion'],
        trim: true,
        uppercase: true,
        unique: true
    },
    companyName: {
        type: String,
        required: [true, 'Por favor ingrese el nombre de la compania'],
        trim: true
    },
    currentPrice: {
        type: Number,
        required: [true, 'Por favor ingrese el precio actual']
    },
    percentageChange: {
        type: Number,
        default: 0
    },
    isDollar: {
        type: Boolean,
        default: true,
        required: true
    },
    lastUpdate: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals:true }
});

// Campo virtual para obtener todas las transacciones de la accion
StockSchema.virtual('transactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'stock',
    justOne: false
});

// Middleware para actualizar la fecha de la ultima actualizacion
StockSchema.pre('save', function(next) {
    if (this.isModified('currentPrice') || this.isModified('percentageChange')) {
        this.lastUpdate = Date.now();
    }
    next();
});

export default mongoose.model('Stock', StockSchema);