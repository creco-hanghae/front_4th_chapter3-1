import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setupMockHandlerCreation, setupMockHandlerDeletion } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';
import { formatDate } from '../utils/dateUtils';

const toastFn = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

function setup(ui: ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(<ChakraProvider>{ui}</ChakraProvider>),
  };
}

async function saveSchedule(
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
}

async function selectView(user: UserEvent, view: 'week' | 'month') {
  const viewSelect = screen.getByLabelText('view');
  await user.selectOptions(viewSelect, view);
}

async function searchKeyword(user: UserEvent, keyword: string) {
  const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
  await user.type(searchInput, keyword);
}

async function clearSearch(user: UserEvent) {
  const searchInput = screen.getByPlaceholderText('검색어를 입력하세요');
  await user.clear(searchInput);
}

async function gotoPrevMonth(user: UserEvent, times: number) {
  const prevButton = screen.getByLabelText('Previous');
  for (let i = 0; i < times; i++) {
    await user.click(prevButton);
  }
}

describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    server.resetHandlers();
    toastFn.mockClear();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    const newEvent = {
      title: '테스트를 짜자',
      date: '2024-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 킥오프',
      location: '회의실 A',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    const eventList = screen.getByTestId('event-list');
    const eventTitles = await within(eventList).findAllByText(newEvent.title);
    expect(eventTitles.length).toBeGreaterThan(0);
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const initialEvent: Event = {
      id: '1',
      title: '수정 전 킥오프',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    let currentEvents = [initialEvent];

    server.use(
      http.get('/api/events', () => HttpResponse.json({ events: currentEvents })),
      http.put('/api/events/:id', async ({ request }) => {
        const updatedEvent = (await request.json()) as Event;
        currentEvents = currentEvents.map((evt) =>
          evt.id === updatedEvent.id ? updatedEvent : evt
        );
        return HttpResponse.json(updatedEvent);
      })
    );

    const { user } = setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    const initialTitle = await within(eventList).findByText(initialEvent.title);
    expect(initialTitle).toBeInTheDocument();

    const editButton = await screen.findByLabelText('Edit event');
    await user.click(editButton);

    await user.clear(screen.getByLabelText('날짜'));
    await user.type(screen.getByLabelText('날짜'), initialEvent.date);

    const startTimeInput = screen.getByLabelText('시작 시간');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, initialEvent.startTime);

    const endTimeInput = screen.getByLabelText('종료 시간');
    await user.clear(endTimeInput);
    await user.type(endTimeInput, initialEvent.endTime);

    const titleInput = screen.getByLabelText('제목');
    await user.clear(titleInput);
    await user.type(titleInput, '수정된 회의');

    await user.selectOptions(screen.getByLabelText('카테고리'), initialEvent.category);

    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(async () => {
      const updatedTitle = await within(eventList).findByText('수정된 회의');
      expect(updatedTitle).toBeInTheDocument();
    });

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 수정되었습니다.',
        status: 'success',
      })
    );
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);

    const eventTitles = await screen.findAllByText('삭제할 이벤트');
    expect(eventTitles[0]).toBeInTheDocument();

    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);

    await screen.findByText('검색 결과가 없습니다.');

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 삭제되었습니다.',
        status: 'info',
      })
    );
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    server.resetHandlers();
    toastFn.mockClear();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    await selectView(user, 'week');

    const weekView = screen.getByTestId('week-view');

    await user.click(screen.getByLabelText('Previous'));

    await waitFor(() => {
      expect(within(weekView).queryByText('회의')).not.toBeInTheDocument();
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const mockEvents = [
      {
        id: '1',
        title: '주간 회의',
        date: '2024-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents as Event[]);
    const { user } = setup(<App />);

    await selectView(user, 'week');
    const weekView = screen.getByTestId('week-view');
    const eventElement = await within(weekView).findByText('주간 회의');
    expect(eventElement).toBeInTheDocument();
  });
});

