import { useEffect, useState } from 'react';
import { Plus, Search, X, ChevronRight } from 'lucide-react';
import { getOrders, createOrder, cancelOrder } from '../api/order';
import { getMenus } from '../api/menu';
import type { OrderResDto, MenuResDto, OrderItemReqDto } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { Loading } from '../components/common/Loading';

const statusMap = { COMPLETED: '완료', CANCELLED: '취소', REFUNDED: '환불' };
const paymentMap = { CARD: '카드', CASH: '현금', APP: '앱' };
const statusVariant = { COMPLETED: 'success', CANCELLED: 'danger', REFUNDED: 'warning' } as const;

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderResDto[]>([]);
  const [menus, setMenus] = useState<MenuResDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResDto | null>(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // New order state
  const [items, setItems] = useState<{ menu: MenuResDto; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH' | 'APP'>('CARD');
  const [menuSearch, setMenuSearch] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchOrders = async (range = dateRange, p = page) => {
    setLoading(true);
    try {
      const res = await getOrders({
        page: p, size: 20, sort: 'createdAt', direction: 'DESC',
        ...(range.from && { orderStartDate: range.from + 'T00:00:00' }),
        ...(range.to && { orderEndDate: range.to + 'T23:59:59' }),
      });
      if (res.data) {
        setOrders(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(dateRange, page); }, [page]);

  const onSearch = () => { setPage(0); fetchOrders(dateRange, 0); };
  const onReset = () => { const e = { from: '', to: '' }; setDateRange(e); setPage(0); fetchOrders(e, 0); };

  useEffect(() => {
    if (!showCreate) return;
    getMenus({ isActive: true, size: 100 }).then((r) => r.data && setMenus(r.data.content)).catch(() => {});
  }, [showCreate]);

  const addItem = (menu: MenuResDto) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.menu.id === menu.id);
      if (ex) return prev.map((i) => i.menu.id === menu.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { menu, quantity: 1 }];
    });
  };

  const updateQty = (menuId: number, qty: number) => {
    if (qty <= 0) setItems((prev) => prev.filter((i) => i.menu.id !== menuId));
    else setItems((prev) => prev.map((i) => i.menu.id === menuId ? { ...i, quantity: qty } : i));
  };

  const totalAmount = items.reduce((sum, i) => sum + i.menu.price * i.quantity, 0);

  const handleCreate = async () => {
    if (items.length === 0) return;
    setCreating(true);
    try {
      const dto = {
        totalAmount,
        paymentMethod,
        orderItemReqDtos: items.map<OrderItemReqDto>((i) => ({ menuId: i.menu.id, quantity: i.quantity })),
      };
      await createOrder(dto);
      setShowCreate(false);
      setItems([]);
      setPage(0);
      fetchOrders();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message ?? '주문 생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (order: OrderResDto, status: 'CANCELLED' | 'REFUNDED') => {
    if (!confirm(`주문을 ${status === 'CANCELLED' ? '취소' : '환불'} 처리하시겠습니까?`)) return;
    try {
      await cancelOrder(order.id, { status });
      fetchOrders();
      setSelectedOrder(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message ?? '처리에 실패했습니다.');
    }
  };

  const filteredMenus = menus.filter((m) =>
    m.name.toLowerCase().includes(menuSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">주문 관리</h2>
          <p className="text-sm text-gray-500 mt-0.5">주문 내역 조회 및 신규 주문 등록</p>
        </div>
        <button onClick={() => { setShowCreate(true); setItems([]); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: '#3454D0' }}>
          <Plus size={16} /> 새 주문
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-sm w-fit">
        <input type="date" value={dateRange.from} onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#3454D0]" />
        <span className="text-gray-400">~</span>
        <input type="date" value={dateRange.to} onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#3454D0]" />
        <button onClick={onSearch}
          className="px-3 py-1.5 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: '#3454D0' }}>
          검색
        </button>
        <button onClick={onReset}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
          초기화
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        {loading ? <Loading /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left px-6 py-3 font-medium">주문번호</th>
                    <th className="text-left px-6 py-3 font-medium">메뉴</th>
                    <th className="text-left px-6 py-3 font-medium">금액</th>
                    <th className="text-left px-6 py-3 font-medium">결제수단</th>
                    <th className="text-left px-6 py-3 font-medium">상태</th>
                    <th className="text-left px-6 py-3 font-medium">일시</th>
                    <th className="w-8 px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">주문이 없습니다</td></tr>
                  ) : orders.map((order) => (
                    <tr key={order.id} className="group border-b border-gray-50 hover:bg-blue-50/60 cursor-pointer transition-colors"
                      onClick={() => setSelectedOrder(order)}>
                      <td className="px-6 py-3 text-sm font-mono text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {order.orderItemResDtoList?.map((i) => `${i.menuName}×${i.quantity}`).join(', ')}
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">
                        {order.totalAmount.toLocaleString()}원
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">{paymentMap[order.paymentMethod]}</td>
                      <td className="px-6 py-3">
                        <Badge variant={statusVariant[order.status]}>{statusMap[order.status]}</Badge>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {order.createdAt?.slice(0, 16).replace('T', ' ')}
                      </td>
                      <td className="px-6 py-3">
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-[#3454D0] transition-colors" />
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

      {/* Create order modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="새 주문 등록" size="lg">
        <div className="grid grid-cols-2 gap-4">
          {/* Menu list */}
          <div>
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="메뉴 검색..." className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#3454D0]" />
            </div>
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {filteredMenus.map((menu) => (
                <button key={menu.id} onClick={() => addItem(menu)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors text-left">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{menu.name}</p>
                    <p className="text-xs text-gray-500">{menu.menuCategory}</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#3454D0' }}>{menu.price.toLocaleString()}원</p>
                </button>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="flex flex-col">
            <h4 className="font-medium text-gray-900 mb-3">주문 항목</h4>
            <div className="flex-1 space-y-2 max-h-60 overflow-y-auto mb-3">
              {items.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">메뉴를 선택해주세요</p>
              ) : items.map((item) => (
                <div key={item.menu.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.menu.name}</p>
                    <p className="text-xs text-gray-500">{(item.menu.price * item.quantity).toLocaleString()}원</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.menu.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 text-xs hover:bg-gray-100">-</button>
                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.menu.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 text-xs hover:bg-gray-100">+</button>
                    <button onClick={() => updateQty(item.menu.id, 0)} className="ml-1 text-red-400 hover:text-red-600">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">결제수단</span>
                <div className="flex gap-1">
                  {(['CARD', 'CASH', 'APP'] as const).map((m) => (
                    <button key={m} onClick={() => setPaymentMethod(m)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                        paymentMethod === m ? 'bg-[#3454D0] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {paymentMap[m]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">합계</span>
                <span className="text-lg font-bold" style={{ color: '#3454D0' }}>{totalAmount.toLocaleString()}원</span>
              </div>
              <button onClick={handleCreate} disabled={creating || items.length === 0}
                className="w-full py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-50"
                style={{ backgroundColor: '#3454D0' }}>
                {creating ? '처리중...' : '주문 등록'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Order detail modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)}
        title={`주문 상세 - ${selectedOrder?.orderNumber}`}>
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-500">상태</p><p className="font-medium mt-0.5">
                <Badge variant={statusVariant[selectedOrder.status]}>{statusMap[selectedOrder.status]}</Badge>
              </p></div>
              <div><p className="text-gray-500">결제수단</p><p className="font-medium mt-0.5">{paymentMap[selectedOrder.paymentMethod]}</p></div>
              <div><p className="text-gray-500">총 금액</p><p className="font-medium mt-0.5">{selectedOrder.totalAmount.toLocaleString()}원</p></div>
              <div><p className="text-gray-500">주문 시간</p><p className="font-medium mt-0.5">{selectedOrder.createdAt?.slice(0, 16).replace('T', ' ')}</p></div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">주문 항목</p>
              <div className="space-y-2">
                {selectedOrder.orderItemResDtoList?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{item.menuName}</span>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">×{item.quantity} </span>
                      <span className="text-sm font-semibold">{item.subtotal.toLocaleString()}원</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selectedOrder.status === 'COMPLETED' && (
              <div className="flex gap-2 pt-2">
                <button onClick={() => handleCancel(selectedOrder, 'CANCELLED')}
                  className="flex-1 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50">
                  주문 취소
                </button>
                <button onClick={() => handleCancel(selectedOrder, 'REFUNDED')}
                  className="flex-1 py-2 rounded-xl border border-yellow-200 text-yellow-600 text-sm font-medium hover:bg-yellow-50">
                  환불 처리
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
