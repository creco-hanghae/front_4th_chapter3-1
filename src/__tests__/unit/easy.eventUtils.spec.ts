import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    expect(
      getFilteredEvents(
        [
          {
            id: '1',
            title: '이벤트 2',
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
            id: '2',
            title: '이벤트 3',
            date: '2024-10-15',
            startTime: '10:00',
            endTime: '10:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
        ],
        '이벤트 2',
        new Date('2024-10-16'),
        'week'
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "category": "업무",
          "date": "2024-10-15",
          "description": "기존 팀 미팅",
          "endTime": "09:30",
          "id": "1",
          "location": "회의실 B",
          "notificationTime": 10,
          "repeat": {
            "interval": 0,
            "type": "none",
          },
          "startTime": "09:00",
          "title": "이벤트 2",
        },
      ]
    `);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    expect(
      getFilteredEvents(
        [
          {
            id: '1',
            title: '이벤트 2',
            date: '2024-07-01',
            startTime: '09:00',
            endTime: '09:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
          {
            id: '2',
            title: '이벤트 3',
            date: '2024-07-15',
            startTime: '10:00',
            endTime: '10:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
        ],
        '',
        new Date('2024-07-01'),
        'week'
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "category": "업무",
          "date": "2024-07-01",
          "description": "기존 팀 미팅",
          "endTime": "09:30",
          "id": "1",
          "location": "회의실 B",
          "notificationTime": 10,
          "repeat": {
            "interval": 0,
            "type": "none",
          },
          "startTime": "09:00",
          "title": "이벤트 2",
        },
      ]
    `);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    expect(
      getFilteredEvents(
        [
          {
            id: '1',
            title: '이벤트 2',
            date: '2024-07-01',
            startTime: '09:00',
            endTime: '09:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
          {
            id: '2',
            title: '이벤트 3',
            date: '2024-08-15',
            startTime: '10:00',
            endTime: '10:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
        ],
        '',
        new Date('2024-07-01'),
        'month'
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "category": "업무",
          "date": "2024-07-01",
          "description": "기존 팀 미팅",
          "endTime": "09:30",
          "id": "1",
          "location": "회의실 B",
          "notificationTime": 10,
          "repeat": {
            "interval": 0,
            "type": "none",
          },
          "startTime": "09:00",
          "title": "이벤트 2",
        },
      ]
    `);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    expect(
      getFilteredEvents(
        [
          {
            id: '1',
            title: '이벤트 2',
            date: '2024-07-01',
            startTime: '09:00',
            endTime: '09:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
          {
            id: '1',
            title: '회의 2',
            date: '2024-07-02',
            startTime: '09:00',
            endTime: '09:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
          {
            id: '2',
            title: '이벤트 3',
            date: '2024-08-15',
            startTime: '10:00',
            endTime: '10:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
        ],
        '이벤트',
        new Date('2024-07-01'),
        'week'
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "category": "업무",
          "date": "2024-07-01",
          "description": "기존 팀 미팅",
          "endTime": "09:30",
          "id": "1",
          "location": "회의실 B",
          "notificationTime": 10,
          "repeat": {
            "interval": 0,
            "type": "none",
          },
          "startTime": "09:00",
          "title": "이벤트 2",
        },
      ]
    `);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    expect(
      getFilteredEvents(
        [
          {
            id: '1',
            title: '이벤트 2',
            date: '2024-07-01',
            startTime: '09:00',
            endTime: '09:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
          {
            id: '2',
            title: '이벤트 3',
            date: '2024-07-15',
            startTime: '10:00',
            endTime: '10:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
        ],
        '',
        new Date('2024-07-01'),
        'month'
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "category": "업무",
          "date": "2024-07-01",
          "description": "기존 팀 미팅",
          "endTime": "09:30",
          "id": "1",
          "location": "회의실 B",
          "notificationTime": 10,
          "repeat": {
            "interval": 0,
            "type": "none",
          },
          "startTime": "09:00",
          "title": "이벤트 2",
        },
        {
          "category": "업무",
          "date": "2024-07-15",
          "description": "기존 팀 미팅",
          "endTime": "10:30",
          "id": "2",
          "location": "회의실 B",
          "notificationTime": 10,
          "repeat": {
            "interval": 0,
            "type": "none",
          },
          "startTime": "10:00",
          "title": "이벤트 3",
        },
      ]
    `);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    expect(
      getFilteredEvents(
        [
          {
            id: '1',
            title: '이벤트 2',
            date: '2024-07-01',
            startTime: '09:00',
            endTime: '09:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
          {
            id: '2',
            title: '이벤트 3',
            date: '2024-07-15',
            startTime: '10:00',
            endTime: '10:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
        ],
        '회의실 b',
        new Date('2024-07-01'),
        'month'
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "category": "업무",
          "date": "2024-07-01",
          "description": "기존 팀 미팅",
          "endTime": "09:30",
          "id": "1",
          "location": "회의실 B",
          "notificationTime": 10,
          "repeat": {
            "interval": 0,
            "type": "none",
          },
          "startTime": "09:00",
          "title": "이벤트 2",
        },
        {
          "category": "업무",
          "date": "2024-07-15",
          "description": "기존 팀 미팅",
          "endTime": "10:30",
          "id": "2",
          "location": "회의실 B",
          "notificationTime": 10,
          "repeat": {
            "interval": 0,
            "type": "none",
          },
          "startTime": "10:00",
          "title": "이벤트 3",
        },
      ]
    `);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    expect(
      getFilteredEvents(
        [
          {
            id: '1',
            title: '이벤트 2',
            date: '2024-07-31',
            startTime: '09:00',
            endTime: '09:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
          {
            id: '2',
            title: '이벤트 3',
            date: '2024-08-01',
            startTime: '10:00',
            endTime: '10:30',
            description: '기존 팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
        ],
        '회의실 b',
        new Date('2024-07-31'),
        'week'
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "category": "업무",
          "date": "2024-07-31",
          "description": "기존 팀 미팅",
          "endTime": "09:30",
          "id": "1",
          "location": "회의실 B",
          "notificationTime": 10,
          "repeat": {
            "interval": 0,
            "type": "none",
          },
          "startTime": "09:00",
          "title": "이벤트 2",
        },
        {
          "category": "업무",
          "date": "2024-08-01",
          "description": "기존 팀 미팅",
          "endTime": "10:30",
          "id": "2",
          "location": "회의실 B",
          "notificationTime": 10,
          "repeat": {
            "interval": 0,
            "type": "none",
          },
          "startTime": "10:00",
          "title": "이벤트 3",
        },
      ]
    `);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents([], '회의실 b', new Date('2024-07-31'), 'week')).toMatchInlineSnapshot(
      `[]`
    );
  });
});
