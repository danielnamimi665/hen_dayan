export interface InvoiceData {
  id: string;
  name: string;
  createdAt: string;
  type: string;
  size: number;
  width: number;
  height: number;
  month: number;
  year: number;
  storagePath: string;
  downloadURL: string;
  blob?: Blob; // Optional for when we need to create object URLs
}

// Extended type for upload operations
export type InvoiceWithUpload = InvoiceData & {
  blob?: Blob;
};

// Type for Firebase operations
export interface FirebaseInvoice extends InvoiceData {
  // FirebaseInvoice already has all the fields we need
}

// Type for local storage operations
export interface LocalInvoiceData {
  id: string;
  name: string;
  createdAt: string;
  type: string;
  size: number;
  width: number;
  height: number;
  month: number;
  year: number;
  blob?: Blob; // Optional for IndexedDB operations
  base64Data?: string; // For localStorage fallback
}
