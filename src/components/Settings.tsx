import React, { useState, useEffect } from 'react';
import { Building2, Users, Save, Plus, Trash2, Edit2 } from 'lucide-react';
import { companyService, AppwriteCompany } from '../services/companyService';
import { customerService, AppwriteCustomer } from '../services/customerService';

const Settings: React.FC = () => {
    // Company state
    const [company, setCompany] = useState<AppwriteCompany | null>(null);
    const [companyLoading, setCompanyLoading] = useState(true);
    const [companySaving, setCompanySaving] = useState(false);

    // Customers state
    const [customers, setCustomers] = useState<AppwriteCustomer[]>([]);
    const [customersLoading, setCustomersLoading] = useState(true);
    const [editingCustomer, setEditingCustomer] = useState<AppwriteCustomer | null>(null);
    const [showCustomerForm, setShowCustomerForm] = useState(false);

    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Load company info
    useEffect(() => {
        loadCompany();
    }, []);

    // Load customers
    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCompany = async () => {
        try {
            const data = await companyService.getCompanyInfo();
            setCompany(data);
        } catch (error) {
            console.error('Error loading company:', error);
            setMessage({ type: 'error', text: 'فشل في تحميل بيانات المؤسسة' });
        } finally {
            setCompanyLoading(false);
        }
    };

    const loadCustomers = async () => {
        try {
            const data = await customerService.listCustomers();
            setCustomers(data);
        } catch (error) {
            console.error('Error loading customers:', error);
            setMessage({ type: 'error', text: 'فشل في تحميل العملاء' });
        } finally {
            setCustomersLoading(false);
        }
    };

    const handleSaveCompany = async () => {
        if (!company) return;

        setCompanySaving(true);
        try {
            await companyService.updateCompanyInfo(company);
            setMessage({ type: 'success', text: 'تم حفظ بيانات المؤسسة بنجاح' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'فشل في حفظ بيانات المؤسسة' });
        } finally {
            setCompanySaving(false);
        }
    };

    const handleSaveCustomer = async (customer: Partial<AppwriteCustomer>) => {
        try {
            if (editingCustomer?.$id) {
                // Update existing
                await customerService.updateCustomer(editingCustomer.$id, customer);
                setMessage({ type: 'success', text: 'تم تحديث العميل بنجاح' });
            } else {
                // Create new
                await customerService.createCustomer(customer as any);
                setMessage({ type: 'success', text: 'تم إضافة العميل بنجاح' });
            }
            loadCustomers();
            setShowCustomerForm(false);
            setEditingCustomer(null);
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'فشل في حفظ بيانات العميل' });
        }
    };

    const handleDeleteCustomer = async (customerId: string, customerName: string) => {
        if (!confirm(`هل أنت متأكد من حذف العميل: ${customerName}؟`)) {
            return;
        }

        try {
            await customerService.deleteCustomer(customerId);
            setMessage({ type: 'success', text: 'تم حذف العميل بنجاح' });
            loadCustomers();
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'فشل في حذف العميل' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Success/Error Message */}
                {message && (
                    <div className={`p-4 rounded-md ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                        <div className="flex items-center gap-2">
                            {message.type === 'success' ? '✓' : '✗'}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    </div>
                )}

                {/* Company Settings */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Building2 className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800">معلومات المؤسسة</h2>
                    </div>

                    {companyLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : company ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم المؤسسة</label>
                                    <input
                                        type="text"
                                        value={company.name}
                                        onChange={(e) => setCompany({ ...company, name: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الرقم الضريبي</label>
                                    <input
                                        type="text"
                                        value={company.taxNumber}
                                        onChange={(e) => setCompany({ ...company, taxNumber: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                                <input
                                    type="text"
                                    value={company.address}
                                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
                                <input
                                    type="text"
                                    value={company.city}
                                    onChange={(e) => setCompany({ ...company, city: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>



                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveCompany}
                                    disabled={companySaving}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                                >
                                    <Save size={18} />
                                    {companySaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Customer Management */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Users className="text-blue-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-800">إدارة العملاء</h2>
                        </div>
                        <button
                            onClick={() => {
                                setEditingCustomer(null);
                                setShowCustomerForm(true);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} />
                            إضافة عميل
                        </button>
                    </div>

                    {customersLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            {/* Customer Form */}
                            {/* Customer Form Modal */}
                            {showCustomerForm && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <CustomerForm
                                            customer={editingCustomer}
                                            onSave={handleSaveCustomer}
                                            onCancel={() => {
                                                setShowCustomerForm(false);
                                                setEditingCustomer(null);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Customers List */}
                            <div className="space-y-3">
                                {customers.map((customer) => (
                                    <div
                                        key={customer.$id}
                                        className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center justify-between"
                                    >
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                                            <p className="text-sm text-gray-600">{customer.address}</p>
                                            <p className="text-sm text-gray-500">الرقم الضريبي: {customer.taxNumber}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingCustomer(customer);
                                                    setShowCustomerForm(true);
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCustomer(customer.$id!, customer.name)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Customer Form Component
interface CustomerFormProps {
    customer: AppwriteCustomer | null;
    onSave: (customer: Partial<AppwriteCustomer>) => void;
    onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: customer?.name || '',
        address: customer?.address || '',
        city: customer?.city || '',
        taxNumber: customer?.taxNumber || '',
        bankName: customer?.bankName || '',
        iban: customer?.iban || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
                {customer ? 'تعديل العميل' : 'إضافة عميل جديد'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم العميل</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الرقم الضريبي</label>
                    <input
                        type="text"
                        required
                        value={formData.taxNumber}
                        onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
                <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم البنك</label>
                <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="اختياري"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الآيبان</label>
                <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="اختياري"
                />
            </div>
            <div className="flex gap-2 justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    إلغاء
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                    <Save size={18} />
                    حفظ
                </button>
            </div>
        </form>
    );
};

export default Settings;
