/**
 * VIZUAL-X ADMIN CONTROL PLANE - SYNC API
 * 
 * Purpose: REST API endpoints for Infinity Sync status and heartbeat monitoring
 */

import { Router, Request, Response } from 'express';
import { syncService } from '../services/SyncService';

const router = Router();

/**
 * GET /api/sync/status
 * Get the latest sync status from infinity-sync.ps1
 */
router.get('/status', async (req: Request, res: Response) => {
    try {
        const syncStatus = await syncService.getSyncStatus();
        
        if (!syncStatus) {
            return res.status(404).json({
                error: 'No sync status available',
                message: 'Run infinity-sync.ps1 to generate sync status'
            });
        }

        const isFresh = await syncService.isSyncStatusFresh();

        res.json({
            ...syncStatus,
            fresh: isFresh
        });
    } catch (error) {
        console.error('[Sync API] Error getting sync status:', error);
        res.status(500).json({
            error: 'Failed to retrieve sync status'
        });
    }
});

/**
 * GET /api/sync/heartbeat
 * Get heartbeat status for all external services
 */
router.get('/heartbeat', async (req: Request, res: Response) => {
    try {
        const heartbeats = await syncService.getAllHeartbeats();
        
        res.json({
            timestamp: new Date().toISOString(),
            heartbeats
        });
    } catch (error) {
        console.error('[Sync API] Error getting heartbeats:', error);
        res.status(500).json({
            error: 'Failed to retrieve heartbeat status'
        });
    }
});

/**
 * GET /api/sync/heartbeat/github
 * Get GitHub API heartbeat status
 */
router.get('/heartbeat/github', async (req: Request, res: Response) => {
    try {
        const heartbeat = await syncService.checkGitHubHeartbeat();
        res.json(heartbeat);
    } catch (error) {
        console.error('[Sync API] Error checking GitHub heartbeat:', error);
        res.status(500).json({
            error: 'Failed to check GitHub heartbeat'
        });
    }
});

/**
 * GET /api/sync/heartbeat/gcp
 * Get Google Cloud Platform heartbeat status
 */
router.get('/heartbeat/gcp', async (req: Request, res: Response) => {
    try {
        const heartbeat = await syncService.checkGoogleCloudHeartbeat();
        res.json(heartbeat);
    } catch (error) {
        console.error('[Sync API] Error checking GCP heartbeat:', error);
        res.status(500).json({
            error: 'Failed to check GCP heartbeat'
        });
    }
});

/**
 * GET /api/sync/heartbeat/cloudflare
 * Get Cloudflare heartbeat status
 */
router.get('/heartbeat/cloudflare', async (req: Request, res: Response) => {
    try {
        const heartbeat = await syncService.checkCloudflareHeartbeat();
        res.json(heartbeat);
    } catch (error) {
        console.error('[Sync API] Error checking Cloudflare heartbeat:', error);
        res.status(500).json({
            error: 'Failed to check Cloudflare heartbeat'
        });
    }
});

/**
 * GET /api/sync/overview
 * Get comprehensive sync overview including status and heartbeats
 */
router.get('/overview', async (req: Request, res: Response) => {
    try {
        const overview = await syncService.getSyncOverview();
        res.json(overview);
    } catch (error) {
        console.error('[Sync API] Error getting sync overview:', error);
        res.status(500).json({
            error: 'Failed to retrieve sync overview'
        });
    }
});

export default router;
