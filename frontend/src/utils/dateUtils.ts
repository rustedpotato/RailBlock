import { useState, useEffect } from 'react';

export interface WeekDayItem {
  dayName: string;
  dayNumber: number;
  formatted: string;
  isToday: boolean;
  isSunday: boolean;
  fullDateStr: string;
}

export interface RealtimeDateInfo {
  now: Date;
  weekNumber: number;
  weekNumberText: string;
  todayFormatted: string;
  todayShort: string;
  currentTimeFormatted: string;
  currentTimeIST: string;
  weekRangeShort: string;
  weekRangeFull: string;
  weekString: string;
  weekDays: WeekDayItem[];
}

export function getISOWeekNumber(d: Date = new Date()): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

export function computeRealtimeDateInfo(d: Date = new Date()): RealtimeDateInfo {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Current Day info
  const dayName = dayNames[d.getDay()];
  const dateNum = d.getDate();
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();

  const todayFormatted = `${dayName}, ${String(dateNum).padStart(2, '0')} ${monthName} ${year}`;
  const todayShort = `${String(dateNum).padStart(2, '0')} ${monthName}`;

  // Time in IST
  const timeFormatter = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const currentTimeFormatted = timeFormatter.format(d);

  const shortTimeFormatter = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const currentTimeIST = `${shortTimeFormatter.format(d)} IST`;

  // ISO Week Number
  const weekNumber = getISOWeekNumber(d);
  const weekNumberText = `Week ${weekNumber}`;

  // Find Monday of this week
  const day = d.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  // Sunday of this week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const monDate = String(monday.getDate()).padStart(2, '0');
  const sunDate = String(sunday.getDate()).padStart(2, '0');
  const monMonth = months[monday.getMonth()];
  const sunMonth = months[sunday.getMonth()];
  const sunYear = sunday.getFullYear();

  let weekRangeShort = '';
  let weekRangeFull = '';

  if (monMonth === sunMonth) {
    weekRangeShort = `${monDate} – ${sunDate} ${sunMonth}`;
    weekRangeFull = `${monDate} – ${sunDate} ${sunMonth} ${sunYear}`;
  } else {
    weekRangeShort = `${monDate} ${monMonth} – ${sunDate} ${sunMonth}`;
    weekRangeFull = `${monDate} ${monMonth} – ${sunDate} ${sunMonth} ${sunYear}`;
  }

  const weekString = `${weekNumberText} · ${weekRangeFull}`;

  // 7 days of the current week (Monday to Sunday)
  const weekDays: WeekDayItem[] = [];
  const daysOfWeekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);

    const isToday = cur.toDateString() === d.toDateString();
    const isSunday = i === 6;
    const curDateStr = String(cur.getDate()).padStart(2, '0');
    const label = daysOfWeekLabels[i];

    let formatted = `${label} ${curDateStr}`;
    if (isToday) {
      formatted = `${label} ${curDateStr} (Today)`;
    } else if (isSunday) {
      formatted = `${label} ${curDateStr} (Mega Block)`;
    }

    weekDays.push({
      dayName: label,
      dayNumber: cur.getDate(),
      formatted,
      isToday,
      isSunday,
      fullDateStr: `${curDateStr} ${months[cur.getMonth()]}`
    });
  }

  return {
    now: d,
    weekNumber,
    weekNumberText,
    todayFormatted,
    todayShort,
    currentTimeFormatted,
    currentTimeIST,
    weekRangeShort,
    weekRangeFull,
    weekString,
    weekDays
  };
}

export function useRealtimeDate(): RealtimeDateInfo {
  const [dateInfo, setDateInfo] = useState<RealtimeDateInfo>(() => computeRealtimeDateInfo(new Date()));

  useEffect(() => {
    // Update every second for live clock accuracy
    const timer = setInterval(() => {
      setDateInfo(computeRealtimeDateInfo(new Date()));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return dateInfo;
}