describe('월간 뷰', () => {
  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    server.resetHandlers();
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    await user.selectOptions(screen.getByLabelText('view'), 'week');

    await screen.findByText('검색 결과가 없습니다.');

    await user.selectOptions(screen.getByLabelText('view'), 'month');

    await waitFor(() => {
      const monthView = screen.getByTestId('month-view');
      expect(within(monthView).queryAllByText(/.+/).length).toBeGreaterThan(0);
    });
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const mockEvents = [
      {
        id: '1',
        title: '월간 정기 회의',
        date: '2024-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '10월 정기 회의',
        location: '대회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents as Event[]);
    setup(<App />);

    const monthView = screen.getByTestId('month-view');
    const eventElement = await within(monthView).findByText('월간 정기 회의');
    expect(eventElement).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);

    // 10월에서 1월로 이동 (9번 클릭)
    await gotoPrevMonth(user, 9);

    const monthView = screen.getByTestId('month-view');
    const holidayText = await within(monthView).findByText('신정');
    expect(holidayText).toHaveStyle({ color: expect.stringMatching(/red/) });
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    server.resetHandlers();
    toastFn.mockClear();
  });

  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const mockEvents = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents as Event[]);
    const { user } = setup(<App />);

    await searchKeyword(user, '존재하지 않는 회의');

    const noResultText = await screen.findByText('검색 결과가 없습니다.');
    expect(noResultText).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const mockEvents = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents as Event[]);
    const { user } = setup(<App />);

    await searchKeyword(user, '팀 회의');

    const eventList = screen.getByTestId('event-list');
    const eventTitle = await within(eventList).findByText('팀 회의');
    expect(eventTitle).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const mockEvents = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(mockEvents as Event[]);
    const { user } = setup(<App />);

    await searchKeyword(user, '존재하지 않는 회의');
    await screen.findByText('검색 결과가 없습니다.');

    // 검색어 삭제
    await clearSearch(user);

    const eventList = screen.getByTestId('event-list');
    const eventTitle = await within(eventList).findByText('팀 회의');
    expect(eventTitle).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  beforeEach(() => {
    server.resetHandlers();
    toastFn.mockClear();
  });

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    server.use(
      http.post('/api/events', () =>
        HttpResponse.json({ message: '일정이 겹칩니다' }, { status: 409 })
      )
    );

    const { user } = setup(<App />);

    const newEvent = {
      title: '새 회의',
      date: '2024-10-15',
      startTime: '10:30',
      endTime: '11:30',
      description: '새로운 회의',
      location: '회의실 B',
      category: '업무',
    };

    await saveSchedule(user, newEvent);

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    );
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    server.use(
      http.get('/api/events', () => {
        const mockEvents = [
          {
            id: '1',
            title: '테스트 회의',
            date: '2024-10-15',
            startTime: '09:00',
            endTime: '10:00',
            description: '팀 미팅',
            location: '회의실 B',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
        ];
        return HttpResponse.json({ events: mockEvents });
      }),
      http.put('/api/events/:id', () =>
        HttpResponse.json({ message: '일정이 겹칩니다' }, { status: 409 })
      )
    );

    const { user } = setup(<App />);

    // 초기 데이터 확인
    const eventTitles = await screen.findAllByText('테스트 회의');
    expect(eventTitles[0]).toBeInTheDocument();

    // 수정 버튼 클릭
    const editButtons = await screen.findAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    const startTimeInput = screen.getByLabelText('시작 시간');
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '10:30');

    await user.click(screen.getByTestId('event-submit-button'));

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 로딩 완료!',
        status: 'info',
      })
    );
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
      })
    );
  });

  it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
    const now = new Date();
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
    const hours = tenMinutesLater.getHours().toString().padStart(2, '0');
    const minutes = tenMinutesLater.getMinutes().toString().padStart(2, '0');

    server.use(
      http.get('/api/events', () => {
        const mockEvents = [
          {
            id: '1',
            title: '알림 테스트 회의',
            date: formatDate(tenMinutesLater),
            startTime: `${hours}:${minutes}`,
            endTime: '23:59',
            description: '알림 테스트',
            location: '회의실',
            category: '업무',
            repeat: { type: 'none', interval: 0 },
            notificationTime: 10,
          },
        ];
        return HttpResponse.json({ events: mockEvents });
      })
    );

    vi.useFakeTimers();
    setup(<App />);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('10분 후 알림 테스트 회의 일정이 시작됩니다.')).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});
