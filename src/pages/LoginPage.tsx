import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login, getMe } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Coffee, Eye, EyeOff } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setToken, setUser } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    try {
      const res = await login(data.email, data.password);
      if (res.code === 'SUCCESS' && res.data) {
        setToken(res.data);
        try {
          const me = await getMe();
          if (me.data) setUser(me.data);
        } catch {}
        navigate('/');
      } else {
        setError(res.message ?? '로그인에 실패했습니다.');
      }
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 403) {
        alert('비활성화된 계정입니다.');
      } else {
        setError(err.response?.data?.message ?? '이메일 또는 비밀번호를 확인해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F0F2FA' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 text-white relative overflow-hidden"
        style={{ backgroundColor: '#1E2D6E' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #3454D0 0%, transparent 60%)' }} />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#3454D0' }}>
            <Coffee size={40} />
          </div>
          <h1 className="text-4xl font-bold mb-4">카페 운영관리</h1>
          <p className="text-white/60 text-lg leading-relaxed">
            매장 운영의 모든 것을<br />한 곳에서 관리하세요
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {['주문 관리', '재고 현황', '매출 분석', '메뉴 관리'].map((item) => (
              <div key={item} className="bg-white/10 rounded-xl p-4">
                <p className="text-white font-medium text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">로그인</h2>
              <p className="text-gray-500 mt-1 text-sm">관리자 계정으로 로그인하세요</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
                <input
                  type="email"
                  placeholder="admin@cafe.com"
                  {...register('email', { required: '이메일을 입력해주세요' })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0] focus:ring-2 focus:ring-[#3454D0]/20 transition-all"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', { required: '비밀번호를 입력해주세요' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0] focus:ring-2 focus:ring-[#3454D0]/20 transition-all pr-11"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-medium text-sm transition-all disabled:opacity-60"
                style={{ backgroundColor: '#3454D0' }}
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 shrink-0">또는</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => onSubmit({ email: 'test@test.com', password: 'testtest123!' })}
                  className="flex-1 py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-60 border-2 border-dashed"
                  style={{ borderColor: '#3454D0', color: '#3454D0', backgroundColor: '#3454D010' }}
                >
                  {loading ? '로그인 중...' : '👀 관리자 데모'}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => onSubmit({ email: 'staff@test.com', password: 'testtest123!' })}
                  className="flex-1 py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-60 border-2 border-dashed"
                  style={{ borderColor: '#3454D0', color: '#3454D0', backgroundColor: '#3454D010' }}
                >
                  {loading ? '로그인 중...' : '🙋 스태프 데모'}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500">
                계정이 없으신가요?{' '}
                <Link to="/register" className="font-medium" style={{ color: '#3454D0' }}>
                  회원가입
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
