<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartTrip 물량 분석기 Pro</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }

        /* 배경 애니메이션 */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(162, 155, 254, 0.3), transparent 50%),
                radial-gradient(circle at 40% 20%, rgba(194, 233, 251, 0.3), transparent 50%);
            animation: backgroundMove 20s ease-in-out infinite;
            z-index: 0;
        }

        @keyframes backgroundMove {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(50px, 50px); }
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem;
            position: relative;
            z-index: 1;
        }

        /* 글래스모피즘 헤더 */
        .header {
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border-radius: 20px;
            margin: 2rem 0;
            padding: 2rem;
            animation: slideDown 0.8s ease-out;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .header-content {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .logo-box {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            box-shadow: 
                0 10px 40px rgba(102, 126, 234, 0.4),
                inset 0 0 0 1px rgba(255, 255, 255, 0.2);
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        .header-text h1 {
            font-size: 2.5rem;
            font-weight: 900;
            color: white;
            text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
            letter-spacing: -1px;
        }

        .header-text p {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.9);
            margin-top: 0.5rem;
            font-weight: 500;
        }

        /* 입력 카드 그리드 */
        .input-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }

        .card {
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            animation: fadeInUp 0.8s ease-out;
            animation-fill-mode: both;
        }

        .card:nth-child(1) { animation-delay: 0.1s; }
        .card:nth-child(2) { animation-delay: 0.2s; }
        .card:nth-child(3) { animation-delay: 0.3s; }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            border-color: rgba(255, 255, 255, 0.4);
        }

        .card-header {
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            position: relative;
            overflow: hidden;
        }

        .card-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05));
            z-index: 0;
        }

        .card-header.purple::before {
            background: linear-gradient(135deg, #a855f7, #ec4899);
        }

        .card-header.blue::before {
            background: linear-gradient(135deg, #3b82f6, #06b6d4);
        }

        .card-header.green::before {
            background: linear-gradient(135deg, #10b981, #34d399);
        }

        .card-header-content {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .card-icon {
            font-size: 2rem;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        .card-header h2 {
            color: white;
            font-size: 1.4rem;
            font-weight: 700;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .card-body {
            padding: 1.5rem;
        }

        textarea {
            width: 100%;
            height: 16rem;
            padding: 1.2rem;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            resize: none;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            color: #1f2937;
        }

        textarea:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.6);
            box-shadow: 
                0 0 0 4px rgba(255, 255, 255, 0.1),
                0 8px 20px rgba(0, 0, 0, 0.1);
            background: white;
        }

        textarea::placeholder {
            color: #9ca3af;
        }

        .card-footer {
            margin-top: 1rem;
            font-size: 0.875rem;
        }

        .hint, .warning {
            padding: 0.75rem;
            border-radius: 12px;
            margin-top: 0.5rem;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .hint {
            background: rgba(59, 130, 246, 0.15);
            color: white;
            border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .warning {
            background: rgba(239, 68, 68, 0.15);
            color: white;
            border: 1px solid rgba(239, 68, 68, 0.3);
            font-weight: 500;
        }

        /* 버튼 */
        .button-container {
            display: flex;
            justify-content: center;
            margin: 3rem 0;
        }

        .btn-analyze {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 700;
            padding: 1.5rem 5rem;
            border-radius: 20px;
            border: none;
            font-size: 1.3rem;
            cursor: pointer;
            box-shadow: 
                0 10px 40px rgba(102, 126, 234, 0.4),
                inset 0 0 0 1px rgba(255, 255, 255, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            gap: 1rem;
            position: relative;
            overflow: hidden;
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% {
                box-shadow: 
                    0 10px 40px rgba(102, 126, 234, 0.4),
                    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
            }
            50% {
                box-shadow: 
                    0 10px 40px rgba(102, 126, 234, 0.6),
                    0 0 0 8px rgba(102, 126, 234, 0.1),
                    inset 0 0 0 1px rgba(255, 255, 255, 0.3);
            }
        }

        .btn-analyze::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }

        .btn-analyze:hover::before {
            width: 400px;
            height: 400px;
        }

        .btn-analyze:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 
                0 20px 60px rgba(102, 126, 234, 0.6),
                inset 0 0 0 1px rgba(255, 255, 255, 0.3);
        }

        .btn-analyze:active {
            transform: translateY(-2px) scale(1.02);
        }

        .btn-text {
            position: relative;
            z-index: 1;
        }

        /* 결과 영역 */
        .result-container {
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.95);
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            overflow: hidden;
            margin-bottom: 3rem;
            animation: scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes scaleIn {
            from {
                opacity: 0;
                transform: scale(0.9);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .result-header {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            padding: 2.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
        }

        .result-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.2), transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.2), transparent 50%);
        }

        .result-title {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            position: relative;
            z-index: 1;
        }

        .result-icon {
            font-size: 3.5rem;
            animation: rotate 3s linear infinite;
        }

        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .result-title h2 {
            color: white;
            font-size: 2rem;
            font-weight: 800;
            text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        }

        .result-title p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1rem;
            margin-top: 0.5rem;
        }

        .btn-copy {
            background: white;
            color: #1f2937;
            font-weight: 700;
            padding: 1rem 2.5rem;
            border-radius: 16px;
            border: none;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            position: relative;
            z-index: 1;
            font-size: 1.1rem;
        }

        .btn-copy:hover {
            transform: translateY(-4px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
        }

        .result-body {
            padding: 2.5rem;
        }

        /* 통계 카드 */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2.5rem;
        }

        .stat-card {
            padding: 2rem;
            border-radius: 20px;
            background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6));
            border: 2px solid;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, transparent, rgba(255,255,255,0.5));
            opacity: 0;
            transition: opacity 0.3s;
        }

        .stat-card:hover::before {
            opacity: 1;
        }

        .stat-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .stat-card.blue { border-color: #3b82f6; }
        .stat-card.green { border-color: #10b981; }
        .stat-card.purple { border-color: #8b5cf6; }
        .stat-card.orange { border-color: #f59e0b; }

        .stat-label {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
            font-size: 0.95rem;
            font-weight: 600;
        }

        .stat-icon {
            font-size: 2rem;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: 900;
            letter-spacing: -1px;
        }

        /* 작업자 카드 */
        .workers-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .worker-card {
            border-radius: 20px;
            border: 3px solid;
            padding: 2rem;
            background: white;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .worker-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
        }

        .worker-card.rank-1 { 
            border-color: #fbbf24;
            box-shadow: 0 8px 30px rgba(251, 191, 36, 0.3);
        }
        .worker-card.rank-1::before { background: linear-gradient(to right, #fbbf24, #f59e0b); }

        .worker-card.rank-2 { 
            border-color: #9ca3af;
            box-shadow: 0 8px 30px rgba(156, 163, 175, 0.3);
        }
        .worker-card.rank-2::before { background: linear-gradient(to right, #9ca3af, #6b7280); }

        .worker-card.rank-3 { 
            border-color: #f97316;
            box-shadow: 0 8px 30px rgba(249, 115, 22, 0.3);
        }
        .worker-card.rank-3::before { background: linear-gradient(to right, #f97316, #ea580c); }

        .worker-card.rank-other { 
            border-color: #e5e7eb;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .worker-card.rank-other::before { background: linear-gradient(to right, #e5e7eb, #d1d5db); }

        .worker-card:hover {
            transform: translateX(8px);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .worker-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }

        .worker-info {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .worker-emoji {
            font-size: 3.5rem;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
        }

        .worker-name {
            font-size: 2rem;
            font-weight: 800;
            color: #1f2937;
            letter-spacing: -0.5px;
        }

        .worker-volume {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border-radius: 16px;
            padding: 1.2rem 2rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: 2px solid;
            text-align: center;
            min-width: 140px;
        }

        .worker-volume.trip2 { border-color: #10b981; }
        .worker-volume.trip1 { border-color: #3b82f6; }

        .volume-label {
            font-size: 0.8rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .volume-value {
            font-size: 2.8rem;
            font-weight: 900;
            letter-spacing: -1px;
        }

        .volume-ratio {
            font-size: 0.8rem;
            margin-top: 0.5rem;
            font-weight: 600;
        }

        /* 라우트 그리드 */
        .routes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 1rem;
            margin-top: 0.5rem;
        }

        .route-item {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border-radius: 12px;
            padding: 1rem 1.2rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            border: 2px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.3s ease;
        }

        .route-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
            border-color: #3b82f6;
        }

        .route-name {
            font-weight: 700;
            color: #374151;
            font-size: 0.95rem;
        }

        .route-volume {
            font-size: 1.4rem;
            font-weight: 900;
        }

        .route-volume.trip2 { color: #059669; }
        .route-volume.trip1 { color: #2563eb; }

        .hidden {
            display: none;
        }

        /* 반응형 */
        @media (max-width: 768px) {
            .header-text h1 { font-size: 1.8rem; }
            .input-grid { grid-template-columns: 1fr; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .worker-header { flex-direction: column; gap: 1rem; }
            .btn-analyze { padding: 1.2rem 3rem; font-size: 1.1rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="logo-box">📦</div>
                <div class="header-text">
                    <h1>SmartTrip 물량 분석기</h1>
                    <p>프리미엄 물량 데이터 분석 시스템</p>
                </div>
            </div>
        </div>

        <div class="input-grid">
            <div class="card">
                <div class="card-header purple">
                    <div class="card-header-content">
                        <span class="card-icon">👥</span>
                        <h2>당일 스케줄</h2>
                    </div>
                </div>
                <div class="card-body">
                    <textarea id="scheduleInput" placeholder="📅 예시:
2W 입차일 : 1월 15일 수요일
출근인원 : 13명

501B01 / 김병후
501B02 / 김병후
511B / 임민호
..."></textarea>
                    <div class="card-footer">
                        <div class="hint">💡 511B, 529A 같은 표기는 전체 하위구역 포함</div>
                        <div class="warning">⚠️ 날짜 필수: "1월 15일" 형식</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header blue">
                    <div class="card-header-content">
                        <span class="card-icon">📊</span>
                        <h2>Trip1 물량 데이터</h2>
                    </div>
                </div>
                <div class="card-body">
                    <textarea id="trip1Input" placeholder="📦 예시:
26.01.15Trip1 캠도물량
B&M로지스
501B01 | 24
501B02 | 40
..."></textarea>
                    <div class="card-footer">
                        <div class="warning">⚠️ 날짜 필수: "26.01.15Trip1" 형식</div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header green">
                    <div class="card-header-content">
                        <span class="card-icon">📈</span>
                        <h2>Trip2 물량 데이터</h2>
                    </div>
                </div>
                <div class="card-body">
                    <textarea id="trip2Input" placeholder="📦 예시 (선택):
26.01.15Trip2 캠도물량
..."></textarea>
                    <div class="card-footer">
                        <div class="hint">💡 Trip2가 없으면 비워두세요</div>
                        <div class="warning">⚠️ 날짜 필수: "26.01.15Trip2" 형식</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="button-container">
            <button class="btn-analyze" onclick="analyze()">
                <span style="font-size: 2rem;">🔍</span>
                <span class="btn-text">분석 실행</span>
            </button>
        </div>

        <div id="resultContainer" class="hidden"></div>
    </div>

    <script>
        let state = { trip1Data: '', trip2Data: '', scheduleData: '', targetDate: '', result: null };

        function extractDate(text) {
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
        }

        function parseVolumeData(text) {
            const lines = text.trim().split('\n');
            const volumes = {};
            lines.forEach(line => {
                const parts = line.split('|').map(s => s.trim());
                if (parts.length >= 2 && parts[0] && !parts[0].includes('B&M') && !parts[0].includes('캠도물량')) {
                    volumes[parts[0]] = parseInt(parts[1]) || 0;
                }
            });
            return volumes;
        }

        function parseScheduleData(text) {
            const lines = text.trim().split('\n');
            const schedule = {};
            lines.forEach(line => {
                const parts = line.split('/').map(s => s.trim());
                if (parts.length >= 2) {
                    if (!schedule[parts[1]]) schedule[parts[1]] = [];
                    schedule[parts[1]].push(parts[0]);
                }
            });
            return schedule;
        }

        function expandRoutes(route, trip1Volumes, trip2Volumes) {
            if (trip1Volumes[route] || trip2Volumes[route]) return [route];
            const pattern = new RegExp("^" + route + "\\d+$");
            const subRoutes = new Set();
            Object.keys(trip1Volumes).forEach(key => { if (pattern.test(key)) subRoutes.add(key); });
            Object.keys(trip2Volumes).forEach(key => { if (pattern.test(key)) subRoutes.add(key); });
            return subRoutes.size > 0 ? Array.from(subRoutes).sort() : [route];
        }

        function analyze() {
            state.scheduleData = document.getElementById('scheduleInput').value;
            state.trip1Data = document.getElementById('trip1Input').value;
            state.trip2Data = document.getElementById('trip2Input').value;

            if (!state.trip1Data || !state.scheduleData) {
                alert('⚠️ Trip1 물량과 스케줄을 모두 입력해주세요.');
                return;
            }

            const trip1Date = extractDate(state.trip1Data);
            const trip2Date = state.trip2Data ? extractDate(state.trip2Data) : null;
            const scheduleDate = extractDate(state.scheduleData);

            if (!trip1Date || !scheduleDate) {
                alert('⚠️ 날짜를 찾을 수 없습니다.');
                return;
            }

            if (trip1Date !== scheduleDate || (trip2Date && trip2Date !== scheduleDate)) {
                alert('❌ 날짜가 일치하지 않습니다!');
                return;
            }

            state.targetDate = scheduleDate;
            const trip1Volumes = parseVolumeData(state.trip1Data);
            const trip2Volumes = state.trip2Data ? parseVolumeData(state.trip2Data) : {};
            const schedule = parseScheduleData(state.scheduleData);

            const workerVolumes = {};
            Object.entries(schedule).forEach(([worker, routes]) => {
                let trip1Total = 0, trip2Total = 0;
                const routeDetails = [];
                routes.forEach(route => {
                    expandRoutes(route, trip1Volumes, trip2Volumes).forEach(expandedRoute => {
                        const t1Vol = trip1Volumes[expandedRoute] || 0;
                        const t2Vol = trip2Volumes[expandedRoute] || 0;
                        trip1Total += t1Vol;
                        trip2Total += t2Vol;
                        if (t1Vol > 0 || t2Vol > 0) {
                            routeDetails.push({ route: expandedRoute, trip1: t1Vol, trip2: t2Vol, total: t1Vol + t2Vol });
                        }
                    });
                });
                workerVolumes[worker] = { trip1: trip1Total, trip2: trip2Total, total: trip1Total + trip2Total, routes: routeDetails };
            });

            const sorted = Object.entries(workerVolumes).sort((a, b) => b[1].total - a[1].total);
            const totalTrip1 = Object.values(trip1Volumes).reduce((a, b) => a + b, 0);
            const totalTrip2 = Object.values(trip2Volumes).reduce((a, b) => a + b, 0);

            state.result = {
                workers: sorted,
                trip1Total: totalTrip1,
                trip2Total: totalTrip2,
                totalVolume: totalTrip1 + totalTrip2,
                workerCount: sorted.length
            };

            renderResult();
        }

        function renderResult() {
            const container = document.getElementById('resultContainer');
            if (!state.result) {
                container.classList.add('hidden');
                return;
            }

            container.classList.remove('hidden');
            const dateStr = new Date(state.targetDate).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
            });

            let html = `
                <div class="result-container">
                    <div class="result-header">
                        <div class="result-title">
                            <span class="result-icon">📈</span>
                            <div>
                                <h2>분석 결과</h2>
                                <p>${dateStr}</p>
                            </div>
                        </div>
                        <button class="btn-copy" onclick="copyToClipboard()">
                            <span style="font-size: 1.5rem;">📋</span>
                            <span>복사하기</span>
                        </button>
                    </div>
                    <div class="result-body">
                        <div class="stats-grid">
                            <div class="stat-card blue">
                                <div class="stat-label">
                                    <span class="stat-icon">🚚</span>
                                    <span style="color: #1e40af;">Trip1 물량</span>
                                </div>
                                <div class="stat-value" style="color: #1e3a8a;">${state.result.trip1Total.toLocaleString()}</div>
                            </div>
                            <div class="stat-card green">
                                <div class="stat-label">
                                    <span class="stat-icon">🚛</span>
                                    <span style="color: #065f46;">Trip2 물량</span>
                                </div>
                                <div class="stat-value" style="color: #064e3b;">${state.result.trip2Total.toLocaleString()}</div>
                            </div>
                            <div class="stat-card purple">
                                <div class="stat-label">
                                    <span class="stat-icon">📦</span>
                                    <span style="color: #6b21a8;">총 물량</span>
                                </div>
                                <div class="stat-value" style="color: #581c87;">${state.result.totalVolume.toLocaleString()}</div>
                            </div>
                            <div class="stat-card orange">
                                <div class="stat-label">
                                    <span class="stat-icon">👷</span>
                                    <span style="color: #c2410c;">출근 인원</span>
                                </div>
                                <div class="stat-value" style="color: #9a3412;">${state.result.workerCount}명</div>
                            </div>
                        </div>
                        <div class="workers-list">
            `;

            state.result.workers.forEach(([worker, data], index) => {
                const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other';
                const emoji = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
                const trip2Ratio = data.total > 0 ? ((data.trip2 / data.total) * 100).toFixed(1) : 0;

                html += `
                    <div class="worker-card ${rankClass}">
                        <div class="worker-header">
                            <div class="worker-info">
                                <div class="worker-emoji">${emoji}</div>
                                <div class="worker-name">${worker}</div>
                            </div>
                            <div class="worker-volume ${data.trip2 > 0 ? 'trip2' : 'trip1'}">
                                <div class="volume-label" style="color: ${data.trip2 > 0 ? '#059669' : '#2563eb'};">
                                    ${data.trip2 > 0 ? 'Trip2' : 'Trip1'}
                                </div>
                                <div class="volume-value" style="color: ${data.trip2 > 0 ? '#047857' : '#1e40af'};">
                                    ${data.trip2 > 0 ? data.trip2.toLocaleString() : data.trip1.toLocaleString()}
                                </div>
                                ${data.trip2 > 0 ? `<div class="volume-ratio" style="color: #059669;">비율: ${trip2Ratio}%</div>` : ''}
                            </div>
                        </div>
                        <div class="routes-grid">
                `;

                data.routes.forEach(({ route, trip1, trip2 }) => {
                    html += `
                        <div class="route-item">
                            <span class="route-name">${route}</span>
                            <span class="route-volume ${trip2 > 0 ? 'trip2' : 'trip1'}">
                                ${trip2 > 0 ? trip2 : trip1}
                            </span>
                        </div>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            });

            html += `
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function copyToClipboard() {
            if (!state.result || !state.targetDate) return;

            const dateObj = new Date(state.targetDate);
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth() + 1;
            const day = dateObj.getDate();
            const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
            const weekday = weekdays[dateObj.getDay()];
            const hasTrip2 = state.result.trip2Total > 0;
            const tripLabel = hasTrip2 ? "Trip2" : "Trip1";
            const displayTotal = hasTrip2 ? state.result.trip2Total : state.result.trip1Total;

            let text = "(주)비앤엠(M_안성1)\n";
            text += year + "년 " + month + "월 " + day + "일(" + weekday + ") " + tripLabel + "\n";

            if (hasTrip2) {
                const totalRatio = ((state.result.trip2Total / state.result.totalVolume) * 100).toFixed(2);
                text += "📦 총 수량: " + displayTotal.toLocaleString() + " (비율 " + totalRatio + "%)\n";
                text += "📊 금일 총 수량: " + state.result.totalVolume.toLocaleString() + " (Trip1 + Trip2)\n\n";
            } else {
                text += "📦 총 수량: " + displayTotal.toLocaleString() + "\n\n";
            }

            state.result.workers.forEach(([worker, data], index) => {
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

            navigator.clipboard.writeText(text).then(() => {
                alert('✅ 복사 완료!');
            }).catch(() => {
                alert('❌ 복사 실패');
            });
        }
    </script>
</body>
</html>