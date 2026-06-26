'use client';

import { useState, useEffect } from 'react';

export default function SmartTripAnalyzer() {
  const [trip1Data, setTrip1Data] = useState('');
  const [trip2Data, setTrip2Data] = useState('');
  const [scheduleData, setScheduleData] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  // ✅ 반응형(모바일) 판단
  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(max-width: 768px)').matches;

  // ✅ [업그레이드] 입력값 자동 불러오기 (페이지 열릴 때 1회)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smarttrip_inputs');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.scheduleData) setScheduleData(data.scheduleData);
        if (data.trip1Data) setTrip1Data(data.trip1Data);
        if (data.trip2Data) setTrip2Data(data.trip2Data);
      }
    } catch {
      // 저장된 값 없거나 손상 시 무시
    }
    setLoaded(true);
  }, []);

  // ✅ [업그레이드] 입력값 자동 저장 (입력 바뀔 때마다)
  useEffect(() => {
    if (!loaded) return; // 첫 로드 전에는 저장하지 않음
    try {
      localStorage.setItem(
        'smarttrip_inputs',
        JSON.stringify({ scheduleData, trip1Data, trip2Data })
      );
    } catch {
      // 저장 공간 문제 등 무시
    }
  }, [scheduleData, trip1Data, trip2Data, loaded]);

  // ✅ [업그레이드] 입력 초기화
  const resetInputs = () => {
    if (!confirm('입력한 내용을 모두 지울까요?')) return;
    setScheduleData('');
    setTrip1Data('');
    setTrip2Data('');
    setResult(null);
    setTargetDate('');
    try {
      localStorage.removeItem('smarttrip_inputs');
    } catch {
      // 무시
    }
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

  // ✅ [업그레이드] 유연한 수량 인식
  // 구분자(공백/탭/파이프)가 몇 개든, 구역코드 중간에 공백이 있어도 인식.
  // 규칙: 맨 끝 숫자 = 수량, 나머지에서 공백/탭/파이프 모두 제거 = 구역코드
  const parseVolumeData = (text: string) => {
    const lines = text.trim().split('\n');
    const volumes: Record<string, number> = {};
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      // 헤더/안내 줄 제외
      if (
        trimmed.includes('B&M') ||
        trimmed.includes('캠도물량') ||
        trimmed.includes('Trip')
      )
        return;

      // "코드부분 ... 끝숫자" 형태에서 끝 숫자를 수량으로 분리
      const match = trimmed.match(/^(.+?)[\s|]+(\d+)\s*$/);
      if (!match) return;

      // 코드 부분의 모든 공백/탭/파이프 제거 → 순수 구역코드
      const code = match[1].replace(/[\s|]+/g, '');
      const vol = parseInt(match[2]) || 0;

      // 코드가 비어있거나 숫자만 있으면(=잘못된 줄) 제외
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
        // ✅ 스케줄 구역코드도 공백 제거해서 통일
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

  const analyze = () => {
    if (!trip1Data || !scheduleData) {
      alert('⚠️ Trip1 물량과 스케줄을 모두 입력해주세요.');
      return;
    }

    const trip1Date = extractDate(trip1Data);
    const trip2Date = trip2Data ? extractDate(trip2Data) : null;
    const scheduleDate = extractDate(scheduleData);

    if (!trip1Date || !scheduleDate) {
      alert('⚠️ 날짜를 찾을 수 없습니다.');
      return;
    }

    if (trip1Date !== scheduleDate || (trip2Date && trip2Date !== scheduleDate)) {
      alert('❌ 날짜가 일치하지 않습니다!');
      return;
    }

    setTargetDate(scheduleDate);
    const trip1Volumes = parseVolumeData(trip1Data);
    const trip2Volumes = trip2Data ? parseVolumeData(trip2Data) : {};
    const schedule = parseScheduleData(scheduleData);

    // ✅ [업그레이드] 배정된 구역 전체 집합 만들기 (미배정 경고용)
    const assignedRoutes = new Set<string>();
    Object.values(schedule).forEach((routes) => {
      routes.forEach((route) => {
        expandRoutes(route, trip1Volumes, trip2Volumes).forEach((r) => {
          assignedRoutes.add(r);
        });
      });
    });

    // ✅ [업그레이드] 물량은 있는데(수량>0) 아무한테도 배정 안 된 구역 찾기
    const allVolumeRoutes = new Set<string>([
      ...Object.keys(trip1Volumes),
      ...Object.keys(trip2Volumes),
    ]);
    const unassigned: { route: string; trip1: number; trip2: number; total: number }[] = [];
    allVolumeRoutes.forEach((route) => {
      const t1 = trip1Volumes[route] || 0;
      const t2 = trip2Volumes[route] || 0;
      const total = t1 + t2;
      // 수량이 0이면 경고 대상 아님 (수량 0은 정상)
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
      unassigned, // ✅ 미배정 구역 목록
      recognizedCount: allVolumeRoutes.size, // ✅ 인식된 구역 개수 (안심용)
    });
  };

  const copyToClipboard = () => {
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

    result.workers.forEach(([worker, data]: any, index: number) => {
      const emoji = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
      const trip2Ratio =
        hasTrip2 && data.total > 0 ? ((data.trip2 / data.total) * 100).toFixed(2) : '0.00';
      const displayVolume = hasTrip2 ? data.trip2 : data.trip1;
      const ratioText = hasTrip2 ? ' (비율: ' + trip2Ratio + '%)' : '';

      text += emoji + ' ' + worker + ' (합계: ' + displayVolume + ')' + ratioText + '\n';

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

    // ✅ [업그레이드] 미배정 구역이 있으면 복사 텍스트에도 경고 포함
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

  return (
    <div
      style={{
        fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: isMobile ? '1rem' : '2rem',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
{/* 헤더 */}
<div style={{
  backdropFilter: 'blur(20px)',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  borderRadius: '20px',
  padding: '2rem',
  marginBottom: '2rem'
}}>
  {/* 모바일 로고 크게/텍스트 최소화를 위한 인라인 CSS */}
  <style>{`
    .headerWrap {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .logoCircle {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 10px 50px rgba(102, 126, 234, 0.5);
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 4px solid rgba(255, 255, 255, 0.5);
      position: relative;
      flex: 0 0 auto;
    }
    .logoImg {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .titleBig { 
      font-size: 2.5rem; 
      font-weight: 900; 
      color: white; 
      margin: 0; 
      letter-spacing: -1px; 
      line-height: 1.05;
    }
    .subText { 
      font-size: 1rem; 
      color: rgba(255, 255, 255, 0.9); 
      margin-top: 0.5rem; 
      font-weight: 500; 
    }

    /* ✅ 모바일: 로고가 화면을 꽉 차게 크게 + 텍스트는 "물량 분석기"만 */
    @media (max-width: 480px) {
      .headerWrap {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
      }

      /* 로고를 크게: 화면 너비에 맞춰 최대한 확장 */
      .logoCircle {
        width: min(72vw, 260px);
        height: min(72vw, 260px);
        border-radius: 9999px;
        border-width: 6px;
      }

      /* "SmartTrip" 크게 필요없으면 숨김 */
      .titleBig {
        display: none;
      }

      /* 부제는 숨김 */
      .subText {
        display: none;
      }

      /* 대신 "물량 분석기"만 보여주기 */
      .titleMobileOnly {
        display: block;
        font-size: 1.8rem;
        font-weight: 900;
        color: white;
        margin: 0;
        letter-spacing: -0.5px;
      }
    }

    /* 데스크탑/태블릿에서는 모바일 전용 텍스트 숨김 */
    .titleMobileOnly { display: none; }
  `}</style>

  <div className="headerWrap">
    {/* 원형 아이돌 이미지 로고 */}
    <div className="logoCircle">
      <img
        src="/idol-logo.png"
        alt="Profile"
        className="logoImg"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          const parent = target.parentElement;
          if (parent) {
            parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            parent.innerHTML = '<div style="font-size: 3rem;">📦</div>';
          }
        }}
      />
    </div>

    <div>
      {/* 데스크탑: 기존 제목 */}
      <h1 className="titleBig">SmartTrip 물량 분석기</h1>
      <p className="subText">프리미엄 물량 데이터 분석 시스템</p>

      {/* 모바일: 텍스트 최소 */}
      <h2 className="titleMobileOnly">물량 분석기</h2>
    </div>
  </div>
</div>


        {/* 입력 카드들 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}
        >
          {/* 스케줄 입력 */}
          <div
            style={{
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.4s',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                padding: '1.5rem',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <span style={{ fontSize: '2rem' }}>👥</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>당일 스케줄</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <textarea
                value={scheduleData}
                onChange={(e) => setScheduleData(e.target.value)}
                placeholder="📅 예시:&#10;2W 입차일 : 1월 15일 수요일&#10;출근인원 : 13명&#10;&#10;501B01 / 김병후&#10;501B02 / 김병후&#10;511B / 임민호&#10;..."
                style={{
                  width: '100%',
                  height: '16rem',
                  padding: '1.2rem',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.9rem',
                  resize: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#1f2937',
                  transition: 'all 0.3s',
                }}
              />
              <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: 'white',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    marginBottom: '0.5rem',
                  }}
                >
                  💡 511B, 529A 같은 표기는 전체 하위구역 포함
                </div>
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: 'white',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    fontWeight: 500,
                  }}
                >
                  ⚠️ 날짜 필수: "1월 15일" 형식
                </div>
              </div>
            </div>
          </div>

          {/* Trip1 입력 */}
          <div
            style={{
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                padding: '1.5rem',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <span style={{ fontSize: '2rem' }}>📊</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Trip1 물량 데이터</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <textarea
                value={trip1Data}
                onChange={(e) => setTrip1Data(e.target.value)}
                placeholder="📦 예시:&#10;26.01.15Trip1 캠도물량&#10;B&M로지스&#10;501B01 24&#10;501B02 40&#10;(공백/탭/| 무엇이든 인식됩니다)&#10;..."
                style={{
                  width: '100%',
                  height: '16rem',
                  padding: '1.2rem',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.9rem',
                  resize: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#1f2937',
                }}
              />
              <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: 'white',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    fontWeight: 500,
                  }}
                >
                  ⚠️ 날짜 필수: "26.01.15Trip1" 형식
                </div>
              </div>
            </div>
          </div>

          {/* Trip2 입력 */}
          <div
            style={{
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                padding: '1.5rem',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <span style={{ fontSize: '2rem' }}>📈</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Trip2 물량 데이터</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <textarea
                value={trip2Data}
                onChange={(e) => setTrip2Data(e.target.value)}
                placeholder="📦 예시 (선택):&#10;26.01.15Trip2 캠도물량&#10;B&M로지스&#10;501B01 7&#10;501B02 15&#10;..."
                style={{
                  width: '100%',
                  height: '16rem',
                  padding: '1.2rem',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '0.9rem',
                  resize: 'none',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#1f2937',
                }}
              />
              <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: 'white',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    marginBottom: '0.5rem',
                  }}
                >
                  💡 Trip2가 없으면 비워두세요
                </div>
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: 'white',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    fontWeight: 500,
                  }}
                >
                  ⚠️ 날짜 필수: "26.01.15Trip2" 형식
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '3rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={analyze}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 700,
              padding: isMobile ? '1.2rem 3rem' : '1.5rem 5rem',
              borderRadius: '20px',
              border: 'none',
              fontSize: isMobile ? '1.1rem' : '1.3rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            <span style={{ fontSize: '2rem' }}>🔍</span>
            <span>분석 실행</span>
          </button>

          {/* ✅ [업그레이드] 입력 초기화 버튼 */}
          <button
            onClick={resetInputs}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              fontWeight: 700,
              padding: isMobile ? '1.2rem 1.8rem' : '1.5rem 2.5rem',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontSize: isMobile ? '1rem' : '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>🗑️</span>
            <span>입력 초기화</span>
          </button>
        </div>

        {/* 결과 표시 */}
        {result && (
          <div
            style={{
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              overflow: 'hidden',
              marginBottom: '3rem',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: isMobile ? '1.5rem' : '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '1rem' : '0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontSize: '3.5rem' }}>📈</span>
                <div>
                  <h2 style={{ fontSize: isMobile ? '1.6rem' : '2rem', fontWeight: 800, color: 'white', margin: 0 }}>
                    분석 결과
                  </h2>
                  <p
                    style={{
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      marginTop: '0.5rem',
                    }}
                  >
                    {new Date(targetDate).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={copyToClipboard}
                style={{
                  background: 'white',
                  color: '#1f2937',
                  fontWeight: 700,
                  padding: '1rem 2.5rem',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: isMobile ? '100%' : 'auto',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>📋</span>
                <span>복사하기</span>
              </button>
            </div>

            <div style={{ padding: isMobile ? '1.5rem' : '2.5rem' }}>
              {/* ✅ [업그레이드] 인식 확인 + 미배정 경고 */}
              <div
                style={{
                  padding: '0.9rem 1.2rem',
                  borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#065f46',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginBottom: result.unassigned && result.unassigned.length > 0 ? '1rem' : '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>✅</span>
                <span>물량 데이터 {result.recognizedCount}개 구역 인식 완료</span>
              </div>

              {/* ✅ [업그레이드] 미배정 구역 경고 (물량은 있는데 배정 안 된 구역) */}
              {result.unassigned && result.unassigned.length > 0 && (
                <div
                  style={{
                    padding: '1.2rem 1.4rem',
                    borderRadius: '16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '2px solid rgba(239, 68, 68, 0.4)',
                    marginBottom: '2rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '1.1rem',
                      fontWeight: 900,
                      color: '#b91c1c',
                      marginBottom: '0.8rem',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <span>미배정 구역 {result.unassigned.length}개 — 배정 누락 확인 필요!</span>
                  </div>
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    {result.unassigned.map((u: any) => {
                      const hasTrip2 = result.trip2Total > 0;
                      const vol = hasTrip2 ? (u.trip2 > 0 ? u.trip2 : u.total) : u.trip1;
                      return (
                        <div
                          key={u.route}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.55rem 0.85rem',
                            borderRadius: '10px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            fontFamily: "'Courier New', monospace",
                          }}
                        >
                          <span style={{ fontWeight: 800, color: '#991b1b' }}>{u.route}</span>
                          <span style={{ fontWeight: 900, color: '#7f1d1d' }}>
                            {vol.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 요약 통계 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '2rem',
                }}
              >
                <div style={{
                  background: 'white',
                  borderRadius: '18px',
                  padding: '1.2rem',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>총 인원</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '0.25rem' }}>
                    {result.workerCount}명
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '18px',
                  padding: '1.2rem',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>Trip1 총 수량</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '0.25rem' }}>
                    {result.trip1Total.toLocaleString()}
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '18px',
                  padding: '1.2rem',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>Trip2 총 수량</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '0.25rem' }}>
                    {result.trip2Total.toLocaleString()}
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  borderRadius: '18px',
                  padding: '1.2rem',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>금일 총 수량</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginTop: '0.25rem' }}>
                    {result.totalVolume.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 작업자 리스트 */}
              <div style={{ display: 'grid', gap: '1rem' }}>
                {result.workers.map(([worker, data]: any, index: number) => {
                  const medal = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
                  const hasTrip2 = result.trip2Total > 0;
                  const mainVol = hasTrip2 ? data.trip2 : data.trip1;

                  return (
                    <div
                      key={worker}
                      style={{
                        background: 'white',
                        borderRadius: '18px',
                        padding: '1.2rem',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(15, 23, 42, 0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                          {medal} {worker}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#111827' }}>
                          {mainVol.toLocaleString()}
                        </div>
                      </div>

                      {result.trip2Total > 0 && (
                        <div style={{ marginTop: '0.3rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>
                          금일 총합계: {data.total.toLocaleString()}
                        </div>
                      )}

                      <div style={{ marginTop: '0.8rem', display: 'grid', gap: '0.35rem' }}>
                        {data.routes
                          .map((r: any) => {
                            const vol = hasTrip2 ? r.trip2 : r.trip1;
                            return { ...r, vol };
                          })
                          .filter((r: any) => r.vol > 0)
                          .sort((a: any, b: any) => b.vol - a.vol)
                          .map((r: any) => (
                            <div
                              key={r.route}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0.55rem 0.75rem',
                                borderRadius: '12px',
                                background: 'rgba(15, 23, 42, 0.04)',
                                fontFamily: "'Courier New', monospace"
                              }}
                            >
                              <span style={{ fontWeight: 800, color: '#0f172a' }}>{r.route}</span>
                              <span style={{ fontWeight: 900, color: '#111827' }}>{r.vol.toLocaleString()}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
