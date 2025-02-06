import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { events } from '../../__mocks__/response/realEvents.json';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(events as Event[]));

  expect(result.current.notifications).toMatchInlineSnapshot(`[]`);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.setSystemTime(new Date('2025-02-20T09:59:00'));
  const { result } = renderHook(() => useNotifications(events as Event[]));

  act(() => vi.advanceTimersByTime(1000));

  expect(result.current.notifications).toMatchInlineSnapshot(`
    [
      {
        "id": "2b7545a6-ebee-426c-b906-2329bc8d62bd",
        "message": "1분 후 팀 회의 일정이 시작됩니다.",
      },
    ]
  `);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.setSystemTime(new Date('2025-02-20T09:59:00'));
  const { result } = renderHook(() => useNotifications(events as Event[]));
  act(() => vi.advanceTimersByTime(1000));

  expect(result.current.notifications).toMatchInlineSnapshot(`
    [
      {
        "id": "2b7545a6-ebee-426c-b906-2329bc8d62bd",
        "message": "1분 후 팀 회의 일정이 시작됩니다.",
      },
    ]
  `);

  act(() => result.current.removeNotification(0));
  expect(result.current.notifications).toEqual([]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.setSystemTime(new Date('2025-02-20T09:59:00'));
  const { result } = renderHook(() => useNotifications(events as Event[]));
  act(() => vi.advanceTimersByTime(1000));

  expect(result.current.notifiedEvents).toMatchInlineSnapshot(`
    [
      "2b7545a6-ebee-426c-b906-2329bc8d62bd",
    ]
  `);
  expect(result.current.notifications).toMatchInlineSnapshot(`
    [
      {
        "id": "2b7545a6-ebee-426c-b906-2329bc8d62bd",
        "message": "1분 후 팀 회의 일정이 시작됩니다.",
      },
    ]
  `);

  act(() => vi.advanceTimersByTime(1000));
  expect(result.current.notifiedEvents).toMatchInlineSnapshot(`
    [
      "2b7545a6-ebee-426c-b906-2329bc8d62bd",
    ]
  `);
  expect(result.current.notifications).toMatchInlineSnapshot(`
    [
      {
        "id": "2b7545a6-ebee-426c-b906-2329bc8d62bd",
        "message": "1분 후 팀 회의 일정이 시작됩니다.",
      },
    ]
  `);
});
