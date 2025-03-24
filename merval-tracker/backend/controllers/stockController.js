import Stock from "../models/Stock";
import axios from 'axios';
import ExchangeRate from "../models/ExchangeRate";

// @desc Obtener todas las acciones
// @route Get /api/stocks
// @access Private
exports.getStock = async (req, res) => {
    try {
        const stocks = await Stock.find().sort({ companyName: 1 });

        res.status(200).json({
            success: true,
            count: stocks.length,
            data: stocks
        });
    } catch (error) {
        console.error('Error al obtener acciones: ', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};

// @desc Obtener una acicon por ID
// @route GET /api/stocks/:id
// @access Private
exports.getStockById = async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);

        if (!stock) {
            return res.status(400).json({
                success: false,
                error: 'Accion no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: stock
        });
    } catch (error) {
        console.error('Error al obtener accion: ', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};

// @desc Crear una nueva accion
// @route POST /api/stocks
// @access Private
exports.createStock = async (req, res) => {
    try {
        const { stockSymbol, companyName, currentPrice, isDollar } = req.body;

        // Validar campos requeridos
        if (!stockSymbol || !companyName || currentPrice == undefined) {
            return res.status(400).json({
                success: false,
                error: 'Por favor complete todos los campos requeridos'
            });
        }

        // Verificar si ya existe una accion con ese simbolo
        const stockExists = await Stock.findOne({
            stockSymbol: stockSymbol.toUpperCase()
        });

        if (stockExists) {
            return res.status(400).json({
                success: false,
                error: 'Ya existe una accion ocn ese simbolo'
            });
        }

        // Crear la accion
        const stock = new Stock({
            stockSymbol: stockSymbol.toUpperCase(),
            companyName,
            currentPrice,
            isDollar: isDollar
        });

        await stock.save();

        res.status(201).json({
            success: true,
            data: stock
        });
    } catch (error) {
        console.error('Error al crear accion: ', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};

// @desc Actualizar los precios de todas las acciones
// @route GET /api/stocks/update-prices
// @access Private
exports.updateStockPrice = async (req, res) => {
    try {
        // Obtener todas las acciones
        const stocks = await Stock.find();

        if (stocks.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No hay acicones para actualizar'
            });
        }

        // Dividar las acciones segun si cotizan en pesos o dolares
        const pesoStocks = stocks.filter(stock => !stock.isDollar);
        const dollarStocks = stocks.filter(stock => stock.isDollar);

        // Actualizar precio del dolar blue
        await updateDollarRate();

        // Actualziar precios de acciones en pesos (API to be define)
        for (const stock of pesoStocks) {
            try {
                //TBD API de cotizacion argentina
                //....
                // Por ahora, como ejemplo, simulamos un cambio aleatorio
                const previousPrice = stock.currentPrice;
                const changePercentage = (Math.random() * 10) - 5; // Entre -5% y +5%
                const newPrice = previousPrice * (1 + (changePercentage / 100));

                stock.currentPrice = parseFloat(newPrice.toFixed(2));
                stock.percentageChange = changePercentage;
                stock.lastUpdate = Date.now();

                await stock.save();
            } catch (error) {
                console.error(`Error actualizando ${stock.stockSymbol}:`, error);
            }
        }

        // Actualizar precios de ADRs (podrías usar una API de EE.UU.)
        for (const stock of dollarStocks) {
            try {
                // Aquí iría la lógica para consultar la API de precios de EE.UU.
                // Por ahora, como ejemplo, simulamos un cambio aleatorio
                const previousPrice = stock.currentPrice;
                const changePercentage = (Math.random() * 8) - 4; // Entre -4% y +4%
                const newPrice = previousPrice * (1 + (changePercentage / 100));

                stock.currentPrice = parseFloat(newPrice.toFixed(2));
                stock.percentageChange = changePercentage;
                stock.lastUpdate = Date.now();

                await stock.save();
            } catch (error) {
                console.error(`Error actualizando ${stock.stockSymbol}:`, error);
            }
        }
        res.status(200).json({
            success: true,
            message: 'Precios actualizados correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar precios:', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor'
        });
    }
};


// Función auxiliar para actualizar el precio del dólar blue
async function updateDollarRate() {
    try {
        // Aquí iría la consulta a la API del dólar blue
        // Por ejemplo, podrías usar una API como https://api.bluelytics.com.ar/v2/latest
        // o https://criptoya.com/api/dolar

        const response = await axios.get('https://api.bluelytics.com.ar/v2/latest');
        const blueRate = response.data.blue.value_sell;

        // Guardar la nueva cotización
        const exchangeRate = new ExchangeRate({
            dollarBlueRate: blueRate,
            source: 'Bluelytics API'
        });

        await exchangeRate.save();

        return blueRate;
    } catch (error) {
        console.error('Error al actualizar cotización del dólar:', error);

        // Si falla, tratar de obtener la última cotización guardada
        const latestRate = await ExchangeRate.getLatestRate();
        return latestRate ? latestRate.dollarBlueRate : null;
    }
}