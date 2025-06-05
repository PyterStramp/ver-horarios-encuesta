// src/components/common/ConfirmationModal.tsx
'use client';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`mr-3 text-2xl ${danger ? 'text-red-500' : 'text-blue-500'}`}>
              {danger ? '⚠️' : 'ℹ️'}
            </div>
            <h2 className="text-lg font-bold text-gray-800">
              {title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg transition-colors text-white ${
              danger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
