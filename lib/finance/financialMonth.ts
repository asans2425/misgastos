export type FinancialMonthLabelMode = "next" | "same";

type FinancialMonthSettings = {
  labelMode?: FinancialMonthLabelMode | null;
  startDay?: number | null;
};

function clampStartDay(value?: number | null) {
  if (!value || !Number.isFinite(value)) {
    return 1;
  }

  return Math.min(Math.max(Math.trunc(value), 1), 31);
}

function resolveLabelMode(
  startDay: number,
  labelMode?: FinancialMonthLabelMode | null,
) {
  if (startDay >= 16) {
    return "next";
  }

  return labelMode ?? "same";
}

function clampDayToMonth(year: number, monthIndex: number, day: number) {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();

  return Math.min(day, lastDay);
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(`${value}T00:00:00`);
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function getFinancialMonthKey(
  value: Date | string = new Date(),
  settings: FinancialMonthSettings = {},
) {
  const date = toDate(value);
  const startDay = clampStartDay(settings.startDay);
  const labelMode = resolveLabelMode(startDay, settings.labelMode);

  if (startDay === 1) {
    return toMonthKey(date);
  }

  const startsNewCycle = date.getDate() >= startDay;

  if (labelMode === "next") {
    return startsNewCycle ? toMonthKey(addMonths(date, 1)) : toMonthKey(date);
  }

  return startsNewCycle ? toMonthKey(date) : toMonthKey(addMonths(date, -1));
}

export function getFinancialMonthRange(
  month: string,
  settings: FinancialMonthSettings = {},
) {
  const [year, monthNumber] = month.split("-").map(Number);
  const startDay = clampStartDay(settings.startDay);
  const labelMode = resolveLabelMode(startDay, settings.labelMode);

  if (startDay === 1) {
    const start = new Date(year, monthNumber - 1, 1);
    const end = new Date(year, monthNumber, 0);

    return {
      end: formatDateKey(end),
      start: formatDateKey(start),
    };
  }

  const startMonthOffset = labelMode === "next" ? -1 : 0;
  const startMonth = new Date(year, monthNumber - 1 + startMonthOffset, 1);
  const start = new Date(
    startMonth.getFullYear(),
    startMonth.getMonth(),
    clampDayToMonth(startMonth.getFullYear(), startMonth.getMonth(), startDay),
  );
  const nextStartMonth = new Date(
    startMonth.getFullYear(),
    startMonth.getMonth() + 1,
    1,
  );
  const nextStart = new Date(
    nextStartMonth.getFullYear(),
    nextStartMonth.getMonth(),
    clampDayToMonth(
      nextStartMonth.getFullYear(),
      nextStartMonth.getMonth(),
      startDay,
    ),
  );
  const end = new Date(nextStart);

  end.setDate(end.getDate() - 1);

  return {
    end: formatDateKey(end),
    start: formatDateKey(start),
  };
}

export function getDateForFinancialMonthDay(
  month: string,
  dayOfMonth: number,
  settings: FinancialMonthSettings = {},
) {
  const [year, monthNumber] = month.split("-").map(Number);
  const startDay = clampStartDay(settings.startDay);
  const labelMode = resolveLabelMode(startDay, settings.labelMode);
  const day = clampStartDay(dayOfMonth);
  const baseMonthOffset =
    startDay === 1
      ? 0
      : labelMode === "next"
        ? day >= startDay
          ? -1
          : 0
        : day >= startDay
          ? 0
          : 1;
  const targetMonth = new Date(year, monthNumber - 1 + baseMonthOffset, 1);
  const targetDay = clampDayToMonth(
    targetMonth.getFullYear(),
    targetMonth.getMonth(),
    day,
  );

  return formatDateKey(
    new Date(targetMonth.getFullYear(), targetMonth.getMonth(), targetDay),
  );
}
