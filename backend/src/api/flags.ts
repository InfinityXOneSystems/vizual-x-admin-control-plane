
import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', async (req, res) => {
    await db.read();
    res.json(db.data.flags);
});

router.post('/:id/toggle', async (req, res) => {
    const { id } = req.params;
    await db.read();
    const flag = db.data.flags.find(f => f.id === id);
    if (flag) {
        flag.enabled = !flag.enabled;
        await db.write();
        res.json(flag);
    } else {
        res.status(404).json({ error: 'Feature flag not found' });
    }
});

export default router;
