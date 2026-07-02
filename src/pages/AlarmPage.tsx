import { useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useAlarmStore } from '../store/alarmStore';
import { type AlarmDto } from '../api/alarm';

const TYPE_META: Record<AlarmDto['type'], { label: string; icon: typeof AlertTriangle; badge: string; icon_: string; bg: string; needsResolve: boolean }> = {
  ORDER_CREATED:            { label: '새 주문', icon: Info,          badge: 'bg-blue-100 text-blue-700',     icon_: 'text-blue-500',   bg: 'bg-blue-50 border-blue-100',     needsResolve: false },
  INVENTORY_LOW:            { label: '재고 경고', icon: AlertTriangle, badge: 'bg-orange-100 text-orange-700', icon_: 'text-orange-500', bg: 'bg-orange-50 border-orange-100', needsResolve: true },
  INVENTORY_NEAR_DEPLETION: { label: '재고 주의', icon: AlertCircle,  badge: 'bg-yellow-100 text-yellow-700', icon_: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-100', needsResolve: true },
};

function timeAgo(isoStr: string) {
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export function AlarmPage() {
  const { alarms, loading, fetch, resolve } = useAlarmStore();

  useEffect(() => { fetch(); }, [fetch]);

  const active = alarms.filter((a) => !a.resolved && TYPE_META[a.type]?.needsResolve);
  const notifications = alarms.filter((a) => !TYPE_META[a.type]?.needsResolve);
  const handled = alarms.filter((a) => a.resolved && TYPE_META[a.type]?.needsResolve);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">알람</h2>
        <p className="text-sm text-gray-500 mt-0.5">시스템 알람 및 경고 목록</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <Bell size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">미처리 알람</p>
              <p className="text-2xl font-bold text-gray-900">{active.length}건</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle size={18} className="text-green-500" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">처리 완료</p>
              <p className="text-2xl font-bold text-gray-900">{handled.length}건</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#EEF1FB] rounded-xl flex items-center justify-center">
              <Bell size={18} style={{ color: '#3454D0' }} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">전체 알람</p>
              <p className="text-2xl font-bold text-gray-900">{alarms.length}건</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active alarms */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">미처리 알람</h3>
        </div>
        <div className="p-4 space-y-3">
          {loading && alarms.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">불러오는 중...</div>
          ) : active.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-300" />
              <p className="text-sm">미처리 알람이 없습니다</p>
            </div>
          ) : active.map((alarm) => {
            const meta = TYPE_META[alarm.type] ?? TYPE_META.ORDER_CREATED;
            const Icon = meta.icon;
            return (
              <div key={alarm.id} className={`flex items-start gap-4 p-4 rounded-xl border ${meta.bg}`}>
                <Icon size={18} className={`mt-0.5 flex-shrink-0 ${meta.icon_}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${meta.badge}`}>{meta.label}</span>
                  </div>
                  <p className="text-sm text-gray-700">{alarm.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(alarm.occurredAt)}</p>
                </div>
                {meta.needsResolve && (
                  <button
                    onClick={() => resolve(alarm.id)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-700 hover:border-[#3454D0] hover:text-[#3454D0] transition-colors"
                  >
                    처리
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">주문 알림</h3>
          </div>
          <div className="p-4 space-y-2">
            {notifications.map((alarm) => {
              const meta = TYPE_META[alarm.type] ?? TYPE_META.ORDER_CREATED;
              const Icon = meta.icon;
              return (
                <div key={alarm.id} className={`flex items-start gap-4 p-4 rounded-xl border ${meta.bg}`}>
                  <Icon size={18} className={`mt-0.5 flex-shrink-0 ${meta.icon_}`} />
                  <div className="flex-1 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${meta.badge}`}>{meta.label}</span>
                    <p className="text-sm text-gray-700 mt-1">{alarm.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(alarm.occurredAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Handled alarms */}
      {handled.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-500">처리 완료</h3>
          </div>
          <div className="p-4 space-y-2">
            {handled.map((alarm) => {
              const meta = TYPE_META[alarm.type] ?? TYPE_META.ORDER_CREATED;
              const Icon = meta.icon;
              return (
                <div key={alarm.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 opacity-60">
                  <Icon size={16} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">{alarm.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(alarm.occurredAt)}</p>
                  </div>
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
