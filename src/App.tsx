import React, { useState } from 'react';
import { FileText, List, Settings as SettingsIcon } from 'lucide-react';
import InvoiceForm from './components/InvoiceForm';
import InvoiceList from './components/InvoiceList';
import Settings from './components/Settings';

type Page = 'create' | 'list' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('create');
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);

  const handleEditInvoice = (invoiceId: string) => {
    setEditingInvoiceId(invoiceId);
    setViewingInvoiceId(null);
    setCurrentPage('create');
  };

  const handleViewInvoice = (invoiceId: string) => {
    setViewingInvoiceId(invoiceId);
    setEditingInvoiceId(null);
    setCurrentPage('create');
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    // Load the invoice and trigger download
    setViewingInvoiceId(invoiceId);
    setEditingInvoiceId(null);
    setCurrentPage('create');
    // The InvoiceForm will handle the download automatically when in view mode
  };

  const handleNewInvoice = () => {
    setEditingInvoiceId(null);
    setViewingInvoiceId(null);
    setCurrentPage('create');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" dir="rtl">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-l border-slate-200 flex flex-col z-20 shrink-0 transition-all duration-300">
        {/* Branding */}
        <div className="h-32 flex flex-col items-center justify-center border-b border-slate-200 bg-white p-4 text-center">
          <div className="bg-blue-600 p-2.5 rounded-xl mb-3 shadow-lg shadow-blue-500/20">
            <FileText size={28} className="text-white" />
          </div>
          <h1 className="text-lg font-bold leading-tight text-slate-800">
            Almatboli Fatora System
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">نظام الفواتير</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <button
            onClick={handleNewInvoice}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentPage === 'create'
              ? 'bg-blue-50 text-blue-700 shadow-sm border-r-4 border-blue-600'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <div className={`p-1.5 rounded-md transition-colors ${currentPage === 'create' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'}`}>
              <FileText size={18} />
            </div>
            <span className="font-medium">إنشاء فاتورة</span>
          </button>

          <button
            onClick={() => setCurrentPage('list')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentPage === 'list'
              ? 'bg-blue-50 text-blue-700 shadow-sm border-r-4 border-blue-600'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <div className={`p-1.5 rounded-md transition-colors ${currentPage === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'}`}>
              <List size={18} />
            </div>
            <span className="font-medium">سجل الفواتير</span>
          </button>

          <div className="border-t border-slate-200 my-4 pt-4 box-border mx-2"></div>

          <button
            onClick={() => setCurrentPage('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${currentPage === 'settings'
              ? 'bg-blue-50 text-blue-700 shadow-sm border-r-4 border-blue-600'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <div className={`p-1.5 rounded-md transition-colors ${currentPage === 'settings' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'}`}>
              <SettingsIcon size={18} />
            </div>
            <span className="font-medium">الإعدادات</span>
          </button>
        </nav>

        {/* User Info / Footer */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-200 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm">
              <span className="font-bold">A</span>
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-800">المسؤول</p>
              <p className="text-xs text-slate-500">مستخدم النظام</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 relative">
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {currentPage === 'create' && <InvoiceForm invoiceId={editingInvoiceId || viewingInvoiceId} viewMode={!!viewingInvoiceId} onSaveComplete={() => setCurrentPage('list')} />}
          {currentPage === 'list' && <InvoiceList onEditInvoice={handleEditInvoice} onViewInvoice={handleViewInvoice} onDownloadInvoice={handleDownloadInvoice} />}
          {currentPage === 'settings' && <Settings />}

          {/* Bottom spacer for fixed footers */}
          <div className="h-20"></div>
        </div>
      </main>
    </div>
  );
}

export default App;