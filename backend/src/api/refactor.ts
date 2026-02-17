
import { Router } from 'express';
import axios from 'axios';

const router = Router();

const PYTHON_BRIDGE_URL = process.env.PYTHON_BRIDGE_URL || 'http://localhost:8000';

// Audit repository for compliance
router.post('/audit', async (req, res) => {
    try {
        const { target } = req.body;
        
        if (!target) {
            return res.status(400).json({ error: 'Target repository is required' });
        }

        const response = await axios.post(`${PYTHON_BRIDGE_URL}/execute`, {
            action: 'audit_repo',
            target: target,
            params: {}
        });

        res.json(response.data);
    } catch (error) {
        console.error('[REFACTOR API] Audit failed:', error);
        res.status(500).json({ 
            error: 'Failed to audit repository',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Execute God Mode refactoring
router.post('/execute', async (req, res) => {
    try {
        const { target, params } = req.body;
        
        if (!target) {
            return res.status(400).json({ error: 'Target repository is required' });
        }

        const response = await axios.post(`${PYTHON_BRIDGE_URL}/execute`, {
            action: 'execute_refactor',
            target: target,
            params: params || {}
        });

        res.json(response.data);
    } catch (error) {
        console.error('[REFACTOR API] God Mode execution failed:', error);
        res.status(500).json({ 
            error: 'Failed to execute God Mode refactor',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get God Mode status
router.get('/status', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_BRIDGE_URL}/`);
        res.json({
            enabled: response.data.status === 'online',
            bridgeStatus: response.data.status,
            loadedPlugins: response.data.loaded_plugins
        });
    } catch (error) {
        console.error('[REFACTOR API] Status check failed:', error);
        res.status(503).json({ 
            enabled: false,
            error: 'Python bridge unavailable'
        });
    }
});

export default router;
