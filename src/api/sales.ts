import { storeClient } from './client';
import type { CommonResponse, PageResponse, SalesStatsDailyResDto, SalesStatsHourlyResDto, SalesHistorySearchDto } from '../types';

export const getDailySales = async (storeId: number, params: SalesHistorySearchDto) => {
  const res = await storeClient.get<CommonResponse<PageResponse<SalesStatsDailyResDto>>>(
    `/stores/${storeId}/sales/daily`, { params }
  );
  return res.data;
};

export const getHourlySales = async (storeId: number, params: SalesHistorySearchDto) => {
  const res = await storeClient.get<CommonResponse<PageResponse<SalesStatsHourlyResDto>>>(
    `/stores/${storeId}/sales/hourly`, { params }
  );
  return res.data;
};
