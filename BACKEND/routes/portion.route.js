import express from 'express';
import {createPortionController, getAllPortionController,  getPortionByIdController} from '../controllers/portion.controller.js';
import { validateCreatePortionRequest } from '../middlewares/portion.validator.js';
// import authMiddleware from '../middleware/authMiddleware.js'; // Uncomment when you have auth


const portionRouter = express.Router();

portionRouter.post('/createPortion', validateCreatePortionRequest, createPortionController.createPortion);

portionRouter.get('/getAllPortion', getAllPortionController);

portionRouter.get('/getPortionById/:portion_id', getPortionByIdController);

export default portionRouter;

