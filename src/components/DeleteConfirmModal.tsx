import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { ServiceItem } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  service: ServiceItem | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  service,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-rose-900/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Usuwanie panelu usługi</h3>
            <p className="text-xs text-rose-300 font-medium">Czy na pewno chcesz usunąć tę usługę?</p>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 mb-5 space-y-1 text-xs">
          <div className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>{service.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 uppercase font-mono">
              {service.type}
            </span>
          </div>
          <div className="text-slate-400 font-mono">
            Adres: <span className="text-slate-300">{service.ip}:{service.port}</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          Usługa zostanie usunięta z pulpitu monitorowania. Tej operacji nie można cofnąć, ale będzie można dodać ją ponownie.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(service.id);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Tak, usuń panel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
