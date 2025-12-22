"use client";

import React, { useState } from 'react';

export default function SmartTripAnalyzer() {
  const [trip1Data, setTrip1Data] = useState('');
  const [trip2Data, setTrip2Data] = useState('');
  const [scheduleData, setScheduleData] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [result, setResult] = useState(null);

  // 날짜 추출 함수
  const extractDate = (text: string) => {
    // "25.12.21" 또는 "2025.12.21" 형식 찾기
    const dotMatch = text.match(/(\d{2,4})\.(\d{1,2})\.(\d{1,2})/);
    if (dotMatch) {
      let year = dotMatch[1];
      const month = dotMatch[2].padStart(2, '0');
      const day = dotMatch[3].padStart(2, '0');
      
      // 2자리 연도를 4자리로 변환
      if (year.length === 2) {
        year = '20' + year;
      }
      
      return year + '-' + month + '-' + day;
    }
    
    // "12월 21일" 형식 찾기
    const koreanMatch = text.match(/(\d{1,2})월\s*(\d{1,2})일/);
    if (koreanMatch) {
      const month = koreanMatch[1].padStart(2, '0');
      const day = koreanMatch[2].padStart(2, '0');
      return '2025-' + month + '-' + day;
    }
    
    return null;
  };

  // 물량 데이터 파싱 함수
  const parseVolumeData = (text: string) => {
    const lines = text.trim().split('\n');
    const volumes = {};
    
    lines.forEach(line => {
      const parts = line.split('|').map(s => s.trim());
      if (parts.length >= 2 && parts[0] && !parts[0].includes('B&M') && !parts[0].includes('캠도물량')) {
        const route = parts[0];
        const volume = parseInt(parts[1]) || 0;
        volumes[route] = volume;
      }
    });
    
    return volumes;
  };

  // 스케줄 데이터 파싱 함수
  const parseScheduleData = (text) => {
    const lines = text.trim().split('\n');
    const schedule = {};
    
    lines.forEach(line => {
      const parts = line.split('/').map(s => s.trim());
      if (parts.length >= 2) {
        const route = parts[0];
        const name = parts[1];
        
        if (!schedule[name]) {
          schedule[name] = [];
        }
        schedule[name].push(route);
      }
    });
    
    return schedule;
  };

  // 라우트를 개별 하위 라우트로 확장하는 함수
  const expandRoutes = (route, trip1Volumes, trip2Volumes) => {
    // 정확히 일치하는 라우트가 있으면 그대로 반환
    if (trip1Volumes[route] || trip2Volumes[route]) {
      return [route];
    }

    // 511B, 529A 같은 경우 → 하위 라우트들을 찾아서 배열로 반환
    const pattern = new RegExp("^" + route + "\\d+$");
    const subRoutes = new Set();
    
    Object.keys(trip1Volumes).forEach(key => {
      if (pattern.test(key)) {
        subRoutes.add(key);
      }
    });
    
    Object.keys(trip2Volumes).forEach(key => {
      if (pattern.test(key)) {
        subRoutes.add(key);
      }
    });
    
    return subRoutes.size > 0 ? Array.from(subRoutes).sort() : [route];
  };

  // 복사 기능
  const copyToClipboard = () => {
    if (!result || !targetDate) return;

    const dateObj = new Date(targetDate);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[dateObj.getDay()];

    // Trip2가 있으면 Trip2 물량만, 없으면 Trip1 물량 표시
    const hasTrip2 = result.trip2Total > 0;
    const tripLabel = hasTrip2 ? "Trip2" : "Trip1";
    const displayTotal = hasTrip2 ? result.trip2Total : result.trip1Total;

    let text = "(주)비앤엠(M_안성1)\n";
    text += "2025년 " + month + "월 " + day + "일(" + weekday + ") " + tripLabel + "\n";
    
    if (hasTrip2) {
      const totalRatio = ((result.trip2Total / result.totalVolume) * 100).toFixed(2);
      text += "📦 총 수량: " + displayTotal.toLocaleString() + " (비율 " + totalRatio + "%)\n";
      text += "📊 금일 총 수량: " + result.totalVolume.toLocaleString() + " (Trip1 + Trip2)\n\n";
    } else {
      text += "📦 총 수량: " + displayTotal.toLocaleString() + "\n\n";
    }

    result.workers.forEach(([worker, data], index) => {
      const emoji = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
      
      // 비율 계산: Trip2 / (Trip1 + Trip2) * 100 (Trip2가 있을 때만)
      const trip2Ratio = hasTrip2 && data.total > 0 ? ((data.trip2 / data.total) * 100).toFixed(2) : '0.00';
      
      // Trip2가 있으면 Trip2 물량만, 없으면 Trip1 물량 표시
      const displayVolume = hasTrip2 ? data.trip2 : data.trip1;
      const ratioText = hasTrip2 ? " (비율: " + trip2Ratio + "%)" : "";
      
      text += emoji + " " + worker + " (합계: " + displayVolume + ")" + ratioText + "\n";
      
      data.routes.forEach(({ route, trip1, trip2 }) => {
        const routeVolume = hasTrip2 ? trip2 : trip1;
        if (routeVolume > 0) {
          text += "  ∙ " + route + " (" + routeVolume + ")\n";
        }
      });
      
      // Trip2가 있을 때만 금일 총합계 표시
      if (hasTrip2) {
        text += "[금일 총합계: " + data.total + "]\n";
      }
      text += "\n";
    });

    // 모바일 환경 대응: textarea를 이용한 복사
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('✅ 복사 완료!');
      } else {
        // Clipboard API 재시도
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            alert('✅ 복사 완료!');
          }).catch(() => {
            alert('❌ 복사 실패: 수동으로 복사해주세요');
          });
        } else {
          alert('❌ 복사 실패: 수동으로 복사해주세요');
        }
      }
    } catch (err) {
      alert('❌ 복사 실패: 수동으로 복사해주세요');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  // 분석 실행
  const analyze = () => {
    if (!trip1Data || !scheduleData) {
      alert('⚠️ Trip1 물량과 스케줄을 모두 입력해주세요.');
      return;
    }

    // 날짜 검증
    const trip1Date = extractDate(trip1Data);
    const trip2Date = trip2Data ? extractDate(trip2Data) : null;
    const scheduleDate = extractDate(scheduleData);

    if (!trip1Date) {
      alert('⚠️ Trip1 물량 데이터에서 날짜를 찾을 수 없습니다.\n예: 25.12.21Trip1');
      return;
    }

    if (!scheduleDate) {
      alert('⚠️ 스케줄 데이터에서 날짜를 찾을 수 없습니다.\n예: 2W 입차일 : 12월 21일');
      return;
    }

    // 날짜 일치 여부 확인
    if (trip1Date !== scheduleDate) {
      alert('❌ 날짜가 일치하지 않습니다!\n스케줄: ' + scheduleDate + '\nTrip1: ' + trip1Date);
      return;
    }

    if (trip2Date && trip2Date !== scheduleDate) {
      alert('❌ 날짜가 일치하지 않습니다!\n스케줄: ' + scheduleDate + '\nTrip2: ' + trip2Date);
      return;
    }

    // 날짜 저장
    setTargetDate(scheduleDate);

    const trip1Volumes = parseVolumeData(trip1Data);
    const trip2Volumes = trip2Data ? parseVolumeData(trip2Data) : {};
    const schedule = parseScheduleData(scheduleData);

    // 각 담당자별 물량 계산
    const workerVolumes = {};
    
    Object.entries(schedule).forEach(([worker, routes]) => {
      let trip1Total = 0;
      let trip2Total = 0;
      const routeDetails = [];
      
      routes.forEach(route => {
        // 라우트를 개별 하위 라우트로 확장
        const expandedRoutes = expandRoutes(route, trip1Volumes, trip2Volumes);
        
        expandedRoutes.forEach(expandedRoute => {
          const t1Vol = trip1Volumes[expandedRoute] || 0;
          const t2Vol = trip2Volumes[expandedRoute] || 0;
          
          trip1Total += t1Vol;
          trip2Total += t2Vol;
          
          if (t1Vol > 0 || t2Vol > 0) {
            routeDetails.push({ 
              route: expandedRoute, 
              trip1: t1Vol, 
              trip2: t2Vol,
              total: t1Vol + t2Vol 
            });
          }
        });
      });
      
      workerVolumes[worker] = { 
        trip1: trip1Total,
        trip2: trip2Total,
        total: trip1Total + trip2Total, 
        routes: routeDetails 
      };
    });

    // 내림차순 정렬
    const sorted = Object.entries(workerVolumes)
      .sort((a, b) => b[1].total - a[1].total);

    const totalTrip1 = Object.values(trip1Volumes).reduce((a, b) => a + b, 0);
    const totalTrip2 = Object.values(trip2Volumes).reduce((a, b) => a + b, 0);

    setResult({
      workers: sorted,
      trip1Total: totalTrip1,
      trip2Total: totalTrip2,
      totalVolume: totalTrip1 + totalTrip2,
      workerCount: sorted.length
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📦 SmartTrip 물량 분석기
          </h1>
          <p className="text-gray-600">스케줄 물량 데이터를 분석하고 정리하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 스케줄 입력 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-purple-600 mb-4">
              👥 당일 스케줄
            </h2>
            <textarea
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none font-mono text-sm bg-white text-gray-900"
              style={{ WebkitTextFillColor: '#111827', opacity: 1 }}
              placeholder="예시:
2W 입차일 : 12월 21일 토요일
출근인원 : 13명

501B01 / 김병후
501B02 / 김병후
511B / 임민호
529A / 김진우
..."
              value={scheduleData}
              onChange={(e) => setScheduleData(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-2">* 511B, 529A 같은 표기는 전체 하위구역 포함</p>
            <p className="text-sm text-red-500 mt-1">* 날짜 필수: "12월 21일" 형식</p>
          </div>

          {/* Trip1 물량 입력 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4">
              📊 Trip1 물량 데이터
            </h2>
            <textarea
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm bg-white text-gray-900"
              style={{ WebkitTextFillColor: '#111827', opacity: 1 }}
              placeholder="예시:
25.12.21Trip1 캠도물량
B&M로지스
501B01 | 24
501B02 | 40
..."
              value={trip1Data}
              onChange={(e) => setTrip1Data(e.target.value)}
            />
            <p className="text-sm text-red-500 mt-2">* 날짜 필수: "25.12.21Trip1" 형식</p>
          </div>

          {/* Trip2 물량 입력 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-green-600 mb-4">
              📊 Trip2 물량 데이터
            </h2>
            <textarea
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none font-mono text-sm bg-white text-gray-900"
              style={{ WebkitTextFillColor: '#111827', opacity: 1 }}
              placeholder="예시 (선택사항):
25.12.21Trip2 캠도물량
B&M로지스
501B01 | 7
501B02 | 15
..."
              value={trip2Data}
              onChange={(e) => setTrip2Data(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-2">* Trip2가 없으면 비워두세요</p>
            <p className="text-sm text-red-500 mt-1">* 날짜 필수: "25.12.21Trip2" 형식</p>
          </div>
        </div>

        {/* 분석 버튼 */}
        <div className="text-center mb-8">
          <button
            onClick={analyze}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-lg shadow-lg transform transition hover:scale-105"
          >
            🔍 분석 실행
          </button>
        </div>

        {/* 결과 출력 */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6 pb-4 border-b-2 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  📈 분석 결과
                </h2>
                <button
                  onClick={copyToClipboard}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 flex items-center gap-2"
                >
                  📋 복사하기
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Trip1 물량</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.trip1Total.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">Trip2 물량</p>
                  <p className="text-2xl font-bold text-green-600">
                    {result.trip2Total.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">총 물량</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {result.totalVolume.toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-gray-600 text-sm">출근 인원</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {result.workerCount}명
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {result.workers.map(([worker, data], index) => {
                // 비율 계산: Trip2 / (Trip1 + Trip2) * 100
                const trip2Ratio = data.total > 0 ? ((data.trip2 / data.total) * 100).toFixed(1) : 0;
                
                return (
                  <div
                    key={worker}
                    className={`p-5 rounded-lg border-l-4 ${
                      index === 0
                        ? 'bg-yellow-50 border-yellow-500'
                        : index === 1
                        ? 'bg-gray-50 border-gray-400'
                        : index === 2
                        ? 'bg-orange-50 border-orange-400'
                        : 'bg-white border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                        </span>
                        <h3 className="text-xl font-bold text-gray-800">
                          {worker}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="space-y-2">
                          {data.trip2 > 0 ? (
                            <div className="bg-green-50 rounded px-3 py-2">
                              <p className="text-xs text-green-600 font-medium">Trip2</p>
                              <p className="text-2xl font-bold text-green-700">
                                {data.trip2.toLocaleString()}
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                비율: {trip2Ratio}%
                              </p>
                            </div>
                          ) : (
                            <div className="bg-blue-50 rounded px-3 py-2">
                              <p className="text-xs text-blue-600 font-medium">Trip1</p>
                              <p className="text-2xl font-bold text-blue-700">
                                {data.trip1.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data.routes.map(({ route, trip1, trip2, total }) => (
                        <div
                          key={route}
                          className="bg-white px-4 py-3 rounded-lg border border-gray-300"
                        >
                          <div className="font-semibold text-gray-700 mb-2">{route}</div>
                          {trip2 > 0 ? (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-green-600">T2:</span>
                                <span className="font-bold text-green-700">{trip2}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <span className="text-blue-600 text-sm">T1:</span>
                              <span className="font-bold text-blue-700">{trip1}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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