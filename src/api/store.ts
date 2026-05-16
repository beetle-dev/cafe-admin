import { storeClient } from './client';
import type { CommonResponse, PageResponse, StoreResDto, StoreReqDto, StoreSearchDto } from '../types';

export const getStores = async (params?: StoreSearchDto) => {
  const res = await storeClient.get<CommonResponse<PageResponse<StoreResDto>>>('/stores', { params });
  return res.data;
};

export const createStore = async (dto: StoreReqDto) => {
  const res = await storeClient.post<CommonResponse<null>>('/stores', dto);
  return res.data;
};

export const updateStore = async (id: number, dto: Partial<StoreReqDto>) => {
  const res = await storeClient.patch<CommonResponse<null>>(`/stores/${id}`, dto);
  return res.data;
};

export const deleteStore = async (id: number) => {
  const res = await storeClient.delete<CommonResponse<null>>(`/stores/${id}`);
  return res.data;
};
