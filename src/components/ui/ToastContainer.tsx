import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useToastStore, type Toast } from '../../store/toastStore';

const config = {
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />,
    title: 'text-red-800',
    message: 'text-red-600',
    bar: 'bg-red-400',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: <AlertCircle size={18} className="text-yellow-500 shrink-0 mt-0.5" />,
    title: 'text-yellow-800',
    message: 'text-yellow-600',
    bar: 'bg-yellow-400',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />,
    title: 'text-blue-800',
    message: 'text-blue-600',
    bar: 'bg-blue-400',
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const c = config[toast.type];

  return (
    <div
      className={`relative flex gap-3 w-80 rounded-2xl border shadow-lg p-4 pr-9 overflow-hidden ${c.bg} ${c.border} animate-slide-in`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${c.bar}`} />
      {c.icon}
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${c.title}`}>{toast.title}</p>
        <p className={`text-xs mt-0.5 break-words ${c.message}`}>{toast.message}</p>
      </div>
      <button
        onClick={() => remove(toast.id)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
