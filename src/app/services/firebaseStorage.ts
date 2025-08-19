/**
 * Firebase Storage Service for Invoices
 * 
 * כדי להשתמש בשירות זה:
 * 1. צור פרויקט Firebase חדש ב-https://console.firebase.google.com/
 * 2. הפעל Firebase Storage ו-Firestore Database
 * 3. צור קובץ .env.local עם פרטי Firebase שלך:
 *    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
 *    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
 *    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
 *    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
 *    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
 *    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
 * 4. עדכן את firebase/config.ts עם הפרטים שלך
 */

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getStorage
} from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy,
  limit,
  getFirestore
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { app } from '../firebase/config';
import { ImageProcessor } from './imageUtils';

import { FirebaseInvoice } from '../types/invoice'

export class FirebaseStorageService {
  private static storage = getStorage(app);
  private static db = getFirestore(app);
  private static storageRef = ref(FirebaseStorageService.storage, 'invoices');

  private static async ensureAuth(): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      const auth = getAuth(app);
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    } catch (err) {
      // Non-fatal; Firestore rules may still allow public read in some setups
      console.warn('ensureAuth: anonymous sign-in failed or not required.', err);
    }
  }

  // Check if Firebase is properly configured
  static async isFirebaseConfigured(): Promise<boolean> {
    try {
      console.log('Checking Firebase configuration...')
      
      // Check if Firebase app is initialized
      if (!FirebaseStorageService.db || !FirebaseStorageService.storage) {
        console.error('Firebase app not initialized')
        return false
      }
      
      // Try to access Firestore to check if it's working
      console.log('Testing Firestore connection...')
      await FirebaseStorageService.ensureAuth();
      const testQuery = query(collection(FirebaseStorageService.db, 'invoices'), limit(1));
      await getDocs(testQuery);
      console.log('Firebase is properly configured - Firestore working');
      return true;
    } catch (error) {
      console.error('Firebase is not properly configured:', error)
      
      // Check if it's a configuration error vs network error
      if (error instanceof Error) {
        if (error.message.includes('Firebase: Error (auth/unauthorized)') ||
            error.message.includes('Firebase: Error (storage/unauthorized)') ||
            error.message.includes('Firebase: Error (firestore/unauthorized)')) {
          console.error('Firebase configuration error - check API keys and permissions')
        } else if (error.message.includes('Failed to fetch') || 
                   error.message.includes('NetworkError')) {
          console.error('Network error - check internet connection')
        }
      }
      
      return false;
    }
  }

  // Helper: convert Blob to Base64 (without data URL prefix)
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          const base64 = result.split(',')[1] || '';
          resolve(base64);
        } else {
          reject(new Error('Failed converting blob to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed reading blob'));
      reader.readAsDataURL(blob);
    });
  }

  // Upload image by saving image data directly in Firestore (as base64) and metadata alongside
  static async uploadImage(
    file: File, 
    month: number, 
    year: number
  ): Promise<FirebaseInvoice> {
    try {
      console.log(`Starting upload for file: ${file.name}, month: ${month}, year: ${year}`);
      await FirebaseStorageService.ensureAuth();

      // Process image (resize/compress) before storing to Firestore to fit document limits
      const processed = await ImageProcessor.processImage(file);
      console.log('[Firebase] Processed image details:', {
        name: file.name,
        originalSizeBytes: file.size,
        processedSizeBytes: processed.size,
        width: processed.width,
        height: processed.height,
        month,
        year
      });
      const base64 = await this.blobToBase64(processed.blob);
      console.log('[Firebase] Base64 length:', base64.length);
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      // Create invoice metadata
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 15);
      const invoice: FirebaseInvoice = {
        id: `${timestamp}-${randomSuffix}`,
        name: file.name,
        createdAt: new Date().toISOString(),
        type: 'image/jpeg',
        size: processed.size,
        width: processed.width,
        height: processed.height,
        month,
        year,
        storagePath: '',
        downloadURL: dataUrl
      };

      console.log('[Firebase] Saving image data + metadata to Firestore...');
      // Save metadata + image data to Firestore
      const docRef = await addDoc(collection(FirebaseStorageService.db, 'invoices'), {
        ...invoice,
        imageData: base64 // store raw base64 to reduce Firestore doc size slightly
      });
      invoice.id = docRef.id; // Use Firestore document ID as final ID
      console.log('[Firebase] Saved to Firestore with ID:', docRef.id);
      console.table([{ id: docRef.id, name: invoice.name, month: invoice.month, year: invoice.year, sizeBytes: invoice.size }]);

      console.log('[Firebase] Image uploaded successfully to Firestore document. Preview URL length:', (invoice.downloadURL || '').length);
      return invoice;
    } catch (error) {
      console.error('Error uploading image to Firebase (Firestore path):', error);
      throw error;
    }
  }

  // Get all invoices for a specific month/year
  static async getInvoicesByMonthYear(
    month: number, 
    year: number
  ): Promise<FirebaseInvoice[]> {
    try {
      console.log(`Fetching invoices for month: ${month}, year: ${year}`);
      await FirebaseStorageService.ensureAuth();
      
      // Preferred query (requires composite index: month asc, year asc, createdAt desc)
      const indexedQuery = query(
        collection(FirebaseStorageService.db, 'invoices'),
        where('month', '==', month),
        where('year', '==', year),
        orderBy('createdAt', 'desc')
      );
      const indexedSnapshot = await getDocs(indexedQuery);
      const indexedInvoices: FirebaseInvoice[] = [];
      indexedSnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        const imageData = typeof data.imageData === 'string' ? data.imageData : undefined;
        const downloadURL = imageData ? `data:image/jpeg;base64,${imageData}` : (data.downloadURL as string | undefined) || '';
        indexedInvoices.push({ ...(data as object), id: docSnap.id, downloadURL } as FirebaseInvoice);
      });
      console.log(`Retrieved ${indexedInvoices.length} invoices from Firebase for ${month}/${year} (indexed)`);
      return indexedInvoices;
    } catch (error: unknown) {
      // If index is missing, Firestore throws failed-precondition with a link to create the index.
      const message = error instanceof Error ? error.message : String(error);
      const code = (error as { code?: string } | undefined)?.code;
      const isIndexMissing = message.includes('requires an index') || code === 'failed-precondition';
      if (!isIndexMissing) {
        console.error('Error getting invoices from Firebase:', error);
        throw error;
      }

      console.warn('Firestore composite index missing. Falling back to non-indexed query and client-side sort.');
      // Fallback query without orderBy (no composite index required)
      const fallbackQuery = query(
        collection(FirebaseStorageService.db, 'invoices'),
        where('month', '==', month),
        where('year', '==', year)
      );
      const fallbackSnapshot = await getDocs(fallbackQuery);
      const invoices: FirebaseInvoice[] = [];
      fallbackSnapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        const imageData = typeof data.imageData === 'string' ? data.imageData : undefined;
        const downloadURL = imageData ? `data:image/jpeg;base64,${imageData}` : (data.downloadURL as string | undefined) || '';
        invoices.push({ ...(data as object), id: docSnap.id, downloadURL } as FirebaseInvoice);
      });
      // Client-side sort by createdAt desc
      invoices.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
      console.log(`Retrieved ${invoices.length} invoices from Firebase for ${month}/${year} (fallback, client-sorted)`);
      return invoices;
    }
  }

  // Delete invoice from Firebase (Firestore doc always; Storage object only if path present)
  static async deleteInvoice(invoice: FirebaseInvoice): Promise<boolean> {
    try {
      console.log('[Delete] Starting delete for:', { id: invoice.id, name: invoice.name, storagePath: invoice.storagePath });
      // Delete Storage object only when storagePath exists
      if (invoice.storagePath && invoice.storagePath.trim() !== '') {
        try {
          const storageRef = ref(FirebaseStorageService.storage, invoice.storagePath);
          await deleteObject(storageRef);
          console.log('[Delete] Storage object deleted:', invoice.storagePath);
        } catch (storageErr) {
          console.warn('[Delete] Storage delete failed (continuing with Firestore doc delete):', storageErr);
        }
      }
      // Delete Firestore document
      await deleteDoc(doc(FirebaseStorageService.db, 'invoices', invoice.id));
      console.log('[Delete] Firestore document deleted:', invoice.id);
      return true;
    } catch (error) {
      console.error('[Delete] Error deleting invoice from Firebase:', error);
      return false;
    }
  }

  // Get all invoices (for debugging)
  static async getAllInvoices(): Promise<FirebaseInvoice[]> {
    try {
      await FirebaseStorageService.ensureAuth();
      const querySnapshot = await getDocs(collection(FirebaseStorageService.db, 'invoices'));
      const invoices: FirebaseInvoice[] = [];
      
      querySnapshot.forEach((doc) => {
        invoices.push({ ...doc.data(), id: doc.id } as FirebaseInvoice);
      });
      
      return invoices;
    } catch (error) {
      console.error('Error getting all invoices:', error);
      return [];
    }
  }
}
