
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { db } from './db';
import { User } from '../../types';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  await db.read();
  const user = db.data.users.find(u => u.id === id);
  done(null, user || false);
});


// --- LOCAL (EMAIL/PASSWORD) STRATEGY ---
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    await db.read();
    const user = db.data.users.find(u => u.email === email);
    
    if (!user || !user.password) {
      return done(null, false, { message: 'Incorrect credentials.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: 'Incorrect credentials.' });
    }
    
    return done(null, user);
  }
));


// --- GITHUB OAUTH STRATEGY ---
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    // FAIL FAST: Throw a fatal error if secrets are not configured.
    // This prevents the application from running in a non-functional state.
    throw new Error("[VIX AUTH FATAL] GitHub OAuth credentials (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET) are missing. Please configure them in your .env file.");
} else {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3001/api/auth/github/callback",
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        await db.read();
        let user = db.data.users.find(u => u.githubId === profile.id);
        if (user) {
            user.name = profile.displayName || profile.username;
            user.avatarUrl = profile.photos?.[0]?.value;
            user.lastActive = new Date().toISOString();
        } else {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.placeholder.com`;
            const existingEmailUser = db.data.users.find(u => u.email === email);
            if(existingEmailUser) {
                existingEmailUser.githubId = profile.id;
                user = existingEmailUser;
            } else {
                const newUser: User = {
                    id: (db.data.users.length + 1).toString(),
                    githubId: profile.id,
                    name: profile.displayName || profile.username,
                    email,
                    role: 'operator',
                    status: 'active',
                    lastActive: new Date().toISOString(),
                    accessLevel: 'full',
                    avatarUrl: profile.photos?.[0]?.value
                };
                db.data.users.push(newUser);
                user = newUser;
            }
        }
        if (!user.connections) user.connections = {};
        user.connections.github = { connected: true, username: profile.username, lastSynced: new Date().toISOString() };
        await db.write();
        return done(null, user);
      }
    ));
}


// --- GOOGLE OAUTH STRATEGY ---
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    // FAIL FAST: Throw a fatal error if secrets are not configured.
    throw new Error("[VIX AUTH FATAL] Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are missing. Please configure them in your .env file.");
} else {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3001/api/auth/google/callback"
      },
      async (accessToken, refreshToken, profile, done) => {
        await db.read();
        let user = db.data.users.find(u => u.connections?.google?.id === profile.id);
        if (user) {
            user.name = profile.displayName;
            user.avatarUrl = profile.photos?.[0]?.value;
            user.lastActive = new Date().toISOString();
        } else {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email found in Google profile"), false);
            }
            const existingEmailUser = db.data.users.find(u => u.email === email);
            if(existingEmailUser) {
                user = existingEmailUser;
            } else {
                const newUser: User = {
                    id: (db.data.users.length + 1).toString(),
                    name: profile.displayName,
                    email,
                    role: 'operator',
                    status: 'active',
                    lastActive: new Date().toISOString(),
                    accessLevel: 'full',
                    avatarUrl: profile.photos?.[0]?.value
                };
                db.data.users.push(newUser);
                user = newUser;
            }
        }
        if (!user.connections) user.connections = {};
        
        // When a user authenticates with Google, mark all related services as connected.
        // This provides a seamless experience for the user.
        const connectionDetails = { 
            id: profile.id, 
            connected: true, 
            username: profile.displayName, 
            lastSynced: new Date().toISOString() 
        };
        user.connections.google = connectionDetails;
        user.connections.gcp = connectionDetails;
        user.connections.gworkspace = connectionDetails;

        await db.write();
        return done(null, user);
      }
    ));
}
