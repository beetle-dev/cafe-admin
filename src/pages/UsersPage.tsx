import { useEffect, useState } from 'react';
import { Plus, Search, Info } from 'lucide-react';
import { getUsers, createUser, updateUser } from '../api/auth';
import type { UserResDto, Role } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { Loading } from '../components/common/Loading';
import { useForm } from 'react-hook-form';

interface UserForm {
  email: string;
  password: string;
  name: string;
  role: Role;
  isActive: boolean;
}

const ROLES: { code: Role; name: string; level: number }[] = (
  [
    { code: 'PENDING', name: '대기', level: 1 },
    { code: 'STAFF', name: '스태프', level: 2 },
    { code: 'MANAGER', name: '점장', level: 3 },
    { code: 'ADMIN', name: '관리자', level: 4 },
  ] as { code: Role; name: string; level: number }[]
).sort((a, b) => a.level - b.level);

const roleLabel: Record<Role, string> = Object.fromEntries(ROLES.map((r) => [r.code, r.name])) as Record<Role, string>;
const roleVariant: Record<Role, 'danger' | 'warning' | 'default'> = { ADMIN: 'danger', MANAGER: 'warning', STAFF: 'default', PENDING: 'default' };

export function UsersPage() {
  const [users, setUsers] = useState<UserResDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | undefined>();
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserResDto | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<UserForm>();
  const activeValue = watch('isActive');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers({ page, size: 20, name: search || undefined, role: roleFilter });
      if (res.data) {
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const openCreate = () => {
    reset({ role: 'STAFF' });
    setEditUser(null);
    setShowCreate(true);
  };

  const openEdit = (user: UserResDto) => {
    setEditUser(user);
    setValue('email', user.email);
    setValue('name', user.name);
    setValue('role', user.roleCode);
    setValue('isActive', user.active);
    setValue('password', '');
    setShowCreate(true);
  };

  const onSubmit = async (data: UserForm) => {
    setSaving(true);
    try {
      if (editUser) {
        const payload: Partial<UserForm> = { name: data.name, role: data.role, isActive: data.isActive };
        if (data.password) payload.password = data.password;
        await updateUser(editUser.uuid, payload);
      } else {
        await createUser(data);
      }
      setShowCreate(false);
      setEditUser(null);
      fetchUsers();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message ?? '저장에 실패했습니다.');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">직원 관리</h2>
          <p className="text-sm text-gray-500 mt-0.5">직원 계정 조회 및 관리</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: '#3454D0' }}>
          <Plus size={15} /> 직원 추가
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm">
        <Info size={15} className="shrink-0" />
        해당 메뉴는 관리자, 점장만 접근할 수 있습니다.
      </div>

      {/* Filter */}
      <div className="flex gap-3 items-center">
        <div className="flex gap-1">
          {[undefined, 'ADMIN', 'MANAGER', 'STAFF'].map((r) => (
            <button key={r ?? 'ALL'} onClick={() => { setRoleFilter(r as Role | undefined); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                roleFilter === r ? 'bg-[#3454D0] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
              {r ? roleLabel[r as Role] : '전체'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              placeholder="이름 검색..."
              className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
          </div>
          <button onClick={fetchUsers} className="px-4 py-2 rounded-xl text-white text-sm" style={{ backgroundColor: '#3454D0' }}>
            검색
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        {loading ? <Loading /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left px-6 py-3 font-medium">이름</th>
                    <th className="text-left px-6 py-3 font-medium">이메일</th>
                    <th className="text-left px-6 py-3 font-medium">권한</th>
                    <th className="text-left px-6 py-3 font-medium">상태</th>
                    <th className="text-left px-6 py-3 font-medium">최근 로그인</th>
                    <th className="text-left px-6 py-3 font-medium">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">직원이 없습니다</td></tr>
                  ) : users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-3">
                        <Badge variant={roleVariant[user.roleCode]}>{user.roleName}</Badge>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={user.active ? 'success' : 'danger'}>
                          {user.active ? '활성' : '비활성'}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {user.lastLoginAt ? user.lastLoginAt.slice(0, 16).replace('T', ' ') : '-'}
                      </td>
                      <td className="px-6 py-3">
                        <button onClick={() => openEdit(user)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#3454D0] hover:text-[#3454D0] transition-colors">
                          수정
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setEditUser(null); }}
        title={editUser ? '직원 수정' : '직원 추가'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">이름 *</label>
            <input {...register('name', { required: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
            {errors.name && <p className="text-red-500 text-xs mt-1">필수 입력</p>}
          </div>

          {!editUser && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">이메일 *</label>
              <input type="email" {...register('email', { required: true })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
              {errors.email && <p className="text-red-500 text-xs mt-1">유효한 이메일 입력</p>}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              비밀번호 {editUser && <span className="text-gray-400 font-normal">(변경시만 입력)</span>}
            </label>
            <input type="password" {...register('password', { required: !editUser, minLength: 8 })}
              placeholder="8자 이상, 영문+숫자"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
            {errors.password && <p className="text-red-500 text-xs mt-1">8자 이상 영문+숫자</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">역할 *</label>
            <select {...register('role', { required: true })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]">
              {ROLES.map((r) => (
                <option key={r.code} value={r.code}>{r.name}</option>
              ))}
            </select>
          </div>

          {editUser && (
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">계정 상태</label>
              <input type="hidden" {...register('isActive')} />
              <button type="button" onClick={() => setValue('isActive', !activeValue)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  activeValue ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'
                }`}>
                <span className={`w-9 h-5 rounded-full relative transition-colors ${activeValue ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${activeValue ? 'left-[18px]' : 'left-0.5'}`} />
                </span>
                {activeValue ? '활성' : '비활성'}
              </button>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => { setShowCreate(false); setEditUser(null); }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">
              취소
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#3454D0' }}>
              {saving ? '저장중...' : '저장'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
