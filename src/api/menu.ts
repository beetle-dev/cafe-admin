import { storeClient } from './client';
import type { CommonResponse, PageResponse, MenuResDto, MenuCategoryResDto, MenuCategoryReqDto, MenuSearchDto } from '../types';

export const getMenus = async (params?: MenuSearchDto) => {
  const res = await storeClient.get<CommonResponse<PageResponse<MenuResDto>>>('/menus', { params });
  return res.data;
};

export const createMenu = async (formData: FormData) => {
  const res = await storeClient.post<CommonResponse<null>>('/menus', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateMenu = async (id: number, formData: FormData) => {
  const res = await storeClient.patch<CommonResponse<null>>(`/menus/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getMenuCategories = async () => {
  const res = await storeClient.get<CommonResponse<PageResponse<MenuCategoryResDto>>>('/menus/categories');
  return res.data;
};

export const createMenuCategory = async (dto: MenuCategoryReqDto) => {
  const res = await storeClient.post<CommonResponse<null>>('/menus/category', dto);
  return res.data;
};

export const updateMenuCategory = async (id: number, dto: Partial<MenuCategoryReqDto>) => {
  const res = await storeClient.patch<CommonResponse<null>>(`/menus/category/${id}`, dto);
  return res.data;
};
