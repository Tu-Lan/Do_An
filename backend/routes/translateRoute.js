import express from 'express';
import { translateText } from '../controllers/translateController.js';

const translationRouter = express.Router();

translationRouter.post('/translate', translateText);

export default translationRouter;