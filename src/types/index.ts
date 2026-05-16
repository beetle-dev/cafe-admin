// Common
export interface CommonResponse<T> {
  code: string;
  message: string | null;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Auth
export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface UserResDto {
  id: number;
  uuid: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserReqDto {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface UsersSearchDto {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  email?: string;
  name?: string;
  role?: Role;
}

// Store
export interface StoreResDto {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  openTime: string;
  closeTime: string;
  active: boolean;
}

export interface StoreReqDto {
  name: string;
  email: string;
  active?: boolean;
  address?: string;
  phone?: string;
  openTime?: string;
  closeTime?: string;
}

export interface StoreSearchDto {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  active?: boolean;
}

// Menu
export interface MenuResDto {
  id: number;
  menuCategory: string;
  menuCategoryId: number;
  name: string;
  description: string;
  price: number;
  cost: number;
  isActive: boolean;
  imageUrl: string | null;
}

export interface MenuCategoryResDto {
  id: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface MenuCategoryReqDto {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface MenuSearchDto {
  menuCategoryId?: number;
  name?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

// Order
export type OrderStatus = 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type PaymentMethod = 'CARD' | 'CASH' | 'APP';

export interface OrderItemResDto {
  id: number;
  orderId: number;
  menuId: number;
  menuName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResDto {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  orderItemResDtoList: OrderItemResDto[];
  createdAt: string;
}

export interface OrderItemReqDto {
  menuId: number;
  quantity: number;
}

export interface OrderCreateReqDto {
  totalAmount: number;
  paymentMethod: PaymentMethod;
  orderItemReqDtos: OrderItemReqDto[];
}

export interface OrderUpdateReqDto {
  status: 'CANCELLED' | 'REFUNDED';
}

// Inventory
export type ChangeType = 'IN' | 'OUT' | 'ADJUST';

export interface StoreInventoryResDto {
  id: number;
  ingredientId: number;
  ingredientName: string;
  ingredientUnit: string;
  currentStock: number;
  minStock: number;
  updatedAt: string;
  isLow: boolean;
}

export interface InventoryLogResDto {
  id: number;
  storeId: number;
  ingredientId: number;
  ingredientName: string;
  changeType: ChangeType;
  quantity: number;
  stockAfter: number;
  note: string;
  performedBy: number;
  createdAt: string;
}

export interface InventoryReqDto {
  ingredientId: number;
  quantity: number;
  changeType: ChangeType;
  note?: string;
}

// Sales
export interface SalesStatsDailyResDto {
  id: number;
  storeId: number;
  statDate: string;
  orderCount: number;
  totalSales: number;
  cardSales: number;
  cashSales: number;
  appSales: number;
  avgOrderPrice: number;
  peakHour: number;
  createdAt: string;
}

export interface SalesStatsHourlyResDto {
  id: number;
  storeId: number;
  statHour: string;
  orderCount: number;
  totalSales: number;
  cardSales: number;
  cashSales: number;
  createdAt: string;
}

export interface SalesHistorySearchDto {
  from: string;
  to: string;
  page?: number;
  size?: number;
}

// Search base
export interface SearchDto {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export interface InventorySearchDto extends SearchDto {
  ingredientName?: string;
  low?: boolean;
}

export interface InventoryLogSearchDto extends SearchDto {
  ingredientName?: string;
  changeType?: string;
}
