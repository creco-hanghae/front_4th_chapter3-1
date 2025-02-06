import {
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Tooltip,
  Select,
  Checkbox,
  Button,
  useToast,
  AlertDialog,
  ModalBody,
  AlertDialogContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { categories, notificationOptions } from '../constants';
import { useEventForm } from '../hooks/useEventForm';
import { Event, EventForm as EventFormType, RepeatType } from '../types';
import { findOverlappingEvents } from '../utils/eventOverlap';
import { getTimeErrorMessage } from '../utils/timeValidation';

interface EventFormProps {
  // eslint-disable-next-line no-unused-vars
  saveEvent: (eventData: Event | EventFormType) => Promise<void>;
  events: Event[];
  eventForm: ReturnType<typeof useEventForm>;
}

export const EventForm = ({ saveEvent, events, eventForm }: EventFormProps) => {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
  } = eventForm;
  const toast = useToast();
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      toast({
        title: '필수 정보를 모두 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (startTimeError || endTimeError) {
      toast({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const eventData: Event | EventFormType = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: {
        type: isRepeating ? repeatType : 'none',
        interval: repeatInterval,
        endDate: repeatEndDate || undefined,
      },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    if (overlapping.length > 0) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
    } else {
      await saveEvent(eventData);
      resetForm();
    }
  };

  return (
    <>
      <VStack w="400px" spacing={5} align="stretch">
        <Heading>{editingEvent ? '일정 수정' : '일정 추가'}</Heading>

        <FormControl>
          <FormLabel>제목</FormLabel>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormControl>

        <FormControl>
          <FormLabel>날짜</FormLabel>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FormControl>

        <HStack width="100%">
          <FormControl>
            <FormLabel>시작 시간</FormLabel>
            <Tooltip label={startTimeError} isOpen={!!startTimeError} placement="top">
              <Input
                type="time"
                value={startTime}
                onChange={handleStartTimeChange}
                onBlur={() => getTimeErrorMessage(startTime, endTime)}
                isInvalid={!!startTimeError}
              />
            </Tooltip>
          </FormControl>
          <FormControl>
            <FormLabel>종료 시간</FormLabel>
            <Tooltip label={endTimeError} isOpen={!!endTimeError} placement="top">
              <Input
                type="time"
                value={endTime}
                onChange={handleEndTimeChange}
                onBlur={() => getTimeErrorMessage(startTime, endTime)}
                isInvalid={!!endTimeError}
              />
            </Tooltip>
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel>설명</FormLabel>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormControl>

        <FormControl>
          <FormLabel>위치</FormLabel>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </FormControl>

        <FormControl>
          <FormLabel>카테고리</FormLabel>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">카테고리 선택</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>반복 설정</FormLabel>
          <Checkbox isChecked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)}>
            반복 일정
          </Checkbox>
        </FormControl>

        <FormControl>
          <FormLabel>알림 설정</FormLabel>
          <Select
            value={notificationTime}
            onChange={(e) => setNotificationTime(Number(e.target.value))}
          >
            {notificationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormControl>

        {isRepeating && (
          <VStack width="100%">
            <FormControl>
              <FormLabel>반복 유형</FormLabel>
              <Select
                value={repeatType}
                onChange={(e) => setRepeatType(e.target.value as RepeatType)}
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
                <option value="monthly">매월</option>
                <option value="yearly">매년</option>
              </Select>
            </FormControl>
            <HStack width="100%">
              <FormControl>
                <FormLabel>반복 간격</FormLabel>
                <Input
                  type="number"
                  value={repeatInterval}
                  onChange={(e) => setRepeatInterval(Number(e.target.value))}
                  min={1}
                />
              </FormControl>
              <FormControl>
                <FormLabel>반복 종료일</FormLabel>
                <Input
                  type="date"
                  value={repeatEndDate}
                  onChange={(e) => setRepeatEndDate(e.target.value)}
                />
              </FormControl>
            </HStack>
          </VStack>
        )}

        <Button data-testid="event-submit-button" onClick={addOrUpdateEvent} colorScheme="blue">
          {editingEvent ? '일정 수정' : '일정 추가'}
        </Button>
      </VStack>

      <AlertDialog
        isOpen={isOverlapDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOverlapDialogOpen(false)}
      >
        <ModalOverlay>
          <AlertDialogContent>
            <ModalHeader fontSize="lg" fontWeight="bold">
              일정 겹침 경고
            </ModalHeader>

            <ModalBody>
              다음 일정과 겹칩니다:
              {overlappingEvents.map((event) => (
                <Text key={event.id}>
                  {event.title} ({event.date} {event.startTime}-{event.endTime})
                </Text>
              ))}
              계속 진행하시겠습니까?
            </ModalBody>

            <ModalFooter>
              <Button ref={cancelRef} onClick={() => setIsOverlapDialogOpen(false)}>
                취소
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  setIsOverlapDialogOpen(false);
                  saveEvent({
                    id: editingEvent ? editingEvent.id : undefined,
                    title,
                    date,
                    startTime,
                    endTime,
                    description,
                    location,
                    category,
                    repeat: {
                      type: isRepeating ? repeatType : 'none',
                      interval: repeatInterval,
                      endDate: repeatEndDate || undefined,
                    },
                    notificationTime,
                  });
                }}
                ml={3}
              >
                계속 진행
              </Button>
            </ModalFooter>
          </AlertDialogContent>
        </ModalOverlay>
      </AlertDialog>
    </>
  );
};
