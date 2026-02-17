import { Client, Databases, ID } from 'appwrite';

export const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);

export const appwriteConfig = {
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    collections: {
        customers: import.meta.env.VITE_APPWRITE_CUSTOMERS_COLLECTION_ID,
        company: import.meta.env.VITE_APPWRITE_COMPANY_COLLECTION_ID,
        invoices: import.meta.env.VITE_APPWRITE_INVOICES_COLLECTION_ID,
        invoiceItems: import.meta.env.VITE_APPWRITE_INVOICE_ITEMS_COLLECTION_ID,
    },
    companyDocumentId: import.meta.env.VITE_APPWRITE_COMPANY_DOCUMENT_ID,
};

export { ID };
