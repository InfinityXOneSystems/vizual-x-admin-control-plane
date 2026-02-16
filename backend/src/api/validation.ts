
import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/tests', async (req, res) => {
    await db.read();
    res.json(db.data.tests);
});

router.get('/status', async (req, res) => {
    await db.read();
    const tests = db.data.tests;
    const passRate = (tests.filter(t => t.status === 'pass').length / tests.length) * 100;
    res.json({
        health: 'STEADY',
        passRate: passRate.toFixed(2),
        db: 'CONNECTED',
        api: 'READY',
        lastAudit: new Date().toISOString()
    });
});

export default router;
