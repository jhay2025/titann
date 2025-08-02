// Firebase Configuration
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');
const admin = require('firebase-admin');

// Firebase Web App Configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:demo"
};

// Initialize Firebase Web App
let app, auth, db, storage;
let adminApp, adminAuth, adminDb, adminStorage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('✅ Firebase Web App inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase Web App:', error.message);
  // Fallback configuration
  app = null;
  auth = null;
  db = null;
  storage = null;
}

// Initialize Firebase Admin SDK
try {
  // Check if we have the required environment variables
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    adminAuth = admin.auth(adminApp);
    adminDb = admin.firestore(adminApp);
    adminStorage = admin.storage(adminApp);
    
    console.log('✅ Firebase Admin SDK inicializado correctamente');
  } else {
    console.log('⚠️ Firebase Admin SDK no configurado - variables de entorno faltantes');
    adminApp = null;
    adminAuth = null;
    adminDb = null;
    adminStorage = null;
  }
} catch (error) {
  console.error('❌ Error inicializando Firebase Admin SDK:', error.message);
  adminApp = null;
  adminAuth = null;
  adminDb = null;
  adminStorage = null;
}

// Helper functions for error handling
const checkFirebaseConfig = () => {
  if (!app || !auth || !db || !storage) {
    throw new Error('Firebase no está configurado correctamente');
  }
};

const checkAdminConfig = () => {
  if (!adminApp || !adminAuth || !adminDb || !adminStorage) {
    throw new Error('Firebase Admin SDK no está configurado correctamente');
  }
};

module.exports = {
  app,
  auth,
  db,
  storage,
  adminApp,
  adminAuth,
  adminDb,
  adminStorage,
  checkFirebaseConfig,
  checkAdminConfig,
  isConfigured: !!(app && auth && db && storage),
  isAdminConfigured: !!(adminApp && adminAuth && adminDb && adminStorage)
}; 