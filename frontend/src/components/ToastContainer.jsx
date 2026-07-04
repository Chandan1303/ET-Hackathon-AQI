import { CheckCircle, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertOctagon,
  info: Info,
};

const STYLES = {
  success: 'border-green-500 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-200',
  warning: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200',
  error: 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200',
  info: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200',
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none print:hidden">
      {toasts.map(toast => {
        const Icon = ICONS[toast.type] || Info;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-xl backdrop-blur-sm animate-slide-in ${STYLES[toast.type] || STYLES.info}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
