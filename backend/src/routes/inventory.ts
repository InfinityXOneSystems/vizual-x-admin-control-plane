import { Router } from 'express';
import { InventoryService } from '../services/InventoryService';

const router = Router();
const inventoryService = new InventoryService();

/**
 * GET /api/inventory/status
 * Returns aggregated inventory data from forensic audit reports
 */
router.get('/status', (req, res) => {
  try {
    const cloudResources = inventoryService.getCloudResources();
    const localResources = inventoryService.getLocalResources();
    const systemHealth = inventoryService.getSystemHealth();

    res.json({
      timestamp: new Date().toISOString(),
      health: systemHealth,
      cloud: cloudResources,
      local: localResources
    });
  } catch (error) {
    console.error('[Inventory API] Error:', error);
    res.status(500).json({
      error: 'Failed to retrieve inventory data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
