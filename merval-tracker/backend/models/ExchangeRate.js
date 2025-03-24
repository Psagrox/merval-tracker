import mongoose from "mongoose";

const ExchangeRateSchema = new mongoose.Schema ({
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    dollarBlueRate: {
        type: Number,
        required: [true, 'Por favor ingrese la cotizacion del dolar blue']
    },
    dollarOfficialRate: {
        type: Number,
        default: null
    },
    source: {
        type: String,
        default: 'API'
    }
});

// Indice para optimizar las busquedas por fecha
ExchangeRateSchema.index({ date: -1 });

// Metodo estatico para obtener la cotizacion más reciente
ExchangeRateSchema.statics.getLatestRate = async function() {
    return await this.findOne().sort({ date: -1 }).limit(1);
};

// Metodo estatico para obtener la cotizacion más cercana a una fecha
ExchangeRateSchema.statics.getRateByDate = async function(targetDate) {
    const date = new Date(targetDate);

    // Primero intentamos encontrar una cotizacion del mismo día
    const sameDay = await this.findOne({
        date: {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lte: new Date(date.setHours(23, 59, 59, 999))
        }
    });

    if (sameDay) return sameDay

    // Si no hay cotizacion del mismo día, buscamos la más cercana
    return await this.findOne({
        date: { $lte: targetDate }
    }).sort({ date: -1}).limit(1);
};

export default mongoose.model('ExchangeRate', ExchangeRateSchema);