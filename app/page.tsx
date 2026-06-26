'use client';

import { useState, useEffect } from 'react';

export default function SmartTripAnalyzer() {
  const [trip1Data, setTrip1Data] = useState('');
  const [trip2Data, setTrip2Data] = useState('');
  const [scheduleData, setScheduleData] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  // ✅ 이름 표시 변환 (화면에만 적용, 복사는 원래 이름 유지)
  const displayName = (name: string) => {
    if (name === '김대원') return '대원♡빛나';
    return name;
  };

  // ✅ 입력값 자동 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smarttrip_inputs');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.scheduleData) setScheduleData(data.scheduleData);
        if (data.trip1Data) setTrip1Data(data.trip1Data);
        if (data.trip2Data) setTrip2Data(data.trip2Data);
      }
    } catch {}
    setLoaded(true);
  }, []);

  // ✅ 입력값 자동 저장
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

    // 복사 텍스트에도 표시 이름 적용 (김대원 → 대원♡빛나)
    result.workers.forEach(([worker, data]: any, index: number) => {
      const emoji = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
      const trip2Ratio =
        hasTrip2 && data.total > 0 ? ((data.trip2 / data.total) * 100).toFixed(2) : '0.00';
      const displayVolume = hasTrip2 ? data.trip2 : data.trip1;
      const ratioText = hasTrip2 ? ' (비율: ' + trip2Ratio + '%)' : '';
      const nameForCopy = displayName(worker);

      text += emoji + ' ' + nameForCopy + ' (합계: ' + displayVolume + ')' + ratioText + '\n';

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
          text-align: center;
          padding: 1.5rem 0 2.5rem;
          border-bottom: 1px solid rgba(201,162,39,0.18);
          margin-bottom: 2.5rem;
        }
        .st-logo-ring {
          width: 92px; height: 92px;
          border-radius: 50%;
          margin: 0 auto 1.4rem;
          padding: 3px;
          background: linear-gradient(135deg, #c9a227, #e8d48f, #c9a227);
          display: flex; align-items: center; justify-content: center;
        }
        .st-logo-inner {
          width: 100%; height: 100%;
          border-radius: 50%;
          background: #161616;
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem;
          overflow: hidden;
        }
        .st-logo-inner img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .st-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          line-height: 1;
        }
        .st-brand .accent { color: #c9a227; }
        .st-tagline {
          margin-top: 0.7rem;
          font-size: 0.8rem;
          letter-spacing: 4px;
          color: #8a8a82;
          font-weight: 500;
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
          border: 1px solid rgba(201,162,39,0.15);
          border-radius: 18px;
          overflow: hidden;
        }
        .st-card-head {
          padding: 1.1rem 1.4rem;
          display: flex; align-items: center; gap: 0.8rem;
          border-bottom: 1px solid rgba(201,162,39,0.12);
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
        .st-hint {
          margin-top: 0.9rem;
          padding: 0.65rem 0.9rem;
          border-radius: 10px;
          font-size: 0.83rem;
          font-weight: 500;
        }
        .st-hint.info { background: rgba(201,162,39,0.08); color: #d8c98f; border: 1px solid rgba(201,162,39,0.2); margin-bottom: 0.5rem; }
        .st-hint.warn { background: rgba(180,80,40,0.1); color: #d9a98f; border: 1px solid rgba(180,80,40,0.25); }

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
          gap: 1px; background: rgba(201,162,39,0.18);
          border: 1px solid rgba(201,162,39,0.18); border-radius: 14px;
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
          .st-brand { font-size: 2.2rem; }
          .st-rank-name { font-size: 1.3rem; }
          .st-rank-vol { font-size: 1.9rem; }
          .st-stat-num { font-size: 1.7rem; }
          .st-btn-main { padding: 1rem 2.5rem; }
        }
      `}</style>

      <div className="st-wrap">
        {/* 헤더 */}
        <div className="st-header">
          <div className="st-logo-ring">
            <div className="st-logo-inner">
              <img
                src="/idol-logo.png"
                alt="Profile"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) parent.innerHTML = '<div style="font-size:2rem;">📦</div>';
                }}
              />
            </div>
          </div>
          <div className="st-brand">
            Smart<span className="accent">Trip</span>
          </div>
          <div className="st-tagline">물량 분석 시스템</div>
        </div>

        {/* ✅ 입력 초기화 버튼을 입력 카드 위로 */}
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
              <div className="st-hint info">💡 511B, 529A 같은 표기는 전체 하위구역 포함</div>
              <div className="st-hint warn">⚠️ 날짜 필수: &quot;1월 15일&quot; 형식</div>
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
              <div className="st-hint warn">⚠️ 날짜 필수: &quot;26.01.15Trip1&quot; 형식</div>
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
              <div className="st-hint info">💡 Trip2가 없으면 비워두세요</div>
              <div className="st-hint warn">⚠️ 날짜 필수: &quot;26.01.15Trip2&quot; 형식</div>
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
                          <>
                            대원<span style={{ color: '#c9a227' }}>♡</span>빛나
                          </>
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
          </div>
        )}
      </div>
    </div>
  );
}
