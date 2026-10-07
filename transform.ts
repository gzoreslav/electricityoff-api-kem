import * as moment from 'moment-timezone';

type SlotType = 'Definite' | 'NotPlanned' | string;

type Slot = {
  start: number; // minutes from midnight
  end: number;
  type: SlotType;
};

type DaySchedule = {
  status?: string;
  slots?: Slot[];
};

type QueueSchedule = {
  today?: DaySchedule;
  tomorrow?: DaySchedule;
};

type YasnoPlannedOutages = Record<string, QueueSchedule>;

type EventItem = {
  date: string;
  startTime: string;
  endTime: string;
  provider: string;
  electricity: 'off';
  queue: string;
};

const PROVIDER_ID = 'KEM';
const GROUPS_COUNT = 60;

function minutesToTime(totalMinutes: number): string {
  const MINUTES_IN_DAY = 24 * 60;
  if (totalMinutes < 0) totalMinutes = 0;
  if (totalMinutes > MINUTES_IN_DAY) totalMinutes = MINUTES_IN_DAY;

  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const mm = String(totalMinutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function getDayEvents(
  day: DaySchedule | undefined,
  date: string,
  queue: string
): EventItem[] {
  if (!day || day.status !== 'ScheduleApplies' || !Array.isArray(day.slots)) {
    return [];
  }

  return day.slots
    .filter((slot) => slot.type === 'Definite')
    .map((slot) => ({
      date,
      startTime: minutesToTime(slot.start),
      endTime: minutesToTime(slot.end),
      provider: PROVIDER_ID,
      electricity: 'off' as const,
      queue,
    }));
}

export function transformNew(data: YasnoPlannedOutages) {
  const today = moment.tz('Europe/Kyiv').format('YYYY-MM-DD');
  const tomorrow = moment.tz('Europe/Kyiv').add(1, 'day').format('YYYY-MM-DD');

  let todayEvents: EventItem[] = [];
  let tomorrowEvents: EventItem[] = [];

  for (let group = 1; group <= GROUPS_COUNT; group++) {
    const queue = `${group}.1`;
    const queueData = data?.[queue];

    if (!queueData) continue;

    todayEvents = [
      ...todayEvents,
      ...getDayEvents(queueData.today, today, queue),
    ];
    tomorrowEvents = [
      ...tomorrowEvents,
      ...getDayEvents(queueData.tomorrow, tomorrow, queue),
    ];
  }

  return {
    events: [...todayEvents, ...tomorrowEvents],
    hasTodayData: todayEvents.length > 0,
    hasTomorrowData: tomorrowEvents.length > 0,
  };
}
