## Next.js OAuth Template (Firebase Auth + MongoDB)

Production-ready Next.js App Router template with Firebase Authentication (Email/Password + Google OAuth) and MongoDB for user profiles. Includes protected routes, signup/login pages, and API routes to upsert/fetch users.

### Features
- App Router (Next.js 15 / Turbopack)
- Firebase Auth client SDK (Email/Password, Google)
- MongoDB user collection with idempotent upserts
- Protected routes via middleware
- Fully typed TypeScript

### Stack
- Next.js 15, React 19
- Firebase Web SDK (client), Firebase Admin SDK (server)
- MongoDB (official Node.js driver)
- Tailwind-ready (PostCSS config included)

---

## Project Structure
- `app/(auth)/login/page.tsx` and `app/(auth)/signup/page.tsx`: Auth pages using `components/AuthForm.tsx`
- `app/dashboard/page.tsx`: Example protected page
- `app/api/users/route.ts`: POST upsert user document
- `app/api/users/[uid]/route.ts`: GET user by `uid`
- `app/middleware.ts`: Redirects based on auth status
- `lib/firebase.ts`: Firebase client initialization
- `lib/firebase-admin.ts`: Admin SDK for server code
- `lib/mongodb.ts`: MongoDB client
- `types/user.ts`: User type

---

## Prerequisites
- Node.js 18+
- A Firebase project with a Web App configured
- A MongoDB connection string (Atlas or local)

---

## Environment Variables
Create `.env.local` in the project root:

```
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_WEB_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase (Server/Admin)
FIREBASE_ADMIN_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# MongoDB
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/test?retryWrites=true&w=majority
MONGODB_DB=test
```

Restart the dev server after changing envs.

---

## Firebase Console Setup
1. Project Settings → Your Apps → Web App → copy SDK config to `.env.local` (values above)
2. Authentication → Sign-in method:
   - Enable Email/Password
   - Enable Google
3. Authentication → Settings → Authorized domains:
   - Add `localhost` and `127.0.0.1`

If using API key restrictions in GCP, ensure `Identity Toolkit API` is allowed and referrers include `http://localhost:3000/*`.

---

## Development

```bash
npm install
npm run dev
# http://localhost:3000
```

Pages:
- `/login` — email/password or Continue with Google
- `/signup` — create account (saves to MongoDB)
- `/dashboard` — protected, redirected by `app/middleware.ts`

---

## API Routes
- `POST /api/users`
  - Body: `{ uid, email, displayName?, photoURL?, providers: string[], updatedAt }`
  - Upserts a user document; sets `createdAt` on first insert

- `GET /api/users/[uid]`
  - Returns a subset of user fields

---

## Implementation Notes
- Firebase client is initialized in `lib/firebase.ts`
- Admin SDK uses service-account creds in `lib/firebase-admin.ts`
- MongoDB client is a singleton in `lib/mongodb.ts`
- `app/middleware.ts` checks auth token and redirects between `/login`, `/signup`, and `/dashboard`

---

## Deployment

### Vercel
1. Push to GitHub
2. Import the repo in Vercel
3. Set all env vars in Vercel Project Settings
4. Deploy

### Firebase Hosting (Web Frameworks)
```bash
npx firebase-tools experiments:enable webframeworks
npx firebase-tools init hosting
npx firebase-tools deploy
```
Set envs with your hosting provider and ensure authorized domains include your production domain.

---

## Troubleshooting
- CONFIGURATION_NOT_FOUND (400 from `identitytoolkit.googleapis.com`)
  - The Web API key or Firebase config is incorrect/missing, or the API key is restricted. Recheck `.env.local` and Firebase Console.
- Dynamic route params error
  - Using Next.js 15 App Router, ensure you `await context.params` in dynamic API routes (already fixed in this template).

---

## License
MIT
