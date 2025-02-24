import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import firebaseConfig from './config/firebaseConfig';

const firebaseApp = initializeApp(firebaseConfig);

// Export instances of services
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);

export { auth, db };
