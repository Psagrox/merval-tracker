import express from 'express';
const router = express.Router();
import { getTransactions, createTransaction, deleteTransaction } from '../controllers/transactionController';
import { protect } from '../middleware/auth';

// Aplicar middleware de protección a todas las rutas
router.use(protect);

// Rutas para transacciones
router.route('/')
    .get(getTransactions)
    .post(createTransaction);

router.delete('/:id', deleteTransaction);

export default router;