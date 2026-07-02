import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../ui/ToastContainer';
import { useAlarmSSE } from '../../hooks/useAlarmSSE';

const titleMap: Record<string, string> = {
  '/': '대시보드',
  '/orders': '주문 관리',
  '/menus': '메뉴 관리',
  '/inventory': '재고 관리',
  '/sales': '매출 통계',
  '/users': '직원 관리',
  '/alarms': '알람',
};

export function Layout() {
  const { pathname } = useLocation();
  const title = titleMap[pathname] ?? '카페 관리';

  useAlarmSSE();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F0F2FA' }}>
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <Header title={title} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
