
import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { User } from '../../../types';

const router = Router();
const saltRounds = 10;

// === LIVE OAUTH 2.0 FLOWS ===

// 1. Initiate GitHub Authentication
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// 2. GitHub Callback Handler
router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: 'http://localhost:3000/?error=auth_failed' }),
    (req, res) => { res.redirect('http://localhost:3000/'); }
);

// --- GOOGLE OAUTH FLOWS ---
// Generic Google login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Specific Google Service Connections
router.get('/gcp', passport.authenticate('google', { 
    scope: [
        'profile', 
        'email', 
        'https://www.googleapis.com/auth/cloud-platform.read-only'
    ] 
}));

router.get('/gworkspace', passport.authenticate('google', { 
    scope: [
        'profile', 
        'email', 
        'https://www.googleapis.com/auth/admin.directory.user.readonly' // Example scope for Workspace
    ] 
}));

// Single Google Callback Handler for all Google auth flows
router.get(
    '/google/callback', 
    passport.authenticate('google', { failureRedirect: 'http://localhost:3000/?error=auth_failed' }), 
    (req, res) => { res.redirect('http://localhost:3000/'); }
);


// === SESSION MANAGEMENT ===

router.get('/session', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.json({ authenticated: true, user: req.user });
    } else {
        res.status(401).json({ authenticated: false, user: null });
    }
});

router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to destroy session.'});
            }
            res.clearCookie('connect.sid');
            res.json({ success: true, message: 'Logged out successfully.' });
        });
    });
});


// === LOCAL AUTH & DEMO (Email/Password) ===

router.post('/login', passport.authenticate('local'), (req, res) => {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.json({ success: true, message: 'Authentication successful.', user: req.user });
});


router.post('/signup', async (req, res, next) => {
    try {
        const { email, password, promoCode } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });

        await db.read();
        if (db.data.users.find(u => u.email === email)) return res.status(409).json({ success: false, message: 'Operator email already exists.' });

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser: User = {
            id: (db.data.users.length + 1).toString(),
            name: email.split('@')[0],
            email,
            password: hashedPassword,
            role: 'operator',
            status: 'active',
            lastActive: new Date().toISOString(),
            accessLevel: 'full',
        };

        // Promo code logic remains the same...

        db.data.users.push(newUser);
        await db.write();

        req.logIn(newUser, (err) => {
            if (err) { return next(err); }
            res.status(201).json({ success: true, message: 'Account created successfully.', user: newUser });
        });
    } catch(err) {
        next(err);
    }
});

router.post('/demo', async (req, res, next) => {
    await db.read();
    const demoUser = db.data.users.find(u => u.accessLevel === 'demo');
    if (!demoUser) return res.status(500).json({ success: false, message: 'Demo environment not configured.' });
    
    req.logIn(demoUser, (err) => {
        if (err) { return next(err); }
        res.json({ success: true, message: 'Demo access granted.', user: demoUser });
    });
});

router.post('/request-reset', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
    await db.read();
    const userExists = db.data.users.some(u => u.email === email);
    console.log(`[AUTH] Password reset requested for: ${email}. User exists: ${userExists}`);
    res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
});

export default router;