import { renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/realEvents.json';
import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() =>
    useSearch(events as Event[], new Date('2025-02-01'), 'month')
  );

  expect(result.current.searchTerm).toMatchInlineSnapshot(`""`);
  expect(result.current.filteredEvents).toMatchInlineSnapshot(`
    [
      {
        "category": "업무",
        "date": "2025-02-20",
        "description": "주간 팀 미팅",
        "endTime": "11:00",
        "id": "2b7545a6-ebee-426c-b906-2329bc8d62bd",
        "location": "회의실 A",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "10:00",
        "title": "팀 회의",
      },
      {
        "category": "개인",
        "date": "2025-02-21",
        "description": "동료와 점심 식사",
        "endTime": "13:30",
        "id": "09702fb3-a478-40b3-905e-9ab3c8849dcd",
        "location": "회사 근처 식당",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "12:30",
        "title": "점심 약속",
      },
      {
        "category": "업무",
        "date": "2025-02-25",
        "description": "분기별 프로젝트 마감",
        "endTime": "18:00",
        "id": "da3ca408-836a-4d98-b67a-ca389d07552b",
        "location": "사무실",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "09:00",
        "title": "프로젝트 마감",
      },
      {
        "category": "개인",
        "date": "2025-02-28",
        "description": "친구 생일 축하",
        "endTime": "22:00",
        "id": "dac62941-69e5-4ec0-98cc-24c2a79a7f81",
        "location": "친구 집",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "19:00",
        "title": "생일 파티",
      },
      {
        "category": "개인",
        "date": "2025-02-22",
        "description": "주간 운동",
        "endTime": "19:00",
        "id": "80d85368-b4a4-47b3-b959-25171d49371f",
        "location": "헬스장",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "18:00",
        "title": "운동",
      },
    ]
  `);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result, rerender } = renderHook(() =>
    useSearch(events as Event[], new Date('2025-02-01'), 'month')
  );

  result.current.setSearchTerm('생일');

  rerender();

  expect(result.current.searchTerm).toMatchInlineSnapshot(`"생일"`);
  expect(result.current.filteredEvents).toMatchInlineSnapshot(`
    [
      {
        "category": "개인",
        "date": "2025-02-28",
        "description": "친구 생일 축하",
        "endTime": "22:00",
        "id": "dac62941-69e5-4ec0-98cc-24c2a79a7f81",
        "location": "친구 집",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "19:00",
        "title": "생일 파티",
      },
    ]
  `);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result, rerender } = renderHook(() =>
    useSearch(events as Event[], new Date('2025-02-01'), 'month')
  );

  result.current.setSearchTerm('회');

  rerender();

  expect(result.current.searchTerm).toMatchInlineSnapshot(`"회"`);
  expect(result.current.filteredEvents).toMatchInlineSnapshot(`
    [
      {
        "category": "업무",
        "date": "2025-02-20",
        "description": "주간 팀 미팅",
        "endTime": "11:00",
        "id": "2b7545a6-ebee-426c-b906-2329bc8d62bd",
        "location": "회의실 A",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "10:00",
        "title": "팀 회의",
      },
      {
        "category": "개인",
        "date": "2025-02-21",
        "description": "동료와 점심 식사",
        "endTime": "13:30",
        "id": "09702fb3-a478-40b3-905e-9ab3c8849dcd",
        "location": "회사 근처 식당",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "12:30",
        "title": "점심 약속",
      },
    ]
  `);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: case1 } = renderHook(() =>
    useSearch(events as Event[], new Date('2025-02-01'), 'month')
  );

  expect(case1.current.searchTerm).toMatchInlineSnapshot(`""`);
  expect(case1.current.filteredEvents).toMatchInlineSnapshot(`
    [
      {
        "category": "업무",
        "date": "2025-02-20",
        "description": "주간 팀 미팅",
        "endTime": "11:00",
        "id": "2b7545a6-ebee-426c-b906-2329bc8d62bd",
        "location": "회의실 A",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "10:00",
        "title": "팀 회의",
      },
      {
        "category": "개인",
        "date": "2025-02-21",
        "description": "동료와 점심 식사",
        "endTime": "13:30",
        "id": "09702fb3-a478-40b3-905e-9ab3c8849dcd",
        "location": "회사 근처 식당",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "12:30",
        "title": "점심 약속",
      },
      {
        "category": "업무",
        "date": "2025-02-25",
        "description": "분기별 프로젝트 마감",
        "endTime": "18:00",
        "id": "da3ca408-836a-4d98-b67a-ca389d07552b",
        "location": "사무실",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "09:00",
        "title": "프로젝트 마감",
      },
      {
        "category": "개인",
        "date": "2025-02-28",
        "description": "친구 생일 축하",
        "endTime": "22:00",
        "id": "dac62941-69e5-4ec0-98cc-24c2a79a7f81",
        "location": "친구 집",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "19:00",
        "title": "생일 파티",
      },
      {
        "category": "개인",
        "date": "2025-02-22",
        "description": "주간 운동",
        "endTime": "19:00",
        "id": "80d85368-b4a4-47b3-b959-25171d49371f",
        "location": "헬스장",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "18:00",
        "title": "운동",
      },
    ]
  `);

  const { result: case2 } = renderHook(() =>
    useSearch(events as Event[], new Date('2025-02-20'), 'week')
  );

  expect(case2.current.searchTerm).toMatchInlineSnapshot(`""`);
  expect(case2.current.filteredEvents).toMatchInlineSnapshot(`
    [
      {
        "category": "업무",
        "date": "2025-02-20",
        "description": "주간 팀 미팅",
        "endTime": "11:00",
        "id": "2b7545a6-ebee-426c-b906-2329bc8d62bd",
        "location": "회의실 A",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "10:00",
        "title": "팀 회의",
      },
      {
        "category": "개인",
        "date": "2025-02-21",
        "description": "동료와 점심 식사",
        "endTime": "13:30",
        "id": "09702fb3-a478-40b3-905e-9ab3c8849dcd",
        "location": "회사 근처 식당",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "12:30",
        "title": "점심 약속",
      },
      {
        "category": "개인",
        "date": "2025-02-22",
        "description": "주간 운동",
        "endTime": "19:00",
        "id": "80d85368-b4a4-47b3-b959-25171d49371f",
        "location": "헬스장",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "18:00",
        "title": "운동",
      },
    ]
  `);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result, rerender } = renderHook(() =>
    useSearch(events as Event[], new Date('2025-02-01'), 'month')
  );

  result.current.setSearchTerm('회의');

  rerender();

  expect(result.current.searchTerm).toMatchInlineSnapshot(`"회의"`);
  expect(result.current.filteredEvents).toMatchInlineSnapshot(`
    [
      {
        "category": "업무",
        "date": "2025-02-20",
        "description": "주간 팀 미팅",
        "endTime": "11:00",
        "id": "2b7545a6-ebee-426c-b906-2329bc8d62bd",
        "location": "회의실 A",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "10:00",
        "title": "팀 회의",
      },
    ]
  `);

  result.current.setSearchTerm('점심');

  rerender();

  expect(result.current.searchTerm).toMatchInlineSnapshot(`"점심"`);
  expect(result.current.filteredEvents).toMatchInlineSnapshot(`
    [
      {
        "category": "개인",
        "date": "2025-02-21",
        "description": "동료와 점심 식사",
        "endTime": "13:30",
        "id": "09702fb3-a478-40b3-905e-9ab3c8849dcd",
        "location": "회사 근처 식당",
        "notificationTime": 1,
        "repeat": {
          "interval": 0,
          "type": "none",
        },
        "startTime": "12:30",
        "title": "점심 약속",
      },
    ]
  `);
});
