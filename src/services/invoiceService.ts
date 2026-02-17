import { databases, appwriteConfig, ID } from '../config/appwrite';
import { Query } from 'appwrite';
import type { Invoice, InvoiceItem } from '../types/Invoice';

export interface AppwriteInvoice {
    $id?: string;
    invoiceNumber: string;
    date: string;
    customerId: string;
    customerName: string;
    subtotal: number;
    taxAmount: number;
    total: number;
    paid: number;
    discount: number;
    remaining: number;
    notes: string;
    status: 'draft' | 'finalized' | 'paid';
    $createdAt?: string;
    $updatedAt?: string;
}

export interface AppwriteInvoiceItem {
    $id?: string;
    invoiceId: string;
    description: string;
    quantity: number;
    price: number;
    taxRate: number;
    total: number;
    orderIndex: number;
}

export const invoiceService = {
    /**
     * Create a new invoice with items
     */
    async createInvoice(invoice: Invoice): Promise<{ invoice: AppwriteInvoice; items: AppwriteInvoiceItem[] }> {
        try {
            // Create the invoice document
            const invoiceData: Partial<AppwriteInvoice> = {
                invoiceNumber: invoice.number,
                date: invoice.date,
                customerId: invoice.customer.taxNumber, // Using tax number as customer ID
                customerName: invoice.customer.name,
                subtotal: invoice.subtotal,
                taxAmount: invoice.taxAmount,
                total: invoice.total,
                paid: invoice.paid,
                discount: invoice.discount,
                remaining: invoice.remaining,
                notes: invoice.notes,
                status: 'finalized',
            };

            const createdInvoice = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.invoices,
                ID.unique(),
                invoiceData
            );

            const invoiceId = createdInvoice.$id;

            // Create invoice items
            const itemPromises = invoice.items.map((item, index) =>
                databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.invoiceItems,
                    ID.unique(),
                    {
                        invoiceId,
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                        taxRate: item.taxRate,
                        total: item.total,
                        orderIndex: index,
                    }
                )
            );

            const createdItems = await Promise.all(itemPromises);

            return {
                invoice: createdInvoice as AppwriteInvoice,
                items: createdItems as AppwriteInvoiceItem[],
            };
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw new Error('فشل في حفظ الفاتورة');
        }
    },

    /**
     * Get a single invoice with its items
     */
    async getInvoice(invoiceId: string): Promise<{ invoice: AppwriteInvoice; items: AppwriteInvoiceItem[] }> {
        try {
            const invoice = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.invoices,
                invoiceId
            );

            const itemsResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.invoiceItems,
                [Query.equal('invoiceId', invoiceId), Query.orderAsc('orderIndex')]
            );

            return {
                invoice: invoice as AppwriteInvoice,
                items: itemsResponse.documents as AppwriteInvoiceItem[],
            };
        } catch (error) {
            console.error('Error fetching invoice:', error);
            throw new Error('فشل في تحميل الفاتورة');
        }
    },

    /**
     * List all invoices with pagination and filters
     */
    async listInvoices(options?: {
        limit?: number;
        offset?: number;
        searchQuery?: string;
    }): Promise<{ invoices: AppwriteInvoice[]; total: number }> {
        try {
            const queries = [Query.orderDesc('date')];

            if (options?.limit) {
                queries.push(Query.limit(options.limit));
            }
            if (options?.offset) {
                queries.push(Query.offset(options.offset));
            }
            if (options?.searchQuery) {
                queries.push(Query.search('invoiceNumber', options.searchQuery));
            }

            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.invoices,
                queries
            );

            return {
                invoices: response.documents as AppwriteInvoice[],
                total: response.total,
            };
        } catch (error) {
            console.error('Error listing invoices:', error);
            throw new Error('فشل في تحميل الفواتير');
        }
    },

    /**
     * Update an existing invoice with items
     */
    async updateInvoice(invoiceId: string, invoice: Invoice): Promise<{ invoice: AppwriteInvoice; items: AppwriteInvoiceItem[] }> {
        try {
            // Update the invoice document
            const invoiceData: Partial<AppwriteInvoice> = {
                invoiceNumber: invoice.number,
                date: invoice.date,
                customerId: invoice.customer.taxNumber,
                customerName: invoice.customer.name,
                subtotal: invoice.subtotal,
                taxAmount: invoice.taxAmount,
                total: invoice.total,
                paid: invoice.paid,
                discount: invoice.discount,
                remaining: invoice.remaining,
                notes: invoice.notes,
                status: 'finalized',
            };

            const updatedInvoice = await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.invoices,
                invoiceId,
                invoiceData
            );

            // Delete existing items
            const existingItemsResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.invoiceItems,
                [Query.equal('invoiceId', invoiceId)]
            );

            await Promise.all(
                existingItemsResponse.documents.map((item) =>
                    databases.deleteDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.collections.invoiceItems,
                        item.$id
                    )
                )
            );

            // Create new items
            const itemPromises = invoice.items.map((item, index) =>
                databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.invoiceItems,
                    ID.unique(),
                    {
                        invoiceId,
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                        taxRate: item.taxRate,
                        total: item.total,
                        orderIndex: index,
                    }
                )
            );

            const createdItems = await Promise.all(itemPromises);

            return {
                invoice: updatedInvoice as AppwriteInvoice,
                items: createdItems as AppwriteInvoiceItem[],
            };
        } catch (error) {
            console.error('Error updating invoice:', error);
            throw new Error('فشل في تحديث الفاتورة');
        }
    },

    /**
     * Delete an invoice and its items
     */
    async deleteInvoice(invoiceId: string): Promise<void> {
        try {
            // Delete all items first
            const itemsResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.invoiceItems,
                [Query.equal('invoiceId', invoiceId)]
            );

            await Promise.all(
                itemsResponse.documents.map((item) =>
                    databases.deleteDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.collections.invoiceItems,
                        item.$id
                    )
                )
            );

            // Then delete the invoice
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.invoices,
                invoiceId
            );
        } catch (error) {
            console.error('Error deleting invoice:', error);
            throw new Error('فشل في حذف الفاتورة');
        }
    },

    /**
     * Get the next invoice number
     */
    async getNextInvoiceNumber(): Promise<string> {
        try {
            const response = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.invoices,
                [Query.orderDesc('invoiceNumber'), Query.limit(1)]
            );

            if (response.documents.length === 0) {
                return '0000001';
            }

            const lastInvoice = response.documents[0] as AppwriteInvoice;
            const lastNumber = parseInt(lastInvoice.invoiceNumber);
            const nextNumber = lastNumber + 1;
            return nextNumber.toString().padStart(7, '0');
        } catch (error) {
            console.error('Error getting next invoice number:', error);
            return '0000001';
        }
    },
};
