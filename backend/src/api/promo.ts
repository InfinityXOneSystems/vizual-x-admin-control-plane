
import { Router } from 'express';
import { db } from '../db';
import { PromoCode } from '../../../types';

const router = Router();

// GET all promo codes (for admin)
router.get('/', async (req, res) => {
    await db.read();
    res.json(db.data.promoCodes);
});

// GET (validate) a single promo code
router.get('/:code', async (req, res) => {
    const { code } = req.params;
    await db.read();
    const promo = db.data.promoCodes.find(c => c.code === code && c.usesLeft > 0 && new Date(c.expiresAt) > new Date());
    if (promo) {
        res.json({ success: true, message: 'Code is valid.', promo });
    } else {
        res.status(404).json({ success: false, message: 'Invalid or expired code.' });
    }
});

// POST a new promo code (for admin)
router.post('/', async (req, res) => {
    const newPromo: PromoCode = {
        id: `promo_${Date.now()}`,
        ...req.body,
    };
    db.data.promoCodes.push(newPromo);
    await db.write();
    res.status(201).json(newPromo);
});

// PUT (update) a promo code (for admin)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    await db.read();
    const promoIndex = db.data.promoCodes.findIndex(c => c.id === id);
    if (promoIndex > -1) {
        db.data.promoCodes[promoIndex] = { ...db.data.promoCodes[promoIndex], ...req.body };
        await db.write();
        res.json(db.data.promoCodes[promoIndex]);
    } else {
        res.status(404).json({ error: 'Promo code not found' });
    }
});

// DELETE a promo code (for admin)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await db.read();
    const initialLength = db.data.promoCodes.length;
    db.data.promoCodes = db.data.promoCodes.filter(c => c.id !== id);
    if (db.data.promoCodes.length < initialLength) {
        await db.write();
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Promo code not found' });
    }
});

export default router;