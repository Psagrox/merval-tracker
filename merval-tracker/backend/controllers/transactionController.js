import Transaction from "../models/Transaction";
import Portfolio from "../models/Portfolio";
import Stock from "../models/Stock";
import ExchangeRate from "../models/ExchangeRate";

// @desc Obtener todas las transacciones del usuario
// @route GET /api/transactions
// @access Private
exports.getTransactions = async (req, res) => {
    try {
        // Buscar el portafolio del usuario
        const porfolio = await Portfolio.findOne({ user: req.user.id });

        if (!porfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portafolio no encontrado'
            });
        }

        // Buscar todas las transacciones en el portafolio
        const transactions = await Transaction.find({ portfolio: porfolio._id })
            .populate('stock')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        console.error('Error al obtener transacciones: ', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};

// @desc Crear una nueva transaccion
// @route POST /api/transactions
// @access Private
exports.createTransaction = async (req, res) => {
    try {
        const { stockId, type, quantity, price, date, notes } = req.body;

        // Validar los campos requeridos
        if (!stockId || !type || !quantity || !price) {
            return res.status(400).json({
                success: false,
                error: 'Por favor complete todos los campos requeridos'
            });
        }

        // Verificar si el stock existe
        const stock = await Stock.findById(stockId);
        if (!stock) {
            return res.status(404).json({
                success: false,
                error: 'Accion no encontrada'
            });
        }

        // Obtener el portafolio del usuario
        const porfolio = await Portfolio.findOne({ user: req.user.id });
        if (!porfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio no encontrado'
            });
        }

        // Para ventas, verificar que tenga suficientes acciones
        if (type == 'sell') {
            // Obtener la cantidad actual de la stock en si
            const { totalQuantity } = await getCurrentStockQuantity(porfolio._id, stockId);

            if (totalQuantity < quantity) {
                return res.status(400).json({
                    success: false,
                    error: `No tiene suficientes acciones para vender. Disponible: ${totalQuantity}`
                });
            }
        }

        // Si la accion cotiza en dolares, obtener el tipo de cambio
        let dollarRate = null;
        if (stock.isDollar) {
            // Si se proporciono una fecha en especifico, buscar la cotizacion de esa fecha
            const targetDate = date ? new Date(date) : new Date();
            const exchangeRate = await ExchangeRate.getRateByDate(targetDate);

            if (exchangeRate) {
                dollarRate = exchangeRate.dollarBlueRate;
            } else {
                // Si no hay cotizacion, obtener la más reciente
                const latestRate = await ExchangeRate.getLastRate();
                if (latestRate) {
                    dollarRate = latestRate.dollarBlueRate;
                }
            }
        }

        // Crear la transaccion
        const transaction = new Transaction({
            stock: stockId,
            portfolio: porfolio._id,
            type,
            quantity,
            price,
            dollarRate,
            date: date || Date.now(),
            notes
        });

        await transaction.save();

        // Actualziar el precio actual de la accion si es una compra reciente
        const transactionDate = new Date(transaction.date);
        const now = new Date();
        const isRecent = (now - transactionDate) < (1000 * 60 * 60 * 24) // Menos de un día

        if (isRecent && type == 'buy') {
            stock.currentPrice = price;
            stock.lastUpdate = now;
            await stock.save();
        }

        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Error al crear trnasaccion: ', error);
        res.status(500).json({
            success: false,
            error: 'Erro en el servidor'
        });
    }
}

// @desc Eliminar
// @route DELETE /api/tansactions/:id
// @access Private
exports.deleteTransaction = async (req, res) => {
    try {
        // Buscar el portafolio del usuario
        const porfolio = await Portfolio.findOne({ user: req.user.id });

        if (!porfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portafolio no encontrado'
            });
        }

        // Buscar la transaccion
        const transaction = await Transaction.findById(req.params.id);

        if(!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaccion no encontrada'
            });
        }

        // Verificar que la transaccion pertenece al portafolio del usuario
        if (transaction.portfolio.toString() !== porfolio._id.toString()) {
            return res.status(401).json({
                success: false,
                error: 'No autorizado para eliminar esta transaccion',
            });
        }

        // Para ventas, asegurarse de eliminar esta transacicon no genre una cantidad negativa
        if (transaction.type === 'sell'){
            // No necesesitamos verifincar nada aca ya que al revertir una venta sumamos no restamos
        } else if (transaction.type === 'buy') {
            // Aca si necesitamos verificar que al revertir la compra no quedemos en unidades negativas
            const { totalQuantity } = await getCurrentStockQuantity(
                porfolio._id,
                transaction.stock,
                transaction._id,
            );

            if (totalQuantity < transaction.quantity ){
                return res.status(400).json({
                    success: false,
                    error: `No se puede eliminar esta compra ya que tenemos disponibles: ${totalQuantity} acciones solamente`
                });
            }
        }

        // Eliminar la transaccion
        await transaction.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error al eliminar transaccion: ', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        })
    }
};


// Funcion auxiliar para obtenre la cantidad actual de una accion
async function getCurrentStockQuantity(portfolioId, stockId, excludeTransactionId = null) {
    const query = {
        porfolio: portfolioId,
        stock: stockId
    };

    // Si se proporciona un ID de transaccion para excluir
    if (excludeTransactionId) {
        query._id = { $ne: excludeTransactionId };
    }

    const transactions = await Transaction.find(query);

    let totalQuantity = 0;
    let totalInvested = 0;

    transactions.forEach(t => {
        if (t.type === 'buy') {
            totalQuantity += t.quantity;
            totalInvested += t.price * t.quantity;
        } else {
            totalQuantity -= t.quantity;
        }
    });

    const avgBuyPrice = totalQuantity > 0 ? totalInvested / totalQuantity : 0;

    return {
        totalQuantity,
        totalInvested,
        avgBuyPrice
    };
}