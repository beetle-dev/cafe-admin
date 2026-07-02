import { useEffect, useRef } from 'react';
import { useToastStore, type ToastType } from '../store/toastStore';
import { useAlarmStore } from '../store/alarmStore';

// 항상 Vite 프록시(/noti-api)를 통해 API Gateway로 라우팅
const SSE_URL = '/noti-api/alarms/subscribe';

const ALARM_TYPE_MAP: Record<string, { type: ToastType; title: string }> = {
  ORDER_CREATED:            { type: 'info',    title: '새 주문' },
  INVENTORY_LOW:            { type: 'danger',  title: '재고 부족' },
  INVENTORY_NEAR_DEPLETION: { type: 'warning', title: '재고 주의' },
};

interface AlarmPayload {
  id?: number;
  type?: string;
  message?: string;
}

export function useAlarmSSE() {
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const add = useToastStore.getState().add;
    const addFromSSE = useAlarmStore.getState().addFromSSE;
    let retryTimer: ReturnType<typeof setTimeout>;

    async function connect() {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch(SSE_URL, {
          headers: {
            Accept: 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          console.warn('[SSE] 연결 실패:', res.status);
          retryTimer = setTimeout(connect, 30_000);
          return;
        }

        console.log('[SSE] 알림 스트림 연결됨');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';

          for (const block of events) {
            let data = '';
            for (const line of block.split('\n')) {
              if (line.startsWith('data:')) {
                data = line.slice(5).trim();
              }
            }
            if (!data || data === 'ping') continue;

            try {
              const alarm: AlarmPayload = JSON.parse(data);
              const mapped = ALARM_TYPE_MAP[alarm.type ?? ''] ?? { type: 'info' as ToastType, title: '알림' };
              add({ type: mapped.type, title: mapped.title, message: alarm.message ?? '' });
              addFromSSE(alarm as Parameters<typeof addFromSSE>[0]);
            } catch {
              // heartbeat 등 비 JSON 메시지 무시
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.warn('[SSE] 연결 끊김, 30초 후 재연결:', err);
        retryTimer = setTimeout(connect, 30_000);
      }
    }

    connect();

    return () => {
      abortRef.current?.abort();
      clearTimeout(retryTimer);
    };
  }, []); // 마운트 1회만 실행
}
