import { storeClient } from './client';
import type { CommonResponse, PageResponse, StoreInventoryResDto, InventoryLogResDto, InventoryReqDto, InventorySearchDto, InventoryLogSearchDto } from '../types';

export const getInventory = async (storeId: number, params?: InventorySearchDto) => {
  const res = await storeClient.get<CommonResponse<PageResponse<StoreInventoryResDto>>>(
    `/stores/${storeId}/inventory`, { params }
  );
  return res.data;
};

export const adjustInventory = async (storeId: number, dto: InventoryReqDto) => {
  const res = await storeClient.post<CommonResponse<null>>(`/stores/${storeId}/inventory/adjust`, dto);
  return res.data;
};

export const getInventoryLogs = async (storeId: number, params?: InventoryLogSearchDto) => {
  const res = await storeClient.get<CommonResponse<PageResponse<InventoryLogResDto>>>(
    `/stores/${storeId}/inventory/logs`, { params }
  );
  return res.data;
};
