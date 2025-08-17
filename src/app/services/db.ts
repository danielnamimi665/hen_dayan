import { InvoiceData, LocalInvoiceData } from '../types/invoice'

export class InvoicesDB {
  private static dbName = 'invoicesDB';
  private static version = 1;
  private static storeName = 'invoices';
  private static fallbackKeyPrefix = 'invoices_fallback';
  private static db: IDBDatabase | null = null;

  // Check if IndexedDB is available and working
  private static isIndexedDBSupported(): boolean {
    return typeof window !== 'undefined' && 
           'indexedDB' in window && 
           window.indexedDB !== null;
  }

  // Initialize database connection (reuse if available)
  private static async getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    
    this.db = await this.init();
    return this.db;
  }

  // Initialize database
  private static async init(): Promise<IDBDatabase> {
    if (!this.isIndexedDBSupported()) {
      throw new Error('IndexedDB not supported');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        console.log('IndexedDB opened successfully');
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        console.log('IndexedDB upgrade needed');
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('Object store and index created');
        }
      };
    });
  }

  // Delete invoice
  static async deleteInvoice(id: string): Promise<boolean> {
    try {
      if (this.isIndexedDBSupported()) {
        const db = await this.getDB();
        if (db) {
          const transaction = db.transaction(['invoices'], 'readwrite');
          const store = transaction.objectStore('invoices');
          const request = store.delete(id);
          
          return new Promise((resolve) => {
            request.onsuccess = () => {
              console.log('Invoice deleted from IndexedDB:', id);
              resolve(true);
            };
            request.onerror = (event) => {
              console.error('Error deleting from IndexedDB:', event);
              resolve(false);
            };
          });
        }
      }
      
             // Fallback to localStorage
       return await this.deleteFromLocalStorage(id);
    } catch (error) {
      console.error('Error in deleteInvoice:', error);
      return false;
    }
  }

  // Delete from localStorage
  private static async deleteFromLocalStorage(id: string): Promise<boolean> {
    try {
      // Get all keys from localStorage
      const keys = Object.keys(localStorage);
      const invoiceKeys = keys.filter(key => key.startsWith('invoices:'));
      
      for (const key of invoiceKeys) {
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const invoices = JSON.parse(saved);
            const updatedInvoices = invoices.filter((invoice: unknown) => (invoice as { id: string }).id !== id);
            
            if (updatedInvoices.length !== invoices.length) {
              localStorage.setItem(key, JSON.stringify(updatedInvoices));
              console.log('Invoice deleted from localStorage:', id);
              return true;
            }
          } catch (error) {
            console.error('Error parsing localStorage data:', error);
          }
        }
      }
      
      // Also check the fallback key
      const fallbackKey = this.fallbackKey(
        new Date().getMonth(),
        new Date().getFullYear()
      );
      
      const saved = localStorage.getItem(fallbackKey);
      if (saved) {
        try {
          const invoices = JSON.parse(saved);
          const updatedInvoices = invoices.filter((invoice: unknown) => (invoice as { id: string }).id !== id);
          
          if (updatedInvoices.length !== invoices.length) {
            localStorage.setItem(fallbackKey, JSON.stringify(updatedInvoices));
            console.log('Invoice deleted from localStorage fallback:', id);
            return true;
          }
        } catch (error) {
          console.error('Error parsing localStorage fallback data:', error);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error in deleteFromLocalStorage:', error);
      return false;
    }
  }

  // Save to localStorage
  private static async saveToLocalStorage(invoice: LocalInvoiceData): Promise<boolean> {
    try {
      // Use the month and year fields from the invoice if they exist, otherwise calculate from createdAt
      let month: number, year: number;
      
      if (invoice.month && invoice.year) {
        month = invoice.month;
        year = invoice.year;
        console.log('Using stored month/year from invoice:', month, year);
      } else {
        // Fallback to calculating from createdAt date
        const invoiceDate = new Date(invoice.createdAt);
        month = invoiceDate.getMonth() + 1; // Convert 0-indexed to 1-indexed
        year = invoiceDate.getFullYear();
        console.log('Calculated month/year from createdAt:', month, year);
      }
      
      const fallbackKey = this.fallbackKey(month, year);
      
      const existing = localStorage.getItem(fallbackKey);
      const invoices = existing ? JSON.parse(existing) : [];
      
      // Convert blob to base64
      const base64Data = await this.blobToBase64(invoice.blob);
      
      const invoiceToSave = {
        ...invoice,
        base64Data,
        blob: undefined // Remove blob from localStorage data
      };
      
      // Check if invoice already exists
      const existingIndex = invoices.findIndex((inv: unknown) => (inv as { id: string }).id === invoice.id);
      if (existingIndex >= 0) {
        invoices[existingIndex] = invoiceToSave;
      } else {
        invoices.push(invoiceToSave);
      }
      
      localStorage.setItem(fallbackKey, JSON.stringify(invoices));
      console.log('Invoice saved to localStorage:', invoice.name, 'for month:', month, 'year:', year, 'key:', fallbackKey);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  // Convert blob to base64
  private static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Convert base64 to blob
  private static base64ToBlob(base64: string, type: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
  }

  // Generate fallback key for localStorage
  private static fallbackKey(month: number, year: number): string {
    return `invoices:${year}-${String(month + 1).padStart(2, '0')}`;
  }

  // Validate invoice data
  static validateInvoice(invoice: LocalInvoiceData): boolean {
    if (!invoice.id || typeof invoice.id !== 'string') {
      console.error('Invalid invoice ID:', invoice.id);
      return false;
    }
    if (!invoice.name || typeof invoice.name !== 'string') {
      console.error('Invalid invoice name:', invoice.name);
      return false;
    }
    if (!invoice.createdAt || typeof invoice.createdAt !== 'string') {
      console.error('Invalid invoice createdAt:', invoice.createdAt);
      return false;
    }
    if (!invoice.blob) {
      console.error('Invoice blob is missing:', invoice.name);
      return false;
    }
    if (!(invoice.blob instanceof Blob)) {
      console.error('Invoice blob is not a valid Blob instance:', invoice.name);
      return false;
    }
    if (invoice.blob.size === 0) {
      console.error('Invoice blob is empty:', invoice.name);
      return false;
    }
    if (invoice.blob.type === '') {
      console.error('Invoice blob has no type:', invoice.name);
      return false;
    }
    if (!invoice.blob.type.startsWith('image/')) {
      console.error('Invoice blob is not an image:', invoice.name, invoice.blob.type);
      return false;
    }
    return true;
  }

  // Save invoice to IndexedDB with fallback to localStorage
  static async saveInvoice(invoice: LocalInvoiceData): Promise<boolean> {
    try {
      // Validate invoice before saving
      if (!this.validateInvoice(invoice)) {
        console.error('Invoice validation failed:', invoice.name);
        return false;
      }

      console.log('Saving invoice to IndexedDB:', invoice.name, 'Size:', invoice.blob.size, 'Type:', invoice.blob.type);

      if (this.isIndexedDBSupported()) {
        const db = await this.getDB();
        if (db) {
          const transaction = db.transaction(['invoices'], 'readwrite');
          const store = transaction.objectStore('invoices');
          
          // Create a new blob to ensure it's fresh
          const freshBlob = new Blob([invoice.blob], { type: invoice.blob.type });
          
          const invoiceToSave = {
            ...invoice,
            blob: freshBlob,
            size: freshBlob.size,
            width: invoice.width || 0,
            height: invoice.height || 0
          };

          const request = store.put(invoiceToSave);
          
                     return new Promise(async (resolve) => {
             request.onsuccess = () => {
               console.log('Invoice saved to IndexedDB successfully:', invoice.name);
               resolve(true);
             };
             request.onerror = async (event) => {
               console.error('Error saving to IndexedDB:', event);
               // Fallback to localStorage
               resolve(await this.saveToLocalStorage(invoice));
             };
             transaction.oncomplete = () => {
               console.log('IndexedDB transaction completed for invoice:', invoice.name);
             };
             transaction.onerror = (event) => {
               console.error('IndexedDB transaction error:', event);
             };
           });
        }
      }
      
             // Fallback to localStorage
       console.log('Falling back to localStorage for invoice:', invoice.name);
       return await this.saveToLocalStorage(invoice);
    } catch (error) {
      console.error('Error in saveInvoice:', error);
             // Final fallback to localStorage
       return await this.saveToLocalStorage(invoice);
    }
  }

  // Get database info for debugging
  static async getDatabaseInfo(): Promise<{
    type: string;
    name?: string;
    version?: number;
    objectStores?: string[];
    readyState?: string;
    fallbackKey?: string;
    hasData?: boolean;
    dataSize?: number;
    error?: string;
  }> {
    try {
      if (this.isIndexedDBSupported()) {
        const db = await this.getDB();
        return {
          type: 'IndexedDB',
          name: db.name,
          version: db.version,
          objectStores: Array.from(db.objectStoreNames),
          readyState: db.readyState
        };
      } else {
        const fallbackData = localStorage.getItem(this.fallbackKeyPrefix);
        return {
          type: 'localStorage',
          fallbackKey: this.fallbackKeyPrefix,
          hasData: !!fallbackData,
          dataSize: fallbackData ? fallbackData.length : 0
        };
      }
    } catch (error) {
      console.error('Error getting database info:', error);
      return { type: 'error', error: error.message };
    }
  }

  // Clear all data (for testing/debugging)
  static async clearAllData(): Promise<void> {
    try {
      if (this.isIndexedDBSupported()) {
        const db = await this.getDB();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
        
        console.log('All IndexedDB data cleared');
      }
      
      // Also clear localStorage fallback
      localStorage.removeItem(this.fallbackKeyPrefix);
      console.log('localStorage fallback cleared');
      
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  // Get all invoices
  static async getAllInvoices(): Promise<LocalInvoiceData[]> {
    const db = await this.init();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('createdAt');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result.reverse());
      request.onerror = () => reject(request.error);
    });
  }

  // Get invoices from localStorage fallback
  private static getInvoicesFromLocalStorage(month: number, year: number): LocalInvoiceData[] {
    try {
      const fallbackKey = this.fallbackKey(month, year);
      const saved = localStorage.getItem(fallbackKey);
      
      if (saved) {
        try {
          const invoices = JSON.parse(saved);
          console.log('Retrieved from localStorage:', invoices.length, 'invoices for month:', month, 'year:', year);
          
          // Convert base64 back to blobs
          const processedInvoices: InvoiceData[] = [];
          
          for (const invoice of invoices) {
            try {
              if (invoice.base64Data) {
                const blob = this.base64ToBlob(invoice.base64Data, invoice.type || 'image/jpeg');
                if (blob && blob.size > 0) {
                  const processedInvoice: InvoiceData = {
                    ...invoice,
                    blob,
                    size: blob.size
                  };
                  
                  if (this.validateInvoice(processedInvoice)) {
                    processedInvoices.push(processedInvoice);
                  } else {
                    console.error('Invalid invoice from localStorage:', invoice.name);
                  }
                } else {
                  console.error('Generated blob is empty for invoice:', invoice.name);
                }
              }
            } catch (error) {
              console.error('Error converting base64 to blob for invoice:', invoice.name, error);
            }
          }
          
          console.log('Valid invoices from localStorage:', processedInvoices.length);
          return processedInvoices;
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error in getInvoicesFromLocalStorage:', error);
      return [];
    }
  }

  // Get invoices by month and year
  static async getInvoicesByMonthYear(month: number, year: number): Promise<LocalInvoiceData[]> {
    try {
      console.log('Fetching invoices for month:', month, 'year:', year);
      
      if (this.isIndexedDBSupported()) {
        const db = await this.getDB();
        if (db) {
          const transaction = db.transaction(['invoices'], 'readonly');
          const store = transaction.objectStore('invoices');
          const request = store.getAll();
          
          return new Promise((resolve) => {
            request.onsuccess = () => {
              const allInvoices = request.result || [];
              console.log('Retrieved from IndexedDB:', allInvoices.length, 'invoices');
              
              // Filter by month and year using the stored month/year fields
              const filteredInvoices = allInvoices.filter(invoice => {
                // Use the stored month and year fields if they exist
                if (invoice.month && invoice.year) {
                  const matches = invoice.month === month && invoice.year === year;
                  console.log(`Invoice ${invoice.name}: stored month ${invoice.month} (expected ${month}), stored year ${invoice.year} (expected ${year}), matches: ${matches}`);
                  return matches;
                }
                
                // Fallback to date parsing if month/year fields don't exist
                try {
                  const invoiceDate = new Date(invoice.createdAt);
                  const invoiceMonth = invoiceDate.getMonth() + 1; // Convert 0-indexed to 1-indexed
                  const invoiceYear = invoiceDate.getFullYear();
                  
                  const matches = invoiceMonth === month && invoiceYear === year;
                  console.log(`Invoice ${invoice.name}: parsed month ${invoiceMonth} (expected ${month}), parsed year ${invoiceYear} (expected ${year}), matches: ${matches}`);
                  
                  return matches;
                } catch (error) {
                  console.error('Error parsing invoice date:', invoice.createdAt, error);
                  return false;
                }
              });
              
              console.log('Filtered invoices from IndexedDB:', filteredInvoices.length);
              resolve(filteredInvoices);
            };
            request.onerror = () => {
              console.error('Error reading from IndexedDB, falling back to localStorage');
              resolve(this.getInvoicesFromLocalStorage(month, year));
            };
          });
        }
      }
      
      // Fallback to localStorage
      console.log('Falling back to localStorage for month:', month, 'year:', year);
      return this.getInvoicesFromLocalStorage(month, year);
      
    } catch (error) {
      console.error('Error in getInvoicesByMonthYear:', error);
      // Final fallback to localStorage
      return this.getInvoicesFromLocalStorage(month, year);
    }
  }
}
