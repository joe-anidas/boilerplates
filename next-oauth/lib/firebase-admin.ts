// app/lib/firebase-admin.ts
import { cert, initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminApp: ReturnType<typeof initializeAdminApp>;

export function initializeFirebaseAdmin() {
  if (!adminApp) {
    adminApp = initializeAdminApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n')
      })
    });
  }
  return adminApp;
}

export function getAdminAuth() {
  return getAuth(initializeFirebaseAdmin());
}