import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { getDailySales, getHourlySales } from '../api/sales';
import { useAuthStore } from '../store/authStore';
import type { SalesStatsDailyResDto, SalesStatsHourlyResDto } from '../types';
import { Loading } from '../components/common/Loading';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const PRIMARY = '#3454D0';

export function SalesPage() {
  const { selectedStoreId } = useAuthStore();
  const [dailySales, setDailySales] = useState<SalesStatsDailyResDto[]>([]);
  const [hourlySales, setHourlySales] = useState<SalesStatsHourlyResDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'daily' | 'hourly'>('daily');

  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      from: from.toISOString().slice(0, 10),
      to: now.toISOString().slice(0, 10),
    };
  });

  const fetchSales = async () => {
    if (!selectedStoreId) return;
    setLoading(true);
    try {
      const params = {
        from: dateRange.from + 'T00:00:00',
        to: dateRange.to + 'T23:59:59',
        size: 100,
      };
      const [daily, hourly] = await Promise.allSettled([
        getDailySales(selectedStoreId, params),
        getHourlySales(selectedStoreId, params),
      ]);
      if (daily.status === 'fulfilled' && daily.value.data)
        setDailySales([...daily.value.data.content].reverse());
      if (hourly.status === 'fulfilled' && hourly.value.data)
        setHourlySales([...hourly.value.data.content].sort((a, b) => a.statHour.localeCompare(b.statHour)));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSales(); }, [selectedStoreId]);

  const totalSales = dailySales.reduce((sum, d) => sum + d.totalSales, 0);
  const totalOrders = dailySales.reduce((sum, d) => sum + d.orderCount, 0);
  const avgOrder = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const peakDay = dailySales.reduce((max, d) => d.totalSales > (max?.totalSales ?? 0) ? d : max, dailySales[0]);

  const barData = {
    labels: dailySales.map((d) => d.statDate.slice(5)),
    datasets: [
      {
        label: '카드',
        data: dailySales.map((d) => d.cardSales),
        backgroundColor: PRIMARY,
        borderRadius: 4,
        stack: 'sales',
      },
      {
        label: '현금',
        data: dailySales.map((d) => d.cashSales),
        backgroundColor: '#6B8EFF',
        borderRadius: 4,
        stack: 'sales',
      },
      {
        label: '앱',
        data: dailySales.map((d) => d.appSales ?? 0),
        backgroundColor: '#A5B8FF',
        borderRadius: 4,
        stack: 'sales',
      },
    ],
  };

  const lineData = {
    labels: hourlySales.map((h) => h.statHour.slice(11, 13) + '시'),
    datasets: [
      {
        label: '총 매출',
        data: hourlySales.map((h) => h.totalSales),
        borderColor: PRIMARY,
        backgroundColor: PRIMARY + '20',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: PRIMARY,
      },
      {
        label: '카드',
        data: hourlySales.map((h) => h.cardSales),
        borderColor: '#6B8EFF',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: '#6B8EFF',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' as const } },
    scales: { y: { grid: { color: '#f0f0f0' }, ticks: { callback: (v: unknown) => (Number(v) / 1000).toFixed(0) + 'k' } }, x: { grid: { display: false } } },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">매출 통계</h2>
          <p className="text-sm text-gray-500 mt-0.5">일별/시간별 매출 분석</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-sm">
          <input type="date" value={dateRange.from} onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#3454D0]" />
          <span className="text-gray-400">~</span>
          <input type="date" value={dateRange.to} onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#3454D0]" />
          <button onClick={fetchSales}
            className="px-3 py-1.5 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: '#3454D0' }}>
            조회
          </button>
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '총 매출', value: totalSales.toLocaleString() + '원' },
          { label: '총 주문', value: totalOrders.toLocaleString() + '건' },
          { label: '평균 객단가', value: avgOrder.toLocaleString() + '원' },
          { label: '최고 매출일', value: peakDay ? peakDay.statDate.slice(5) : '-' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm mb-2">{item.label}</p>
            <p className="text-xl font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm w-fit">
        {(['daily', 'hourly'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-[#3454D0] text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}>
            {t === 'daily' ? '일별 매출' : '시간별 매출'}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : (
        <>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            {tab === 'daily' ? (
              <>
                <h3 className="font-semibold text-gray-900 mb-4">일별 매출 (결제수단별)</h3>
                {dailySales.length > 0 ? (
                  <Bar data={barData} options={chartOptions} height={80} />
                ) : <p className="text-center py-12 text-gray-400">데이터가 없습니다</p>}
              </>
            ) : (
              <>
                <h3 className="font-semibold text-gray-900 mb-4">시간별 매출 추이</h3>
                {hourlySales.length > 0 ? (
                  <Line data={lineData} options={chartOptions} height={80} />
                ) : <p className="text-center py-12 text-gray-400">데이터가 없습니다</p>}
              </>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{tab === 'daily' ? '일별' : '시간별'} 상세</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    {tab === 'daily' ? (
                      <>
                        <th className="text-left px-6 py-3 font-medium">날짜</th>
                        <th className="text-left px-6 py-3 font-medium">주문수</th>
                        <th className="text-left px-6 py-3 font-medium">총 매출</th>
                        <th className="text-left px-6 py-3 font-medium">카드</th>
                        <th className="text-left px-6 py-3 font-medium">현금</th>
                        <th className="text-left px-6 py-3 font-medium">평균 객단가</th>
                        <th className="text-left px-6 py-3 font-medium">피크타임</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left px-6 py-3 font-medium">시간</th>
                        <th className="text-left px-6 py-3 font-medium">주문수</th>
                        <th className="text-left px-6 py-3 font-medium">총 매출</th>
                        <th className="text-left px-6 py-3 font-medium">카드</th>
                        <th className="text-left px-6 py-3 font-medium">현금</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tab === 'daily' ? dailySales.map((d) => (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{d.statDate}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{d.orderCount}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">{d.totalSales.toLocaleString()}원</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{d.cardSales.toLocaleString()}원</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{d.cashSales.toLocaleString()}원</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{d.avgOrderPrice?.toLocaleString()}원</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{d.peakHour != null ? `${d.peakHour}시` : '-'}</td>
                    </tr>
                  )) : hourlySales.map((h) => (
                    <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{h.statHour?.slice(0, 16).replace('T', ' ')}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{h.orderCount}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">{h.totalSales.toLocaleString()}원</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{h.cardSales.toLocaleString()}원</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{h.cashSales.toLocaleString()}원</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
