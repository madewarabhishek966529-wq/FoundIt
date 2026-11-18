import React from 'react';
import { X, QrCode, Printer, ExternalLink, ShieldCheck } from 'lucide-react';

export const ItemQRCodeModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const itemUrl = `${window.location.origin}/items/${item._id || item.id}`;
  // Use high-reliability public QR generator API or SVG rendering for crisp printing
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    itemUrl
  )}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:bg-white print:p-0">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 text-center space-y-5 print:shadow-none print:border-none print:p-0">
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Security Desk Custody Tag</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Tag Card */}
        <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 space-y-3 print:bg-white print:border-solid print:border-black">
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-4 h-4" />
            <span>CAMPUS SECURITY DESK</span>
          </div>

          <div className="flex justify-center p-2 bg-white rounded-xl shadow-inner">
            <img
              src={qrApiUrl}
              alt="Item QR Tag"
              className="w-44 h-44 object-contain"
            />
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 truncate">
              {item.title}
            </h4>
            <p className="text-[11px] text-slate-500 capitalize">
              {item.category} • Found in {item.zone}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              ID: {(item._id || item.id).slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Physical Tag</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
