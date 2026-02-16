
import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', async (req, res) => {
    await db.read();
    res.json(db.data.users);
});

router.post('/', async (req, res) => {
    const newUser = req.body;
    await db.read();
    db.data.users.push(newUser);
    await db.write();
    res.status(201).json(newUser);
});

export default router;
