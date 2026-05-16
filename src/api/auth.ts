import { authClient } from './client';
import type { CommonResponse, PageResponse, UserResDto, UserReqDto, UsersSearchDto } from '../types';

export const login = async (email: string, password: string) => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  const res = await authClient.post<CommonResponse<string>>('/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return res.data;
};

export const logout = async () => {
  const res = await authClient.post<CommonResponse<null>>('/auth/logout');
  return res.data;
};

export const getMe = async () => {
  const res = await authClient.get<CommonResponse<UserResDto>>('/auth/me');
  return res.data;
};

export const getUsers = async (params: UsersSearchDto) => {
  const res = await authClient.get<CommonResponse<PageResponse<UserResDto>>>('/auth/users', { params });
  return res.data;
};

export const createUser = async (dto: UserReqDto) => {
  const res = await authClient.post<CommonResponse<null>>('/auth/user', dto);
  return res.data;
};

export const updateUser = async (uuid: string, dto: Partial<UserReqDto>) => {
  const res = await authClient.patch<CommonResponse<null>>(`/auth/users/${uuid}`, dto);
  return res.data;
};
