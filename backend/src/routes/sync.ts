/**
 * Sync API Routes
 * Endpoints for managing synchronization across the Vizual-X ecosystem
 */

import { Router } from 'express';
import { syncOrchestrator } from '../services/SyncOrchestrator';

const router = Router();

/**
 * GET /api/sync/status
 * Returns the current sync status for all components
 */
router.get('/status', async (req, res) => {
  try {
    const status = syncOrchestrator.getStatus();
    const isSyncing = syncOrchestrator.isSyncing();
    const isWatchMode = syncOrchestrator.isInWatchMode();

    res.json({
      ...status,
      isSyncing,
      isWatchMode
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to retrieve sync status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/sync/trigger
 * Triggers a sync operation
 * Body: { watch?: boolean } - optional flag to run in watch mode
 */
router.post('/trigger', async (req, res) => {
  try {
    const { watch = false } = req.body;
    const result = await syncOrchestrator.triggerSync(watch);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to trigger sync operation'
    });
  }
});

/**
 * POST /api/sync/stop
 * Stops the current sync operation (if running in watch mode)
 */
router.post('/stop', async (req, res) => {
  try {
    const result = await syncOrchestrator.stopSync();

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to stop sync operation'
    });
  }
});

export default router;
