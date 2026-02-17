
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
        console.error('[REFACTOR API] Audit failed');
        res.status(500).json({ 
            error: 'Failed to audit repository',
            details: 'Please check that the Python bridge is running and accessible'
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
        console.error('[REFACTOR API] God Mode execution failed');
        res.status(500).json({ 
            error: 'Failed to execute God Mode refactor',
            details: 'Please check that the Python bridge is running and accessible'
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
        console.error('[REFACTOR API] Status check failed');
        res.status(503).json({ 
            enabled: false,
            error: 'Python bridge unavailable',
            details: 'The Python bridge service is not responding'
        });
    }
});

export default router;
