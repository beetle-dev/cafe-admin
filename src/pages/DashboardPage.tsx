import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { ShoppingCart, TrendingUp, Package, Bell, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getOrders } from '../api/order';
import { getInventory } from '../api/inventory';
import { useAuthStore } from '../store/authStore';
import type { OrderResDto, StoreInventoryResDto } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const PRIMARY = '#3454D0';
const PRIMARY_LIGHT = '#4D6BE8';

function KpiCard({
  title, value, sub, icon: Icon, color, trend
}: {
  title: string; value: string; sub?: string;
  icon: React.ElementType; color: string; trend?: number;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export function DashboardPage() {
  const { selectedStoreId } = useAuthStore();
  const [monthOrders, setMonthOrders] = useState<OrderResDto[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderResDto[]>([]);
  const [inventory, setInventory] = useState<StoreInventoryResDto[]>([]);

  useEffect(() => {
    if (!selectedStoreId) return;
    getOrders(selectedStoreId, { size: 2000, sort: 'createdAt', direction: 'DESC' })
      .then((r) => r.data && setMonthOrders(r.data.content)).catch(() => {});
    getOrders(selectedStoreId, { size: 5, sort: 'createdAt', direction: 'DESC' })
      .then((r) => r.data && setRecentOrders(r.data.content)).catch(() => {});
    getInventory(selectedStoreId, { size: 100 })
      .then((r) => r.data && setInventory(r.data.content)).catch(() => {});
  }, [selectedStoreId]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const monthStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  const completedOrders = monthOrders.filter((o) => o.status === 'COMPLETED');
  const thisMonthOrders = completedOrders.filter((o) => o.createdAt?.startsWith(monthStr));
  const todayOrders = completedOrders.filter((o) => o.createdAt?.startsWith(todayStr));

  const totalMonthlySales = thisMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = thisMonthOrders.length;
  const todayTotalSales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockCount = inventory.filter((i) => i.isLow).length;

  // 일별 매출 (최근 14일)
  const dailyMap = new Map<string, number>();
  thisMonthOrders.forEach((o) => {
    const date = o.createdAt?.slice(0, 10) ?? '';
    dailyMap.set(date, (dailyMap.get(date) ?? 0) + o.totalAmount);
  });
  const sortedDays = [...dailyMap.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-14);

  // 시간별 매출 (오늘)
  const hourlyMap = new Map<string, number>();
  todayOrders.forEach((o) => {
    const hour = o.createdAt?.slice(11, 13) ?? '';
    hourlyMap.set(hour, (hourlyMap.get(hour) ?? 0) + o.totalAmount);
  });
  const sortedHours = [...hourlyMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  // 결제 수단별 (오늘)
  const todayCard = todayOrders.filter((o) => o.paymentMethod === 'CARD').reduce((s, o) => s + o.totalAmount, 0);
  const todayCash = todayOrders.filter((o) => o.paymentMethod === 'CASH').reduce((s, o) => s + o.totalAmount, 0);
  const todayApp = todayOrders.filter((o) => o.paymentMethod === 'APP').reduce((s, o) => s + o.totalAmount, 0);

  const barData = {
    labels: sortedDays.map(([date]) => date.slice(5)),
    datasets: [{
      label: '일별 매출',
      data: sortedDays.map(([, sales]) => sales),
      backgroundColor: PRIMARY + '90',
      borderColor: PRIMARY,
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const lineData = {
    labels: sortedHours.map(([hour]) => hour + '시'),
    datasets: [{
      label: '시간별 매출',
      data: sortedHours.map(([, sales]) => sales),
      borderColor: PRIMARY_LIGHT,
      backgroundColor: PRIMARY + '20',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: PRIMARY,
    }],
  };

  const paymentData = (todayCard || todayCash || todayApp) ? {
    labels: ['카드', '현금', '앱'],
    datasets: [{
      data: [todayCard, todayCash, todayApp],
      backgroundColor: [PRIMARY, '#6B8EFF', '#A5B8FF'],
      borderWidth: 0,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { grid: { color: '#f0f0f0' } }, x: { grid: { display: false } } },
  };

  const formatMoney = (n: number) => n.toLocaleString('ko-KR') + '원';

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-yellow-100 text-yellow-700',
    };
    const label: Record<string, string> = { COMPLETED: '완료', CANCELLED: '취소', REFUNDED: '환불' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? ''}`}>{label[status] ?? status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          title="이번달 매출" value={formatMoney(totalMonthlySales)}
          icon={TrendingUp} color={PRIMARY} sub={`오늘 ${formatMoney(todayTotalSales)}`}
        />
        <KpiCard
          title="이번달 주문" value={`${totalOrders}건`}
          icon={ShoppingCart} color="#10B981" sub={`오늘 ${todayOrders.length}건`}
        />
        <KpiCard
          title="재고 부족" value={`${lowStockCount}개`}
          icon={Package} color={lowStockCount > 0 ? '#EF4444' : '#10B981'}
          sub="최소 재고 미만 항목"
        />
        <KpiCard
          title="알람" value="0건" icon={Bell} color="#F59E0B"
          sub="처리 대기 알람 (미구현)" trend={0}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">일별 매출 (최근 14일)</h3>
          </div>
          {sortedDays.length > 0 ? (
            <Bar data={barData} options={chartOptions} height={100} />
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              데이터가 없습니다
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">결제 수단별 (오늘)</h3>
          {paymentData && (todaySales?.cardSales || todaySales?.cashSales) ? (
            <div>
              <Doughnut data={paymentData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '65%' }} />
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              오늘 데이터 없음
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">시간별 매출 (오늘)</h3>
          {sortedHours.length > 0 ? (
            <Line data={lineData} options={chartOptions} height={80} />
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              데이터가 없습니다
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">재고 부족 항목</h3>
          <div className="space-y-2 overflow-y-auto max-h-48">
            {inventory.filter((i) => i.isLow).length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">부족 항목 없음</p>
            ) : inventory.filter((i) => i.isLow).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.ingredientName}</p>
                  <p className="text-xs text-gray-500">{item.currentStock} / {item.minStock} {item.ingredientUnit}</p>
                </div>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">부족</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">최근 주문</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium">주문번호</th>
                <th className="text-left px-6 py-3 font-medium">금액</th>
                <th className="text-left px-6 py-3 font-medium">결제수단</th>
                <th className="text-left px-6 py-3 font-medium">상태</th>
                <th className="text-left px-6 py-3 font-medium">시간</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">주문이 없습니다</td></tr>
              ) : recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-mono text-gray-900">{order.orderNumber}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{formatMoney(order.totalAmount)}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {{ CARD: '카드', CASH: '현금', APP: '앱' }[order.paymentMethod]}
                  </td>
                  <td className="px-6 py-3">{statusBadge(order.status)}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{order.createdAt?.slice(0, 16).replace('T', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
