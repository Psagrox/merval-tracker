import express from "express";

// Creo una instancia del router
const router = express.Router();

import { getPortfolio, updatePortfolio } from '../controllers/portfolioController';
import { protect } from '../middleware/auth';

// Aplicar middleware de proteccion a todas las rutas
router.use(protect);

// Rutas para portfolios
router.get('/', getPortfolio);
router.put('/', updatePortfolio);

export default router;