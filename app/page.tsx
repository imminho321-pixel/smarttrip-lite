<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>옵시디언 골드 시안</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Cormorant+Garamond:wght@500;600;700&display=swap');

  :root {
    --bg: #0a0a0a;
    --card: #161616;
    --card-hi: #1c1c1c;
    --gold: #c9a227;
    --gold-lt: #e8d48f;
    --silver: #c8c8c8;
    --bronze: #b08d57;
    --ink: #f5f4ef;
    --muted: #8a8a82;
    --line: rgba(201,162,39,0.18);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Noto Sans KR', sans-serif;
    background:
      radial-gradient(circle at 20% 0%, rgba(201,162,39,0.05), transparent 40%),
      var(--bg);
    color: var(--ink);
    min-height: 100vh;
    padding: 2.5rem 1.5rem;
    -webkit-font-smoothing: antialiased;
  }

  .wrap { max-width: 720px; margin: 0 auto; }

  /* ── 헤더 ── */
  .header {
    text-align: center;
    padding: 2rem 0 2.5rem;
    border-bottom: 1px solid var(--line);
    margin-bottom: 2.5rem;
  }
  .logo-ring {
    width: 88px; height: 88px;
    border-radius: 50%;
    margin: 0 auto 1.4rem;
    padding: 3px;
    background: linear-gradient(135deg, var(--gold), var(--gold-lt), var(--gold));
    display: flex; align-items: center; justify-content: center;
  }
  .logo-inner {
    width: 100%; height: 100%;
    border-radius: 50%;
    background: var(--card);
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem;
    overflow: hidden;
  }
  .brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.6rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: var(--ink);
    line-height: 1;
  }
  .brand .accent { color: var(--gold); }
  .tagline {
    margin-top: 0.6rem;
    font-size: 0.78rem;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
  }

  /* ── 결과 헤더 ── */
  .result-head {
    text-align: center;
    margin-bottom: 2rem;
  }
  .rh-company {
    font-size: 0.85rem;
    letter-spacing: 2px;
    color: var(--muted);
    margin-bottom: 0.4rem;
  }
  .rh-date {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--gold-lt);
  }
  .rh-trip {
    display: inline-block;
    margin-top: 0.5rem;
    font-size: 0.72rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0.3rem 1.1rem;
  }

  /* ── 요약 통계 ── */
  .stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 2.5rem;
  }
  .stat {
    background: var(--card);
    padding: 1.4rem 1rem;
    text-align: center;
  }
  .stat-label {
    font-size: 0.7rem;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.5rem;
  }
  .stat-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem;
    font-weight: 600;
    color: var(--ink);
    font-variant-numeric: tabular-nums;
  }
  .stat-num.gold { color: var(--gold-lt); }

  /* ── 순위 리스트 ── */
  .section-title {
    font-size: 0.75rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
    text-align: center;
    margin-bottom: 1.5rem;
    position: relative;
  }

  .ranks { display: flex; flex-direction: column; gap: 0.7rem; }

  .rank-card {
    background: var(--card);
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: 14px;
    padding: 1.1rem 1.3rem;
    transition: all 0.3s;
  }
  .rank-card.top {
    background: linear-gradient(135deg, rgba(201,162,39,0.08), var(--card) 60%);
    border-color: var(--line);
  }
  .rank-row {
    display: flex; align-items: center; gap: 1rem;
  }
  .rank-badge {
    flex: 0 0 auto;
    width: 44px; height: 44px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.4rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .badge-1 { background: linear-gradient(135deg, #c9a227, #e8d48f); color: #1a1407; }
  .badge-2 { background: linear-gradient(135deg, #9a9a9a, #d8d8d8); color: #1a1a1a; }
  .badge-3 { background: linear-gradient(135deg, #8a6d3f, #b08d57); color: #1a1207; }
  .badge-n {
    background: transparent;
    border: 1px solid var(--line);
    color: var(--muted);
    font-size: 0.95rem;
  }
  .rank-name {
    flex: 1;
    font-size: 1.45rem;
    font-weight: 700;
    color: var(--ink);
  }
  .rank-vol {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.1rem;
    font-weight: 600;
    color: var(--gold-lt);
    font-variant-numeric: tabular-nums;
  }
  .badge-n ~ .rank-vol { color: var(--ink); }

  /* 막대 */
  .bar-track {
    margin-top: 0.8rem;
    height: 3px;
    background: rgba(255,255,255,0.05);
    border-radius: 2px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--gold), var(--gold-lt));
    border-radius: 2px;
  }
  .top .bar-fill { box-shadow: 0 0 8px rgba(201,162,39,0.4); }

  /* 상세 구역 */
  .routes {
    margin-top: 0.9rem;
    padding-top: 0.9rem;
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .route-chip {
    font-family: 'Courier New', monospace;
    font-size: 0.95rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px;
    padding: 0.4rem 0.7rem;
    color: var(--muted);
  }
  .route-chip b { color: var(--gold-lt); font-weight: 700; margin-left: 0.35rem; }

  .note { text-align:center; color: var(--muted); font-size: 0.8rem; margin-top: 2.5rem; line-height: 1.6; }
</style>
</head>
<body>
<div class="wrap">

  <div class="header">
    <div class="logo-ring"><div class="logo-inner">📦</div></div>
    <div class="brand">Smart<span class="accent">Trip</span></div>
    <div class="tagline">물량 분석 시스템</div>
  </div>

  <div class="result-head">
    <div class="rh-company">(주)비앤엠 · M_안성1</div>
    <div class="rh-date">2026. 06. 26 (금)</div>
    <div class="rh-trip">Trip 1</div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-label">인원</div>
      <div class="stat-num">12</div>
    </div>
    <div class="stat">
      <div class="stat-label">구역</div>
      <div class="stat-num">71</div>
    </div>
    <div class="stat">
      <div class="stat-label">총 물량</div>
      <div class="stat-num gold">3,298</div>
    </div>
  </div>

  <div class="section-title">— 개인별 순위 —</div>

  <div class="ranks">
    <div class="rank-card top">
      <div class="rank-row">
        <div class="rank-badge badge-1">1</div>
        <div class="rank-name">임민호</div>
        <div class="rank-vol">367</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:100%"></div></div>
      <div class="routes">
        <span class="route-chip">511B01<b>86</b></span>
        <span class="route-chip">511A02<b>80</b></span>
        <span class="route-chip">511C03<b>74</b></span>
        <span class="route-chip">511C02<b>41</b></span>
        <span class="route-chip">511A03<b>32</b></span>
        <span class="route-chip">511A04<b>23</b></span>
        <span class="route-chip">511B02<b>19</b></span>
        <span class="route-chip">511B03<b>10</b></span>
        <span class="route-chip">511B04<b>2</b></span>
      </div>
    </div>

    <div class="rank-card top">
      <div class="rank-row">
        <div class="rank-badge badge-2">2</div>
        <div class="rank-name">김정우</div>
        <div class="rank-vol">294</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:80%"></div></div>
      <div class="routes">
        <span class="route-chip">511C01<b>136</b></span>
        <span class="route-chip">511A01<b>79</b></span>
        <span class="route-chip">511D01<b>79</b></span>
      </div>
    </div>

    <div class="rank-card top">
      <div class="rank-row">
        <div class="rank-badge badge-3">3</div>
        <div class="rank-name">임태학</div>
        <div class="rank-vol">291</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:79%"></div></div>
      <div class="routes">
        <span class="route-chip">512B05<b>104</b></span>
        <span class="route-chip">512B04<b>77</b></span>
        <span class="route-chip">512B02<b>59</b></span>
        <span class="route-chip">502A01<b>51</b></span>
      </div>
    </div>

    <div class="rank-card">
      <div class="rank-row">
        <div class="rank-badge badge-n">4</div>
        <div class="rank-name">유윤석</div>
        <div class="rank-vol">287</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:78%"></div></div>
      <div class="routes">
        <span class="route-chip">528C01<b>149</b></span>
        <span class="route-chip">528C02<b>94</b></span>
        <span class="route-chip">502D02<b>44</b></span>
      </div>
    </div>

    <div class="rank-card">
      <div class="rank-row">
        <div class="rank-badge badge-n">5</div>
        <div class="rank-name">이상윤</div>
        <div class="rank-vol">281</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:77%"></div></div>
      <div class="routes">
        <span class="route-chip">512A03<b>96</b></span>
        <span class="route-chip">512B01<b>74</b></span>
        <span class="route-chip">501B08<b>48</b></span>
        <span class="route-chip">502A02<b>32</b></span>
        <span class="route-chip">512B03<b>22</b></span>
        <span class="route-chip">512A02<b>6</b></span>
        <span class="route-chip">512A01<b>3</b></span>
      </div>
    </div>

    <div class="rank-card">
      <div class="rank-row">
        <div class="rank-badge badge-n">6</div>
        <div class="rank-name">김지혜</div>
        <div class="rank-vol">270</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:74%"></div></div>
      <div class="routes">
        <span class="route-chip">528D01<b>80</b></span>
        <span class="route-chip">529D03<b>59</b></span>
        <span class="route-chip">529D01<b>55</b></span>
        <span class="route-chip">528D02<b>35</b></span>
        <span class="route-chip">502A03<b>25</b></span>
        <span class="route-chip">529D02<b>16</b></span>
      </div>
    </div>

    <div class="rank-card">
      <div class="rank-row">
        <div class="rank-badge badge-n">7</div>
        <div class="rank-name">성백은</div>
        <div class="rank-vol">268</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:73%"></div></div>
      <div class="routes">
        <span class="route-chip">501C01<b>145</b></span>
        <span class="route-chip">501B04<b>38</b></span>
        <span class="route-chip">501D02<b>33</b></span>
        <span class="route-chip">501D03<b>29</b></span>
        <span class="route-chip">501D01<b>11</b></span>
        <span class="route-chip">501D04<b>9</b></span>
        <span class="route-chip">501B05<b>3</b></span>
      </div>
    </div>

    <div class="rank-card">
      <div class="rank-row">
        <div class="rank-badge badge-n">8</div>
        <div class="rank-name">문정학</div>
        <div class="rank-vol">265</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:72%"></div></div>
      <div class="routes">
        <span class="route-chip">502C06<b>49</b></span>
        <span class="route-chip">502C03<b>43</b></span>
        <span class="route-chip">502B01<b>36</b></span>
        <span class="route-chip">502C02<b>38</b></span>
        <span class="route-chip">502B02<b>27</b></span>
        <span class="route-chip">502C05<b>27</b></span>
        <span class="route-chip">502C01<b>25</b></span>
        <span class="route-chip">502C04<b>20</b></span>
      </div>
    </div>

    <div class="rank-card">
      <div class="rank-row">
        <div class="rank-badge badge-n">9</div>
        <div class="rank-name">현석</div>
        <div class="rank-vol">252</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:69%"></div></div>
      <div class="routes">
        <span class="route-chip">501C02<b>123</b></span>
        <span class="route-chip">501B02<b>47</b></span>
        <span class="route-chip">501B01<b>38</b></span>
        <span class="route-chip">501B03<b>18</b></span>
        <span class="route-chip">501B07<b>18</b></span>
        <span class="route-chip">501B06<b>8</b></span>
      </div>
    </div>

    <div class="rank-card">
      <div class="rank-row">
        <div class="rank-badge badge-n">10</div>
        <div class="rank-name">김진우</div>
        <div class="rank-vol">243</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:66%"></div></div>
      <div class="routes">
        <span class="route-chip">529A06<b>101</b></span>
        <span class="route-chip">529A01<b>55</b></span>
        <span class="route-chip">529A04<b>31</b></span>
        <span class="route-chip">529A07<b>23</b></span>
        <span class="route-chip">529A03<b>16</b></span>
        <span class="route-chip">529A05<b>9</b></span>
        <span class="route-chip">529A02<b>8</b></span>
      </div>
    </div>

    <div class="rank-card">
      <div class="rank-row">
        <div class="rank-badge badge-n">11</div>
        <div class="rank-name">대원<span style="color:var(--gold)">♡</span>빛나</div>
        <div class="rank-vol">241</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:66%"></div></div>
      <div class="routes">
        <span class="route-chip">528C04<b>84</b></span>
        <span class="route-chip">528C03<b>71</b></span>
        <span class="route-chip">502D03<b>41</b></span>
        <span class="route-chip">502D05<b>24</b></span>
        <span class="route-chip">528D03<b>21</b></span>
      </div>
    </div>

    <div class="rank-card">
      <div class="rank-row">
        <div class="rank-badge badge-n">12</div>
        <div class="rank-name">임동명</div>
        <div class="rank-vol">239</div>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:65%"></div></div>
      <div class="routes">
        <span class="route-chip">502D01<b>90</b></span>
        <span class="route-chip">502B04<b>55</b></span>
        <span class="route-chip">502B03<b>53</b></span>
        <span class="route-chip">502C07<b>38</b></span>
        <span class="route-chip">502A05<b>2</b></span>
        <span class="route-chip">502A04<b>1</b></span>
      </div>
    </div>
  </div>

  <div class="note">— 시안 (목업) · 전체 12명 · 모든 구역 표시 —<br>김대원은 "대원♡빛나"로 표시됩니다</div>

</div>
</body>
</html>
