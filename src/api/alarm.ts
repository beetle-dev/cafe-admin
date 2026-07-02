import { notiClient } from './client';

export interface AlarmDto {
  id: number;
  type: 'ORDER_CREATED' | 'INVENTORY_LOW' | 'INVENTORY_NEAR_DEPLETION';
  message: string;
  resolved: boolean;
  occurredAt: string;
  resolvedAt: string | null;
}

export const getAlarms = () =>
  notiClient.get<AlarmDto[]>('/alarms').then((r) => r.data);

export const resolveAlarm = (id: number) =>
  notiClient.patch(`/alarms/${id}/resolve`);
