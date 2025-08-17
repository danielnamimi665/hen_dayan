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
  listAll 
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
  limit
} from 'firebase/firestore';
import { storage, db } from '../firebase/config';

import { FirebaseInvoice } from '../types/invoice'

export class FirebaseStorageService {
  private static storageRef = ref(storage, 'invoices');

  // Check if Firebase is properly configured
  static async isFirebaseConfigured(): Promise<boolean> {
    try {
      console.log('Checking Firebase configuration...')
      
      // Check if Firebase app is initialized
      if (!db || !storage) {
        console.error('Firebase app not initialized')
        return false
      }
      
      // Try to access Firestore to check if it's working
      console.log('Testing Firestore connection...')
      const testQuery = query(collection(db, 'invoices'), limit(1));
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

  // Upload image to Firebase Storage
  static async uploadImage(
    file: File, 
    month: number, 
    year: number
  ): Promise<FirebaseInvoice> {
    try {
      console.log(`Starting upload for file: ${file.name}, month: ${month}, year: ${year}`);
      
      // Create unique filename with more randomness to avoid conflicts
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 15);
      const filename = `${year}-${month}-${timestamp}-${randomSuffix}-${file.name}`;
      const storagePath = `invoices/${year}/${month}/${filename}`;
      
      console.log(`Storage path: ${storagePath}`);
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, storagePath);
      console.log('Uploading to Firebase Storage...');
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Upload completed, getting download URL...');
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', downloadURL);
      
      // Create invoice object with unique ID
      const invoice: FirebaseInvoice = {
        id: `${timestamp}-${randomSuffix}`, // More unique ID
        name: file.name,
        createdAt: new Date().toISOString(),
        type: file.type,
        size: file.size,
        width: 0, // Will be updated after processing
        height: 0, // Will be updated after processing
        month,
        year,
        storagePath,
        downloadURL
      };

      console.log('Saving metadata to Firestore...');
      // Save metadata to Firestore
      const docRef = await addDoc(collection(db, 'invoices'), invoice);
      invoice.id = docRef.id; // Use Firestore document ID as final ID
      console.log('Metadata saved to Firestore with ID:', docRef.id);

      console.log('Image uploaded successfully:', filename);
      return invoice;
    } catch (error) {
      console.error('Error uploading image to Firebase:', error);
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
      
      const q = query(
        collection(db, 'invoices'),
        where('month', '==', month),
        where('year', '==', year),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const invoices: FirebaseInvoice[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Found invoice:', data);
        invoices.push({ ...data, id: doc.id } as FirebaseInvoice);
      });
      
      console.log(`Retrieved ${invoices.length} invoices from Firebase for ${month}/${year}`);
      return invoices;
    } catch (error) {
      console.error('Error getting invoices from Firebase:', error);
      // Don't return empty array, let the error propagate to trigger fallback
      throw error;
    }
  }

  // Delete invoice from Firebase
  static async deleteInvoice(invoice: FirebaseInvoice): Promise<boolean> {
    try {
      // Delete from Storage
      const storageRef = ref(storage, invoice.storagePath);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'invoices', invoice.id));
      
      console.log('Invoice deleted successfully:', invoice.name);
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return false;
    }
  }

  // Get all invoices (for debugging)
  static async getAllInvoices(): Promise<FirebaseInvoice[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'invoices'));
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
