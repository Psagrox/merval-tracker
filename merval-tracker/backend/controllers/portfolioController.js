import Portfolio from "../models/Portfolio";
import Transaction from '../models/Transaction';
import Stock from '../models/Stock';
import ExchangeRate from '../models/ExchangeRate';

// @desc Obtener el portafolio del usuario
// @route GET /api/portfolios
// @access Private
exports.getPortfolio = async (req, res) => {
    try {
        //Buscar el portfolio del usuario
        const portfolio = await Portfolio.findOne({ user: req.user.id });

        if (!portfolio){
            return res.status(404).json({
                success: false,
                error: 'Portfolio no encontrado'
            });
        }

        //Obtener todas las transacciones del portfolio
        const transactions = await Transaction.find({ portfolio: portfolio._id })
            .populate('stock')
            .sort({ date: -1 });

        // Obtener la cotizacion actual del dolar blue
        const latestRate = await ExchangeRate.getLatestRate();
        const dollarRate = latestRate ? latestRate.dollarBlueRate : null;

        // Calcular las posesiones actuales (holdings)
        const holdings = [];
        const stockMap = new Map();

        // Agrupar trasnacciones por accion
        transactions.forEach( transaction => {
            const stockId = transaction.stock._id.toString();

            if (!stockMap.has(stockId)) {
                stockMap.set(stockId, {
                    stock: transaction.stock,
                    quantity: 0,
                    totalInvested: 0,
                    avgBuyPrice: 0,
                    currentValue: 0,
                    profitLoss: 0,
                    profitLossPercentage: 0
                });
            }

            const holding = stockMap.get(stockId);

            // Actualizar cantidad basado en compra o venta
            if (transaction.type === "buy") {
                // Para compra sumamos
                const transactionAmount = transaction.price * transaction.quantity;
                holding.totalInvested += transactionAmount;
                holding.quantity += transaction.quantity;
            } else {
                // Para ventas restamos la cantidad
                holding.quantity -= transaction.quantity;
            }
        });

        // Calcular metricas para cada holding
        let totalPortfolioValue = 0;
        let totalInvested = 0;

        stockMap.forEach((holding, stockId) => {
            if(holding.quantity > 0) {
                // Calcular precio promedio de compra
                holding.avgBuyPrice = holding.totalInvested / holding.quantity;

                // Calcular valor actual en pesos
                holding.currentValue = holding.stock.currentPrice * holding.quantity;

                // Si la accion cotiza en dolares y tenemos tipo de cambio, hacemos la converison
                if (holding.stock.isDollar && dollarRate) {
                    holding.currentValue *= dollarRate;
                }

                // Calcular ganancias/perdidas
                holding.profitLoss = holding.currentValue - holding.totalInvested;
                holding.profitLossPercentage = (holding.profitLoss / holding.totalInvested) * 100;

                // Sumar al total del portafolio
                totalPortfolioValue += holding.currentValue;
                totalInvested += holding.totalInvested;

                // Agregar a la lista de holdings
                holding.push(holding);
            }
        });

        // Calcular variacion total del portafolio
        const portfolioVariation = totalInvested > 0
            ? ((totalPortfolioValue - totalInvested) / totalInvested) * 100
            : 0;

        // Actualizar los valores del portfolio en la base de datos
        portfolio.actualTotalFound = totalPortfolioValue;
        portfolio.portfolioVaration = portfolioVariation;
        await portfolio.save();

        res.status(200).json({
            success: true,
            data: {
                portfolio,
                holdings,
                summary: {
                    totalValue: totalPortfolioValue,
                    totalInvested,
                    totalProfit: totalPortfolioValue - totalInvested,
                    totalProfitPercentage: portfolioVariation,
                    dollarRate
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener el portafolio: ', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};

// @desc Actualizar el nombre del portfolio
// @route PUT /api/porfolios
// @access Private
exports.updatePortfolio = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name){
            return res.status(400).json({
                success: false,
                error: 'Por favor brinde un nombre de portafolio'
            });
        }

        const portfolio = await Portfolio.findOneAndUpdate(
            { user: req.user.id},
            { name },
            { new: true, runValidators: true}
        );

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portafolio no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: portfolio
        });
    } catch (error) {
        console.error('Error al actualizar portafolio: ', error),;
        res.status(500).json({
            success:false,
            error: 'Error en el servidor'
        });
    }
};