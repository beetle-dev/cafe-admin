import { useEffect, useState } from 'react';
import { Plus, MapPin, Phone, Clock, Search, RotateCcw } from 'lucide-react';
import { getStores, createStore, updateStore, deleteStore } from '../api/store';
import type { StoreResDto } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { Loading } from '../components/common/Loading';
import { useForm } from 'react-hook-form';

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.startsWith('02')) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

interface StoreForm {
  name: string;
  email: string;
  isActive: boolean;
  address: string;
  phone: string;
  openTime: string;
  closeTime: string;
}

interface SearchForm {
  name: string;
  address: string;
  phone: string;
  email: string;
  active: string;
}

export function StoresPage() {
  const [stores, setStores] = useState<StoreResDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editStore, setEditStore] = useState<StoreResDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchForm>({ name: '', address: '', phone: '', email: '', active: '' });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<StoreForm>();
  const { register: searchRegister, handleSubmit: handleSearch, reset: resetSearch } = useForm<SearchForm>({ defaultValues: searchParams });

  const fetchStores = async (params?: SearchForm, p = page) => {
    setLoading(true);
    try {
      const s = params ?? searchParams;
      const res = await getStores({
        page: p, size: 12,
        ...(s.name && { name: s.name }),
        ...(s.address && { address: s.address }),
        ...(s.phone && { phone: s.phone }),
        ...(s.email && { email: s.email }),
        ...(s.active !== '' && { active: s.active === 'true' }),
      });
      if (res.data) {
        setStores(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchStores(searchParams, page); }, [page]);

  const onSearch = (data: SearchForm) => {
    setSearchParams(data);
    setPage(0);
    fetchStores(data, 0);
  };

  const onReset = () => {
    const empty = { name: '', address: '', phone: '', email: '', active: '' };
    resetSearch(empty);
    setSearchParams(empty);
    setPage(0);
    fetchStores(empty, 0);
  };

  const openCreate = () => { reset({ isActive: true, openTime: '09:00', closeTime: '22:00' }); setEditStore(null); setShowForm(true); };
  const openEdit = (store: StoreResDto) => {
    setEditStore(store);
    setValue('name', store.name);
    setValue('email', store.email);
    setValue('isActive', store.active);
    setValue('address', store.address);
    setValue('phone', store.phone);
    setValue('openTime', store.openTime?.slice(0, 5));
    setValue('closeTime', store.closeTime?.slice(0, 5));
    setShowForm(true);
  };

  const onSubmit = async (data: StoreForm) => {
    setSaving(true);
    try {
      const dto = {
        name: data.name,
        email: data.email,
        active: data.isActive,
        ...(data.address && { address: data.address }),
        ...(data.phone && { phone: data.phone }),
        ...(data.openTime && { openTime: data.openTime + ':00' }),
        ...(data.closeTime && { closeTime: data.closeTime + ':00' }),
      };
      if (editStore) await updateStore(editStore.id, dto);
      else await createStore(dto);
      setShowForm(false);
      setEditStore(null);
      fetchStores();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message ?? '저장에 실패했습니다.');
    } finally { setSaving(false); }
  };

  const onDelete = async () => {
    if (!editStore) return;
    if (!window.confirm(`'${editStore.name}' 매장을 삭제하시겠습니까?`)) return;
    try {
      await deleteStore(editStore.id);
      setShowForm(false);
      setEditStore(null);
      fetchStores(searchParams, page);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message ?? '삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">매장 관리</h2>
          <p className="text-sm text-gray-500 mt-0.5">매장 정보 등록 및 수정</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: '#3454D0' }}>
          <Plus size={15} /> 매장 추가
        </button>
      </div>

      <form onSubmit={handleSearch(onSearch)} className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <input {...searchRegister('name')} placeholder="매장명" className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
          <input {...searchRegister('email')} placeholder="이메일" className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
          <input {...searchRegister('phone')} placeholder="전화번호" className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
          <input {...searchRegister('address')} placeholder="주소" className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
          <select {...searchRegister('active')} className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0] text-gray-700">
            <option value="">운영 여부 전체</option>
            <option value="true">운영중</option>
            <option value="false">운영중지</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button type="button" onClick={onReset} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
            <RotateCcw size={14} /> 초기화
          </button>
          <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm" style={{ backgroundColor: '#3454D0' }}>
            <Search size={14} /> 검색
          </button>
        </div>
      </form>

      {loading ? <Loading /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-gray-400">등록된 매장이 없습니다</div>
            ) : stores.map((store) => (
              <div key={store.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openEdit(store)}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{store.name}</h3>
                    <Badge variant={store.active ? 'success' : 'danger'} >
                      {store.active ? '운영중' : '운영중지'}
                    </Badge>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#EEF1FB]">
                    <MapPin size={18} style={{ color: '#3454D0' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone size={14} className="flex-shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={14} className="flex-shrink-0" />
                    <span>{store.openTime?.slice(0, 5)} ~ {store.closeTime?.slice(0, 5)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-sm">
            <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
          </div>
        </>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditStore(null); }}
        title={editStore ? '매장 수정' : '매장 추가'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">매장명 *</label>
            <input {...register('name', { required: '필수 입력' })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">이메일 *</label>
            <input type="email" {...register('email', { required: '필수 입력', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '올바른 이메일 형식' } })}
              placeholder="cafe@example.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="flex items-center justify-between py-1">
            <label className="text-sm font-medium text-gray-700">매장 운영 여부</label>
            <button
              type="button"
              onClick={() => setValue('isActive', !watch('isActive'))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${watch('isActive') ? 'bg-[#3454D0]' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${watch('isActive') ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">주소</label>
            <input {...register('address')}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">전화번호 <span className="text-gray-400 font-normal">(예: 02-1234-5678)</span></label>
            <input
              {...register('phone', { validate: (v) => !v || /^[0-9\-]{9,13}$/.test(v) || '올바른 전화번호 형식' })}
              onChange={(e) => setValue('phone', formatPhone(e.target.value), { shouldValidate: true })}
              placeholder="010-1234-5678"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">오픈 시간</label>
              <input type="time" {...register('openTime')}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">마감 시간</label>
              <input type="time" {...register('closeTime')}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            {editStore && (
              <button type="button" onClick={onDelete}
                className="py-2.5 px-4 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50">
                삭제
              </button>
            )}
            <button type="button" onClick={() => { setShowForm(false); setEditStore(null); }}
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
