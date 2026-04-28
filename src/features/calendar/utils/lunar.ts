// Thuật toán Hồ Ngọc Đức (public domain) — chuyển Dương lịch sang Âm lịch VN (UTC+7).

function jdFromDate(dd: number, mm: number, yy: number) {
  const a = Math.floor((14 - mm) / 12)
  const y = yy + 4800 - a
  const m = mm + 12 * a - 3
  let jd =
    dd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083
  }
  return jd
}

function newMoon(k: number) {
  const T = k / 1236.85
  const T2 = T * T
  const T3 = T2 * T
  const dr = Math.PI / 180
  const Jd1 =
    2415020.75933 +
    29.53058868 * k +
    0.0001178 * T2 -
    0.000000155 * T3 +
    0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr)
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3
  const C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
    0.0021 * Math.sin(2 * dr * M) -
    0.4068 * Math.sin(Mpr * dr) +
    0.0161 * Math.sin(dr * 2 * Mpr) -
    0.0004 * Math.sin(dr * 3 * Mpr) +
    0.0104 * Math.sin(dr * 2 * F) -
    0.0051 * Math.sin(dr * (M + Mpr)) -
    0.0074 * Math.sin(dr * (M - Mpr)) +
    0.0004 * Math.sin(dr * (2 * F + M)) -
    0.0004 * Math.sin(dr * (2 * F - M)) -
    0.0006 * Math.sin(dr * (2 * F + Mpr)) +
    0.001 * Math.sin(dr * (2 * F - Mpr)) +
    0.0005 * Math.sin(dr * (2 * Mpr + M))
  const deltat =
    T < -11
      ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
      : -0.000278 + 0.000265 * T + 0.000262 * T2
  return Jd1 + C1 - deltat
}

function sunLongitude(jdn: number) {
  const T = (jdn - 2451545.0) / 36525
  const T2 = T * T
  const dr = Math.PI / 180
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2
  const DL =
    (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M) +
    (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) +
    0.00029 * Math.sin(dr * 3 * M)
  let L = L0 + DL
  L = L * dr
  L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2))
  return Math.floor((L / Math.PI) * 6)
}

function getNewMoonDay(k: number, timezone: number) {
  return Math.floor(newMoon(k) + 0.5 + timezone / 24)
}

function getLunarMonth11(yy: number, tz: number) {
  const off = jdFromDate(31, 12, yy) - 2415021
  const k = Math.floor(off / 29.530588853)
  let nm = getNewMoonDay(k, tz)
  const sunLong = sunLongitude(nm + 0.5 - tz / 24)
  if (sunLong >= 9) nm = getNewMoonDay(k - 1, tz)
  return nm
}

function getLeapMonthOffset(a11: number, tz: number) {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5)
  let last = 0
  let i = 1
  let arc = sunLongitude(getNewMoonDay(k + i, tz) + 0.5 - tz / 24)
  do {
    last = arc
    i += 1
    arc = sunLongitude(getNewMoonDay(k + i, tz) + 0.5 - tz / 24)
  } while (arc !== last && i < 14)
  return i - 1
}

export interface LunarDate {
  day: number
  month: number
  year: number
  leap: boolean
}

export function toLunarDate(date: Date, tz = 7): LunarDate {
  const dd = date.getDate()
  const mm = date.getMonth() + 1
  const yy = date.getFullYear()
  const dayNumber = jdFromDate(dd, mm, yy)
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853)
  let monthStart = getNewMoonDay(k + 1, tz)
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k, tz)
  let a11 = getLunarMonth11(yy, tz)
  let b11 = a11
  let lunarYear
  if (a11 >= monthStart) {
    lunarYear = yy
    a11 = getLunarMonth11(yy - 1, tz)
  } else {
    lunarYear = yy + 1
    b11 = getLunarMonth11(yy + 1, tz)
  }
  const lunarDay = dayNumber - monthStart + 1
  const diff = Math.floor((monthStart - a11) / 29)
  let lunarLeap = false
  let lunarMonth = diff + 11
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, tz)
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10
      if (diff === leapMonthDiff) lunarLeap = true
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap: lunarLeap }
}

export const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi']
export const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý']

export function canChiYear(lunarYear: number): string {
  return `${CAN[(lunarYear + 6) % 10]} ${CHI[(lunarYear + 8) % 12]}`
}

export const HOANG_DAO_BY_MONTH: Record<number, number[]> = {
  1: [0, 1, 3, 6, 8, 9],
  7: [0, 1, 3, 6, 8, 9],
  2: [2, 3, 5, 8, 10, 11],
  8: [2, 3, 5, 8, 10, 11],
  3: [4, 5, 7, 10, 0, 1],
  9: [4, 5, 7, 10, 0, 1],
  4: [6, 7, 9, 0, 2, 3],
  10: [6, 7, 9, 0, 2, 3],
  5: [8, 9, 11, 2, 4, 5],
  11: [8, 9, 11, 2, 4, 5],
  6: [10, 11, 1, 4, 6, 7],
  12: [10, 11, 1, 4, 6, 7],
}

export interface ZodiacHour {
  index: number
  name: string
  start: number
  end: number
  good: boolean
}

export function zodiacHours(lunarMonth: number): ZodiacHour[] {
  const good = new Set(HOANG_DAO_BY_MONTH[lunarMonth] ?? [])
  return Array.from({ length: 12 }, (_, i) => ({
    index: i,
    name: CHI[i]!,
    start: (i * 2 + 23) % 24,
    end: (i * 2 + 1) % 24,
    good: good.has(i),
  }))
}

export interface MoonPhaseInfo {
  name: string
  icon: string
  illumination: number
  ageDays: number
}

export function moonPhase(date: Date): MoonPhaseInfo {
  const knownNew = Date.UTC(2000, 0, 6, 18, 14) / 86400000
  const daysSince = date.getTime() / 86400000 - knownNew
  const cycle = 29.53058868
  const age = ((daysSince % cycle) + cycle) % cycle
  const illum = Math.round(((1 - Math.cos((age / cycle) * 2 * Math.PI)) / 2) * 100)
  let name = 'Trăng non'
  let icon = '🌑'
  if (age < 1.84) { name = 'Trăng non'; icon = '🌑' }
  else if (age < 5.53) { name = 'Lưỡi liềm non'; icon = '🌒' }
  else if (age < 9.22) { name = 'Thượng huyền'; icon = '🌓' }
  else if (age < 12.91) { name = 'Trăng khuyết đầu'; icon = '🌔' }
  else if (age < 16.61) { name = 'Trăng tròn'; icon = '🌕' }
  else if (age < 20.30) { name = 'Trăng khuyết cuối'; icon = '🌖' }
  else if (age < 23.99) { name = 'Hạ huyền'; icon = '🌗' }
  else if (age < 27.68) { name = 'Lưỡi liềm già'; icon = '🌘' }
  return { name, icon, illumination: illum, ageDays: Math.round(age * 10) / 10 }
}
