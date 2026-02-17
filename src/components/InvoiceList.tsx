import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Search, Calendar, User, Edit, Eye, FileDown } from 'lucide-react';
import { invoiceService, AppwriteInvoice } from '../services/invoiceService';

interface InvoiceListProps {
    onViewInvoice?: (invoiceId: string) => void;
    onDownloadInvoice?: (invoiceId: string) => void;
    onEditInvoice?: (invoiceId: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ onViewInvoice, onDownloadInvoice, onEditInvoice }) => {
    const [invoices, setInvoices] = useState<AppwriteInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalInvoices, setTotalInvoices] = useState(0);
    const itemsPerPage = 10;

    const formatNumber = (num: number): string => {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const loadInvoices = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await invoiceService.listInvoices({
                limit: itemsPerPage,
                offset: (currentPage - 1) * itemsPerPage,
                searchQuery: searchQuery || undefined,
            });
            setInvoices(result.invoices);
            setTotalInvoices(result.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'فشل في تحميل الفواتير');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvoices();
    }, [currentPage, searchQuery]);

    const handleDelete = async (invoiceId: string, invoiceNumber: string) => {
        if (!confirm(`هل أنت متأكد من حذف الفاتورة رقم ${invoiceNumber}؟`)) {
            return;
        }

        try {
            await invoiceService.deleteInvoice(invoiceId);
            loadInvoices(); // Reload the list
            alert('تم حذف الفاتورة بنجاح');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'فشل في حذف الفاتورة');
        }
    };

    const totalPages = Math.ceil(totalInvoices / itemsPerPage);

    if (loading && invoices.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">جاري تحميل الفواتير...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="text-blue-600" />
                            قائمة الفواتير
                        </h1>
                        <div className="text-sm text-gray-600">
                            الإجمالي: <span className="font-semibold">{totalInvoices}</span> فاتورة
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="ابحث برقم الفاتورة..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Invoices Table */}
                    {invoices.length === 0 ? (
                        <div className="text-center py-20">
                            <FileText className="mx-auto text-gray-300 mb-4" size={64} />
                            <p className="text-gray-500 text-lg">لا توجد فواتير</p>
                            <p className="text-gray-400 text-sm mt-2">ابدأ بإنشاء فاتورة جديدة</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b-2 border-gray-200">
                                            <th className="p-4 text-right font-semibold text-gray-700">رقم الفاتورة</th>
                                            <th className="p-4 text-right font-semibold text-gray-700">التاريخ</th>
                                            <th className="p-4 text-right font-semibold text-gray-700">العميل</th>
                                            <th className="p-4 text-center font-semibold text-gray-700">المبلغ الإجمالي</th>
                                            <th className="p-4 text-center font-semibold text-gray-700">المتبقي</th>
                                            <th className="p-4 text-center font-semibold text-gray-700">الحالة</th>
                                            <th className="p-4 text-center font-semibold text-gray-700">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map((invoice) => (
                                            <tr key={invoice.$id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                                <td className="p-4 font-medium text-blue-600">{invoice.invoiceNumber}</td>
                                                <td className="p-4 text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={16} className="text-gray-400" />
                                                        {formatDate(invoice.date)}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <User size={16} className="text-gray-400" />
                                                        <span className="truncate max-w-xs">{invoice.customerName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center font-semibold text-gray-800">
                                                    {formatNumber(invoice.total)} ريال
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`font-semibold ${invoice.remaining > 0 ? 'text-red-600' : 'text-green-600'
                                                        }`}>
                                                        {formatNumber(invoice.remaining)} ريال
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${invoice.status === 'paid'
                                                        ? 'bg-green-100 text-green-800'
                                                        : invoice.status === 'finalized'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {invoice.status === 'paid' ? 'مدفوعة' : invoice.status === 'finalized' ? 'نهائية' : 'مسودة'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => onEditInvoice?.(invoice.$id!)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                            title="تعديل الفاتورة"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => onViewInvoice?.(invoice.$id!)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                            title="عرض الفاتورة"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => onDownloadInvoice?.(invoice.$id!)}
                                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                                            title="تحميل PDF"
                                                        >
                                                            <FileDown size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(invoice.$id!, invoice.invoiceNumber)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                            title="حذف الفاتورة"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        السابق
                                    </button>
                                    <span className="px-4 py-2 text-gray-600">
                                        صفحة {currentPage} من {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        التالي
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceList;
