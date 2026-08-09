'use client';

import { useState, useEffect } from 'react';

// ===== Supabase 연결 설정 =====
const SUPABASE_URL = 'https://wavnjbrxlfbzoyfnvitn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DssDmObagqPE8p6XLNaxcw_ufdr_ZeG';

// 대한민국 공휴일 + 대체공휴일 (2026~2030)
const HOLIDAYS: Record<string, string> = {
  '2026-01-01': '신정', '2026-02-16': '설날', '2026-02-17': '설날', '2026-02-18': '설날',
  '2026-03-01': '삼일절', '2026-03-02': '삼일절 대체', '2026-05-05': '어린이날',
  '2026-05-24': '부처님오신날', '2026-05-25': '부처님오신날 대체', '2026-06-06': '현충일',
  '2026-08-15': '광복절', '2026-09-24': '추석', '2026-09-25': '추석', '2026-09-26': '추석',
  '2026-10-03': '개천절', '2026-10-09': '한글날', '2026-12-25': '크리스마스',
  '2027-01-01': '신정', '2027-02-06': '설날', '2027-02-07': '설날', '2027-02-08': '설날',
  '2027-02-09': '설날 대체', '2027-03-01': '삼일절', '2027-05-05': '어린이날',
  '2027-05-13': '부처님오신날', '2027-06-06': '현충일', '2027-08-15': '광복절',
  '2027-08-16': '광복절 대체', '2027-09-14': '추석', '2027-09-15': '추석', '2027-09-16': '추석',
  '2027-10-03': '개천절', '2027-10-04': '개천절 대체', '2027-10-09': '한글날',
  '2027-12-25': '크리스마스', '2027-12-27': '크리스마스 대체',
  '2028-01-01': '신정', '2028-01-26': '설날', '2028-01-27': '설날', '2028-01-28': '설날',
  '2028-03-01': '삼일절', '2028-05-02': '부처님오신날', '2028-05-05': '어린이날',
  '2028-06-06': '현충일', '2028-08-15': '광복절', '2028-10-02': '추석', '2028-10-03': '추석',
  '2028-10-04': '추석', '2028-10-09': '한글날', '2028-12-25': '크리스마스',
  '2029-01-01': '신정', '2029-02-12': '설날', '2029-02-13': '설날', '2029-02-14': '설날',
  '2029-03-01': '삼일절', '2029-05-05': '어린이날', '2029-05-07': '어린이날 대체',
  '2029-05-20': '부처님오신날', '2029-05-21': '부처님오신날 대체', '2029-06-06': '현충일',
  '2029-08-15': '광복절', '2029-09-21': '추석', '2029-09-22': '추석', '2029-09-23': '추석',
  '2029-09-24': '추석 대체', '2029-10-03': '개천절', '2029-10-09': '한글날', '2029-12-25': '크리스마스',
  '2030-01-01': '신정', '2030-02-02': '설날', '2030-02-03': '설날', '2030-02-04': '설날',
  '2030-02-05': '설날 대체', '2030-03-01': '삼일절', '2030-05-05': '어린이날',
  '2030-05-06': '어린이날 대체', '2030-05-09': '부처님오신날', '2030-06-06': '현충일',
  '2030-08-15': '광복절', '2030-09-11': '추석', '2030-09-12': '추석', '2030-09-13': '추석',
  '2030-10-03': '개천절', '2030-10-09': '한글날', '2030-12-25': '크리스마스',
};

// 사람별 고정 과일 이모지 (4등 이하일 때 이름 앞에 표시)
const WORKER_EMOJI: Record<string, string> = {
  '이다운': '🍒', '김지혜': '🍓', '임태학': '🫐', '임민호': '🍊',
  '유윤석': '🍇', '임동명': '🍌', '성백은': '🍑',
  '김진우': '🍈', '문정학': '🥭', '현석': '🍍', '김주표': '🥥',
  '김경훈': '🍐', '김정우': '🍋',
};

// 명단에 없는 신규 인원용 자동 배정 이모지 풀 (과일 먼저, 부족하면 채소·기타)
// 이름 기반으로 배정하므로 같은 사람은 항상 같은 이모지가 나옴
const AUTO_EMOJI_POOL: string[] = [
  // 안 쓴 과일 먼저 (퇴직자 반납분 포함)
  '🥝', '🥑', '🍎', '🍏', '🍅', '🫒', '🍉', '🍇', '🍓',
  // 채소
  '🥕', '🌽', '🥒', '🫑', '🥔', '🧅', '🧄', '🍆', '🥦', '🥬', '🍄',
  // 동물 (그래도 부족하면)
  '🐶', '🐱', '🐰', '🐻', '🐼', '🦊', '🐯', '🦁', '🐸', '🐵',
  '🐷', '🐮', '🐔', '🐧', '🐦', '🦄', '🐢', '🐳', '🐙', '🦋',
];

// 이름을 숫자로 (같은 이름 → 항상 같은 값)
function nameToNumber(name: string): number {
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i) * (i + 1);
  }
  return sum;
}

// 신규 인원 이모지 자동 배정 (이름 기반, 지정 과일과 안 겹치게)
function getAutoEmoji(name: string): string {
  // 이미 쓰이는 지정 이모지들은 제외한 풀 만들기
  const used = new Set(Object.values(WORKER_EMOJI));
  used.add('🐶'); used.add('🐾'); // 김대원용도 제외
  const available = AUTO_EMOJI_POOL.filter((e) => !used.has(e));
  const pool = available.length > 0 ? available : AUTO_EMOJI_POOL;
  const idx = nameToNumber(name) % pool.length;
  return pool[idx];
}

// 정산 기간 계산: 어떤 날짜가 속한 26일~다음달25일 기간 반환
function getBillingPeriod(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  let startYear: number, startMonth: number;
  if (day >= 26) {
    startYear = year;
    startMonth = month;
  } else {
    startYear = month === 0 ? year - 1 : year;
    startMonth = month === 0 ? 11 : month - 1;
  }
  const start = new Date(startYear, startMonth, 26);
  const end = new Date(startYear, startMonth + 1, 25);
  const fmt = (dt: Date) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };
  // 정산월 이름 = 종료일이 속한 달 기준 (6/26~7/25 → "7월 정산")
  // 하준님 회사: 7/25까지 물량을 그 다음 달에 급여로 받으므로 종료월로 표기
  const endDate = new Date(startYear, startMonth + 1, 25);
  const labelYear = endDate.getFullYear();
  const labelMonth = endDate.getMonth() + 1;
  return {
    start: fmt(start),
    end: fmt(end),
    label: `${labelYear}년 ${labelMonth}월 정산`,
  };
}

