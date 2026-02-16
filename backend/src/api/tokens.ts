
import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', async (req, res) => {
    await db.read();
    res.json(db.data.tokens);
});

export default router;
