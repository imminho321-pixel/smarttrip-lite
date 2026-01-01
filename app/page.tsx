// @ts-nocheck
"use client";

import React, { useState } from 'react';

export default function SmartTripAnalyzer() {
  const [trip1Data, setTrip1Data] = useState('');
  const [trip2Data, setTrip2Data] = useState('');
  const [scheduleData, setScheduleData] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [result, setResult] = useState(null);

  // 날짜 추출 함수 (2026년 대응)
  const extractDate = (text) => {
    if (!text || typeof text !== 'string') return null;
    
    const dotMatch = text.match(/(\d{2,4})\.(\d{1,2})\.(\d{1,2})/);
    if (dotMatch) {
      let year = dotMatch[1];
      const month = dotMatch[2].padStart(2, '0');
      const day = dotMatch[3].padStart(2, '0');
      
      if (year.length === 2) {
        year = '20' + year;
      }
      
      return year + '-' + month + '-' + day;
    }
    
    const koreanMatch = text.match(/(\d{1,2})월\s*(\d{1,2})일/);
    if (koreanMatch) {
      const month = koreanMatch[1].padStart(2, '0');
      const day = koreanMatch[2].padStart(2, '0');
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      let targetYear = currentYear;
      const inputMonth = parseInt(koreanMatch[1]);
      
      if (currentMonth === 12 && inputMonth <= 3) {
        targetYear = currentYear + 1;
      } else if (currentMonth <= 3 && inputMonth >= 10) {
        targetYear = currentYear - 1;
      }
      
      return targetYear + '-' + month + '-' + day;
    }
    
    return null;
  };

  const parseVolumeData = (text) => {
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

  const expandRoutes = (route, trip1Volumes, trip2Volumes) => {
    if (trip1Volumes[route] || trip2Volumes[route]) {
      return [route];
    }

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

  const copyToClipboard = () => {
    if (!result || !targetDate) return;

    const dateObj = new Date(targetDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[dateObj.getDay()];

    const hasTrip2 = result.trip2Total > 0;
    const tripLabel = hasTrip2 ? "Trip2" : "Trip1";
    const displayTotal = hasTrip2 ? result.trip2Total : result.trip1Total;

    let text = "(주)비앤엠(M_안성1)\n";
    text += year + "년 " + month + "월 " + day + "일(" + weekday + ") " + tripLabel + "\n";
    
    if (hasTrip2) {
      const totalRatio = ((result.trip2Total / result.totalVolume) * 100).toFixed(2);
      text += "📦 총 수량: " + displayTotal.toLocaleString() + " (비율 " + totalRatio + "%)\n";
      text += "📊 금일 총 수량: " + result.totalVolume.toLocaleString() + " (Trip1 + Trip2)\n\n";
    } else {
      text += "📦 총 수량: " + displayTotal.toLocaleString() + "\n\n";
    }

    result.workers.forEach(([worker, data], index) => {
      const emoji = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
      const trip2Ratio = hasTrip2 && data.total > 0 ? ((data.trip2 / data.total) * 100).toFixed(2) : '0.00';
      const displayVolume = hasTrip2 ? data.trip2 : data.trip1;
      const ratioText = hasTrip2 ? " (비율: " + trip2Ratio + "%)" : "";
      
      text += emoji + " " + worker + " (합계: " + displayVolume + ")" + ratioText + "\n";
      
      data.routes.forEach(({ route, trip1, trip2 }) => {
        const routeVolume = hasTrip2 ? trip2 : trip1;
        if (routeVolume > 0) {
          text += "  ∙ " + route + " (" + routeVolume + ")\n";
        }
      });
      
      if (hasTrip2) {
        text += "[금일 총합계: " + data.total + "]\n";
      }
      text += "\n";
    });

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

  const analyze = () => {
    if (!trip1Data || !scheduleData) {
      alert('⚠️ Trip1 물량과 스케줄을 모두 입력해주세요.');
      return;
    }

    const trip1Date = extractDate(trip1Data);
    const trip2Date = trip2Data ? extractDate(trip2Data) : null;
    const scheduleDate = extractDate(scheduleData);

    if (!trip1Date) {
      alert('⚠️ Trip1 물량 데이터에서 날짜를 찾을 수 없습니다.\n예: 26.01.15Trip1 또는 25.12.21Trip1');
      return;
    }

    if (!scheduleDate) {
      alert('⚠️ 스케줄 데이터에서 날짜를 찾을 수 없습니다.\n예: 2W 입차일 : 1월 15일');
      return;
    }

    if (trip1Date !== scheduleDate) {
      alert('❌ 날짜가 일치하지 않습니다!\n스케줄: ' + scheduleDate + '\nTrip1: ' + trip1Date);
      return;
    }

    if (trip2Date && trip2Date !== scheduleDate) {
      alert('❌ 날짜가 일치하지 않습니다!\n스케줄: ' + scheduleDate + '\nTrip2: ' + trip2Date);
      return;
    }

    setTargetDate(scheduleDate);

    const trip1Volumes = parseVolumeData(trip1Data);
    const trip2Volumes = trip2Data ? parseVolumeData(trip2Data) : {};
    const schedule = parseScheduleData(scheduleData);

    const workerVolumes = {};
    
    Object.entries(schedule).forEach(([worker, routes]) => {
      let trip1Total = 0;
      let trip2Total = 0;
      const routeDetails = [];
      
      routes.forEach(route => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">📦</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SmartTrip 물량 분석기
              </h1>
              <p className="text-sm text-gray-500 mt-1">스케줄 물량 데이터를 스마트하게 분석하세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 입력 카드들 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 당일 스케줄 */}
          <div className="group">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👥</span>
                  <h2 className="text-xl font-bold text-white">당일 스케줄</h2>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:outline-none font-mono text-sm resize-none transition-all bg-gray-50 hover:bg-white"
                  placeholder="📅 예시:
2W 입차일 : 1월 15일 수요일
출근인원 : 13명

501B01 / 김병후
501B02 / 김병후
511B / 임민호
529A / 김진우
..."
                  value={scheduleData}
                  onChange={(e) => setScheduleData(e.target.value)}
                />
                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span>💡</span>
                    <span>511B, 529A 같은 표기는 전체 하위구역 포함</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-red-500 font-medium">
                    <span>⚠️</span>
                    <span>날짜 필수: "1월 15일" 형식</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trip1 물량 */}
          <div className="group">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <h2 className="text-xl font-bold text-white">Trip1 물량 데이터</h2>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none font-mono text-sm resize-none transition-all bg-gray-50 hover:bg-white"
                  placeholder="📦 예시:
26.01.15Trip1 캠도물량
B&M로지스
501B01 | 24
501B02 | 40
511B01 | 35
..."
                  value={trip1Data}
                  onChange={(e) => setTrip1Data(e.target.value)}
                />
                <div className="mt-4">
                  <div className="flex items-start gap-2 text-sm text-red-500 font-medium">
                    <span>⚠️</span>
                    <span>날짜 필수: "26.01.15Trip1" 형식</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trip2 물량 */}
          <div className="group">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  <h2 className="text-xl font-bold text-white">Trip2 물량 데이터</h2>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-4 focus:ring-green-100 focus:outline-none font-mono text-sm resize-none transition-all bg-gray-50 hover:bg-white"
                  placeholder="📦 예시 (선택사항):
26.01.15Trip2 캠도물량
B&M로지스
501B01 | 7
501B02 | 15
..."
                  value={trip2Data}
                  onChange={(e) => setTrip2Data(e.target.value)}
                />
                <div className="mt-4 space-y-2">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span>💡</span>
                    <span>Trip2가 없으면 비워두세요</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-red-500 font-medium">
                    <span>⚠️</span>
                    <span>날짜 필수: "26.01.15Trip2" 형식</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 분석 버튼 */}
        <div className="flex justify-center mb-12">
          <button
            onClick={analyze}
            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 px-16 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center gap-3 text-lg">
              <span className="text-2xl">🔍</span>
              <span>분석 실행</span>
            </span>
            <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </button>
        </div>

        {/* 결과 영역 */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* 결과 헤더 */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">📈</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">분석 결과</h2>
                    <p className="text-slate-300 text-sm mt-1">
                      {new Date(targetDate).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 px-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="text-xl">📋</span>
                  <span>복사하기</span>
                </button>
              </div>
            </div>

            {/* 통계 카드들 */}
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚚</span>
                    <p className="text-sm font-medium text-blue-700">Trip1 물량</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    {result.trip1Total.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚛</span>
                    <p className="text-sm font-medium text-green-700">Trip2 물량</p>
                  </div>
                  <p className="text-3xl font-bold text-green-900">
                    {result.trip2Total.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📦</span>
                    <p className="text-sm font-medium text-purple-700">총 물량</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {result.totalVolume.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👷</span>
                    <p className="text-sm font-medium text-orange-700">출근 인원</p>
                  </div>
                  <p className="text-3xl font-bold text-orange-900">
                    {result.workerCount}명
                  </p>
                </div>
              </div>

              {/* 작업자 목록 */}
              <div className="space-y-4">
                {result.workers.map(([worker, data], index) => {
                  const trip2Ratio = data.total > 0 ? ((data.trip2 / data.total) * 100).toFixed(1) : 0;
                  
                  return (
                    <div
                      key={worker}
                      className={`rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-lg ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400'
                          : index === 1
                          ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300'
                          : index === 2
                          ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <span className="text-4xl">
                              {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}
                            </span>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-800">
                                {worker}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {index === 0 ? '최다 물량' : index === 1 ? '2위' : index === 2 ? '3위' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {data.trip2 > 0 ? (
                              <div className="bg-white rounded-2xl px-6 py-4 shadow-md border-2 border-green-200">
                                <p className="text-xs text-green-600 font-semibold mb-1">Trip2</p>
                                <p className="text-4xl font-bold text-green-700">
                                  {data.trip2.toLocaleString()}
                                </p>
                                <p className="text-xs text-green-600 mt-2">
                                  비율: {trip2Ratio}%
                                </p>
                              </div>
                            ) : (
                              <div className="bg-white rounded-2xl px-6 py-4 shadow-md border-2 border-blue-200">
                                <p className="text-xs text-blue-600 font-semibold mb-1">Trip1</p>
                                <p className="text-4xl font-bold text-blue-700">
                                  {data.trip1.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {data.routes.map(({ route, trip1, trip2 }) => (
                            <div
                              key={route}
                              className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-700">{route}</span>
                                {trip2 > 0 ? (
                                  <span className="text-lg font-bold text-green-600">{trip2}</span>
                                ) : (
                                  <span className="text-lg font-bold text-blue-600">{trip1}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
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