import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    stock: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: [true, 'Por favor agregue una accion']
    },
    portfolio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Porfolio',
        required: [true, 'La transaccion debe pertenecer a un portafolio']
    },
    type: {
        type: String,
        enum: ['buy','sell'],
        required: [true, 'Especifique si se trata de una venta o una compra']
    },
    quantity: {
        type: Number,
        required: [true, 'Por favor ingrese la cantidad'],
        min: [1, 'La cantidad tiene que ser mayor a 1']
    },
    price: {
        type: Number,
        required: [true, 'Por favor ingrese el precio de la transaccion'],
        min: [0, 'El precio no puede ser negativo']
    },
    dollarRate: {
        type: Number,
        default: null // Sera null para las accionesen pesos
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trime: true
    }
});

// Indices para optimizar consultas frecuentes
TransactionSchema.index({ portfolio: 1, date: -1 });
TransactionSchema.index({ stock: 1, date: 1 });


// Middleware para actualizar el total de fondos en el portfolio
TransactionSchema.post('save', async function() {
    try {
        // Calcular posicion actual y valores para actualziar portafolio
        const Porfolio = this.model('Portfolio');
        const Transaction = this.model('Transaction');

        // Obtener todas las transacciones del portafolio
        const portafolio = await Porfolio.findById(this.portfolio);

        if (portafolio) {
            //To be define logica de actualizan de portafolio

            // Por ahora solo actualiza la fecha
            portafolio.updatedAt = Date.now();
            await portafolio.save();
        }
    } catch (err) {
        console.error('Error en la actualizacion del portafolio: ', err);
    }
});

export default mongoose.model('Transaction', TransactionSchema);