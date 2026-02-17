export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  taxRate: number;
  total: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  email: string;
  phone: string;
  taxNumber: string;
  bankName?: string;
  iban?: string;
}

export interface CustomerInfo {
  name: string;
  address: string;
  city: string;
  taxNumber: string;
  bankName?: string;
  iban?: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  company: CompanyInfo;
  customer: CustomerInfo;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  paid: number;
  discount: number;
  remaining: number;
  notes: string;
}