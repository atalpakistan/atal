import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../../firebase-applet-config.json';

// Completely silent Firestore log level
setLogLevel('silent');

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(config);

// Initialize Firestore with robust local persistent cache for offline resilience and named DB support
export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  },
  config.firestoreDatabaseId || undefined
);

export const auth = getAuth(app);

export default app;
