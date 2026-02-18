
import { Router } from 'express';
import usersRouter from './users';
import tokensRouter from './tokens';
import flagsRouter from './flags';
import validationRouter from './validation';
import authRouter from './auth';
import promoRouter from './promo';
import billingRouter from './billing';
import connectionsRouter from './connections';
import syncRouter from '../routes/sync';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/tokens', tokensRouter);
router.use('/flags', flagsRouter);
router.use('/validation', validationRouter);
router.use('/promos', promoRouter);
router.use('/billing', billingRouter);
router.use('/connections', connectionsRouter);
router.use('/sync', syncRouter);

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
