# Google AI Studio Setup Guide

## Overview

This guide walks you through setting up Google AI Studio integration with the Vizual-X Admin Control Plane, including authentication and Gemini API connectivity.

## Prerequisites

- Node.js 18+ and npm
- A Google account
- Internet connection

## Step 1: Get Your Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select or create a Google Cloud project
5. Copy the generated API key (starts with `AIza...`)

**Important:** Keep your API key secure and never commit it to version control.

## Step 2: Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```env
   VITE_GOOGLE_AI_API_KEY=AIza...your-actual-key-here
   ```

3. (Optional) Configure other settings:
   ```env
   VITE_GEMINI_MODEL=gemini-pro
   VITE_GEMINI_TEMPERATURE=0.7
   VITE_GEMINI_MAX_TOKENS=2048
   VITE_ENABLE_AUTH=true
   ```

## Step 3: Install Dependencies

Run the setup script (PowerShell):
```powershell
./scripts/setup-google-ai.ps1
```

Or manually:
```bash
npm install
```

## Step 4: Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Step 5: Login

Use one of the demo credentials:
- **Admin:** `admin@vizual.x` / `admin123`
- **User:** `user@vizual.x` / `user123`
- **Operator:** `operator@vizual.x` / `op123`

Or use **"Continue with Google"** for OAuth login (simulated in development).

## Authentication Features

### Login Page
- Email/password authentication
- Google OAuth integration
- Input validation
- Loading states
- Error handling
- Glass morphism UI design

### Protected Routes
- Automatic redirect to login if not authenticated
- Role-based access control (admin, user, operator)
- Session persistence across page refreshes
- Secure token storage

### Session Management
- JWT-based tokens (24-hour expiration)
- Auto token refresh
- Secure logout
- User profile management

## Google AI Service Usage

### Initialize the Service

```typescript
import { googleAI } from './services/googleAIService';

// Initialize with your API key
googleAI.initialize(import.meta.env.VITE_GOOGLE_AI_API_KEY);
```

### Generate Content

```typescript
const response = await googleAI.generateContent(
  'Explain quantum computing in simple terms'
);
console.log(response);
```

### Chat Session

```typescript
import { AIMessage } from './types';

const messages: AIMessage[] = [
  { role: 'user', content: 'Hello!', timestamp: new Date() },
  { role: 'assistant', content: 'Hi! How can I help?', timestamp: new Date() },
  { role: 'user', content: 'Tell me about AI', timestamp: new Date() }
];

const response = await googleAI.chat(messages);
console.log(response);
```

### Streaming Content

```typescript
for await (const chunk of googleAI.generateContentStream('Write a story')) {
  console.log(chunk);
}
```

## Optional: Google OAuth Setup

For production OAuth flow:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable **Google+ API**
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials
6. Add authorized redirect URIs:
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

7. Update `.env`:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   VITE_GOOGLE_CLIENT_SECRET=your-client-secret
   VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
   ```

## Feature Flags

### Disable Authentication
To run without authentication (development only):
```env
VITE_ENABLE_AUTH=false
```

## Troubleshooting

### "Invalid API key" Error
- Verify your API key in `.env` is correct
- Ensure no extra spaces or quotes around the key
- Check if the API key is enabled in Google Cloud Console

### "Rate limit exceeded" Error
- Google AI Studio has rate limits on free tier
- Wait a few minutes and try again
- Consider upgrading to paid tier for higher limits

### Login Page Not Showing
- Clear browser cache and localStorage
- Ensure `VITE_ENABLE_AUTH=true` in `.env`
- Check browser console for errors

### Cannot Access Protected Routes
- Ensure you're logged in
- Check that authentication token is valid
- Clear localStorage and login again: `localStorage.clear()`

### Dependencies Not Installing
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version: `node --version` (should be 18+)

## Security Best Practices

### API Keys
- ✅ Store API keys in `.env` (not tracked by git)
- ✅ Use `.env.example` for templates only
- ✅ Never commit actual keys to version control
- ✅ Rotate keys periodically
- ❌ Don't expose keys in client-side code

### Authentication
- ✅ Use HTTPS in production
- ✅ Implement CSRF protection
- ✅ Set secure cookie flags
- ✅ Implement rate limiting on login
- ✅ Use strong password requirements

### Tokens
- ✅ Store tokens in httpOnly cookies (production)
- ✅ Implement token expiration
- ✅ Refresh tokens before expiration
- ✅ Clear tokens on logout
- ❌ Don't store sensitive data in localStorage

## API Rate Limits

Google AI Studio (Free Tier):
- **Requests per minute:** 60
- **Requests per day:** 1,500
- **Tokens per minute:** 32,000

For higher limits, consider:
- Google Cloud Vertex AI
- Paid Google AI Studio tier

## Support & Resources

- [Google AI Documentation](https://ai.google.dev/docs)
- [Gemini API Reference](https://ai.google.dev/api)
- [React Router Docs](https://reactrouter.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Development Notes

### Running Tests
```bash
npm test
```

### Type Checking
```bash
npm run typecheck
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Example: Using Authentication in Components

```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

## Next Steps

1. Customize the login page design
2. Implement password reset flow
3. Add two-factor authentication
4. Connect to real backend API
5. Implement user registration
6. Add session activity logging
7. Integrate with analytics

## License

This setup is part of the Vizual-X Admin Control Plane. See LICENSE for details.
