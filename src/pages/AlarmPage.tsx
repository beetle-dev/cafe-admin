import { Bell, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

// UI-only placeholder page - alarm API not yet implemented
const mockAlarms = [
  { id: 1, type: 'danger', icon: AlertTriangle, title: '재고 부족', message: '에스프레소 원두 재고가 최소 수량 미만입니다.', time: '10분 전', handled: false },
  { id: 2, type: 'warning', icon: AlertCircle, title: '주문 처리 지연', message: '5건의 주문이 30분 이상 처리되지 않았습니다.', time: '23분 전', handled: false },
  { id: 3, type: 'info', icon: Info, title: '일일 매출 목표 달성', message: '오늘 매출이 목표의 80%를 달성했습니다.', time: '1시간 전', handled: true },
  { id: 4, type: 'danger', icon: AlertTriangle, title: '재고 부족', message: '우유 재고가 최소 수량 미만입니다.', time: '2시간 전', handled: false },
  { id: 5, type: 'info', icon: Info, title: '시스템 점검 예정', message: '내일 새벽 2시~4시 시스템 점검이 예정되어 있습니다.', time: '3시간 전', handled: true },
];

const typeStyle = {
  danger: { bg: 'bg-red-50', border: 'border-red-100', icon: 'text-red-500', badge: 'bg-red-100 text-red-700' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-100', icon: 'text-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
  info: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
};

export function AlarmPage() {
  const active = mockAlarms.filter((a) => !a.handled);
  const handled = mockAlarms.filter((a) => a.handled);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">알람</h2>
          <p className="text-sm text-gray-500 mt-0.5">시스템 알람 및 경고 목록</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
          <AlertTriangle size={14} className="text-yellow-600" />
          <span className="text-sm text-yellow-700 font-medium">알람 API 미구현 — 디자인 미리보기</span>
        </div>
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
              <p className="text-2xl font-bold text-gray-900">{mockAlarms.length}건</p>
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
          {active.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle size={32} className="mx-auto mb-2 text-green-300" />
              <p className="text-sm">미처리 알람이 없습니다</p>
            </div>
          ) : active.map((alarm) => {
            const style = typeStyle[alarm.type as keyof typeof typeStyle];
            const Icon = alarm.icon;
            return (
              <div key={alarm.id}
                className={`flex items-start gap-4 p-4 rounded-xl border ${style.bg} ${style.border}`}>
                <Icon size={18} className={`mt-0.5 flex-shrink-0 ${style.icon}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm">{alarm.title}</p>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${style.badge}`}>
                      {alarm.type === 'danger' ? '긴급' : alarm.type === 'warning' ? '경고' : '정보'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{alarm.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{alarm.time}</p>
                </div>
                <button className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-700 hover:border-[#3454D0] hover:text-[#3454D0] transition-colors">
                  처리
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Handled alarms */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm text-gray-500">처리 완료</h3>
        </div>
        <div className="p-4 space-y-2">
          {handled.map((alarm) => {
            const Icon = alarm.icon;
            return (
              <div key={alarm.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 opacity-60">
                <Icon size={16} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 line-through">{alarm.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{alarm.message}</p>
                </div>
                <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
