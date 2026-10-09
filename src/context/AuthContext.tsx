import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { UserProfile } from '../types';
import { getStoreSettings, getLocalStoreSettings, saveLocalStoreSettings } from '../services/storeService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
  loading: boolean;
  // Customer Auth
  registerCustomer: (email: string, phone: string, pass: string, name: string) => Promise<void>;
  loginCustomer: (identifier: string, pass: string) => Promise<void>;
  // Admin & Staff Auth
  loginAsAdminOrStaff: (email: string, pass: string) => Promise<{ role: 'admin' | 'staff' }>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  // Quick instant mode for testing/demoing
  enterDemoAdminMode: () => void;
  isDemoAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ADMIN_KEY = 'atal_demo_admin_active';
const LOCAL_CUSTOMERS_KEY = 'atal_local_customers_store';
const LOCAL_ACTIVE_SESSION_KEY = 'atal_active_session_profile';
const ADMIN_CUSTOM_PASS_KEY = 'atal_custom_admin_password_v1';

// Master administrator primary & secondary credentials
export const PRIMARY_ADMIN_EMAIL = 'uatal.pk@gmail.com';
export const FIXED_PRIMARY_ADMIN_PASS = 'Umer@9157'; // Permanent master fixed primary password
export const DEFAULT_SECONDARY_ADMIN_PASS = 'Abu6232'; // Default secondary changeable password
export const DEFAULT_MASTER_ADMIN_PASS = 'Umer@9157'; // Backwards compatibility alias

interface LocalUserRecord {
  uid: string;
  email: string;
  phone: string;
  name: string;
  passwordHash: string;
  role: 'customer' | 'admin' | 'staff';
  createdAt: number;
}

