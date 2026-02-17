import React, { useState } from 'react';
import { Plus, Trash2, FileText, Download, Printer as Print, FileDown } from 'lucide-react';
import { Invoice, InvoiceItem, CompanyInfo, CustomerInfo } from '../types/Invoice';
import QRCodeComponent from './QRCodeComponent';
import { generateZatcaQrCode } from '../utils/qrCodeUtils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const InvoiceForm: React.FC = () => {
  // Helper function to format numbers with thousand separators
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Predefined customers
  const PREDEFINED_CUSTOMERS: CustomerInfo[] = [
    {
      name: 'شركة هنقرستيشن المحدودة',
      address: 'حي الياسمين - طريق الملك عبدالعزيز',
      city: 'الرياض - السعودية',
      taxNumber: '310069655100003'
    },
    {
      name: 'شركة كيتا تكنولوجيز العربية المحدودة',
      address: '7782 طريق الملك عبدالعزيز . 5654 حي الربيع',
      city: 'الرياض - المملكة العربية السعودية 13315',
      taxNumber: '312187366900003'
    }
  ];

  const [invoice, setInvoice] = useState<Invoice>({
    id: Math.random().toString(36).substr(2, 9),
    number: '0002453',
    date: new Date().toISOString().split('T')[0],
    company: {
      name: 'مؤسسة الماسة الغربية للخدمات اللوجستية',
      address: 'حي الاجاويد - شارع بدية- مبنى 5100',
      city: '                     جدة - السعودية',
      email: '',
      phone: '',
      taxNumber: '311684171400003'
    },
    customer: PREDEFINED_CUSTOMERS[0],
    items: [],
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    paid: 0,
    discount: 0,
    remaining: 0,
    notes: ''
  });

  const [newItem, setNewItem] = useState<Omit<InvoiceItem, 'id' | 'total'>>({
    description: '',
    quantity: 1,
    price: 0,
    taxRate: 15
  });

  const [showPreview, setShowPreview] = useState(false);

  const addItem = () => {
    if (newItem.description.trim() === '') return;

    const item: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newItem,
      taxRate: 15, // Set default tax rate since we removed it from the form
      total: newItem.quantity * newItem.price
    };

    const updatedItems = [...invoice.items, item];
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = subtotal * 0.15; // 15% tax on subtotal
    const total = subtotal + taxAmount;
    const remaining = total - invoice.paid - invoice.discount;

    setInvoice({
      ...invoice,
      items: updatedItems,
      subtotal,
      taxAmount,
      total,
      remaining
    });

    setNewItem({
      description: '',
      quantity: 1,
      price: 0,
    });
  };

  const removeItem = (id: string) => {
    const updatedItems = invoice.items.filter(item => item.id !== id);
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = subtotal * 0.15; // 15% tax on subtotal
    const total = subtotal + taxAmount;
    const remaining = total - invoice.paid + invoice.discount;

    setInvoice({
      ...invoice,
      items: updatedItems,
      subtotal,
      taxAmount,
      total,
      remaining
    });
  };

  const updateCompanyInfo = (field: keyof CompanyInfo, value: string) => {
    setInvoice({
      ...invoice,
      company: {
        ...invoice.company,
        [field]: value
      }
    });
  };

  const updateCustomerInfo = (field: keyof CustomerInfo, value: string) => {
    setInvoice({
      ...invoice,
      customer: {
        ...invoice.customer,
        [field]: value
      }
    });
  };

  const updatePaidAmount = (paid: number) => {
    const remaining = invoice.total - paid + invoice.discount;
    setInvoice({
      ...invoice,
      paid,
      remaining
    });
  };

  const updateDiscountAmount = (discount: number) => {
    const remaining = invoice.total - invoice.paid - discount;
    setInvoice({
      ...invoice,
      discount,
      remaining
    });
  };

  const handleCustomerChange = (customerIndex: number) => {
    setInvoice({
      ...invoice,
      customer: PREDEFINED_CUSTOMERS[customerIndex]
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById('invoice-content');
      if (!element) return;

      // Hide buttons during PDF generation
      const buttons = element.querySelectorAll('.print\\:hidden');
      buttons.forEach(btn => (btn as HTMLElement).style.display = 'none');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Show buttons again
      buttons.forEach(btn => (btn as HTMLElement).style.display = '');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`فاتورة-${invoice.number}.pdf`);
    } catch (error) {
      console.error('خطأ في تحميل PDF:', error);
      alert('حدث خطأ أثناء تحميل الفاتورة');
    }
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div id="invoice-content" className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0">
            <div className="flex justify-between items-center mb-6 print:hidden">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                العودة للتعديل
              </button>
              <div className="space-x-2 flex gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FileDown size={16} />
                  تحميل PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Print size={16} />
                  طباعة
                </button>
              </div>
            </div>

            {/* Invoice Header */}
            <div className="border-b-2 border-gray-300 pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div className="text-left flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-2">
                    <img src="/logo.jpg" alt="Company Logo" className="w-24 h-24 object-contain" />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 text-right">
                    <div>{invoice.company.name}</div>
                    <div>{invoice.company.address}</div>
                    <div>{invoice.company.city}</div>
                    <div>الرقم الضريبي: {invoice.company.taxNumber}</div>
                  </div>
                </div>
                <div className="flex-1 text-center">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">فاتورة ضريبية مبسطة</h1>
                </div>
                <div className="flex flex-col items-center">
                  <QRCodeComponent
                    value={generateZatcaQrCode(invoice)}
                  />
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div className="space-y-2">
                <div className="text-right">
                  <div className="font-semibold text-gray-800">العميل</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div>{invoice.customer.name}</div>
                    <div>{invoice.customer.address}</div>
                    <div>{invoice.customer.city}</div>
                    <div>الرقم الضريبي: {invoice.customer.taxNumber}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-gray-600">رقم الفاتورة:</span>
                  <span className="font-semibold">{invoice.number}</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-gray-600">التاريخ:</span>
                  <span className="font-semibold">{invoice.date}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-right">الوصف</th>
                    <th className="border border-gray-300 p-3 text-center">الكمية</th>
                    <th className="border border-gray-300 p-3 text-center">السعر</th>
                    <th className="border border-gray-300 p-3 text-center">الضريبة</th>
                    <th className="border border-gray-300 p-3 text-center">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 p-3 text-right">{item.description}</td>
                      <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 p-3 text-center">{formatNumber(item.price)}</td>
                      <td className="border border-gray-300 p-3 text-center">{item.taxRate}%</td>
                      <td className="border border-gray-300 p-3 text-center">{formatNumber(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الإجمالي</span>
                    <span className="font-semibold">{formatNumber(invoice.subtotal)} ريال</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ضريبة القيمة المضافة</span>
                    <span className="font-semibold">{formatNumber(invoice.taxAmount)} ريال</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>الصافي</span>
                    <span>{formatNumber(invoice.total)} ريال</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">المدفوع</span>
                    <span className="font-semibold">{formatNumber(invoice.paid)} ريال</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الخصم</span>
                    <span className="font-semibold">{formatNumber(invoice.discount)} ريال</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center text-lg font-bold text-blue-600">
                      <span>المتبقي</span>
                      <span>{formatNumber(invoice.remaining)} ريال</span>
                    </div>
                  </div>
                </div>

                {/* Bank Information */}
                <div className="mt-30 pt-12 border-t border-gray-200">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3 text-right">معلومات الحساب البنكي</h3>
                    <div className="space-y-2 text-sm text-gray-600 text-right">
                      <div><strong>البنك:</strong> مصرف الراجحي</div>
                      <div><strong>الايبان:</strong> SA8780000206608010589879</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes section moved below totals */}
            {invoice.notes && (
              <div className="mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">ملاحظات:</div>
                  <div className="text-sm">{invoice.notes}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-blue-600" />
              إنشاء فاتورة ضريبية
            </h1>
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              معاينة الفاتورة
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Company Information - Fixed Display */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">معلومات المؤسسة</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div><strong>الاسم:</strong> {invoice.company.name}</div>
                  <div><strong>العنوان:</strong> {invoice.company.address}</div>
                  <div><strong>المدينة:</strong> {invoice.company.city}</div>
                  <div><strong>الرقم الضريبي:</strong> {invoice.company.taxNumber}</div>
                </div>
              </div>
            </div>

            {/* Customer Information - Fixed Display */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">معلومات العميل</h2>
              <select
                onChange={(e) => handleCustomerChange(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                defaultValue="0"
              >
                {PREDEFINED_CUSTOMERS.map((customer, index) => (
                  <option key={index} value={index}>
                    {customer.name}
                  </option>
                ))}
              </select>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div><strong>الاسم:</strong> {invoice.customer.name}</div>
                  <div><strong>العنوان:</strong> {invoice.customer.address}</div>
                  <div><strong>المدينة:</strong> {invoice.customer.city}</div>
                  <div><strong>الرقم الضريبي:</strong> {invoice.customer.taxNumber}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="رقم الفاتورة"
                  value={invoice.number}
                  onChange={(e) => setInvoice({ ...invoice, number: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={invoice.date}
                  onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Add Item Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">إضافة عنصر جديد</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                <input
                  type="text"
                  placeholder="وصف المنتج/الخدمة"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الكمية</label>
                <input
                  type="number"
                  placeholder="الكمية"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السعر</label>
                <input
                  type="number"
                  step="0.0000000001"
                  min="0"
                  placeholder="السعر"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">الإجمالي</label>
                  <div className="text-lg font-bold text-blue-600 bg-blue-50 p-3 rounded-md border">
                    {(newItem.quantity * newItem.price).toFixed(2)} ريال
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={addItem}
                className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                إضافة
              </button>
            </div>
          </div>

          {/* Items Table */}
          {invoice.items.length > 0 && (
            <div className="mb-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-right">الوصف</th>
                      <th className="border border-gray-300 p-3 text-center">الكمية</th>
                      <th className="border border-gray-300 p-3 text-center">السعر</th>
                      <th className="border border-gray-300 p-3 text-center">الضريبة</th>
                      <th className="border border-gray-300 p-3 text-center">الإجمالي</th>
                      <th className="border border-gray-300 p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 p-3 text-right">{item.description}</td>
                        <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 p-3 text-center">{item.price.toFixed(2)}</td>
                        <td className="border border-gray-300 p-3 text-center">{item.taxRate}%</td>
                        <td className="border border-gray-300 p-3 text-center">{item.total.toFixed(2)}</td>
                        <td className="border border-gray-300 p-3 text-center">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totals Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الإجمالي</span>
                    <span className="font-semibold">{invoice.subtotal.toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ضريبة القيمة المضافة</span>
                    <span className="font-semibold">{invoice.taxAmount.toFixed(2)} ريال</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>الصافي</span>
                      <span>{invoice.total.toFixed(2)} ريال</span>
                    </div>
                  </div>
                  <div className="border-t pt-2 mt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-gray-600">المدفوع</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={invoice.paid}
                          onChange={(e) => updatePaidAmount(parseFloat(e.target.value) || 0)}
                          className="w-24 p-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <label className="text-gray-600">الخصم</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={invoice.discount}
                          onChange={(e) => updateDiscountAmount(parseFloat(e.target.value) || 0)}
                          className="w-24 p-2 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center text-lg font-bold text-blue-600">
                          <span>المتبقي</span>
                          <span>{invoice.remaining.toFixed(2)} ريال</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <textarea
                placeholder="ملاحظات إضافية..."
                value={invoice.notes}
                onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;