import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDocFromServer,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore using custom database ID if provided
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test connection as instructed in Firebase Integration skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice:', error.message);
    }
  }
}
testConnection();

// Types for Firebase Collections
export interface FirestoreProject {
  id: string;
  title: string;
  category: string;
  subCategory?: string;
  subtitle: string;
  description: string;
  tools?: string[];
  tags?: string[];
  images?: string[];
  heroImage?: string;
  videoUrl?: string;
  videos?: string[];
  client?: string;
  year?: string;
  featured?: boolean;
  isCustom?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FirestoreInquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  countryCode?: string;
  serviceType: string;
  budget: string;
  customBudget?: string;
  timeline?: string;
  message: string;
  description?: string;
  isRushDelivery?: boolean;
  advancePaymentRequired?: number;
  promoCode?: string;
  discountPercent?: number;
  discountedTotal?: number;
  originalTotal?: number;
  status: 'new' | 'contacted' | 'in-progress' | 'completed';
  referralSource?: string;
  createdAt: string;
}

// ========================
// FIRESTORE PROJECTS API
// ========================

export async function fetchProjectsFromFirestore(): Promise<FirestoreProject[]> {
  try {
    const colRef = collection(db, 'projects');
    const snapshot = await getDocs(colRef);
    const list: FirestoreProject[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as FirestoreProject);
    });
    return list;
  } catch (err) {
    console.warn('Error fetching projects from Firestore:', err);
    return [];
  }
}

export function subscribeProjects(callback: (projects: FirestoreProject[]) => void) {
  try {
    const colRef = collection(db, 'projects');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: FirestoreProject[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as FirestoreProject);
        });
        callback(list);
      },
      (err) => {
        console.warn('Projects subscription error:', err);
      }
    );
  } catch (err) {
    console.warn('Error setting up projects subscription:', err);
    return () => {};
  }
}

export async function saveProjectToFirestore(project: FirestoreProject): Promise<boolean> {
  try {
    const docRef = doc(db, 'projects', project.id);
    await setDoc(docRef, {
      ...project,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Error saving project to Firestore:', err);
    throw err;
  }
}

export async function deleteProjectFromFirestore(projectId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'projects', projectId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting project from Firestore:', err);
    throw err;
  }
}

// ========================
// FIRESTORE INQUIRIES API
// ========================

export async function saveInquiryToFirestore(inquiry: Omit<FirestoreInquiry, 'status'> & { status?: FirestoreInquiry['status'] }): Promise<boolean> {
  try {
    const record: FirestoreInquiry = {
      ...inquiry,
      status: inquiry.status || 'new',
      createdAt: inquiry.createdAt || new Date().toISOString(),
    };
    const docRef = doc(db, 'inquiries', inquiry.id);
    await setDoc(docRef, record);
    return true;
  } catch (err) {
    console.error('Error saving inquiry to Firestore:', err);
    // Don't throw fatal error if guest submission gets network blip, returns false
    return false;
  }
}

export function subscribeInquiries(callback: (inquiries: FirestoreInquiry[]) => void) {
  try {
    const colRef = collection(db, 'inquiries');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: FirestoreInquiry[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as FirestoreInquiry);
        });
        // Sort descending by date
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(list);
      },
      (err) => {
        console.warn('Inquiries subscription error:', err);
      }
    );
  } catch (err) {
    console.warn('Error setting up inquiries subscription:', err);
    return () => {};
  }
}

export async function updateInquiryStatusInFirestore(
  inquiryId: string,
  status: FirestoreInquiry['status']
): Promise<boolean> {
  try {
    const docRef = doc(db, 'inquiries', inquiryId);
    await updateDoc(docRef, { status });
    return true;
  } catch (err) {
    console.error('Error updating inquiry status:', err);
    throw err;
  }
}

export async function deleteInquiryFromFirestore(inquiryId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'inquiries', inquiryId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting inquiry from Firestore:', err);
    throw err;
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
};
