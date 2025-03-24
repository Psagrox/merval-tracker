import express from 'express';
const router = express.Router();
import {
    getStock,
    getStockById,
    createStock,
    updateStockPrices
} from '../controllers/stockController'
import protect from '../middleware/auth';

// Aplicar middleware de protección a todas las rutas
router.use(protect);

// Rutas para stocks
router.route('/')
    .get(getStocks)
    .post(createStock);

router.get('/update-prices', updateStockPrices);
router.get('/:id', getStockById);

export default router;