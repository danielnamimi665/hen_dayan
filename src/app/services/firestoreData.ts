import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { app } from '../firebase/config'

export class FirestoreDataService {
  private static db = getFirestore(app)

  private static async ensureAuth(): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      const auth = getAuth(app)
      if (!auth.currentUser) {
        await signInAnonymously(auth)
      }
    } catch {
      /* no-op */
    }
  }

  static async load<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
      await FirestoreDataService.ensureAuth()
      const ref = doc(FirestoreDataService.db, collectionName, docId)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        return snap.data() as T
      }
      return null
    } catch (err) {
      console.error(`[Firestore] load failed for ${collectionName}/${docId}:`, err)
      return null
    }
  }

  static async save<T>(collectionName: string, docId: string, data: T): Promise<boolean> {
    try {
      await FirestoreDataService.ensureAuth()
      const ref = doc(FirestoreDataService.db, collectionName, docId)
      await setDoc(ref, data)
      return true
    } catch (err) {
      console.error(`[Firestore] save failed for ${collectionName}/${docId}:`, err)
      return false
    }
  }
}


