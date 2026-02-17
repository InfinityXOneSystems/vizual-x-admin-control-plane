import { Router, Request as ExpressRequest, Response, NextFunction } from 'express';
import { db } from '../db';
import { User } from '../../../types';

const router = Router();

// FIX: Extended ExpressRequest to avoid ambiguity with other Request types.
// This type adds Passport.js properties to the Express request object for type safety.
// Replaced interface with type intersection to fix property inheritance issue.
type AuthenticatedRequest = ExpressRequest & {
  user?: User;
  isAuthenticated(): boolean;
};


// Middleware to ensure user is authenticated for all connection routes
router.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
});

// Generic token validation endpoint
router.post('/:service/validate', async (req: AuthenticatedRequest, res: Response) => {
    const { service } = req.params;
    const { token } = req.body;
    const user = req.user as User; // User is guaranteed to exist by middleware

    if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    let validationResult: { success: boolean; username?: string; message?: string };

    try {
        switch (service) {
            case 'vercel':
                // Validate Vercel token by fetching user info
                const vercelRes = await fetch('https://api.vercel.com/v2/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!vercelRes.ok) throw new Error('Invalid Vercel token.');
                const vercelData = await vercelRes.json();
                validationResult = { success: true, username: vercelData.user.username };
                break;
            
            case 'supabase':
                 // Validate Supabase token (this is a placeholder, real validation is more complex)
                 // A common pattern is to try and list projects.
                if (!token.startsWith('sbp_')) throw new Error('Invalid Supabase token format.');
                validationResult = { success: true, username: 'Supabase User' };
                break;

            case 'openai':
                if (!token.startsWith('sk-')) throw new Error('Invalid OpenAI key format.');
                // A real validation would be to check balance or models
                 validationResult = { success: true, username: 'OpenAI User' };
                break;

            default:
                return res.status(400).json({ success: false, message: `Unsupported service: ${service}` });
        }

        // If validation was successful, update the user's connection status
        if (validationResult.success) {
            await db.read();
            const dbUser = db.data.users.find(u => u.id === user.id);
            if (!dbUser) {
                return res.status(404).json({ success: false, message: 'User not found in database.' });
            }

            if (!dbUser.connections) {
                dbUser.connections = {};
            }
            dbUser.connections[service] = {
                connected: true,
                username: validationResult.username,
                lastSynced: new Date().toISOString()
            };
            
            await db.write();
            
            // In a real app, encrypt the token before storing it if needed for background jobs.
            // For this implementation, we only store the *status*, not the token itself.

            res.json({ success: true, message: 'Connection successful.', user: dbUser });

        } else {
             res.status(401).json({ success: false, message: validationResult.message || 'Validation failed.' });
        }

    } catch (error: any) {
        console.error(`Validation error for ${service}:`, error);
        res.status(500).json({ success: false, message: error.message || 'An internal error occurred.' });
    }
});


export default router;