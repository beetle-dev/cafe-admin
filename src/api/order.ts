import { storeClient } from './client';
import type { CommonResponse, PageResponse, OrderResDto, OrderCreateReqDto, OrderUpdateReqDto, OrderSearchDto } from '../types';

export const getOrders = async (storeId: number, params?: OrderSearchDto) => {
  const res = await storeClient.get<CommonResponse<PageResponse<OrderResDto>>>(`/stores/${storeId}/orders`, { params });
  return res.data;
};

export const createOrder = async (storeId: number, dto: OrderCreateReqDto) => {
  const res = await storeClient.post<CommonResponse<null>>(`/stores/${storeId}/orders`, dto);
  return res.data;
};

export const cancelOrder = async (storeId: number, orderId: number, dto: OrderUpdateReqDto) => {
  const res = await storeClient.patch<CommonResponse<null>>(`/stores/${storeId}/orders/${orderId}/cancel`, dto);
  return res.data;
};
