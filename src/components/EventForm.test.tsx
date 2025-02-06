// EventForm.test.tsx
import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { EventForm } from './EventForm';
import { Event } from '../types';

const mockToast = vi.fn();

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<object>('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

const mockResetForm = vi.fn();

const useEventForm = vi.fn(() => {
  return {
    title: '',
    setTitle: vi.fn(),
    date: '',
    setDate: vi.fn(),
    startTime: '',
    endTime: '',
    description: '',
    setDescription: vi.fn(),
    location: '',
    setLocation: vi.fn(),
    category: '',
    setCategory: vi.fn(),
    isRepeating: false,
    setIsRepeating: vi.fn(),
    repeatType: 'daily',
    setRepeatType: vi.fn(),
    repeatInterval: 1,
    setRepeatInterval: vi.fn(),
    repeatEndDate: '',
    setRepeatEndDate: vi.fn(),
    notificationTime: 10,
    setNotificationTime: vi.fn(),
    startTimeError: null,
    endTimeError: null,
    editingEvent: null,
    handleStartTimeChange: vi.fn(),
    handleEndTimeChange: vi.fn(),
    resetForm: mockResetForm,
  };
});

vi.mock('../hooks/useEventForm', () => {
  return {
    useEventForm,
  };
});

describe('EventForm Component (Vitest)', () => {
  const mockSaveEvent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('필수 필드 없이 제출 시, 에러 토스트가 호출된다.', async () => {
    const eventForm = useEventForm();
    render(
      <ChakraProvider>
        <EventForm
          saveEvent={mockSaveEvent}
          events={[]}
          // FIXME: any 고치기
          eventForm={eventForm as any}
        />
      </ChakraProvider>
    );

    const submitButton = screen.getByTestId('event-submit-button');
    await userEvent.click(submitButton);

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
      })
    );
    expect(mockSaveEvent).not.toHaveBeenCalled();
  });

  it('겹치는 이벤트가 존재할 경우 Overlap Dialog가 표시된다.', async () => {
    const existingEvent: Event = {
      id: '1',
      title: 'Existing Event',
      date: '2025-01-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    useEventForm.mockReturnValue({
      ...useEventForm(),
      title: 'New Event',
      date: '2025-01-01',
      startTime: '09:30',
      endTime: '10:00',
    });

    const eventForm = useEventForm();

    render(
      <ChakraProvider>
        <EventForm
          saveEvent={mockSaveEvent}
          events={[existingEvent]}
          // FIXME: any 고치기
          eventForm={eventForm as any}
        />
      </ChakraProvider>
    );

    const submitButton = screen.getByTestId('event-submit-button');
    await userEvent.click(submitButton);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    expect(screen.getByText('Existing Event (2025-01-01 09:00-10:00)')).toBeInTheDocument();

    const proceedButton = screen.getByText('계속 진행');
    await userEvent.click(proceedButton);

    await waitFor(() => {
      expect(mockSaveEvent).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
    });
  });
});