// 정산월 달력 컴포넌트 (26일 시작, 화살표로 월 넘김)
function BillingCalendar({
  dates,
  showSummary = true,
  detailLabel,
  colorByVolume = false,
  showTripSummary = false,
}: {
  dates: { date: string; vol: number; routes?: { route: string; vol: number }[]; workers?: { name: string; vol: number }[]; trip1?: number; trip2?: number; trip1Time?: string; trip2Time?: string }[];
  showSummary?: boolean;
  detailLabel?: 'route' | 'worker'; // 날짜 클릭 시 상세 종류 (route=노선별, worker=담당자별)
  colorByVolume?: boolean; // 물량에 따라 박스 색 (전체 물량 달력용)
  showTripSummary?: boolean; // 날짜 클릭 시 1차/2차 요약 (전체 물량 달력용)
}) {
  // 로컬 날짜를 YYYY-MM-DD로 (toISOString은 UTC 변환으로 날짜가 밀릴 수 있어 사용 안 함)
  const fmtLocal = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // 물량별 박스 색 (colorByVolume일 때만): 하(노랑)/중(초록)/상(주황)/최상(빨강)
  const volStyle = (v: number): { bg: string; color: string } => {
    if (!colorByVolume) {
      return { bg: 'linear-gradient(135deg, #e8d48f, #c9a227)', color: '#1a1407' }; // 기본 금색
    }
    if (v < 4000) return { bg: 'linear-gradient(135deg, #e8d48f, #c9a227)', color: '#3a2f07' }; // 하 - 금/노랑
    if (v < 4500) return { bg: 'linear-gradient(135deg, #9ed488, #6a9e52)', color: '#12300a' }; // 중 - 초록
    if (v < 5000) return { bg: 'linear-gradient(135deg, #eaa866, #c47e2c)', color: '#3a2007' }; // 상 - 주황
    return { bg: 'linear-gradient(135deg, #e88072, #c44432)', color: '#3a0a07' }; // 최상 - 빨강
  };

  const displayNm = (n: string) => (n === '김대원' ? '빛나는대원' : n);

  // 날짜별 물량 + 상세를 map으로
  const volMap: Record<string, number> = {};
  const detailMap: Record<string, { route: string; vol: number }[] | { name: string; vol: number }[]> = {};
  const tripMap: Record<string, { trip1: number; trip2: number; trip1Time: string; trip2Time: string }> = {};
  dates.forEach((d) => {
    volMap[d.date] = d.vol;
    if (d.routes) detailMap[d.date] = d.routes;
    else if (d.workers) detailMap[d.date] = d.workers;
    if (d.trip1 !== undefined || d.trip2 !== undefined) {
      tripMap[d.date] = { trip1: d.trip1 || 0, trip2: d.trip2 || 0, trip1Time: d.trip1Time || '', trip2Time: d.trip2Time || '' };
    }
  });

  // 클릭해서 상세 펼친 날짜
  const [openDate, setOpenDate] = useState<string | null>(null);

  // 데이터가 있는 정산월들 목록 만들기 (중복 제거, 정렬)
  const periodsSet = new Set<string>();
  dates.forEach((d) => {
    const p = getBillingPeriod(d.date);
    periodsSet.add(p.start); // 정산월 시작일로 식별
  });
  const periodStarts = Array.from(periodsSet).sort();

  // 현재 보고 있는 정산월 인덱스 (기본: 가장 최근 = 마지막)
  const [idx, setIdx] = useState(periodStarts.length - 1);

  if (periodStarts.length === 0) return null;

  const curStart = periodStarts[Math.min(idx, periodStarts.length - 1)];
  const period = getBillingPeriod(curStart);
  const startDate = new Date(period.start + 'T00:00:00');
  const endDate = new Date(period.end + 'T00:00:00');

  // 이 정산월의 합계/근무일
  let monthTotal = 0;
  let monthDays = 0;
  const cur0 = new Date(startDate);
  while (cur0 <= endDate) {
    const key = fmtLocal(cur0);
    if (volMap[key]) { monthTotal += volMap[key]; monthDays++; }
    cur0.setDate(cur0.getDate() + 1);
  }

  // 달력 셀 구성
  const dowNames = ['일', '월', '화', '수', '목', '금', '토'];
  const cells: any[] = [];
  // 시작 요일만큼 빈칸
  const startDow = startDate.getDay();
  for (let i = 0; i < startDow; i++) {
    cells.push(<div key={'e' + i} />);
  }
  const cur = new Date(startDate);
  while (cur <= endDate) {
    const key = fmtLocal(cur);
    const dow = cur.getDay();
    const vol = volMap[key];
    const holiday = HOLIDAYS[key];
    const isRed = dow === 0 || !!holiday;
    const isBlue = dow === 6 && !holiday;
    const dateColor = isRed ? '#e0574f' : isBlue ? '#5a8ad9' : vol ? '#e8d48f' : '#7a7a72';

    const hasDetail = !!vol && ((!!detailLabel && !!detailMap[key]) || (showTripSummary && !!tripMap[key]));
    const isOpen = openDate === key;

    cells.push(
      <div
        key={key}
        onClick={() => { if (hasDetail) setOpenDate(isOpen ? null : key); }}
        style={{
          aspectRatio: '0.8 / 1',
          borderRadius: '10px',
          padding: '0.35rem 0.15rem 0.3rem',
          boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          position: 'relative',
          cursor: hasDetail ? 'pointer' : 'default',
          background: isOpen
            ? 'linear-gradient(160deg, rgba(201,162,39,0.35), rgba(201,162,39,0.12))'
            : vol
            ? 'linear-gradient(160deg, rgba(201,162,39,0.16), rgba(201,162,39,0.05))'
            : 'rgba(255,255,255,0.02)',
          border: isOpen
            ? '1.5px solid rgba(201,162,39,0.7)'
            : vol ? '1px solid rgba(201,162,39,0.35)' : '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {holiday && (
          <div
            style={{
              position: 'absolute', top: '4px', right: '5px',
              width: '5px', height: '5px', borderRadius: '50%', background: '#e0574f',
            }}
            title={holiday}
          />
        )}
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: dateColor, lineHeight: 1 }}>
          {cur.getDate()}
        </div>
        {vol ? (
          <div
            style={{
              fontSize: '0.72rem', fontWeight: 800,
              color: volStyle(vol).color,
              background: volStyle(vol).bg,
              borderRadius: '5px', padding: '2px 0',
              width: '100%', maxWidth: '100%',
              textAlign: 'center', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2,
              overflow: 'hidden', whiteSpace: 'nowrap',
            }}
          >
            {vol.toLocaleString()}
          </div>
        ) : (
          <div style={{ height: '18px' }} />
        )}
      </div>
    );
    cur.setDate(cur.getDate() + 1);
  }

  const canPrev = idx > 0;
  const canNext = idx < periodStarts.length - 1;

  return (
    <div>
      {/* 월 넘김 헤더 */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)',
          borderRadius: '12px', padding: '0.6rem 0.9rem', marginBottom: '0.8rem',
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); if (canPrev) setIdx(idx - 1); }}
          disabled={!canPrev}
          style={{
            background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.4)',
            color: '#e8d48f', width: '38px', height: '38px', borderRadius: '10px',
            fontSize: '1.2rem', fontWeight: 800, cursor: canPrev ? 'pointer' : 'default',
            opacity: canPrev ? 1 : 0.25,
          }}
        >
          ‹
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#e8d48f' }}>{period.label}</div>
          <div style={{ fontSize: '0.7rem', color: '#8a8a82', marginTop: '2px' }}>
            {period.start.slice(5).replace('-', '/')} ~ {period.end.slice(5).replace('-', '/')}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); if (canNext) setIdx(idx + 1); }}
          disabled={!canNext}
          style={{
            background: 'rgba(201,162,39,0.15)', border: '1px solid rgba(201,162,39,0.4)',
            color: '#e8d48f', width: '38px', height: '38px', borderRadius: '10px',
            fontSize: '1.2rem', fontWeight: 800, cursor: canNext ? 'pointer' : 'default',
            opacity: canNext ? 1 : 0.25,
          }}
        >
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', marginBottom: '5px' }}>
        {dowNames.map((d, i) => (
          <div
            key={d}
            style={{
              textAlign: 'center', fontSize: '0.75rem', fontWeight: 800,
              color: i === 0 ? '#e0574f' : i === 6 ? '#5a8ad9' : '#9a9a92',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
        {cells}
      </div>

      {/* 선택한 날 상세 (노선별 또는 담당자별) */}
      {openDate && detailMap[openDate] && (
        <div
          style={{
            marginTop: '0.9rem',
            padding: '0.9rem',
            borderRadius: '12px',
            background: 'rgba(201,162,39,0.08)',
            border: '1px solid rgba(201,162,39,0.3)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#e8d48f', fontWeight: 700, marginBottom: '0.6rem' }}>
            {(() => {
              const dt = new Date(openDate + 'T00:00:00');
              const wd = ['일', '월', '화', '수', '목', '금', '토'][dt.getDay()];
              const hol = HOLIDAYS[openDate];
              return `${dt.getMonth() + 1}/${dt.getDate()}(${wd})${hol ? ' · ' + hol : ''} — ${detailLabel === 'route' ? '노선별' : '담당자별'}`;
            })()}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {(detailMap[openDate] as any[]).map((item, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.85rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(201,162,39,0.25)',
                  borderRadius: '8px',
                  padding: '0.35rem 0.7rem',
                  color: '#d8d4c8',
                }}
              >
                {detailLabel === 'route' ? item.route : displayNm(item.name)}{' '}
                <b style={{ color: '#e8d48f' }}>{item.vol.toLocaleString()}</b>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 선택한 날 1차/2차 요약 (전체 물량 달력용) */}
      {openDate && showTripSummary && tripMap[openDate] && (
        <div
          style={{
            marginTop: '0.9rem',
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(201,162,39,0.08)',
            border: '1px solid rgba(201,162,39,0.3)',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#e8d48f', fontWeight: 700, marginBottom: '0.8rem' }}>
            {(() => {
              const dt = new Date(openDate + 'T00:00:00');
              const wd = ['일', '월', '화', '수', '목', '금', '토'][dt.getDay()];
              const hol = HOLIDAYS[openDate];
              return `${dt.getMonth() + 1}/${dt.getDate()}(${wd})${hol ? ' · ' + hol : ''}`;
            })()}
          </div>
          {(() => {
            const t = tripMap[openDate];
            const total = t.trip1 + t.trip2;
            const ratio1 = total > 0 ? ((t.trip1 / total) * 100).toFixed(1) : '0.0';
            const ratio2 = total > 0 ? ((t.trip2 / total) * 100).toFixed(1) : '0.0';
            const hasTrip2 = t.trip2 > 0;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.6rem', textAlign: 'center', border: '1px solid rgba(201,162,39,0.2)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a8a82' }}>1차</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e8d48f', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                      {t.trip1.toLocaleString()}
                    </div>
                    {t.trip1Time && (
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7fc8e8', marginTop: '2px' }}>
                        🕐 {t.trip1Time}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.6rem', textAlign: 'center', border: '1px solid rgba(201,162,39,0.2)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a8a82' }}>2차</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: hasTrip2 ? '#e8d48f' : '#6a6a62', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                      {hasTrip2 ? t.trip2.toLocaleString() : '없음'}
                    </div>
                    {hasTrip2 && t.trip2Time && (
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7fc8e8', marginTop: '2px' }}>
                        🕐 {t.trip2Time}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.6rem', textAlign: 'center', border: '1px solid rgba(201,162,39,0.2)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a8a82' }}>총합</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e8d48f', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                      {total.toLocaleString()}
                    </div>
                  </div>
                </div>
                {hasTrip2 && (
                  <div style={{ textAlign: 'center', marginTop: '0.2rem' }}>
                    <div style={{ fontSize: '0.72rem', color: '#8a8a82' }}>비율</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e8d48f', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                      {ratio1}% / {ratio2}%
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 물량 색 범례 (colorByVolume일 때만) */}
      {colorByVolume && (
        <div
          style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.9rem',
            justifyContent: 'center', alignItems: 'center',
            marginTop: '0.9rem', paddingTop: '0.9rem',
            borderTop: '1px solid rgba(201,162,39,0.15)',
          }}
        >
          {[
            { label: '하', bg: 'linear-gradient(135deg, #e8d48f, #c9a227)' },
            { label: '중', bg: 'linear-gradient(135deg, #9ed488, #6a9e52)' },
            { label: '상', bg: 'linear-gradient(135deg, #eaa866, #c47e2c)' },
            { label: '최상', bg: 'linear-gradient(135deg, #e88072, #c44432)' },
          ].map((it) => (
            <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: it.bg }} />
              <span style={{ fontSize: '0.8rem', color: '#b8b4a8', fontWeight: 700 }}>{it.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* 이 달 요약 */}
      {showSummary ? (
        <div
          style={{
            display: 'flex', justifyContent: 'space-around',
            marginTop: '0.9rem', paddingTop: '0.9rem',
            borderTop: '1px solid rgba(201,162,39,0.15)', textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: '#8a8a82' }}>이 달 합계</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e8d48f', marginTop: '3px', fontVariantNumeric: 'tabular-nums' }}>
              {monthTotal.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#8a8a82' }}>근무일</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e8d48f', marginTop: '3px' }}>{monthDays}일</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#8a8a82' }}>하루 평균</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e8d48f', marginTop: '3px', fontVariantNumeric: 'tabular-nums' }}>
              {monthDays > 0 ? Math.round(monthTotal / monthDays).toLocaleString() : '-'}
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            marginTop: '0.9rem', paddingTop: '0.9rem',
            borderTop: '1px solid rgba(201,162,39,0.15)', textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#8a8a82' }}>이 달 합계</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e8d48f', marginTop: '3px', fontVariantNumeric: 'tabular-nums' }}>
            {monthTotal.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SmartTripAnalyzer() {
  const [trip1Data, setTrip1Data] = useState('');
  const [trip2Data, setTrip2Data] = useState('');
  const [scheduleData, setScheduleData] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  // 월간 누적 합계 상태
  const [monthlyData, setMonthlyData] = useState<any>(null);

  // 오늘 분석 탭: 전체 날짜별 총 물량 (달력용)
  const [allDatesData, setAllDatesData] = useState<{ date: string; vol: number; trip1?: number; trip2?: number; trip1Time?: string; trip2Time?: string }[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // 공유 입력 상태
  const [shareStatus, setShareStatus] = useState<string>('');
  const [sharedInfo, setSharedInfo] = useState<{ by: string; at: string } | null>(null);

  // 탭 상태: 'analyze' | 'worker' | 'route' | 'delete'
  const [activeTab, setActiveTab] = useState<'analyze' | 'worker' | 'route' | 'delete'>('analyze');

  // 데이터 삭제 관련 상태
  const [deleteDate, setDeleteDate] = useState('');
  const [deletePreview, setDeletePreview] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string>('');

  // 검색 기간 (기본: 이번 정산월)
  const todayStr = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  })();
  const defaultPeriod = getBillingPeriod(todayStr);
  const [searchStart, setSearchStart] = useState(defaultPeriod.start);
  const [searchEnd, setSearchEnd] = useState(defaultPeriod.end);

  // 검색 결과
  const [workerSearchResult, setWorkerSearchResult] = useState<any>(null);
  const [routeSearchResult, setRouteSearchResult] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // 인원별 검색에서 펼친 사람 (날짜별 상세 보기)
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null);
  // 노선별 검색에서 펼친 노선 (날짜별 상세 보기)
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  // ✅ 이름 표시 변환 (화면에만 적용, 복사는 원래 이름 유지)
  const displayName = (name: string) => {
    if (name === '김대원') return '빛나는대원';
    return name;
  };

  // ✅ 입력값 자동 불러오기
  useEffect(() => {
    // 1) 먼저 로컬 저장값으로 채움 (오프라인 대비)
    try {
      const saved = localStorage.getItem('smarttrip_inputs');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.scheduleData) setScheduleData(data.scheduleData);
        if (data.trip1Data) setTrip1Data(data.trip1Data);
        if (data.trip2Data) setTrip2Data(data.trip2Data);
      }
    } catch {}

    // 2) 클라우드에서 가장 최근 공유 내용 자동 불러오기 (통째로 덮어씀)
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/shared_input?select=schedule_data,trip1_data,trip2_data,updated_at&order=updated_at.desc&limit=1`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
          }
        );
        if (res.ok) {
          const rows = await res.json();
          if (rows && rows.length > 0) {
            const d = rows[0];
            // 공유 내용으로 통째로 덮어씀 (빈 칸이면 빈 채로 → 다른 기기에서 비운 게 반영됨)
            setScheduleData(d.schedule_data || '');
            setTrip1Data(d.trip1_data || '');
            setTrip2Data(d.trip2_data || '');
          }
        }
      } catch {}
      setLoaded(true);
    })();
    // 전체 날짜별 총 물량도 불러오기 (달력용)
    loadAllDates();
  }, []);

  // ✅ 입력값 자동 저장 (로컬)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(
        'smarttrip_inputs',
        JSON.stringify({ scheduleData, trip1Data, trip2Data })
      );
    } catch {}
  }, [scheduleData, trip1Data, trip2Data, loaded]);

  // ✅ 입력 초기화
  const resetInputs = () => {
    if (!confirm('입력한 내용을 모두 지울까요?')) return;
    setScheduleData('');
    setTrip1Data('');
    setTrip2Data('');
    setResult(null);
    setTargetDate('');
    try {
      localStorage.removeItem('smarttrip_inputs');
    } catch {}
  };

  const extractDate = (text: string) => {
    if (!text || typeof text !== 'string') return null;

    const dotMatch = text.match(/(\d{2,4})\.(\d{1,2})\.(\d{1,2})/);
    if (dotMatch) {
      let year = dotMatch[1];
      const month = dotMatch[2].padStart(2, '0');
      const day = dotMatch[3].padStart(2, '0');
      if (year.length === 2) year = '20' + year;
      return year + '-' + month + '-' + day;
    }

    const koreanMatch = text.match(/(\d{1,2})월\s*(\d{1,2})일/);
    if (koreanMatch) {
      const month = koreanMatch[1].padStart(2, '0');
      const day = koreanMatch[2].padStart(2, '0');
      const now = new Date();
      let targetYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const inputMonth = parseInt(koreanMatch[1]);
      if (currentMonth === 12 && inputMonth <= 3) targetYear++;
      else if (currentMonth <= 3 && inputMonth >= 10) targetYear--;
      return targetYear + '-' + month + '-' + day;
    }

    return null;
  };

  // ✅ 유연한 수량 인식: 공백/탭/파이프 무엇이든, 구역코드 중간 공백도 인식
  const parseVolumeData = (text: string) => {
    const lines = text.trim().split('\n');
    const volumes: Record<string, number> = {};
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (
        trimmed.includes('B&M') ||
        trimmed.includes('캠도물량') ||
        trimmed.includes('Trip')
      )
        return;

      const match = trimmed.match(/^(.+?)[\s|]+(\d+)\s*$/);
      if (!match) return;

      const code = match[1].replace(/[\s|]+/g, '');
      const vol = parseInt(match[2]) || 0;

      if (!code || /^\d+$/.test(code)) return;

      volumes[code] = vol;
    });
    return volumes;
  };

  const parseScheduleData = (text: string) => {
    const lines = text.trim().split('\n');
    const schedule: Record<string, string[]> = {};
    lines.forEach((line) => {
      const parts = line.split('/').map((s) => s.trim());
      if (parts.length >= 2) {
        const route = parts[0].replace(/[\s|]+/g, '');
        const worker = parts[1];
        if (!route || !worker) return;
        if (!schedule[worker]) schedule[worker] = [];
        schedule[worker].push(route);
      }
    });
    return schedule;
  };

  const expandRoutes = (
    route: string,
    trip1Volumes: Record<string, number>,
    trip2Volumes: Record<string, number>
  ) => {
    if (trip1Volumes[route] || trip2Volumes[route]) return [route];
    const pattern = new RegExp('^' + route + '\\d+$');
    const subRoutes = new Set<string>();
    Object.keys(trip1Volumes).forEach((key) => {
      if (pattern.test(key)) subRoutes.add(key);
    });
    Object.keys(trip2Volumes).forEach((key) => {
      if (pattern.test(key)) subRoutes.add(key);
    });
    return subRoutes.size > 0 ? Array.from(subRoutes).sort() : [route];
  };

  // ===== Supabase에서 조건에 맞는 모든 행 가져오기 (1000줄 한계 극복) =====
  // Supabase는 한 번에 최대 1000줄만 반환하므로, Range 헤더로 나눠서 끝까지 가져옴
  const fetchAllRows = async (url: string): Promise<any[]> => {
    const pageSize = 1000;
    let from = 0;
    let all: any[] = [];
    while (true) {
      const res = await fetch(url, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Range: `${from}-${from + pageSize - 1}`,
          'Range-Unit': 'items',
        },
      });
      if (!res.ok) {
        // 실패 시 지금까지 모은 것 반환 (첫 페이지도 실패면 예외)
        if (from === 0) throw new Error('fetch failed');
        break;
      }
      const rows = await res.json();
      all = all.concat(rows);
      if (!rows || rows.length < pageSize) break; // 마지막 페이지
      from += pageSize;
      if (from > 100000) break; // 안전장치 (10만 줄 이상이면 중단)
    }
    return all;
  };

  // ===== Supabase: 그날 사람별 물량 + 노선별 상세 저장 (날짜 기준 덮어쓰기) =====
  const saveToCloud = async (
    workDate: string,
    workers: [string, any][],
    hasTrip2: boolean
  ) => {
    setSaveStatus('saving');
    try {
      // 0) 현재 시간 -5분을 "HH:MM"으로 (소분 종료 시간 추정)
      const now = new Date();
      now.setMinutes(now.getMinutes() - 5);
      const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // 0-1) 기존에 저장된 이 날짜의 1차/2차 시간 조회 (재분석 시 유지용)
      let existingTrip1Time = '';
      let existingTrip2Time = '';
      try {
        const exRows = await fetchAllRows(
          `${SUPABASE_URL}/rest/v1/daily_volume?work_date=eq.${workDate}&select=trip,trip1_time,trip2_time`
        );
        exRows.forEach((r: any) => {
          if (r.trip1_time) existingTrip1Time = r.trip1_time;
          if (r.trip2_time) existingTrip2Time = r.trip2_time;
        });
      } catch {}

      // 이번 분석에서 1차/2차가 각각 있는지
      const hasTrip1Now = workers.some(([, d]) => d.trip1 > 0);
      const hasTrip2Now = workers.some(([, d]) => d.trip2 > 0);

      // 1차 시간: 기존에 있으면 유지, 없으면 이번 분석 시간
      const trip1Time = existingTrip1Time || (hasTrip1Now ? nowTime : '');
      // 2차 시간: 기존에 있으면 유지, 없고 이번에 2차가 있으면 이번 분석 시간
      const trip2Time = existingTrip2Time || (hasTrip2Now ? nowTime : '');

      // 1) 같은 날짜 기존 데이터 먼저 삭제 (덮어쓰기 = 중복 방지)
      await fetch(`${SUPABASE_URL}/rest/v1/daily_volume?work_date=eq.${workDate}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      await fetch(`${SUPABASE_URL}/rest/v1/route_detail?work_date=eq.${workDate}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });

      // 2-1) 사람별 총합 삽입 (1차/2차 분리 저장 + 시간 기록)
      const rows: any[] = [];
      workers.forEach(([worker, data]) => {
        // 1차가 있으면 trip=1로 저장
        if (data.trip1 > 0) {
          rows.push({
            work_date: workDate,
            worker_name: worker,
            volume: data.trip1,
            trip: 1,
            trip1_time: trip1Time,
            trip2_time: trip2Time,
          });
        }
        // 2차가 있으면 trip=2로 저장
        if (data.trip2 > 0) {
          rows.push({
            work_date: workDate,
            worker_name: worker,
            volume: data.trip2,
            trip: 2,
            trip1_time: trip1Time,
            trip2_time: trip2Time,
          });
        }
      });

      const res = await fetch(`${SUPABASE_URL}/rest/v1/daily_volume`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(rows),
      });

      // 2-2) 노선별 상세 삽입 (검색용, 1차/2차 분리 저장)
      const routeRows: any[] = [];
      workers.forEach(([worker, data]) => {
        data.routes.forEach((r: any) => {
          if ((r.trip1 || 0) > 0) {
            routeRows.push({
              work_date: workDate,
              worker_name: worker,
              route: r.route,
              volume: r.trip1,
              trip: 1,
            });
          }
          if ((r.trip2 || 0) > 0) {
            routeRows.push({
              work_date: workDate,
              worker_name: worker,
              route: r.route,
              volume: r.trip2,
              trip: 2,
            });
          }
        });
      });

      let res2ok = true;
      if (routeRows.length > 0) {
        const res2 = await fetch(`${SUPABASE_URL}/rest/v1/route_detail`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(routeRows),
        });
        res2ok = res2.ok;
      }

      if (res.ok && res2ok) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  };

  // ===== Supabase: 해당 정산월(26~25일) 사람별 누적 합계 불러오기 =====
  const loadMonthly = async (workDate: string) => {
    setMonthlyLoading(true);
    try {
      const period = getBillingPeriod(workDate);
      let rows: { worker_name: string; volume: number; work_date: string }[];
      try {
        rows = await fetchAllRows(
          `${SUPABASE_URL}/rest/v1/daily_volume?work_date=gte.${period.start}&work_date=lte.${period.end}&select=worker_name,volume,work_date`
        );
      } catch {
        setMonthlyData({ error: true, period });
        setMonthlyLoading(false);
        return;
      }

      // 사람별 합산
      const totals: Record<string, number> = {};
      const dayCount: Record<string, Set<string>> = {};
      rows.forEach((r) => {
        totals[r.worker_name] = (totals[r.worker_name] || 0) + (r.volume || 0);
        if (!dayCount[r.worker_name]) dayCount[r.worker_name] = new Set();
        dayCount[r.worker_name].add(r.work_date);
      });

      const sorted = Object.entries(totals)
        .map(([name, total]) => ({
          name,
          total,
          days: dayCount[name] ? dayCount[name].size : 0,
        }))
        .sort((a, b) => b.total - a.total);

      const grandTotal = sorted.reduce((a, b) => a + b.total, 0);
      const workDays = new Set(rows.map((r) => r.work_date)).size;

      setMonthlyData({ period, workers: sorted, grandTotal, workDays });
    } catch {
      setMonthlyData({ error: true });
    }
    setMonthlyLoading(false);
  };

  // ===== 전체 날짜별 총 물량 불러오기 (오늘 분석 탭 달력용) =====
  const loadAllDates = async () => {
    try {
      const rows = await fetchAllRows(
        `${SUPABASE_URL}/rest/v1/daily_volume?select=work_date,volume,trip,trip1_time,trip2_time`
      );
      // 날짜별로 총합 + 1차/2차 나눠서 집계 + 시간
      const byDate: Record<string, { vol: number; trip1: number; trip2: number; t1time: string; t2time: string }> = {};
      rows.forEach((r: any) => {
        if (!byDate[r.work_date]) byDate[r.work_date] = { vol: 0, trip1: 0, trip2: 0, t1time: '', t2time: '' };
        byDate[r.work_date].vol += r.volume || 0;
        if (r.trip === 2) byDate[r.work_date].trip2 += r.volume || 0;
        else byDate[r.work_date].trip1 += r.volume || 0; // trip=1 또는 null은 1차로
        if (r.trip1_time) byDate[r.work_date].t1time = r.trip1_time;
        if (r.trip2_time) byDate[r.work_date].t2time = r.trip2_time;
      });
      const arr = Object.entries(byDate).map(([date, d]) => ({
        date,
        vol: d.vol,
        trip1: d.trip1,
        trip2: d.trip2,
        trip1Time: d.t1time,
        trip2Time: d.t2time,
      }));
      setAllDatesData(arr);
    } catch {
      // 실패 시 조용히 (달력만 안 보임)
    }
  };

  // ===== 빠른 기간 설정 =====
  const setPeriodThisMonth = () => {
    const p = getBillingPeriod(todayStr);
    setSearchStart(p.start);
    setSearchEnd(p.end);
  };
  const setPeriodLastMonth = () => {
    // 이번 정산월 시작 하루 전 = 지난 정산월에 속함
    const thisP = getBillingPeriod(todayStr);
    const before = new Date(thisP.start + 'T00:00:00');
    before.setDate(before.getDate() - 1);
    const beforeStr = `${before.getFullYear()}-${String(before.getMonth() + 1).padStart(2, '0')}-${String(before.getDate()).padStart(2, '0')}`;
    const p = getBillingPeriod(beforeStr);
    setSearchStart(p.start);
    setSearchEnd(p.end);
  };

  // ===== 인원별 검색: 기간 내 사람별 합계 + 각자 노선 상세 =====
  const searchByWorker = async () => {
    if (!searchStart || !searchEnd) {
      alert('⚠️ 검색 기간을 선택해주세요.');
      return;
    }
    setSearchLoading(true);
    setWorkerSearchResult(null);
    try {
      let rows: { worker_name: string; route: string; volume: number; work_date: string; trip: number }[];
      try {
        rows = await fetchAllRows(
          `${SUPABASE_URL}/rest/v1/route_detail?work_date=gte.${searchStart}&work_date=lte.${searchEnd}&select=worker_name,route,volume,work_date,trip`
        );
      } catch {
        setWorkerSearchResult({ error: true });
        setSearchLoading(false);
        return;
      }

      // 날짜별로 1차/2차 존재 여부 파악 (전체 기준: 그날 2차가 하나라도 있으면 2차 운영일)
      const dateHasTrip1: Record<string, boolean> = {};
      const dateHasTrip2: Record<string, boolean> = {};
      rows.forEach((r) => {
        if (r.trip === 1) dateHasTrip1[r.work_date] = true;
        if (r.trip === 2) dateHasTrip2[r.work_date] = true;
      });
      // 완전한 날 = 1차도 있고 2차도 있는 날
      const completeDates = new Set<string>();
      Object.keys(dateHasTrip1).forEach((d) => {
        if (dateHasTrip2[d]) completeDates.add(d);
      });

      // 사람별로 묶기
      const byWorker: Record<
        string,
        {
          total: number;
          routes: Record<string, number>;
          days: Set<string>;
          byDate: Record<string, { vol: number; routes: Record<string, number> }>;
          completeTotal: number; // 완전한 날만의 합 (평균용)
          completeDays: Set<string>;
        }
      > = {};
      rows.forEach((r) => {
        if (!byWorker[r.worker_name]) {
          byWorker[r.worker_name] = {
            total: 0,
            routes: {},
            days: new Set(),
            byDate: {},
            completeTotal: 0,
            completeDays: new Set(),
          };
        }
        byWorker[r.worker_name].total += r.volume || 0;
        byWorker[r.worker_name].routes[r.route] =
          (byWorker[r.worker_name].routes[r.route] || 0) + (r.volume || 0);
        byWorker[r.worker_name].days.add(r.work_date);
        // 날짜별: 총합 + 노선별
        if (!byWorker[r.worker_name].byDate[r.work_date]) {
          byWorker[r.worker_name].byDate[r.work_date] = { vol: 0, routes: {} };
        }
        byWorker[r.worker_name].byDate[r.work_date].vol += r.volume || 0;
        byWorker[r.worker_name].byDate[r.work_date].routes[r.route] =
          (byWorker[r.worker_name].byDate[r.work_date].routes[r.route] || 0) + (r.volume || 0);
        // 완전한 날이면 평균용 합계에도 추가
        if (completeDates.has(r.work_date)) {
          byWorker[r.worker_name].completeTotal += r.volume || 0;
          byWorker[r.worker_name].completeDays.add(r.work_date);
        }
      });

      const workers = Object.entries(byWorker)
        .map(([name, d]) => {
          const completeDayCount = d.completeDays.size;
          const avg = completeDayCount > 0 ? Math.round(d.completeTotal / completeDayCount) : null;
          return {
            name,
            total: d.total,
            days: d.days.size,
            avg, // 하루 평균 (완전한 날만), 완전한 날 없으면 null
            avgDays: completeDayCount, // 평균 계산에 쓰인 날 수
            routes: Object.entries(d.routes)
              .map(([route, vol]) => ({ route, vol }))
              .sort((a, b) => b.vol - a.vol),
            dates: Object.entries(d.byDate)
              .map(([date, info]) => ({
                date,
                vol: info.vol,
                routes: Object.entries(info.routes)
                  .map(([route, vol]) => ({ route, vol }))
                  .sort((a, b) => b.vol - a.vol),
              }))
              .sort((a, b) => b.date.localeCompare(a.date)),
          };
        })
        .sort((a, b) => b.total - a.total);

      const grandTotal = workers.reduce((a, b) => a + b.total, 0);
      setWorkerSearchResult({ workers, grandTotal, start: searchStart, end: searchEnd });
    } catch {
      setWorkerSearchResult({ error: true });
    }
    setSearchLoading(false);
  };

  // ===== 노선별 검색: 기간 내 노선별 합계 + 누가 했는지 =====
  const searchByRoute = async () => {
    if (!searchStart || !searchEnd) {
      alert('⚠️ 검색 기간을 선택해주세요.');
      return;
    }
    setSearchLoading(true);
    setRouteSearchResult(null);
    try {
      let rows: { worker_name: string; route: string; volume: number; work_date: string; trip: number }[];
      try {
        rows = await fetchAllRows(
          `${SUPABASE_URL}/rest/v1/route_detail?work_date=gte.${searchStart}&work_date=lte.${searchEnd}&select=worker_name,route,volume,work_date,trip`
        );
      } catch {
        setRouteSearchResult({ error: true });
        setSearchLoading(false);
        return;
      }

      // 노선별로 1차/2차 존재 여부 파악 (노선 기준: 그 노선이 그날 1차도 2차도 있으면 완전한 날)
      const routeDateTrip: Record<string, { t1: Set<string>; t2: Set<string> }> = {};
      rows.forEach((r) => {
        if (!routeDateTrip[r.route]) routeDateTrip[r.route] = { t1: new Set(), t2: new Set() };
        if (r.trip === 1) routeDateTrip[r.route].t1.add(r.work_date);
        if (r.trip === 2) routeDateTrip[r.route].t2.add(r.work_date);
      });

      // 노선별로 묶기
      const byRoute: Record<
        string,
        {
          total: number;
          workers: Record<string, number>;
          days: Set<string>;
          byDate: Record<string, { vol: number; workers: Record<string, number> }>;
        }
      > = {};
      rows.forEach((r) => {
        if (!byRoute[r.route]) {
          byRoute[r.route] = { total: 0, workers: {}, days: new Set(), byDate: {} };
        }
        byRoute[r.route].total += r.volume || 0;
        byRoute[r.route].workers[r.worker_name] =
          (byRoute[r.route].workers[r.worker_name] || 0) + (r.volume || 0);
        byRoute[r.route].days.add(r.work_date);
        // 날짜별: 총합 + 담당자별
        if (!byRoute[r.route].byDate[r.work_date]) {
          byRoute[r.route].byDate[r.work_date] = { vol: 0, workers: {} };
        }
        byRoute[r.route].byDate[r.work_date].vol += r.volume || 0;
        byRoute[r.route].byDate[r.work_date].workers[r.worker_name] =
          (byRoute[r.route].byDate[r.work_date].workers[r.worker_name] || 0) + (r.volume || 0);
      });

      const routes = Object.entries(byRoute)
        .map(([route, d]) => {
          // 완전한 날 = 그 노선이 1차도 있고 2차도 있는 날
          const trips = routeDateTrip[route];
          const completeDates: string[] = [];
          if (trips) {
            trips.t1.forEach((dt) => {
              if (trips.t2.has(dt)) completeDates.push(dt);
            });
          }
          let completeTotal = 0;
          completeDates.forEach((dt) => {
            completeTotal += d.byDate[dt] ? d.byDate[dt].vol : 0;
          });
          const avg = completeDates.length > 0 ? Math.round(completeTotal / completeDates.length) : null;

          return {
            route,
            total: d.total,
            days: d.days.size,
            avg, // 하루 평균 (완전한 날만)
            avgDays: completeDates.length,
            workers: Object.entries(d.workers)
              .map(([name, vol]) => ({ name, vol }))
              .sort((a, b) => b.vol - a.vol),
            dates: Object.entries(d.byDate)
              .map(([date, info]) => ({
                date,
                vol: info.vol,
                workers: Object.entries(info.workers)
                  .map(([name, vol]) => ({ name, vol }))
                  .sort((a, b) => b.vol - a.vol),
              }))
              .sort((a, b) => b.date.localeCompare(a.date)),
          };
        })
        .sort((a, b) => a.route.localeCompare(b.route)); // 노선코드 순 정렬

      const grandTotal = routes.reduce((a, b) => a + b.total, 0);
      setRouteSearchResult({ routes, grandTotal, start: searchStart, end: searchEnd });
    } catch {
      setRouteSearchResult({ error: true });
    }
    setSearchLoading(false);
  };

  // ===== 인원별 검색 결과 복사 =====
  const copyWorkerSearch = () => {
    if (!workerSearchResult || workerSearchResult.error || workerSearchResult.workers.length === 0) return;
    let text = '📊 인원별 물량 집계\n';
    text += workerSearchResult.start + ' ~ ' + workerSearchResult.end + '\n';
    text += '총 수량: ' + workerSearchResult.grandTotal.toLocaleString() + '\n\n';
    workerSearchResult.workers.forEach((w: any, idx: number) => {
      const emoji = idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '👤';
      const nm = w.name === '김대원' ? '빛나는대원' : w.name;
      text += emoji + ' ' + nm + ' (' + w.total.toLocaleString() + ') · ' + w.days + '일 근무\n';
      w.routes.forEach((r: any) => {
        text += '  ∙ ' + r.route + ' (' + r.vol + ')\n';
      });
      text += '\n';
    });
    navigator.clipboard.writeText(text).then(
      () => alert('✅ 복사 완료!'),
      () => alert('❌ 복사 실패')
    );
  };

  // ===== 노선별 검색 결과 복사 =====
  const copyRouteSearch = () => {
    if (!routeSearchResult || routeSearchResult.error || routeSearchResult.routes.length === 0) return;
    let text = '🛣️ 노선별 물량 집계\n';
    text += routeSearchResult.start + ' ~ ' + routeSearchResult.end + '\n';
    text += '총 수량: ' + routeSearchResult.grandTotal.toLocaleString() + '\n\n';
    routeSearchResult.routes.forEach((r: any) => {
      text += r.route + ' (' + r.total.toLocaleString() + ') · ' + r.days + '일 운영\n';
      r.workers.forEach((w: any) => {
        const nm = w.name === '김대원' ? '빛나는대원' : w.name;
        text += '  ∙ ' + nm + ' (' + w.vol + ')\n';
      });
      text += '\n';
    });
    navigator.clipboard.writeText(text).then(
      () => alert('✅ 복사 완료!'),
      () => alert('❌ 복사 실패')
    );
  };

  // ===== 특정 날짜 데이터 조회 (삭제 전 미리보기) =====
  const previewDelete = async () => {
    const d = deleteDate || todayStr;
    setDeleteLoading(true);
    setDeletePreview(null);
    setDeleteStatus('');
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/daily_volume?work_date=eq.${d}&select=worker_name,volume,trip`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );
      if (!res.ok) {
        setDeletePreview({ error: true });
        setDeleteLoading(false);
        return;
      }
      const rows: { worker_name: string; volume: number; trip: number }[] = await res.json();
      if (rows.length === 0) {
        setDeletePreview({ empty: true, date: d });
      } else {
        // 1차/2차 분리 집계
        const trip1Total = rows.filter((r) => r.trip === 1).reduce((a, b) => a + (b.volume || 0), 0);
        const trip2Total = rows.filter((r) => r.trip === 2).reduce((a, b) => a + (b.volume || 0), 0);
        const trip1Count = new Set(rows.filter((r) => r.trip === 1).map((r) => r.worker_name)).size;
        const trip2Count = new Set(rows.filter((r) => r.trip === 2).map((r) => r.worker_name)).size;
        const total = trip1Total + trip2Total;

        // 사람별 합계 (1차+2차 합쳐서 표시)
        const byWorker: Record<string, number> = {};
        rows.forEach((r) => {
          byWorker[r.worker_name] = (byWorker[r.worker_name] || 0) + (r.volume || 0);
        });
        const workers = Object.entries(byWorker)
          .map(([name, volume]) => ({ name, volume }))
          .sort((a, b) => b.volume - a.volume);

        setDeletePreview({
          date: d,
          count: workers.length,
          total,
          trip1Total,
          trip2Total,
          trip1Count,
          trip2Count,
          hasTrip1: trip1Total > 0,
          hasTrip2: trip2Total > 0,
          workers,
        });
      }
    } catch {
      setDeletePreview({ error: true });
    }
    setDeleteLoading(false);
  };

  // ===== 특정 날짜 데이터 삭제 (trip: 'all' | 1 | 2) =====
  const doDelete = async (tripType: 'all' | 1 | 2) => {
    const d = deleteDate || todayStr;
    if (!deletePreview || deletePreview.empty || deletePreview.error) return;

    let label = '';
    if (tripType === 'all') label = '1차 + 2차 전체';
    else if (tripType === 1) label = '1차만';
    else label = '2차만';

    if (!confirm(`정말 ${d}의 ${label} 데이터를 삭제할까요?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }
    setDeleteStatus('deleting');
    try {
      // trip 조건 만들기
      const tripFilter = tripType === 'all' ? '' : `&trip=eq.${tripType}`;

      await fetch(`${SUPABASE_URL}/rest/v1/daily_volume?work_date=eq.${d}${tripFilter}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      await fetch(`${SUPABASE_URL}/rest/v1/route_detail?work_date=eq.${d}${tripFilter}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      setDeleteStatus('deleted');
      setDeletePreview(null);
    } catch {
      setDeleteStatus('error');
    }
  };

  const analyze = () => {
    // 1) 빈 입력 체크
    if (!scheduleData.trim() && !trip1Data.trim()) {
      alert('⚠️ 스케줄과 Trip1 물량을 입력해주세요.');
      return;
    }
    if (!scheduleData.trim()) {
      alert('⚠️ 당일 스케줄이 비어있습니다.\n스케줄을 입력해주세요.');
      return;
    }
    if (!trip1Data.trim()) {
      alert('⚠️ Trip1 물량 데이터가 비어있습니다.\nTrip1 물량을 입력해주세요.');
      return;
    }

    const trip1Date = extractDate(trip1Data);
    const trip2Date = trip2Data ? extractDate(trip2Data) : null;
    const scheduleDate = extractDate(scheduleData);

    // 2) 날짜 인식 실패 체크 (어느 칸인지 알려줌)
    if (!scheduleDate && !trip1Date) {
      alert('⚠️ 날짜를 찾을 수 없습니다.\n\n• 스케줄: "1월 15일" 형식으로 입력했는지\n• Trip1: "26.01.15Trip1" 형식으로 입력했는지\n확인해주세요.');
      return;
    }
    if (!scheduleDate) {
      alert('⚠️ 스케줄에서 날짜를 찾을 수 없습니다.\n"1월 15일" 같은 형식으로 입력했는지 확인해주세요.');
      return;
    }
    if (!trip1Date) {
      alert('⚠️ Trip1 물량에서 날짜를 찾을 수 없습니다.\n"26.01.15Trip1" 같은 형식으로 입력했는지 확인해주세요.');
      return;
    }

    // 3) 날짜 불일치 체크 (어떤 날짜끼리 안 맞는지 알려줌)
    if (trip1Date !== scheduleDate) {
      alert('❌ 날짜가 일치하지 않습니다!\n\n• 스케줄: ' + scheduleDate + '\n• Trip1: ' + trip1Date + '\n\n같은 날짜인지 확인해주세요.');
      return;
    }
    if (trip2Date && trip2Date !== scheduleDate) {
      alert('❌ Trip2 날짜가 다릅니다!\n\n• 스케줄: ' + scheduleDate + '\n• Trip2: ' + trip2Date + '\n\n같은 날짜인지 확인해주세요.');
      return;
    }

    setTargetDate(scheduleDate);
    const trip1Volumes = parseVolumeData(trip1Data);
    const trip2Volumes = trip2Data ? parseVolumeData(trip2Data) : {};
    const schedule = parseScheduleData(scheduleData);

    const assignedRoutes = new Set<string>();
    Object.values(schedule).forEach((routes) => {
      routes.forEach((route) => {
        expandRoutes(route, trip1Volumes, trip2Volumes).forEach((r) => {
          assignedRoutes.add(r);
        });
      });
    });

    const allVolumeRoutes = new Set<string>([
      ...Object.keys(trip1Volumes),
      ...Object.keys(trip2Volumes),
    ]);
    const unassigned: { route: string; trip1: number; trip2: number; total: number }[] = [];
    allVolumeRoutes.forEach((route) => {
      const t1 = trip1Volumes[route] || 0;
      const t2 = trip2Volumes[route] || 0;
      const total = t1 + t2;
      if (total > 0 && !assignedRoutes.has(route)) {
        unassigned.push({ route, trip1: t1, trip2: t2, total });
      }
    });
    unassigned.sort((a, b) => b.total - a.total);

    const workerVolumes: any = {};
    Object.entries(schedule).forEach(([worker, routes]) => {
      let trip1Total = 0,
        trip2Total = 0;
      const routeDetails: any[] = [];
      routes.forEach((route) => {
        expandRoutes(route, trip1Volumes, trip2Volumes).forEach((expandedRoute) => {
          const t1Vol = trip1Volumes[expandedRoute] || 0;
          const t2Vol = trip2Volumes[expandedRoute] || 0;
          trip1Total += t1Vol;
          trip2Total += t2Vol;
          if (t1Vol > 0 || t2Vol > 0) {
            routeDetails.push({
              route: expandedRoute,
              trip1: t1Vol,
              trip2: t2Vol,
              total: t1Vol + t2Vol,
            });
          }
        });
      });
      workerVolumes[worker] = {
        trip1: trip1Total,
        trip2: trip2Total,
        total: trip1Total + trip2Total,
        routes: routeDetails,
      };
    });

    const sorted = Object.entries(workerVolumes).sort(
      (a: any, b: any) => b[1].total - a[1].total
    );
    const totalTrip1 = Object.values(trip1Volumes).reduce((a, b) => a + b, 0);
    const totalTrip2 = Object.values(trip2Volumes).reduce((a, b) => a + b, 0);

    setResult({
      workers: sorted,
      trip1Total: totalTrip1,
      trip2Total: totalTrip2,
      totalVolume: totalTrip1 + totalTrip2,
      workerCount: sorted.length,
      unassigned,
      recognizedCount: allVolumeRoutes.size,
    });

    // ✅ 클라우드에 저장 + 월간 누적 불러오기
    const hasTrip2ForSave = totalTrip2 > 0;
    saveToCloud(scheduleDate, sorted as [string, any][], hasTrip2ForSave).then(() => {
      loadMonthly(scheduleDate);
      loadAllDates(); // 달력 갱신
    });

    // ✅ 입력 내용도 자동 공유 저장 (다른 기기에서 이어받기 가능)
    autoShareSave(scheduleDate);
  };

  // 분석 시 자동 공유 저장 (조용히, 상태표시 없음)
  const autoShareSave = async (workDate: string) => {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/shared_input?work_date=eq.${workDate}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      await fetch(`${SUPABASE_URL}/rest/v1/shared_input`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify([
          {
            work_date: workDate,
            schedule_data: scheduleData,
            trip1_data: trip1Data,
            trip2_data: trip2Data,
            updated_at: new Date().toISOString(), // 저장 시각 기록 (가장 최근 판별용)
          },
        ]),
      });
    } catch {}
  };

  // 월간 합계만 다시 불러오기 (저장 없이 조회만)
  const refreshMonthly = () => {
    if (targetDate) loadMonthly(targetDate);
  };

  const copyToClipboard = async () => {
    if (!result || !targetDate) return;

    const dateObj = new Date(targetDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[dateObj.getDay()];
    const hasTrip2 = result.trip2Total > 0;
    const tripLabel = hasTrip2 ? 'Trip2' : 'Trip1';
    const displayTotal = hasTrip2 ? result.trip2Total : result.trip1Total;

    let text = '(주)비앤엠(M_안성1)\n';
    text += year + '년 ' + month + '월 ' + day + '일(' + weekday + ') ' + tripLabel + '\n';

    if (hasTrip2) {
      const totalRatio = ((result.trip2Total / result.totalVolume) * 100).toFixed(2);
      text += '📦 총 수량: ' + displayTotal.toLocaleString() + ' (비율 ' + totalRatio + '%)\n';
      text += '📊 금일 총 수량: ' + result.totalVolume.toLocaleString() + ' (Trip1 + Trip2)\n\n';
    } else {
      text += '📦 총 수량: ' + displayTotal.toLocaleString() + '\n\n';
    }

    // 복사 텍스트에도 표시 이름 적용 (김대원 → 빛나는대원)
    result.workers.forEach(([worker, data]: any, index: number) => {
      const isMedal = index < 3; // 1,2,3등
      const trip2Ratio =
        hasTrip2 && data.total > 0 ? ((data.trip2 / data.total) * 100).toFixed(2) : '0.00';
      const displayVolume = hasTrip2 ? data.trip2 : data.trip1;
      const nameForCopy = displayName(worker);

      // 이름 앞뒤 조립
      let line = '';
      if (worker === '김대원') {
        // 김대원(빛나는대원) 특별 규칙
        if (isMedal) {
          // 1,2,3등이면 메달만 (다른 사람과 동일)
          const medal = index === 0 ? '👑' : index === 1 ? '🥈' : '🥉';
          line = medal + ' ' + nameForCopy;
        } else {
          // 4등 이하면 오이수박 + 이름 + 복어굴
          line = '🐶 빛나는대원 🐾';
        }
      } else if (isMedal) {
        // 일반 1,2,3등 → 메달만
        const medal = index === 0 ? '👑' : index === 1 ? '🥈' : '🥉';
        line = medal + ' ' + nameForCopy;
      } else {
        // 일반 4등 이하 → 과일 (명단에 없는 새 사람은 사람 이모지)
        const fruit = WORKER_EMOJI[worker] || getAutoEmoji(worker);
        line = fruit + ' ' + nameForCopy;
      }

      // 이름 + 합계 (한 줄)
      text += line + ' (합계: ' + displayVolume + ')\n';
      // 비율은 다음 줄로 (핸드폰에서 줄바꿈 깨짐 방지)
      if (hasTrip2) {
        text += '   └ 비율 ' + trip2Ratio + '%\n';
      }

      data.routes.forEach(({ route, trip1, trip2 }: any) => {
        const routeVolume = hasTrip2 ? trip2 : trip1;
        if (routeVolume > 0) {
          text += '  ∙ ' + route + ' (' + routeVolume + ')\n';
        }
      });

      if (hasTrip2) {
        text += '[금일 총합계: ' + data.total + ']\n';
      }
      text += '\n';
    });

    if (result.unassigned && result.unassigned.length > 0) {
      text += '⚠️ 미배정 구역 (배정 누락 확인 필요)\n';
      result.unassigned.forEach((u: any) => {
        const vol = hasTrip2 ? u.trip2 : u.trip1;
        text += '  ∙ ' + u.route + ' (' + (vol > 0 ? vol : u.total) + ')\n';
      });
      text += '\n';
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('✅ 복사 완료!');
      })
      .catch(() => {
        alert('❌ 복사 실패');
      });
  };

  // 1위 물량 (막대 비율 기준)
  const topVolume =
    result && result.workers.length > 0
      ? (result.trip2Total > 0
          ? result.workers[0][1].trip2
          : result.workers[0][1].trip1) || 1
      : 1;

  return (
    <div
      style={{
        fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
        background:
          'radial-gradient(circle at 20% 0%, rgba(201,162,39,0.05), transparent 40%), #0a0a0a',
        minHeight: '100vh',
        padding: '2.5rem 1.5rem',
        color: '#f5f4ef',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Cormorant+Garamond:wght@500;600;700&display=swap');

        .st-wrap { max-width: 760px; margin: 0 auto; }

        /* 헤더 */
        .st-header {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          margin-bottom: 2.5rem;
          border: 1px solid rgba(201,162,39,0.35);
          min-height: 340px;
          display: flex;
          align-items: flex-end;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        /* 배경 사진 */
        .st-header-bg {
          position: absolute;
          inset: 0;
          background-image: url('/idol-logo.png');
          background-size: cover;
          background-position: center 25%;
          background-repeat: no-repeat;
        }
        /* 어두운 그라데이션 막 (아래로 갈수록 어둡게 → 글씨 또렷) */
        .st-header-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(10,10,10,0.15) 0%,
            rgba(10,10,10,0.35) 40%,
            rgba(10,10,10,0.85) 80%,
            rgba(10,10,10,0.96) 100%
          );
        }
        .st-header::before {
          content: '';
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 70%; height: 2px;
          background: linear-gradient(90deg, transparent, #c9a227, transparent);
          z-index: 3;
        }
        /* 글씨 영역 (아래쪽) */
        .st-header-content {
          position: relative;
          z-index: 2;
          width: 100%;
          text-align: center;
          padding: 2rem 1.5rem 1rem;
        }
        .st-brand {
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: -0.5px;
          line-height: 1;
          color: #f5f4ef;
          text-shadow:
            -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000,
            -2px 0 0 #000, 2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000,
            0 3px 14px rgba(0,0,0,0.9);
        }
        .st-brand .accent {
          font-family: 'Cormorant Garamond', serif;
          font-size: 4rem;
          font-weight: 700;
          color: #e8d48f;
          letter-spacing: 0.5px;
          margin-right: 0.2em;
          vertical-align: -0.05em;
          text-shadow:
            -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000,
            -2px 0 0 #000, 2px 0 0 #000, 0 -2px 0 #000, 0 2px 0 #000,
            0 0 22px rgba(201,162,39,0.7), 0 3px 14px rgba(0,0,0,0.95);
        }
        .st-divider {
          display: flex; align-items: center; justify-content: center;
          gap: 0.8rem; margin-top: 1.3rem;
        }
        .st-divider .line {
          height: 1px; width: 55px;
          background: linear-gradient(90deg, transparent, rgba(201,162,39,0.7));
        }
        .st-divider .line.right {
          background: linear-gradient(90deg, rgba(201,162,39,0.7), transparent);
        }
        .st-divider .diamond {
          width: 6px; height: 6px;
          background: #c9a227;
          transform: rotate(45deg);
          box-shadow: 0 0 8px rgba(201,162,39,0.6);
        }

        /* 입력 카드 */
        .st-inputs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .st-card {
          background: #141414;
          border: 2px solid rgba(201,162,39,0.45);
          border-radius: 18px;
          overflow: hidden;
        }
        .st-card-head {
          padding: 1.1rem 1.4rem;
          display: flex; align-items: center; gap: 0.8rem;
          border-bottom: 2px solid rgba(201,162,39,0.35);
        }
        .st-card-head .ico { font-size: 1.5rem; }
        .st-card-head h2 {
          font-size: 1.15rem; font-weight: 700; margin: 0; color: #f5f4ef;
        }
        .st-card-body { padding: 1.3rem; }
        .st-textarea {
          width: 100%;
          height: 15rem;
          padding: 1.1rem;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          font-family: 'Courier New', monospace;
          font-size: 0.92rem;
          resize: none;
          background: #0d0d0d;
          color: #e8e8e0;
          outline: none;
          transition: border-color 0.2s;
        }
        .st-textarea:focus { border-color: rgba(201,162,39,0.5); }
        .st-textarea::placeholder { color: #5a5a55; }

        /* 버튼 영역 */
        .st-actions {
          display: flex; justify-content: center; align-items: center;
          gap: 1rem; margin-bottom: 3rem; flex-wrap: wrap;
        }
        .st-btn-main {
          background: linear-gradient(135deg, #c9a227, #e8d48f);
          color: #1a1407;
          font-weight: 900;
          font-size: 1.15rem;
          padding: 1.1rem 3.5rem;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; gap: 0.6rem;
          transition: all 0.3s;
          letter-spacing: 1px;
        }
        .st-btn-main:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(201,162,39,0.3); }
        .st-btn-reset {
          background: transparent;
          color: #8a8a82;
          font-weight: 700;
          font-size: 1rem;
          padding: 1.1rem 2rem;
          border-radius: 14px;
          border: 1px solid rgba(201,162,39,0.25);
          cursor: pointer;
          display: flex; align-items: center; gap: 0.5rem;
          transition: all 0.3s;
        }
        .st-btn-reset:hover { border-color: rgba(201,162,39,0.5); color: #d8c98f; }

        /* 탭 메뉴 */
        .st-tabs {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          border-bottom: 2px solid rgba(201,162,39,0.25);
          padding-bottom: 0;
        }
        .st-tab {
          background: transparent;
          border: none;
          color: #8a8a82;
          font-family: 'Noto Sans KR', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          padding: 0.9rem 1.4rem;
          cursor: pointer;
          position: relative;
          transition: color 0.2s;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
        }
        .st-tab:hover { color: #d8c98f; }
        .st-tab.active {
          color: #e8d48f;
          border-bottom-color: #c9a227;
        }

        /* 검색 영역 */
        .st-search-box {
          background: #141414;
          border: 2px solid rgba(201,162,39,0.35);
          border-radius: 18px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .st-search-title {
          font-size: 1.2rem; font-weight: 700; color: #f5f4ef;
          margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.6rem;
        }
        .st-date-row {
          display: flex; gap: 0.8rem; align-items: center;
          flex-wrap: wrap; margin-bottom: 1rem;
        }
        .st-date-input {
          background: #0d0d0d;
          border: 1px solid rgba(201,162,39,0.3);
          border-radius: 10px;
          color: #f5f4ef;
          padding: 0.7rem 0.9rem;
          font-size: 0.95rem;
          font-family: 'Noto Sans KR', sans-serif;
          outline: none;
          color-scheme: dark;
        }
        .st-date-input:focus { border-color: #c9a227; }
        .st-date-label { color: #8a8a82; font-size: 0.9rem; }
        .st-quick-btns { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.2rem; }
        .st-quick-btn {
          background: rgba(201,162,39,0.1);
          border: 1px solid rgba(201,162,39,0.3);
          border-radius: 8px;
          color: #d8c98f;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .st-quick-btn:hover { background: rgba(201,162,39,0.2); }
        .st-search-btn {
          background: linear-gradient(135deg, #c9a227, #e8d48f);
          color: #1a1407;
          font-weight: 900;
          font-size: 1.05rem;
          padding: 0.9rem 2rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s;
        }
        .st-search-btn:hover { box-shadow: 0 8px 25px rgba(201,162,39,0.3); }

        /* 검색 결과 카드 (노선 상세 펼침) */
        .st-detail-routes {
          margin-top: 0.9rem; padding-top: 0.9rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex; flex-wrap: wrap; gap: 0.45rem;
        }

        /* 결과 헤더 */
        .st-result-head { text-align: center; margin-bottom: 2rem; }
        .st-rh-company { font-size: 0.85rem; letter-spacing: 2px; color: #8a8a82; margin-bottom: 0.4rem; }
        .st-rh-date { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 600; color: #e8d48f; }
        .st-rh-trip {
          display: inline-block; margin-top: 0.5rem;
          font-size: 0.72rem; letter-spacing: 3px; color: #c9a227;
          border: 1px solid rgba(201,162,39,0.18); border-radius: 999px; padding: 0.3rem 1.1rem;
        }

        /* 인식 + 경고 배너 */
        .st-banner {
          padding: 0.8rem 1.2rem; border-radius: 12px;
          font-weight: 700; font-size: 0.92rem;
          display: flex; align-items: center; gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .st-banner.ok { background: rgba(201,162,39,0.08); border: 1px solid rgba(201,162,39,0.25); color: #d8c98f; }
        .st-banner.warn-box {
          flex-direction: column; align-items: stretch;
          background: rgba(180,60,40,0.1); border: 1px solid rgba(180,60,40,0.4);
        }
        .st-warn-title { color: #e89a82; font-weight: 900; font-size: 1.05rem; margin-bottom: 0.7rem; display: flex; align-items: center; gap: 0.5rem; }
        .st-warn-item {
          display: flex; justify-content: space-between;
          padding: 0.5rem 0.8rem; border-radius: 8px;
          background: rgba(180,60,40,0.08); font-family: 'Courier New', monospace; margin-bottom: 0.3rem;
        }
        .st-warn-item span:first-child { color: #e89a82; font-weight: 800; }
        .st-warn-item span:last-child { color: #f0b89f; font-weight: 900; }

        /* 통계 */
        .st-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 2px; background: rgba(201,162,39,0.4);
          border: 2px solid rgba(201,162,39,0.45); border-radius: 14px;
          overflow: hidden; margin-bottom: 2.5rem;
        }
        .st-stat { background: #141414; padding: 1.4rem 1rem; text-align: center; }
        .st-stat-label { font-size: 0.7rem; letter-spacing: 1.5px; color: #8a8a82; margin-bottom: 0.5rem; }
        .st-stat-num { font-family: 'Cormorant Garamond', serif; font-size: 2.1rem; font-weight: 600; font-variant-numeric: tabular-nums; }
        .st-stat-num.gold { color: #e8d48f; }

        .st-section-title {
          font-size: 0.78rem; letter-spacing: 3px; color: #c9a227;
          text-align: center; margin-bottom: 1.5rem;
        }

        /* 순위 카드 */
        .st-ranks { display: flex; flex-direction: column; gap: 0.7rem; }
        .st-rank-card {
          background: #141414; border: 1px solid rgba(255,255,255,0.04);
          border-radius: 14px; padding: 1.2rem 1.4rem;
        }
        .st-rank-card.top {
          background: linear-gradient(135deg, rgba(201,162,39,0.08), #141414 60%);
          border-color: rgba(201,162,39,0.18);
        }
        .st-rank-row { display: flex; align-items: center; gap: 1rem; }
        .st-rank-badge {
          flex: 0 0 auto; width: 46px; height: 46px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif; font-size: 1.5rem;
          font-weight: 700; font-variant-numeric: tabular-nums;
        }
        .badge-1 { background: linear-gradient(135deg, #c9a227, #e8d48f); color: #1a1407; }
        .badge-2 { background: linear-gradient(135deg, #9a9a9a, #d8d8d8); color: #1a1a1a; }
        .badge-3 { background: linear-gradient(135deg, #8a6d3f, #b08d57); color: #1a1207; }
        .badge-n { background: transparent; border: 1px solid rgba(201,162,39,0.2); color: #8a8a82; font-size: 1.1rem; }
        .st-rank-name { flex: 1; font-size: 1.5rem; font-weight: 700; color: #f5f4ef; }
        .st-rank-vol { font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; font-weight: 600; color: #e8d48f; font-variant-numeric: tabular-nums; }

        .st-bar-track { margin-top: 0.9rem; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
        .st-bar-fill { height: 100%; background: linear-gradient(90deg, #c9a227, #e8d48f); border-radius: 2px; }

        .st-routes { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; flex-wrap: wrap; gap: 0.45rem; }
        .st-chip {
          font-family: 'Courier New', monospace; font-size: 0.95rem;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px; padding: 0.4rem 0.7rem; color: #9a9a92;
        }
        .st-chip b { color: #e8d48f; font-weight: 700; margin-left: 0.35rem; }

        /* 모바일 */
        @media (max-width: 480px) {
          .st-brand { font-size: 1.7rem; }
          .st-brand .accent { font-size: 3rem; }
          .st-header { min-height: 280px; }
          .st-rank-name { font-size: 1.3rem; }
          .st-rank-vol { font-size: 1.9rem; }
          .st-stat-num { font-size: 1.7rem; }
          .st-btn-main { padding: 1rem 2.5rem; }
        }
      `}</style>

      <div className="st-wrap">
        {/* 헤더 — 포스터 스타일 */}
        <div className="st-header">
          <div className="st-header-bg"></div>
          <div className="st-header-overlay"></div>
          <div className="st-header-content">
            <div className="st-brand">
              <span className="accent">B&amp;M</span> 물량분석
            </div>
          </div>
        </div>

        {/* ===== 탭 메뉴 ===== */}
        <div className="st-tabs">
          <button
            className={'st-tab' + (activeTab === 'analyze' ? ' active' : '')}
            onClick={() => setActiveTab('analyze')}
          >
            📊 오늘 분석
          </button>
          <button
            className={'st-tab' + (activeTab === 'worker' ? ' active' : '')}
            onClick={() => setActiveTab('worker')}
          >
            👥 인원별 검색
          </button>
          <button
            className={'st-tab' + (activeTab === 'route' ? ' active' : '')}
            onClick={() => setActiveTab('route')}
          >
            🛣️ 노선별 검색
          </button>
          <button
            className={'st-tab' + (activeTab === 'delete' ? ' active' : '')}
            onClick={() => setActiveTab('delete')}
          >
            🗑️ 데이터 삭제
          </button>
        </div>

        {/* ===== 탭 1: 오늘 분석 ===== */}
        {activeTab === 'analyze' && (
        <div>
        {/* 📅 전체 날짜별 총 물량 달력 */}
        {allDatesData.length > 0 && (
          <div
            style={{
              background: 'linear-gradient(160deg, #1a1710 0%, #121212 100%)',
              border: '1px solid rgba(201,162,39,0.3)',
              borderRadius: '18px',
              padding: '1.2rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.8rem',
                color: '#c9a227',
                letterSpacing: '1px',
                marginBottom: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>📅</span>
              <span>날짜별 총 물량</span>
            </div>
            <BillingCalendar dates={allDatesData} showSummary={false} colorByVolume={true} showTripSummary={true} />
          </div>
        )}

        {/* ✅ 입력 초기화 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button className="st-btn-reset" onClick={resetInputs}>
            <span style={{ fontSize: '1.2rem' }}>🗑️</span>
            <span>입력 초기화</span>
          </button>
        </div>

        {/* 입력 카드들 */}
        <div className="st-inputs">
          {/* 스케줄 */}
          <div className="st-card">
            <div className="st-card-head">
              <span className="ico">👥</span>
              <h2>당일 스케줄</h2>
            </div>
            <div className="st-card-body">
              <textarea
                className="st-textarea"
                value={scheduleData}
                onChange={(e) => setScheduleData(e.target.value)}
                placeholder={'📅 예시:\n2W 입차일 : 1월 15일 수요일\n출근인원 : 13명\n\n501B01 / 김병후\n501B02 / 김병후\n511B / 임민호\n...'}
              />
            </div>
          </div>

          {/* Trip1 */}
          <div className="st-card">
            <div className="st-card-head">
              <span className="ico">📊</span>
              <h2>Trip1 물량 데이터</h2>
            </div>
            <div className="st-card-body">
              <textarea
                className="st-textarea"
                value={trip1Data}
                onChange={(e) => setTrip1Data(e.target.value)}
                placeholder={'📦 예시:\n26.01.15Trip1 캠도물량\nB&M로지스\n501B01 24\n501B02 40\n(공백/탭/| 무엇이든 인식)\n...'}
              />
            </div>
          </div>

          {/* Trip2 */}
          <div className="st-card">
            <div className="st-card-head">
              <span className="ico">📈</span>
              <h2>Trip2 물량 데이터</h2>
            </div>
            <div className="st-card-body">
              <textarea
                className="st-textarea"
                value={trip2Data}
                onChange={(e) => setTrip2Data(e.target.value)}
                placeholder={'📦 예시 (선택):\n26.01.15Trip2 캠도물량\nB&M로지스\n501B01 7\n501B02 15\n...'}
              />
            </div>
          </div>
        </div>

        {/* 분석 버튼 */}
        <div className="st-actions">
          <button className="st-btn-main" onClick={analyze}>
            <span style={{ fontSize: '1.4rem' }}>🔍</span>
            <span>분석 실행</span>
          </button>
        </div>

        {/* 결과 */}
        {result && (
          <div>
            <div className="st-result-head">
              <div className="st-rh-company">(주)비앤엠 · M_안성1</div>
              <div className="st-rh-date">
                {new Date(targetDate).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  weekday: 'short',
                })}
              </div>
              <div className="st-rh-trip">{result.trip2Total > 0 ? 'TRIP 2' : 'TRIP 1'}</div>
            </div>

            {/* 복사 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <button
                className="st-btn-main"
                onClick={copyToClipboard}
                style={{ padding: '0.9rem 2.5rem', fontSize: '1.05rem' }}
              >
                <span style={{ fontSize: '1.3rem' }}>📋</span>
                <span>복사하기</span>
              </button>
            </div>

            {/* 인식 배너 */}
            <div className="st-banner ok">
              <span style={{ fontSize: '1.1rem' }}>✅</span>
              <span>물량 데이터 {result.recognizedCount}개 구역 인식 완료</span>
            </div>

            {/* 미배정 경고 */}
            {result.unassigned && result.unassigned.length > 0 && (
              <div className="st-banner warn-box">
                <div className="st-warn-title">
                  <span style={{ fontSize: '1.3rem' }}>⚠️</span>
                  <span>미배정 구역 {result.unassigned.length}개 — 배정 누락 확인 필요!</span>
                </div>
                {result.unassigned.map((u: any) => {
                  const hasTrip2 = result.trip2Total > 0;
                  const vol = hasTrip2 ? (u.trip2 > 0 ? u.trip2 : u.total) : u.trip1;
                  return (
                    <div key={u.route} className="st-warn-item">
                      <span>{u.route}</span>
                      <span>{vol.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 통계 */}
            <div className="st-stats">
              <div className="st-stat">
                <div className="st-stat-label">인원</div>
                <div className="st-stat-num">{result.workerCount}</div>
              </div>
              <div className="st-stat">
                <div className="st-stat-label">구역</div>
                <div className="st-stat-num">{result.recognizedCount}</div>
              </div>
              <div className="st-stat">
                <div className="st-stat-label">총 물량</div>
                <div className="st-stat-num gold">
                  {(result.trip2Total > 0 ? result.trip2Total : result.trip1Total).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="st-section-title">— 개인별 순위 —</div>

            {/* 순위 리스트 */}
            <div className="st-ranks">
              {result.workers.map(([worker, data]: any, index: number) => {
                const hasTrip2 = result.trip2Total > 0;
                const mainVol = hasTrip2 ? data.trip2 : data.trip1;
                const barWidth = Math.max(5, (mainVol / topVolume) * 100);
                const badgeClass =
                  index === 0 ? 'badge-1' : index === 1 ? 'badge-2' : index === 2 ? 'badge-3' : 'badge-n';
                const isTop3 = index < 3;
                const shownName = displayName(worker);

                const sortedRoutes = data.routes
                  .map((r: any) => ({ ...r, vol: hasTrip2 ? r.trip2 : r.trip1 }))
                  .filter((r: any) => r.vol > 0)
                  .sort((a: any, b: any) => b.vol - a.vol);

                return (
                  <div key={worker} className={'st-rank-card' + (isTop3 ? ' top' : '')}>
                    <div className="st-rank-row">
                      <div className={'st-rank-badge ' + badgeClass}>{index + 1}</div>
                      <div className="st-rank-name">
                        {worker === '김대원' ? (
                          <>빛나는대원</>
                        ) : (
                          shownName
                        )}
                      </div>
                      <div className="st-rank-vol">{mainVol.toLocaleString()}</div>
                    </div>
                    <div className="st-bar-track">
                      <div className="st-bar-fill" style={{ width: barWidth + '%' }} />
                    </div>
                    {sortedRoutes.length > 0 && (
                      <div className="st-routes">
                        {sortedRoutes.map((r: any) => (
                          <span key={r.route} className="st-chip">
                            {r.route}
                            <b>{r.vol.toLocaleString()}</b>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ===== 월간 누적 합계 (26일~25일) ===== */}
            <div style={{ marginTop: '3rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.8rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div className="st-section-title" style={{ margin: 0 }}>
                  — 월간 누적 합계 —
                </div>
                <button
                  onClick={refreshMonthly}
                  title="새로고침"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(201,162,39,0.3)',
                    borderRadius: '8px',
                    color: '#c9a227',
                    cursor: 'pointer',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.85rem',
                  }}
                >
                  ↻
                </button>
              </div>

              {monthlyLoading && (
                <div style={{ textAlign: 'center', color: '#8a8a82', padding: '1.5rem' }}>
                  불러오는 중...
                </div>
              )}

              {!monthlyLoading && monthlyData && monthlyData.error && (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#e89a82',
                    padding: '1.5rem',
                    background: 'rgba(180,60,40,0.1)',
                    border: '1px solid rgba(180,60,40,0.3)',
                    borderRadius: '12px',
                  }}
                >
                  ⚠️ 누적 데이터를 불러오지 못했습니다. 인터넷 연결을 확인하고 ↻ 버튼을 눌러주세요.
                </div>
              )}

              {!monthlyLoading && monthlyData && !monthlyData.error && (
                <div>
                  {/* 정산 기간 + 저장 상태 */}
                  <div
                    style={{
                      textAlign: 'center',
                      marginBottom: '1.2rem',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#e8d48f',
                      }}
                    >
                      {monthlyData.period.label}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#8a8a82', marginTop: '0.3rem' }}>
                      {monthlyData.period.start} ~ {monthlyData.period.end} · 누적 {monthlyData.workDays}일
                    </div>
                    {saveStatus === 'saving' && (
                      <div style={{ fontSize: '0.78rem', color: '#8a8a82', marginTop: '0.4rem' }}>
                        ☁️ 저장 중...
                      </div>
                    )}
                    {saveStatus === 'saved' && (
                      <div style={{ fontSize: '0.78rem', color: '#9aca7a', marginTop: '0.4rem' }}>
                        ✓ 오늘 데이터 저장됨 (모든 기기에 공유)
                      </div>
                    )}
                    {saveStatus === 'error' && (
                      <div style={{ fontSize: '0.78rem', color: '#e89a82', marginTop: '0.4rem' }}>
                        ⚠️ 저장 실패 (인터넷 확인)
                      </div>
                    )}
                  </div>

                  {/* 월간 총합 */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(201,162,39,0.12), #141414 70%)',
                      border: '2px solid rgba(201,162,39,0.35)',
                      borderRadius: '16px',
                      padding: '1.2rem',
                      textAlign: 'center',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', letterSpacing: '2px', color: '#8a8a82' }}>
                      이번 달 총 배송수량
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '2.6rem',
                        fontWeight: 600,
                        color: '#e8d48f',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {monthlyData.grandTotal.toLocaleString()}
                    </div>
                  </div>

                  {/* 사람별 누적 리스트 */}
                  {monthlyData.workers.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#8a8a82', padding: '1rem' }}>
                      아직 이번 달 데이터가 없습니다.
                    </div>
                  ) : (
                    <div className="st-ranks">
                      {monthlyData.workers.map((w: any, idx: number) => {
                        const badgeClass =
                          idx === 0 ? 'badge-1' : idx === 1 ? 'badge-2' : idx === 2 ? 'badge-3' : 'badge-n';
                        const topVol = monthlyData.workers[0].total || 1;
                        const barW = Math.max(5, (w.total / topVol) * 100);
                        return (
                          <div key={w.name} className={'st-rank-card' + (idx < 3 ? ' top' : '')}>
                            <div className="st-rank-row">
                              <div className={'st-rank-badge ' + badgeClass}>{idx + 1}</div>
                              <div className="st-rank-name">
                                {w.name === '김대원' ? (
                                  <>빛나는대원</>
                                ) : (
                                  w.name
                                )}
                                <span
                                  style={{
                                    fontSize: '0.8rem',
                                    color: '#8a8a82',
                                    fontWeight: 400,
                                    marginLeft: '0.6rem',
                                  }}
                                >
                                  {w.days}일 근무
                                </span>
                              </div>
                              <div className="st-rank-vol">{w.total.toLocaleString()}</div>
                            </div>
                            <div className="st-bar-track">
                              <div className="st-bar-fill" style={{ width: barW + '%' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
        )}

        {/* ===== 탭 2: 인원별 검색 ===== */}
        {activeTab === 'worker' && (
          <div>
            <div className="st-search-box">
              <div className="st-search-title">
                <span>👥</span>
                <span>인원별 검색</span>
              </div>
              <div className="st-quick-btns">
                <button className="st-quick-btn" onClick={setPeriodThisMonth}>이번 달 정산</button>
                <button className="st-quick-btn" onClick={setPeriodLastMonth}>지난 달 정산</button>
              </div>
              <div className="st-date-row">
                <input
                  type="date"
                  className="st-date-input"
                  value={searchStart}
                  onChange={(e) => setSearchStart(e.target.value)}
                />
                <span className="st-date-label">~</span>
                <input
                  type="date"
                  className="st-date-input"
                  value={searchEnd}
                  onChange={(e) => setSearchEnd(e.target.value)}
                />
              </div>
              <button className="st-search-btn" onClick={searchByWorker}>
                🔍 검색
              </button>
            </div>

            {searchLoading && (
              <div style={{ textAlign: 'center', color: '#8a8a82', padding: '2rem' }}>
                검색 중...
              </div>
            )}

            {!searchLoading && workerSearchResult && workerSearchResult.error && (
              <div
                style={{
                  textAlign: 'center', color: '#e89a82', padding: '1.5rem',
                  background: 'rgba(180,60,40,0.1)', border: '1px solid rgba(180,60,40,0.3)',
                  borderRadius: '12px',
                }}
              >
                ⚠️ 검색에 실패했습니다. 인터넷 연결을 확인해주세요.
              </div>
            )}

            {!searchLoading && workerSearchResult && !workerSearchResult.error && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#8a8a82' }}>
                    {workerSearchResult.start} ~ {workerSearchResult.end}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '2.2rem', fontWeight: 600, color: '#e8d48f',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    총 {workerSearchResult.grandTotal.toLocaleString()}
                  </div>
                  {workerSearchResult.workers.length > 0 && (
                    <button
                      onClick={copyWorkerSearch}
                      style={{
                        marginTop: '0.8rem',
                        background: 'linear-gradient(135deg, #c9a227, #e8d48f)',
                        color: '#1a1407',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        padding: '0.6rem 1.6rem',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span>📋</span>
                      <span>결과 복사하기</span>
                    </button>
                  )}
                </div>

                {workerSearchResult.workers.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8a8a82', padding: '2rem' }}>
                    이 기간에 저장된 데이터가 없습니다.
                  </div>
                ) : (
                  <div className="st-ranks">
                    {workerSearchResult.workers.map((w: any, idx: number) => {
                      const badgeClass =
                        idx === 0 ? 'badge-1' : idx === 1 ? 'badge-2' : idx === 2 ? 'badge-3' : 'badge-n';
                      const topVol = workerSearchResult.workers[0].total || 1;
                      const barW = Math.max(5, (w.total / topVol) * 100);
                      const isExpanded = expandedWorker === w.name;
                      return (
                        <div
                          key={w.name}
                          className={'st-rank-card' + (idx < 3 ? ' top' : '')}
                          onClick={() => setExpandedWorker(isExpanded ? null : w.name)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="st-rank-row">
                            <div className={'st-rank-badge ' + badgeClass}>{idx + 1}</div>
                            <div className="st-rank-name">
                              {w.name === '김대원' ? (
                                <>빛나는대원</>
                              ) : (
                                w.name
                              )}
                              <span style={{ fontSize: '0.8rem', color: '#8a8a82', fontWeight: 400, marginLeft: '0.6rem' }}>
                                {w.days}일 근무
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#c9a227', marginLeft: '0.5rem' }}>
                                {isExpanded ? '▲ 접기' : '▼ 날짜별'}
                              </span>
                            </div>
                            <div className="st-rank-vol">{w.total.toLocaleString()}</div>
                          </div>
                          <div className="st-bar-track">
                            <div className="st-bar-fill" style={{ width: barW + '%' }} />
                          </div>

                          {/* 하루 평균 (1차+2차 완전한 날만) */}
                          {w.avg !== null && (
                            <div
                              style={{
                                marginTop: '0.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.85rem',
                              }}
                            >
                              <span style={{ color: '#8a8a82' }}>📊 하루 평균</span>
                              <span style={{ color: '#e8d48f', fontWeight: 800 }}>
                                {w.avg.toLocaleString()}
                              </span>
                              <span style={{ color: '#6a6a62', fontSize: '0.78rem' }}>
                                (1·2차 모두 있는 {w.avgDays}일 기준)
                              </span>
                            </div>
                          )}

                          {/* 클릭 시 펼쳐짐: 날짜별 + 노선별 */}
                          {isExpanded && (
                            <div
                              style={{
                                marginTop: '0.9rem',
                                paddingTop: '0.9rem',
                                borderTop: '1px solid rgba(201,162,39,0.2)',
                              }}
                            >
                              {/* 날짜별 물량 (정산월 달력) */}
                              {w.dates && w.dates.length > 0 && (
                                <div onClick={(e) => e.stopPropagation()}>
                                  <div style={{ fontSize: '0.75rem', color: '#c9a227', letterSpacing: '1px', marginBottom: '0.6rem' }}>
                                    날짜별 물량
                                  </div>
                                  <BillingCalendar dates={w.dates} detailLabel="route" />
                                </div>
                              )}

                              {/* 노선별 물량 */}
                              <div style={{ fontSize: '0.75rem', color: '#c9a227', letterSpacing: '1px', margin: '1rem 0 0.6rem' }}>
                                노선별 물량 ({w.routes.length}개)
                              </div>
                              <div className="st-detail-routes" style={{ marginTop: 0 }}>
                                {w.routes.map((r: any) => (
                                  <span key={r.route} className="st-chip">
                                    {r.route}
                                    <b>{r.vol.toLocaleString()}</b>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== 탭 3: 노선별 검색 ===== */}
        {activeTab === 'route' && (
          <div>
            <div className="st-search-box">
              <div className="st-search-title">
                <span>🛣️</span>
                <span>노선별 검색</span>
              </div>
              <div className="st-quick-btns">
                <button className="st-quick-btn" onClick={setPeriodThisMonth}>이번 달 정산</button>
                <button className="st-quick-btn" onClick={setPeriodLastMonth}>지난 달 정산</button>
              </div>
              <div className="st-date-row">
                <input
                  type="date"
                  className="st-date-input"
                  value={searchStart}
                  onChange={(e) => setSearchStart(e.target.value)}
                />
                <span className="st-date-label">~</span>
                <input
                  type="date"
                  className="st-date-input"
                  value={searchEnd}
                  onChange={(e) => setSearchEnd(e.target.value)}
                />
              </div>
              <button className="st-search-btn" onClick={searchByRoute}>
                🔍 검색
              </button>
            </div>

            {searchLoading && (
              <div style={{ textAlign: 'center', color: '#8a8a82', padding: '2rem' }}>
                검색 중...
              </div>
            )}

            {!searchLoading && routeSearchResult && routeSearchResult.error && (
              <div
                style={{
                  textAlign: 'center', color: '#e89a82', padding: '1.5rem',
                  background: 'rgba(180,60,40,0.1)', border: '1px solid rgba(180,60,40,0.3)',
                  borderRadius: '12px',
                }}
              >
                ⚠️ 검색에 실패했습니다. 인터넷 연결을 확인해주세요.
              </div>
            )}

            {!searchLoading && routeSearchResult && !routeSearchResult.error && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#8a8a82' }}>
                    {routeSearchResult.start} ~ {routeSearchResult.end}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '2.2rem', fontWeight: 600, color: '#e8d48f',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    총 {routeSearchResult.grandTotal.toLocaleString()}
                  </div>
                  {routeSearchResult.routes.length > 0 && (
                    <button
                      onClick={copyRouteSearch}
                      style={{
                        marginTop: '0.8rem',
                        background: 'linear-gradient(135deg, #c9a227, #e8d48f)',
                        color: '#1a1407',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        padding: '0.6rem 1.6rem',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span>📋</span>
                      <span>결과 복사하기</span>
                    </button>
                  )}
                </div>

                {routeSearchResult.routes.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#8a8a82', padding: '2rem' }}>
                    이 기간에 저장된 데이터가 없습니다.
                  </div>
                ) : (
                  <div className="st-ranks">
                    {routeSearchResult.routes.map((r: any) => {
                      const isExpanded = expandedRoute === r.route;
                      return (
                        <div
                          key={r.route}
                          className="st-rank-card"
                          onClick={() => setExpandedRoute(isExpanded ? null : r.route)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="st-rank-row">
                            <div
                              className="st-rank-name"
                              style={{ fontFamily: "'Courier New', monospace", fontSize: '1.3rem' }}
                            >
                              {r.route}
                              <span style={{ fontSize: '0.8rem', color: '#8a8a82', fontWeight: 400, marginLeft: '0.6rem', fontFamily: "'Noto Sans KR', sans-serif" }}>
                                {r.days}일 운영
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#c9a227', marginLeft: '0.5rem', fontFamily: "'Noto Sans KR', sans-serif" }}>
                                {isExpanded ? '▲ 접기' : '▼ 날짜별'}
                              </span>
                            </div>
                            <div className="st-rank-vol">{r.total.toLocaleString()}</div>
                          </div>

                          {/* 하루 평균 (1차+2차 완전한 날만) */}
                          {r.avg !== null && (
                            <div
                              style={{
                                marginTop: '0.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.85rem',
                              }}
                            >
                              <span style={{ color: '#8a8a82' }}>📊 하루 평균</span>
                              <span style={{ color: '#e8d48f', fontWeight: 800 }}>
                                {r.avg.toLocaleString()}
                              </span>
                              <span style={{ color: '#6a6a62', fontSize: '0.78rem' }}>
                                (1·2차 모두 있는 {r.avgDays}일 기준)
                              </span>
                            </div>
                          )}

                          {/* 클릭 시 펼쳐짐: 날짜별 + 담당자별 */}
                          {isExpanded && (
                            <div
                              style={{
                                marginTop: '0.9rem',
                                paddingTop: '0.9rem',
                                borderTop: '1px solid rgba(201,162,39,0.2)',
                              }}
                            >
                              {/* 날짜별 물량 (정산월 달력) */}
                              {r.dates && r.dates.length > 0 && (
                                <div onClick={(e) => e.stopPropagation()}>
                                  <div style={{ fontSize: '0.75rem', color: '#c9a227', letterSpacing: '1px', marginBottom: '0.6rem' }}>
                                    날짜별 물량
                                  </div>
                                  <BillingCalendar dates={r.dates} detailLabel="worker" />
                                </div>
                              )}

                              {/* 담당자별 물량 */}
                              <div style={{ fontSize: '0.75rem', color: '#c9a227', letterSpacing: '1px', margin: '1rem 0 0.6rem' }}>
                                담당자별 물량 ({r.workers.length}명)
                              </div>
                              <div className="st-detail-routes" style={{ marginTop: 0 }}>
                                {r.workers.map((w: any) => (
                                  <span key={w.name} className="st-chip">
                                    {w.name === '김대원' ? '빛나는대원' : w.name}
                                    <b>{w.vol.toLocaleString()}</b>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== 탭 4: 데이터 삭제 ===== */}
        {activeTab === 'delete' && (
          <div>
            <div className="st-search-box">
              <div className="st-search-title">
                <span>🗑️</span>
                <span>데이터 삭제</span>
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#8a8a82',
                  marginBottom: '1.2rem',
                  lineHeight: 1.6,
                }}
              >
                물량을 잘못 입력한 날이 있으면 여기서 삭제할 수 있습니다.
                <br />
                날짜를 고르고 <b style={{ color: '#d8c98f' }}>조회</b>로 내용을 확인한 뒤 삭제하세요.
                <br />
                <span style={{ color: '#d9a98f' }}>
                  ※ 올바른 데이터가 있으면, 삭제 대신 그 날짜로 다시 분석하면 자동으로 덮어써집니다.
                </span>
              </div>
              <div className="st-date-row">
                <span className="st-date-label">날짜</span>
                <input
                  type="date"
                  className="st-date-input"
                  value={deleteDate || todayStr}
                  onChange={(e) => {
                    setDeleteDate(e.target.value);
                    setDeletePreview(null);
                    setDeleteStatus('');
                  }}
                />
              </div>
              <button className="st-search-btn" onClick={previewDelete}>
                🔍 조회
              </button>
            </div>

            {deleteLoading && (
              <div style={{ textAlign: 'center', color: '#8a8a82', padding: '2rem' }}>
                조회 중...
              </div>
            )}

            {!deleteLoading && deletePreview && deletePreview.error && (
              <div
                style={{
                  textAlign: 'center', color: '#e89a82', padding: '1.5rem',
                  background: 'rgba(180,60,40,0.1)', border: '1px solid rgba(180,60,40,0.3)',
                  borderRadius: '12px',
                }}
              >
                ⚠️ 조회에 실패했습니다. 인터넷 연결을 확인해주세요.
              </div>
            )}

            {!deleteLoading && deletePreview && deletePreview.empty && (
              <div style={{ textAlign: 'center', color: '#8a8a82', padding: '2rem' }}>
                📭 {deletePreview.date}에 저장된 데이터가 없습니다.
              </div>
            )}

            {!deleteLoading && deletePreview && !deletePreview.error && !deletePreview.empty && (
              <div>
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(180,60,40,0.12), #141414 70%)',
                    border: '2px solid rgba(180,60,40,0.4)',
                    borderRadius: '16px',
                    padding: '1.4rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: '#8a8a82' }}>{deletePreview.date}</div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '2rem', fontWeight: 600, color: '#e8d48f',
                      margin: '0.3rem 0',
                    }}
                  >
                    {deletePreview.count}명 · 총 {deletePreview.total.toLocaleString()}
                  </div>

                  {/* 1차/2차 분리 표시 */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '1.5rem',
                      margin: '0.8rem 0 1.2rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <span style={{ color: deletePreview.hasTrip1 ? '#d8d4c8' : '#5a5a55' }}>
                      1차: <b style={{ color: deletePreview.hasTrip1 ? '#e8d48f' : '#5a5a55' }}>
                        {deletePreview.hasTrip1 ? deletePreview.trip1Total.toLocaleString() : '없음'}
                      </b>
                    </span>
                    <span style={{ color: deletePreview.hasTrip2 ? '#d8d4c8' : '#5a5a55' }}>
                      2차: <b style={{ color: deletePreview.hasTrip2 ? '#e8d48f' : '#5a5a55' }}>
                        {deletePreview.hasTrip2 ? deletePreview.trip2Total.toLocaleString() : '없음'}
                      </b>
                    </span>
                  </div>

                  {/* 삭제 버튼 3개 */}
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {deletePreview.hasTrip1 && (
                      <button
                        onClick={() => doDelete(1)}
                        style={{
                          background: 'rgba(180,60,40,0.15)',
                          border: '1px solid rgba(220,80,60,0.5)',
                          color: '#f0b89f',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          padding: '0.7rem 1.2rem',
                          borderRadius: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        🗑️ 1차만 삭제
                      </button>
                    )}
                    {deletePreview.hasTrip2 && (
                      <button
                        onClick={() => doDelete(2)}
                        style={{
                          background: 'rgba(180,60,40,0.15)',
                          border: '1px solid rgba(220,80,60,0.5)',
                          color: '#f0b89f',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          padding: '0.7rem 1.2rem',
                          borderRadius: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        🗑️ 2차만 삭제
                      </button>
                    )}
                    <button
                      onClick={() => doDelete('all')}
                      style={{
                        background: 'linear-gradient(135deg, #b91c1c, #dc2626)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        padding: '0.7rem 1.4rem',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      🗑️ 전체 삭제
                    </button>
                  </div>
                </div>

                {/* 삭제 전 내용 미리보기 */}
                <div className="st-ranks">
                  {deletePreview.workers.map((w: any) => (
                    <div key={w.name} className="st-rank-card" style={{ padding: '0.9rem 1.2rem' }}>
                      <div className="st-rank-row">
                        <div className="st-rank-name" style={{ fontSize: '1.1rem' }}>
                          {w.name === '김대원' ? '빛나는대원' : w.name}
                        </div>
                        <div className="st-rank-vol" style={{ fontSize: '1.4rem' }}>
                          {w.volume.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deleteStatus === 'deleting' && (
              <div style={{ textAlign: 'center', color: '#8a8a82', padding: '1.5rem' }}>
                삭제 중...
              </div>
            )}
            {deleteStatus === 'deleted' && (
              <div
                style={{
                  textAlign: 'center', color: '#9aca7a', padding: '1.5rem',
                  background: 'rgba(120,180,80,0.1)', border: '1px solid rgba(120,180,80,0.3)',
                  borderRadius: '12px', fontWeight: 700,
                }}
              >
                ✓ 삭제 완료되었습니다. (월 누적·검색에서 빠집니다)
              </div>
            )}
            {deleteStatus === 'error' && (
              <div
                style={{
                  textAlign: 'center', color: '#e89a82', padding: '1.5rem',
                  background: 'rgba(180,60,40,0.1)', border: '1px solid rgba(180,60,40,0.3)',
                  borderRadius: '12px',
                }}
              >
                ⚠️ 삭제에 실패했습니다. 다시 시도해주세요.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
