<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartTrip 물량 분석기</title>
    <meta name="description" content="프리미엄 물량 데이터 분석 시스템">
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

        .btn-text {
            position: relative;
            z-index: 1;
        }

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
        }

        .result-title h2 {
            color: white;
            font-size: 2rem;
            font-weight: 800;
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

        .stat-value {
            font-size: 2.5rem;
            font-weight: 900;
        }

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
        }

        .worker-name {
            font-size: 2rem;
            font-weight: 800;
            color: #1f2937;
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
        }

        .volume-value {
            font-size: 2.8rem;
            font-weight: 900;
        }

        .volume-ratio {
            font-size: 0.8rem;
            margin-top: 0.5rem;
            font-weight: 600;
        }

        .routes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 1rem;
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
        }

        .route-name {
            font-weight: 700;
            color: #374151;
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

    <script src="app.js"></script>
</body>
</html>