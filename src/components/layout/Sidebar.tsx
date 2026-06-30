import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, UtensilsCrossed, Package,
  BarChart2, Users, Store, Bell, Coffee
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '대시보드' },
  { to: '/orders', icon: ShoppingCart, label: '주문 관리' },
  { to: '/menus', icon: UtensilsCrossed, label: '메뉴 관리' },
  { to: '/inventory', icon: Package, label: '재고 관리' },
  { to: '/sales', icon: BarChart2, label: '매출 통계' },
  { to: '/users', icon: Users, label: '직원 관리', managerUp: true },
  { to: '/stores', icon: Store, label: '매장 관리', adminOnly: true },
  { to: '/alarms', icon: Bell, label: '알람' },
];

export function Sidebar() {
  const { user } = useAuthStore();
  const visibleNavItems = navItems.filter(item => {
    if (item.adminOnly) return user?.roleCode === 'ADMIN';
    if (item.managerUp) return user?.roleCode === 'ADMIN' || user?.roleCode === 'MANAGER';
    return true;
  });

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col" style={{ backgroundColor: '#1E2D6E' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#3454D0' }}>
          <Coffee size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">카페 관리</p>
          <p className="text-white/40 text-xs">Admin Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {visibleNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl mb-1 text-sm transition-all ${
                isActive
                  ? 'bg-[#3454D0] text-white font-medium'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-white/30 text-xs text-center">© 2026 Cafe Admin</p>
      </div>
    </aside>
  );
}
