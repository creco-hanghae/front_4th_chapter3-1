import { events } from '../../__mocks__/response/realEvents.json';
import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(getUpcomingEvents(events as Event[], new Date('2025-02-20T09:59'), []))
      .toMatchInlineSnapshot(`
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
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(
      getUpcomingEvents(events as Event[], new Date('2025-02-20T09:59'), [
        '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      ])
    ).toMatchInlineSnapshot(`[]`);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(
      getUpcomingEvents(events as Event[], new Date('2025-02-20T09:58'), [])
    ).toMatchInlineSnapshot(`[]`);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(
      getUpcomingEvents(events as Event[], new Date('2025-02-20T10:01'), [])
    ).toMatchInlineSnapshot(`[]`);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const [event] = getUpcomingEvents(events as Event[], new Date('2025-02-20T09:59'), []);
    expect(createNotificationMessage(event)).toMatchInlineSnapshot(
      `"1분 후 팀 회의 일정이 시작됩니다."`
    );
  });
});
