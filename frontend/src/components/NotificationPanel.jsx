import { Bell, X, AlertOctagon, Info, CheckCircle, Clock } from 'lucide-react';

const TYPE_ICONS = {
  alert: AlertOctagon,
  info: Info,
  success: CheckCircle,
};

export default function NotificationPanel({ open, onClose, notifications, incidents, onNavigate }) {
  if (!open) return null;

  const items = [
    ...incidents.filter(i => i.status === 'Active').map(inc => ({
      id: inc.id,
      type: 'alert',
      title: inc.type,
      message: inc.description,
      time: inc.timestamp,
    })),
    ...(notifications || []).map((n, i) => ({
      id: n.id || `notif-${i}`,
      type: n.type || 'info',
      title: n.title || 'System Notification',
      message: n.message || n.text || '',
      time: n.timestamp || n.time,
    })),
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[500] print:hidden" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-[501] flex flex-col print:hidden animate-slide-in-right">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Notifications</h3>
              <p className="text-xs text-gray-500">{items.length} active alerts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
              <p className="font-semibold">All clear</p>
              <p className="text-xs mt-1">No active notifications</p>
            </div>
          ) : (
            items.map(item => {
              const Icon = TYPE_ICONS[item.type] || Info;
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate?.('rca'); onClose(); }}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'alert' ? 'bg-red-50 dark:bg-red-950/40 text-red-600' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition">{item.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{item.message}</p>
                      {item.time && (
                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.time).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
