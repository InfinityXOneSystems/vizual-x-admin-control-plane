
import express from 'express';
import cors from 'cors';
import apiRouter from './api';
import { initializeDatabase } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

const startServer = async () => {
    await initializeDatabase();
    app.listen(PORT, () => {
        console.log(`[VIX BACKEND] Sovereign API listening on port ${PORT}`);
        console.log(`[VIX BACKEND] Status: Handshake ACTIVE`);
    });
};

startServer();
