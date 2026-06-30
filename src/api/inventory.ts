import { storeClient } from './client';
import type { CommonResponse, PageResponse, StoreInventoryResDto, InventoryLogResDto, InventoryReqDto, InventorySearchDto, InventoryLogSearchDto } from '../types';

export const getInventory = async (params?: InventorySearchDto) => {
  const res = await storeClient.get<CommonResponse<PageResponse<StoreInventoryResDto>>>(
    '/stores/inventory', { params }
  );
  return res.data;
};

export const adjustInventory = async (dto: InventoryReqDto) => {
  const res = await storeClient.post<CommonResponse<null>>('/stores/inventory/adjust', dto);
  return res.data;
};

export const getInventoryLogs = async (params?: InventoryLogSearchDto) => {
  const res = await storeClient.get<CommonResponse<PageResponse<InventoryLogResDto>>>(
    '/stores/inventory/logs', { params }
  );
  return res.data;
};
