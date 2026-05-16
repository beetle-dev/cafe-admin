import { Bell, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { StoreSelector } from '../common/StoreSelector';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user, clear } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); } catch {}
    clear();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#3454D0] flex items-center justify-between px-6 shadow-md">
      <h1 className="text-white font-semibold text-lg">{title}</h1>
      <div className="flex items-center gap-3">
        <StoreSelector />
        <button className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          <Bell size={18} className="text-white" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
        </button>
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
          <User size={15} className="text-white/70" />
          <span className="text-white text-sm font-medium">{user?.name ?? '관리자'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm"
        >
          <LogOut size={15} />
          로그아웃
        </button>
      </div>
    </header>
  );
}