function getLocalUsers(): LocalUserRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_CUSTOMERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUser(user: LocalUserRecord) {
  const users = getLocalUsers();
  const existingIdx = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase() || (u.phone && u.phone === user.phone));
  if (existingIdx >= 0) {
    users[existingIdx] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(LOCAL_CUSTOMERS_KEY, JSON.stringify(users));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [isDemoAdmin, setIsDemoAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load session from persistent storage
  useEffect(() => {
    try {
      const isDemo = localStorage.getItem(DEMO_ADMIN_KEY) === 'true';
      if (isDemo) {
        setIsDemoAdmin(true);
        setIsAdmin(true);
        setIsStaff(true);
        setProfile({
          uid: 'demo_admin_session',
          email: PRIMARY_ADMIN_EMAIL,
          displayName: 'Admin User',
          role: 'admin',
          createdAt: Date.now()
        });
      } else {
        const cachedSession = localStorage.getItem(LOCAL_ACTIVE_SESSION_KEY);
        if (cachedSession) {
          const parsed = JSON.parse(cachedSession) as UserProfile;
          setProfile(parsed);
          setIsAdmin(parsed.role === 'admin');
          setIsStaff(parsed.role === 'admin' || parsed.role === 'staff');
        }
      }
    } catch (e) {
      console.warn('Session hydration notice:', e);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            const userIsAdmin = data.role === 'admin' || currentUser.email === PRIMARY_ADMIN_EMAIL || currentUser.email === 'umerjutt9157@gmail.com' || currentUser.email === 'contact.to.atal@gmail.com';
            const userIsStaff = userIsAdmin || data.role === 'staff';
            setIsAdmin(userIsAdmin);
            setIsStaff(userIsStaff);
            saveSession(data);
          } else {
            const userIsAdmin = currentUser.email === PRIMARY_ADMIN_EMAIL || currentUser.email === 'umerjutt9157@gmail.com' || currentUser.email === 'contact.to.atal@gmail.com';
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Member',
              role: userIsAdmin ? 'admin' : 'customer',
              createdAt: Date.now()
            };
            setProfile(newProfile);
            setIsAdmin(userIsAdmin);
            setIsStaff(userIsAdmin);
            saveSession(newProfile);
          }
        } catch (err) {
          console.warn('Profile sync fallback:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveSession = (prof: UserProfile) => {
    try {
      localStorage.setItem(LOCAL_ACTIVE_SESSION_KEY, JSON.stringify(prof));
    } catch {
      // Ignore
    }
  };

  const enterDemoAdminMode = () => {
    setIsDemoAdmin(true);
    setIsAdmin(true);
    setIsStaff(true);
    const demoProf: UserProfile = {
      uid: 'demo_admin_active',
      email: PRIMARY_ADMIN_EMAIL,
      displayName: 'Master Administrator',
      role: 'admin',
      createdAt: Date.now()
    };
    setProfile(demoProf);
    localStorage.setItem(DEMO_ADMIN_KEY, 'true');
    saveSession(demoProf);
  };

  // Customer registration
  const registerCustomer = async (email: string, phone: string, pass: string, name: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    let userUid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      userUid = cred.user.uid;
      setUser(cred.user);
    } catch (fbErr: any) {
      if (fbErr?.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }
    }

    const userProfile: UserProfile = {
      uid: userUid,
      email: cleanEmail,
      phone: cleanPhone,
      displayName: name,
      role: 'customer',
      createdAt: Date.now()
    };

    saveLocalUser({
      uid: userUid,
      email: cleanEmail,
      phone: cleanPhone,
      name,
      passwordHash: pass,
      role: 'customer',
      createdAt: Date.now()
    });

    try {
      await setDoc(doc(db, 'users', userUid), userProfile, { merge: true });
    } catch (dbErr) {
      console.warn('Firestore remote profile sync notice:', dbErr);
    }

    setProfile(userProfile);
    saveSession(userProfile);
    setIsAdmin(false);
    setIsStaff(false);
    setIsDemoAdmin(false);
    localStorage.removeItem(DEMO_ADMIN_KEY);
  };

  // Customer login
  const loginCustomer = async (identifier: string, pass: string) => {
    const clean = identifier.trim();
    const cleanLower = clean.toLowerCase();
    const isPhone = /^[0-9+\s()-]+$/.test(clean) && !clean.includes('@');

    const localUsers = getLocalUsers();
    let matchedUser: LocalUserRecord | undefined;

    if (isPhone) {
      const cleanDigits = clean.replace(/\D/g, '');
      matchedUser = localUsers.find(u => u.phone.replace(/\D/g, '') === cleanDigits);
    } else {
      matchedUser = localUsers.find(u => u.email.toLowerCase() === cleanLower);
    }

    if (matchedUser) {
      if (matchedUser.passwordHash !== pass) {
        throw new Error('Incorrect password. Please try again.');
      }

      const userProfile: UserProfile = {
        uid: matchedUser.uid,
        email: matchedUser.email,
        phone: matchedUser.phone,
        displayName: matchedUser.name,
        role: matchedUser.role,
        createdAt: matchedUser.createdAt
      };

      setProfile(userProfile);
      saveSession(userProfile);
      setIsAdmin(false);
      setIsStaff(false);
      setIsDemoAdmin(false);
      localStorage.removeItem(DEMO_ADMIN_KEY);
      return;
    }

    try {
      const loginEmail = isPhone ? `${clean.replace(/\D/g, '')}@customer.atalstore.com` : cleanLower;
      const cred = await signInWithEmailAndPassword(auth, loginEmail, pass);
      setUser(cred.user);

      const userProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || cleanLower,
        displayName: cred.user.displayName || cleanLower.split('@')[0],
        role: 'customer',
        createdAt: Date.now()
      };

      setProfile(userProfile);
      saveSession(userProfile);
      setIsAdmin(false);
      setIsStaff(false);
      setIsDemoAdmin(false);
      localStorage.removeItem(DEMO_ADMIN_KEY);
    } catch {
      throw new Error('Invalid email/phone number or password. Please verify your credentials.');
    }
  };

  // Admin & Staff login with primary fixed password (Umer@9157) and changeable secondary password (Abu6232)
  const loginAsAdminOrStaff = async (email: string, pass: string): Promise<{ role: 'admin' | 'staff' }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    const isMasterAdminEmail =
      cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
      cleanEmail === 'contact.to.atal@gmail.com' ||
      cleanEmail === 'umerjutt9157@gmail.com' ||
      cleanEmail === 'admin@atal.com' ||
      cleanEmail === 'admin';

    // 1. Check if password is the fixed primary password (permanent for all time)
    const isPrimaryPassValid = cleanPass === FIXED_PRIMARY_ADMIN_PASS;

    // 2. Check if password matches the current active secondary password (default: Abu6232)
    // Note: When secondary password is changed, previous secondary password is no longer valid.
    const localSavedCustomPass = localStorage.getItem(ADMIN_CUSTOM_PASS_KEY);
    const settings = await getStoreSettings().catch(() => getLocalStoreSettings());
    const activeSecondaryPass = (
      settings.secondaryAdminPassword?.trim() ||
      settings.customAdminPassword?.trim() ||
      localSavedCustomPass?.trim() ||
      DEFAULT_SECONDARY_ADMIN_PASS
    ).trim();

    const isSecondaryPassValid = cleanPass === activeSecondaryPass;

    // Both Primary (Umer@9157) and Active Secondary password grant Admin access
    if (isPrimaryPassValid || isSecondaryPassValid) {
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      } catch {
        // Handled gracefully
      }

      const adminProfile: UserProfile = {
        uid: 'master_admin_uatal',
        email: cleanEmail === 'admin' ? PRIMARY_ADMIN_EMAIL : cleanEmail,
        displayName: isPrimaryPassValid ? 'Master Administrator (Primary)' : 'Store Administrator (Secondary)',
        role: 'admin',
        createdAt: Date.now()
      };

      setProfile(adminProfile);
      saveSession(adminProfile);
      setIsAdmin(true);
      setIsStaff(true);
      setIsDemoAdmin(false);
      localStorage.removeItem(DEMO_ADMIN_KEY);
      return { role: 'admin' };
    }

    // 3. Online Firebase Auth verification
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      setUser(cred.user);

      let detectedRole: 'admin' | 'staff' = 'admin';
      try {
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.role === 'customer' && !isMasterAdminEmail && !cleanEmail.startsWith('staff')) {
            await signOut(auth);
            throw new Error('Access Denied: This portal is strictly reserved for Admin and Staff members.');
          }

          if (data.role === 'staff' || cleanEmail.startsWith('staff')) {
            detectedRole = 'staff';
            setIsStaff(true);
            setIsAdmin(false);
          } else {
            detectedRole = 'admin';
            setIsAdmin(true);
            setIsStaff(true);
          }
        } else {
          detectedRole = isMasterAdminEmail ? 'admin' : cleanEmail.startsWith('staff') ? 'staff' : 'admin';
          setIsAdmin(detectedRole === 'admin');
          setIsStaff(true);
        }
      } catch (err: any) {
        if (err?.message?.includes('Access Denied')) {
          throw err;
        }
        detectedRole = isMasterAdminEmail ? 'admin' : cleanEmail.startsWith('staff') ? 'staff' : 'admin';
        setIsAdmin(detectedRole === 'admin');
        setIsStaff(true);
      }

      const adminProfile: UserProfile = {
        uid: cred.user.uid,
        email: cleanEmail,
        displayName: detectedRole === 'admin' ? 'Administrator' : 'Staff Member',
        role: detectedRole,
        createdAt: Date.now()
      };

      setProfile(adminProfile);
      saveSession(adminProfile);
      setIsDemoAdmin(false);
      localStorage.removeItem(DEMO_ADMIN_KEY);
      return { role: detectedRole };
    } catch (firebaseErr: any) {
      if (firebaseErr?.message?.includes('Access Denied')) {
        throw firebaseErr;
      }
      throw new Error('Incorrect administrator or staff password. Please verify your credentials.');
    }
  };

  const sendPasswordReset = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch {
      // Local graceful notification
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignore
    }
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setIsStaff(false);
    setIsDemoAdmin(false);
    localStorage.removeItem(DEMO_ADMIN_KEY);
    localStorage.removeItem(LOCAL_ACTIVE_SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isStaff,
        isCustomer: !!profile && profile.role === 'customer',
        loading,
        registerCustomer,
        loginCustomer,
        loginAsAdminOrStaff,
        sendPasswordReset,
        logout,
        enterDemoAdminMode,
        isDemoAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
