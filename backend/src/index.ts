
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import apiRouter from './api';
import { initializeDatabase } from './db';
import './passport-setup'; // Initialize passport strategies

const app = express();
const PORT = process.env.PORT || 3001;

// Setup CORS first to handle pre-flight requests correctly
app.use(cors({
    origin: 'http://localhost:3000', // Allow frontend to connect
    credentials: true
}));

// Then setup other middlewares
app.use(express.json());

// IMPORTANT: For production, use a persistent session store like connect-redis or connect-mongo.
// MemoryStore is not suitable for production as it will leak memory and doesn't scale.
app.use(session({
    secret: process.env.SESSION_SECRET || 'a-secure-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // use secure cookies in production
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Initialize Passport and restore authentication state, if any, from the session.
// This MUST come after express-session middleware.
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', apiRouter);

// This is a catch-all for the auth redirects to work correctly.
// The user is redirected back to the frontend from the OAuth provider.
app.get('*', (req, res) => {
  res.redirect('http://localhost:3000/');
});


const startServer = async () => {
    await initializeDatabase();
    app.listen(PORT, () => {
        console.log(`[VIX BACKEND] Sovereign API listening on port ${PORT}`);
        console.log(`[VIX BACKEND] Status: Handshake ACTIVE`);
    });
};

startServer();