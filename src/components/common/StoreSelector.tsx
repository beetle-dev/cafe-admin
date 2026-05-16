import { useEffect, useState } from 'react';
import { getStores } from '../../api/store';
import { useAuthStore } from '../../store/authStore';
import type { StoreResDto } from '../../types';
import { Store } from 'lucide-react';

export function StoreSelector() {
  const { selectedStoreId, setSelectedStoreId } = useAuthStore();
  const [stores, setStores] = useState<StoreResDto[]>([]);

  useEffect(() => {
    getStores({ size: 100, active: true }).then((res) => {
      if (res.data?.content) {
        setStores(res.data.content);
        if (!selectedStoreId && res.data.content.length > 0) {
          setSelectedStoreId(res.data.content[0].id);
        }
      }
    }).catch(() => {});
  }, []);

  if (stores.length === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
      <Store size={14} className="text-white/70" />
      <select
        value={selectedStoreId ?? ''}
        onChange={(e) => setSelectedStoreId(Number(e.target.value))}
        className="bg-transparent text-white text-sm outline-none cursor-pointer"
      >
        {stores.map((s) => (
          <option key={s.id} value={s.id} className="text-gray-900 bg-white">
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
