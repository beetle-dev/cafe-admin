import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { signup } from '../api/auth';
import { Coffee, Eye, EyeOff } from 'lucide-react';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    try {
      await signup({ email: data.email, password: data.password, name: data.name });
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? '회원가입에 실패했습니다.');
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
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #3454D0 0%, transparent 60%)' }} />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#3454D0' }}>
            <Coffee size={40} />
          </div>
          <h1 className="text-4xl font-bold mb-4">카페 운영관리</h1>
          <p className="text-white/60 text-lg leading-relaxed">
            계정을 생성하고<br />카페 운영을 시작하세요
          </p>
          <p className="mt-8 text-white/40 text-sm">
            가입 후 관리자 승인이 필요할 수 있습니다
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">회원가입</h2>
              <p className="text-gray-500 mt-1 text-sm">새 계정을 만들어 시작하세요</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">이름</label>
                <input
                  placeholder="홍길동"
                  {...register('name', { required: '이름을 입력해주세요' })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0] focus:ring-2 focus:ring-[#3454D0]/20 transition-all"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일</label>
                <input
                  type="email"
                  placeholder="email@cafe.com"
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
                    placeholder="8자 이상, 영문+숫자"
                    {...register('password', {
                      required: '비밀번호를 입력해주세요',
                      minLength: { value: 8, message: '8자 이상 입력해주세요' },
                      pattern: { value: /^(?=.*[A-Za-z])(?=.*\d)/, message: '영문과 숫자를 모두 포함해야 합니다' },
                    })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0] focus:ring-2 focus:ring-[#3454D0]/20 transition-all pr-11"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">비밀번호 확인</label>
                <input
                  type="password"
                  placeholder="비밀번호 재입력"
                  {...register('passwordConfirm', {
                    required: '비밀번호 확인을 입력해주세요',
                    validate: (v) => v === watch('password') || '비밀번호가 일치하지 않습니다',
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0] focus:ring-2 focus:ring-[#3454D0]/20 transition-all"
                />
                {errors.passwordConfirm && <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm.message}</p>}
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
                {loading ? '처리중...' : '회원가입'}
              </button>

              <p className="text-center text-sm text-gray-500">
                이미 계정이 있으신가요?{' '}
                <Link to="/login" className="font-medium" style={{ color: '#3454D0' }}>
                  로그인
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
