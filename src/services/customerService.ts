import { databases, appwriteConfig, ID } from '../config/appwrite';
import { Query } from 'appwrite';
import type { CustomerInfo } from '../types/Invoice';

export interface AppwriteCustomer extends CustomerInfo {
  $id?: string;
  isActive: boolean;
}

export const customerService = {
  /**
   * Get all active customers
   */
  async listCustomers(): Promise<AppwriteCustomer[]> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        [Query.equal('isActive', true), Query.orderAsc('name')]
      );
      return response.documents as AppwriteCustomer[];
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new Error('فشل في تحميل العملاء');
    }
  },

  /**
   * Get a single customer by ID
   */
  async getCustomer(customerId: string): Promise<AppwriteCustomer> {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        customerId
      );
      return response as AppwriteCustomer;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw new Error('فشل في تحميل بيانات العميل');
    }
  },

  /**
   * Get a customer by Tax Number
   */
  async getCustomerByTaxNumber(taxNumber: string): Promise<AppwriteCustomer | null> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        [Query.equal('taxNumber', taxNumber)]
      );

      if (response.documents.length > 0) {
        return response.documents[0] as AppwriteCustomer;
      }
      return null;
    } catch (error) {
      console.error('Error fetching customer by tax number:', error);
      return null;
    }
  },

  /**
   * Create a new customer
   */
  async createCustomer(customer: CustomerInfo): Promise<AppwriteCustomer> {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        ID.unique(),
        {
          ...customer,
          isActive: true,
        }
      );
      return response as AppwriteCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('فشل في إضافة العميل');
    }
  },

  /**
   * Update an existing customer
   */
  async updateCustomer(customerId: string, customer: Partial<CustomerInfo>): Promise<AppwriteCustomer> {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        customerId,
        customer
      );
      return response as AppwriteCustomer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw new Error('فشل في تحديث بيانات العميل');
    }
  },

  /**
   * Permanently delete a customer
   */
  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.customers,
        customerId
      );
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw new Error('فشل في حذف العميل');
    }
  },
};
