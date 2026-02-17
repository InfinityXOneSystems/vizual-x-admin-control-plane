
import { Router } from 'express';
import usersRouter from './users';
import tokensRouter from './tokens';
import flagsRouter from './flags';
import validationRouter from './validation';
import refactorRouter from './refactor';

const router = Router();

router.use('/users', usersRouter);
router.use('/tokens', tokensRouter);
router.use('/flags', flagsRouter);
router.use('/validation', validationRouter);
router.use('/refactor', refactorRouter);

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
