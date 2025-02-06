import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2024-07-01', '14:30')).toStrictEqual(
      new Date('2024-07-01T14:30:00.000Z')
    );
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('invalid date', '14:30').toString()).toMatchInlineSnapshot(
      `"Invalid Date"`
    );
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2024-07-01', 'invalid time').toString()).toMatchInlineSnapshot(
      `"Invalid Date"`
    );
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14:30').toString()).toMatchInlineSnapshot(`"Invalid Date"`);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    expect(
      convertEventToDateRange({
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      })
    ).toMatchInlineSnapshot(`
      {
        "end": 2024-10-15T10:00:00.000Z,
        "start": 2024-10-15T09:00:00.000Z,
      }
    `);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(
      convertEventToDateRange({
        id: '1',
        title: '기존 회의',
        date: '2024-10-xx',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      })
    ).toMatchInlineSnapshot(`
      {
        "end": Date { NaN },
        "start": Date { NaN },
      }
    `);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(
      convertEventToDateRange({
        id: '1',
        title: '기존 회의',
        date: '2024-10-15',
        startTime: 'xx:00',
        endTime: 'xx:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      })
    ).toMatchInlineSnapshot(`
      {
        "end": Date { NaN },
        "start": Date { NaN },
      }
    `);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(
      isOverlapping(
        {
          id: '1',
          title: '기존 회의',
          date: '2024-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '1',
          title: '기존 회의',
          date: '2024-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        }
      )
    ).toMatchInlineSnapshot(`true`);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    expect(
      isOverlapping(
        {
          id: '1',
          title: '기존 회의',
          date: '2024-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '기존 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '1',
          title: '새 회의',
          date: '2024-10-16',
          startTime: '09:00',
          endTime: '10:00',
          description: '새 팀 미팅',
          location: '회의실 C',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        }
      )
    ).toMatchInlineSnapshot(`false`);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    expect(
      findOverlappingEvents(
        {
          id: '1',
          title: '새 회의',
          date: '2024-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '겹치는 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        [
          {
            id: '2',
            title: '기존 회의',
            date: '2024-10-15',
            startTime: '09:00',
            endTime: '09:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
          {
            id: '3',
            title: '기존 회의',
            date: '2024-10-15',
            startTime: '09:30',
            endTime: '10:00',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
        ]
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "category": "업무",
          "date": "2024-10-15",
          "description": "기존 팀 미팅",
          "endTime": "09:30",
          "id": "2",
          "location": "회의실 B",
          "notificationTime": 10,
          "repeat": {
            "interval": 0,
            "type": "none",
          },
          "startTime": "09:00",
          "title": "기존 회의",
        },
        {
          "category": "업무",
          "date": "2024-10-15",
          "description": "기존 팀 미팅",
          "endTime": "10:00",
          "id": "3",
          "location": "회의실 B",
          "notificationTime": 10,
          "repeat": {
            "interval": 0,
            "type": "none",
          },
          "startTime": "09:30",
          "title": "기존 회의",
        },
      ]
    `);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(
      findOverlappingEvents(
        {
          id: '1',
          title: '새 회의',
          date: '2024-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '겹치는 팀 미팅',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        [
          {
            id: '2',
            title: '기존 회의',
            date: '2024-10-15',
            startTime: '10:00',
            endTime: '10:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
          {
            id: '3',
            title: '기존 회의',
            date: '2024-10-15',
            startTime: '10:30',
            endTime: '11:00',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
        ]
      )
    ).toMatchInlineSnapshot(`[]`);
  });
});
