import { databases, appwriteConfig } from '../config/appwrite';
import type { CompanyInfo } from '../types/Invoice';

export interface AppwriteCompany extends CompanyInfo {
  $id?: string;
  bankName?: string;
  iban?: string;
}

export const companyService = {
  /**
   * Get company information
   */
  async getCompanyInfo(): Promise<AppwriteCompany> {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.company,
        appwriteConfig.companyDocumentId
      );
      return response as AppwriteCompany;
    } catch (error) {
      console.error('Error fetching company info:', error);
      throw new Error('فشل في تحميل بيانات المؤسسة');
    }
  },

  /**
   * Update company information
   */
  async updateCompanyInfo(companyData: Partial<CompanyInfo>): Promise<AppwriteCompany> {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collections.company,
        appwriteConfig.companyDocumentId,
        companyData
      );
      return response as AppwriteCompany;
    } catch (error) {
      console.error('Error updating company info:', error);
      throw new Error('فشل في تحديث بيانات المؤسسة');
    }
  },
};
