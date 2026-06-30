import { storeClient } from './client';
import type { CommonResponse, PageResponse, OrderResDto, OrderCreateReqDto, OrderUpdateReqDto, OrderSearchDto } from '../types';

export const getOrders = async (params?: OrderSearchDto) => {
  const res = await storeClient.get<CommonResponse<PageResponse<OrderResDto>>>('/stores/orders', { params });
  return res.data;
};

export const createOrder = async (dto: OrderCreateReqDto) => {
  const res = await storeClient.post<CommonResponse<null>>('/stores/orders', dto);
  return res.data;
};

export const cancelOrder = async (orderId: number, dto: OrderUpdateReqDto) => {
  const res = await storeClient.patch<CommonResponse<null>>(`/stores/orders/${orderId}/cancel`, dto);
  return res.data;
};
