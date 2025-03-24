import express from "express";

// Crear una instancia del router
const router = express.Router();

// Importar rutas
import authRoutes from './auth.js';
import portfolioRoutes from './portfolio.js';
import stockRoutes from './stock.js';
import transactionRoutes from './transaction.js';

// Montar rutas
router.use('/auth', authRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/stock', stockRoutes);
router.use('/transaction', transactionRoutes);

// Exportar correctamente el router
export default router;
