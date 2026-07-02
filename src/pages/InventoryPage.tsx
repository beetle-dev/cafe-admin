import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Search, RotateCcw, Info } from 'lucide-react';
import { getInventory, adjustInventory, getInventoryLogs } from '../api/inventory';
import type { StoreInventoryResDto, InventoryLogResDto } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { Loading } from '../components/common/Loading';
import { useForm } from 'react-hook-form';

const comma = (n: number) => n?.toLocaleString('ko-KR') ?? '-';

interface AdjustForm {
  ingredientId: number;
  quantity: number;
  changeType: 'IN' | 'OUT' | 'ADJUST';
  note: string;
}

interface InvSearchForm { ingredientName: string; isLow: string; }
interface LogSearchForm { ingredientName: string; changeType: string; }

const changeTypeMap = { IN: '입고', OUT: '출고', ADJUST: '조정' };
const changeTypeBadge = { IN: 'success', OUT: 'danger', ADJUST: 'info' } as const;

export function InventoryPage() {
  const [inventory, setInventory] = useState<StoreInventoryResDto[]>([]);
  const [logs, setLogs] = useState<InventoryLogResDto[]>([]);
  const [page, setPage] = useState(0);
  const [logPage, setLogPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [logTotalPages, setLogTotalPages] = useState(0);
  const [logTotalElements, setLogTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StoreInventoryResDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'logs'>('inventory');
  const [invSearch, setInvSearch] = useState<InvSearchForm>({ ingredientName: '', isLow: '' });
  const [logSearch, setLogSearch] = useState<LogSearchForm>({ ingredientName: '', changeType: '' });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AdjustForm>();
  const { register: invReg, handleSubmit: handleInvSearch, reset: resetInvSearch } = useForm<InvSearchForm>({ defaultValues: invSearch });
  const { register: logReg, handleSubmit: handleLogSearch, reset: resetLogSearch } = useForm<LogSearchForm>({ defaultValues: logSearch });

  const fetchInventory = async (s = invSearch, p = page) => {
    setLoading(true);
    try {
      const res = await getInventory({
        page: p, size: 20,
        ...(s.ingredientName && { ingredientName: s.ingredientName }),
        ...(s.isLow !== '' && { low: s.isLow === 'true' }),
      });
      if (res.data) {
        setInventory(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } finally { setLoading(false); }
  };

  const fetchLogs = async (s = logSearch, p = logPage) => {
    const res = await getInventoryLogs({
      page: p, size: 20, sort: 'createdAt', direction: 'DESC',
      ...(s.ingredientName && { ingredientName: s.ingredientName }),
      ...(s.changeType && { changeType: s.changeType }),
    }).catch(() => null);
    if (res?.data) {
      setLogs(res.data.content);
      setLogTotalPages(res.data.totalPages);
      setLogTotalElements(res.data.totalElements);
    }
  };

  useEffect(() => { fetchInventory(invSearch, page); }, [page]);
  useEffect(() => { if (activeTab === 'logs') fetchLogs(logSearch, logPage); }, [logPage, activeTab]);

  const onInvSearch = (data: InvSearchForm) => { setInvSearch(data); setPage(0); fetchInventory(data, 0); };
  const onInvReset = () => { const e = { ingredientName: '', isLow: '' }; resetInvSearch(e); setInvSearch(e); setPage(0); fetchInventory(e, 0); };
  const onLogSearch = (data: LogSearchForm) => { setLogSearch(data); setLogPage(0); fetchLogs(data, 0); };
  const onLogReset = () => { const e = { ingredientName: '', changeType: '' }; resetLogSearch(e); setLogSearch(e); setLogPage(0); fetchLogs(e, 0); };

  const openAdjust = (item: StoreInventoryResDto) => {
    setSelectedItem(item);
    setValue('ingredientId', item.ingredientId);
    setValue('changeType', 'IN');
    reset({ ingredientId: item.ingredientId, changeType: 'IN', quantity: 0, note: '' });
    setShowAdjust(true);
  };

  const onSubmit = async (data: AdjustForm) => {
    setSaving(true);
    try {
      await adjustInventory({
        ingredientId: data.ingredientId,
        quantity: Number(data.quantity),
        changeType: data.changeType,
        note: data.note,
      });
      setShowAdjust(false);
      fetchInventory();
      if (activeTab === 'logs') fetchLogs();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message ?? '조정에 실패했습니다.');
    } finally { setSaving(false); }
  };

  const lowStockItems = inventory.filter((i) => i.isLow);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">재고 관리</h2>
          <p className="text-sm text-gray-500 mt-0.5">재고 현황 및 입출고 관리</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm">
        <Info size={15} className="shrink-0" />
        재고가 최소 수량 미만이 되면 알림 및 이메일이 전송됩니다.
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">재고 부족 경고</p>
            <p className="text-sm text-red-600 mt-0.5">
              {lowStockItems.map((i) => i.ingredientName).join(', ')} — 최소 재고 미만
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm w-fit">
        {(['inventory', 'logs'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-[#3454D0] text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}>
            {tab === 'inventory' ? '재고 현황' : '입출고 내역'}
          </button>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <>
          <form onSubmit={handleInvSearch(onInvSearch)} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex gap-3">
              <input {...invReg('ingredientName')} placeholder="재료명" className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
              <select {...invReg('isLow')} className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0] text-gray-700">
                <option value="">재고 상태 전체</option>
                <option value="true">부족</option>
                <option value="false">정상</option>
              </select>
              <button type="button" onClick={onInvReset} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
                <RotateCcw size={14} /> 초기화
              </button>
              <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm" style={{ backgroundColor: '#3454D0' }}>
                <Search size={14} /> 검색
              </button>
            </div>
          </form>
          <div className="bg-white rounded-2xl shadow-sm">
            {loading ? <Loading /> : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b border-gray-100">
                        <th className="text-left px-6 py-3 font-medium">재료명</th>
                        <th className="text-left px-6 py-3 font-medium">현재 재고</th>
                        <th className="text-left px-6 py-3 font-medium">최소 재고</th>
                        <th className="text-left px-6 py-3 font-medium">단위</th>
                        <th className="text-left px-6 py-3 font-medium">상태</th>
                        <th className="text-left px-6 py-3 font-medium">최종 수정</th>
                        <th className="text-left px-6 py-3 font-medium">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-12 text-gray-400">재고 항목이 없습니다</td></tr>
                      ) : inventory.map((item) => (
                        <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50 ${item.isLow ? 'bg-red-50/50' : ''}`}>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.ingredientName}</td>
                          <td className="px-6 py-3 text-sm">
                            <span className={`font-semibold ${item.isLow ? 'text-red-600' : 'text-gray-900'}`}>
                              {comma(item.currentStock)}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">{comma(item.minStock)}</td>
                          <td className="px-6 py-3 text-sm text-gray-500">{item.ingredientUnit}</td>
                          <td className="px-6 py-3">
                            <Badge variant={item.isLow ? 'danger' : 'success'}>
                              {item.isLow ? '부족' : '정상'}
                            </Badge>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-500">
                            {item.updatedAt?.slice(0, 16).replace('T', ' ')}
                          </td>
                          <td className="px-6 py-3">
                            <button onClick={() => openAdjust(item)}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-[#3454D0] text-[#3454D0] hover:bg-[#3454D0] hover:text-white transition-colors">
                              <Plus size={12} /> 조정
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
        </>
      )}

      {activeTab === 'logs' && (
        <>
          <form onSubmit={handleLogSearch(onLogSearch)} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex gap-3">
              <input {...logReg('ingredientName')} placeholder="재료명" className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
              <select {...logReg('changeType')} className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0] text-gray-700">
                <option value="">유형 전체</option>
                <option value="IN">입고</option>
                <option value="OUT">출고</option>
                <option value="ADJUST">조정</option>
              </select>
              <button type="button" onClick={onLogReset} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
                <RotateCcw size={14} /> 초기화
              </button>
              <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm" style={{ backgroundColor: '#3454D0' }}>
                <Search size={14} /> 검색
              </button>
            </div>
          </form>
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left px-6 py-3 font-medium">재료명</th>
                    <th className="text-left px-6 py-3 font-medium">유형</th>
                    <th className="text-left px-6 py-3 font-medium">수량</th>
                    <th className="text-left px-6 py-3 font-medium">변경 후 재고</th>
                    <th className="text-left px-6 py-3 font-medium">메모</th>
                    <th className="text-left px-6 py-3 font-medium">일시</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">기록이 없습니다</td></tr>
                  ) : logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{log.ingredientName}</td>
                      <td className="px-6 py-3">
                        <Badge variant={changeTypeBadge[log.changeType]}>{changeTypeMap[log.changeType]}</Badge>
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                        {log.changeType === 'OUT' ? '-' : '+'}{comma(log.quantity)}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{comma(log.stockAfter)}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">{log.note}</td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {log.createdAt?.slice(0, 16).replace('T', ' ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={logPage} totalPages={logTotalPages} totalElements={logTotalElements} onPageChange={setLogPage} />
          </div>
        </>
      )}

      {/* Adjust Modal */}
      <Modal isOpen={showAdjust} onClose={() => setShowAdjust(false)} title={`재고 조정 — ${selectedItem?.ingredientName}`} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('ingredientId')} />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">조정 유형 *</label>
            <div className="flex gap-2">
              {(['IN', 'OUT', 'ADJUST'] as const).map((t) => (
                <label key={t} className="flex-1 cursor-pointer">
                  <input type="radio" value={t} {...register('changeType', { required: true })} className="sr-only" />
                  <span className={`block text-center py-2 rounded-xl text-sm font-medium border transition-colors ${
                    watch('changeType') === t
                      ? 'bg-[#3454D0] text-white border-[#3454D0]'
                      : 'text-gray-600 border-gray-200 hover:border-[#3454D0] hover:text-[#3454D0]'
                  }`}>
                    {changeTypeMap[t]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              수량 * <span className="text-gray-400 font-normal">(현재: {comma(selectedItem?.currentStock ?? 0)} {selectedItem?.ingredientUnit})</span>
            </label>
            <input type="number" step="0.1" {...register('quantity', { required: true, valueAsNumber: true, min: 0.01 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">유효한 수량을 입력해주세요</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">메모</label>
            <input {...register('note')} placeholder="조정 사유..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#3454D0]" />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowAdjust(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">
              취소
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#3454D0' }}>
              {saving ? '처리중...' : '조정'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
