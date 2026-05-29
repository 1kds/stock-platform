# 8팀 주식 분석 플랫폼 — 공통 규약 (SSOT)

> **이 파일은 팀 전원이 함께 관리하는 단일 진실 공급원(Single Source of Truth)입니다.**
> 수집→HDFS→분석→웹으로 데이터가 흐르므로, 아래 **경로·컬럼·점수·API 스키마**가 파트 간 계약입니다.
> 한쪽이 계약(컬럼명/경로/응답 모양)을 바꾸면 **반드시 이 파일을 먼저 고치고** 9장 결정 로그에 한 줄 남길 것.
> 개인 작업 메모는 각자 파일(`sy.md` 등)에, 공통 계약만 여기에.
>
> _마지막 갱신: 2026-05-29_

---

## 1. 프로젝트 한 줄 + 전체 흐름

**Hadoop·Kubernetes 기반 주식 통합 분석 플랫폼** — 매일 장 마감 후 KOSPI·KOSDAQ 전 종목 데이터를 자동 수집하고, 다음 날 장 시작 전(08:00)까지 Spark로 분석해 **Top3 추천 종목**을 선정, 웹 대시보드로 제공한다.

```
[20:00~20:40] 수집 CronJob ──▶ HDFS /data/stock/...
                                      │
[07:30] Spark 분석 CronJob ──▶ Top3 선정 ──▶ HDFS /result/...
                                      │
[08:00] 리포트 생성 CronJob ──▶ /result/top3_json/
                                      │
[상시] FastAPI (결과 읽기) ──▶ REST API ──▶ [상시] Next.js 대시보드
```

---

## 2. 팀 구성 & 개인 파일

| 팀원 | 담당 | 개인 브리핑 파일 |
|------|------|-----------------|
| 김동성 | 데이터 수집 (크롤러 3종) | (예: `ds.md`) |
| 장지은 | HDFS 저장 구조 | (예: `je.md`) |
| **조상윤** | **웹 파트 (FastAPI + Next.js)** | **`sy.md`** |
| 허재성 | Kubernetes 인프라 | (예: `js.md`) |

> 정식 제출 보고서: `분산시스템 8팀.md` (PDF 변환본, 이미지 포함). **이 공통 파일은 보고서와 별개로 "개발하면서 계속 고치는 약속" 역할.**

---

## 3. ⭐ HDFS 경로 규약

모든 경로는 환경변수 **`HDFS_BASE`** 를 루트로 사용한다. (로컬 `/tmp/stock-data`, 운영 `hdfs://namenode:9000`)
파티션은 전부 `year=YYYY/month=MM/day=DD`, 파일은 기본 `part-0.parquet`.

**입력(원천 데이터) — `/data` 영역**
| 테이블 | 경로 | 형식 | 쓰는 사람 |
|--------|------|------|----------|
| OHLCV·파생 | `{BASE}/data/stock/ohlcv/year=/month=/day=/part-0.parquet` | Parquet | 김동성(stock_collector) |
| 투자자 수급 | `{BASE}/data/stock/investor/year=/month=/day=/part-0.parquet` | Parquet | 김동성(stock_collector) |
| 뉴스 | `{BASE}/data/stock/news/year=/month=/day=/part-0.parquet` | Parquet | 김동성(news_collector) |
| 공시(DART) | `{BASE}/data/stock/news/year=/month=/day=/dart-disclosures.parquet` | Parquet | 김동성(dart_collector) |
| 재무 | `{BASE}/data/stock/financial/year=/month=/day=/part-0.parquet` | Parquet | 김동성(dart_collector) |
| (확장) 암호화폐 | `{BASE}/data/crypto/{market}/year=/month=/day=/ohlcv.parquet` | Parquet | (upbit, 우선순위 낮음) |

**결과(분석 산출) — `/result` 영역**
| 테이블 | 경로 | 형식 | 쓰는 사람 / 읽는 사람 |
|--------|------|------|----------------------|
| 전체 점수 | `{BASE}/result/daily_score/year=/month=/day=/` | Parquet | Spark 씀 / 웹 읽음 |
| Top3 | `{BASE}/result/top3/year=/month=/day=/` | Parquet | Spark 씀 / 웹(트래킹) 읽음 |
| Top3 JSON | `{BASE}/result/top3_json/year=/month=/day=/` | JSON | 리포트 씀 / 웹(대시보드) 읽음 |
| 분석 로그 | `{BASE}/result/logs/year=/month=/day=/` | JSON/text | Spark 씀 |

규칙: **`/data`(원천)와 `/result`(결과)는 명확히 분리.** 웹(FastAPI)은 **`/result` 읽기 전용**, 백테스팅 시 `/data/stock/ohlcv`도 읽음. 웹은 **절대 쓰지 않음.**

---

## 4. ⭐ 테이블별 컬럼 스키마 (실제 수집기 코드 기준)

> 이게 수집↔분석↔웹의 핵심 계약. 컬럼 추가/이름 변경 시 여기부터 고칠 것.

### 4.1 `ohlcv` (stock_collector.py)
```
symbol, name, date,
open, high, low, close, volume, trade_value, change_rate, market_cap,
prev_close, close_5d_ago, close_20d_ago,
ma5, ma20, ma60,
volume_avg_20, volume_ratio_20,
high_52w, low_52w, volatility_20
```

### 4.2 `investor` (stock_collector.py, 시총 상위 300종목만)
```
symbol, date,
foreign_net_buy_1d / 2d / 3d / 5d,
institution_net_buy_1d / 2d / 3d / 5d,
individual_net_buy_1d / 2d / 3d / 5d,
foreign_net_amount_1d,        # 외국인 순매수 금액(KRW)
foreign_holding_ratio         # 외국인 보유비율(%)
```

### 4.3 `news` (news_collector.py + dart_collector 공시 통합)
```
symbol, date, published_at, source, title
```
- 네이버 뉴스: `source` = 언론사명. 공시: `source` = `"dart"`, 파일명 `dart-disclosures.parquet`.
- `published_at` 포맷: `YYYY-MM-DD HH:MM` (정규화됨).

### 4.4 `financial` (dart_collector.py)
```
symbol, name, sector,
per, pbr, roe, eps, bps, dividend_yield,
per_q25, pbr_q25,            # 업종(sector)별 25th percentile
market_cap,
debt_ratio, operating_margin, revenue_growth, operating_profit_growth
```
- ⚠️ **실제 코드엔 `date` 컬럼 없음** (보고서 4.4.4와 불일치 → 9장 참조).

### 4.5 `daily_score` (Spark, 미구현 — 보고서 5.4.1 기준 예정)
```
symbol, name, sector, date,
undervaluation_score, investor_flow_score, volume_spike_score,
news_keyword_score, momentum_score, earnings_score, risk_penalty,
final_score, rank
```
`top3`는 위 컬럼에서 `final_score` 상위 3개. `top3_json`은 대시보드용 JSON(6장 참조).

---

## 5. ⭐ 점수 체계 (7항목 → final_score)

| 항목 | 영문 컬럼 | 최대 | 기준 |
|------|----------|------|------|
| 저평가 | undervaluation_score | 25 | 업종 PER/PBR 25% 이하 + ROE 양호 |
| 수급 | investor_flow_score | 20 | 외국인·기관 5일 누적 순매수 양수 (각 +10) |
| 거래량 | volume_spike_score | 15 | 20일 평균 대비 거래량 증가 |
| 뉴스 | news_keyword_score | 10 | 긍정 뉴스/공시 가점, 부정 감점 |
| 모멘텀 | momentum_score | 20 | 5·20일 수익률 + 이동평균 추세 |
| 실적 | earnings_score | 10 | 매출·영업이익 성장률 |
| 리스크 | risk_penalty | (감점) | 변동성·부채비율·부정뉴스 |

```
final_score = undervaluation + investor_flow + volume_spike + news_keyword
            + momentum + earnings − risk_penalty
# (가중치 적용 시 각 항목 × *_weight, 가중치는 ConfigMap scoring-weights)
```

**기준 배점은 위 표(5.2)로 통일한다.** (ConfigMap의 옛 가중치와 불일치 → 9장)

---

## 6. ⭐ FastAPI ↔ 프론트 응답 계약

| 메서드 | 경로 | 설명 | 데이터 출처 |
|--------|------|------|------------|
| GET | `/api/top3` | 오늘의 Top3 | `/result/top3_json/` |
| GET | `/api/scores` | 전체 종목 점수 | `/result/daily_score/` |
| GET | `/api/backtest?start=&end=&hold=` | 백테스팅 | `/result/daily_score/` + `/data/stock/ohlcv/` |
| GET | `/api/tracking?period=` | 추천 이력·적중률 | `/result/top3/` + ohlcv |
| GET | `/health` | K8s Liveness용 | (200 OK) |

**날짜 파라미터 없으면** 당일 파티션 기준 최신 데이터 반환. **휴장일이면 직전 영업일 파티션 폴백.**

`/api/top3` 응답 예시 (스키마 합의용 — 바꾸면 여기 갱신):
```json
{
  "date": "2026-05-28",
  "updated_at": "2026-05-29 08:00",
  "top3": [
    { "rank": 1, "symbol": "005930", "name": "삼성전자", "final_score": 90,
      "scores": { "undervaluation": 22, "investor_flow": 18, "volume_spike": 12,
                  "news_keyword": 8, "momentum": 18, "earnings": 8, "risk_penalty": 4 },
      "reason": "저평가·수급·모멘텀 모두 높음" }
  ]
}
```

---

## 7. 명명·포맷·환경 규칙

- **symbol**: 항상 6자리 문자열 zero-padding (`"005930"`, `"000660"`). KRX 티커 형식과 일치 → join 오류 방지.
- **date**: `YYYY-MM-DD` (ISO). 파티션 경로는 `year=YYYY/month=MM/day=DD` (month/day는 2자리 zero-pad).
- **경로**: 코드에 절대 하드코딩 금지. 전부 `HDFS_BASE` 환경변수 기준.
- **API 키**: `.env`(로컬) / K8s `Secret`(운영). 코드·이미지에 절대 포함 금지. `.env`는 `.gitignore` 필수.
- 로컬 개발: `HDFS_BASE=/tmp/stock-data` / 운영: `HDFS_BASE=hdfs://namenode:9000`. 코드는 양쪽에서 동일 동작.

---

## 8. K8s 배치·포트·스케줄 (허재성 담당, 전원 참조)

**클러스터**: master 1 + worker 3. 역할별 노드 분리.

| 노드 | 역할 | Pod |
|------|------|-----|
| master | control-plane, HDFS NameNode | - |
| worker1 | DataNode | 수집 (stock/dart/news-collector) |
| worker2 | DataNode | Spark 분석 (spark-analyzer) |
| worker3 | DataNode | 웹·서비스 (fastapi-server, dashboard, realtime-tracker) |

**CronJob 시간표** (모두 `concurrencyPolicy: Forbid`, 성공이력 3/실패이력 1, nodeSelector 강제)
| 이름 | 시간 | 노드 |
|------|------|------|
| stock-collector | 20:00 | worker1 |
| dart-collector | 20:20 | worker1 |
| news-collector | 20:40 | worker1 |
| spark-analyzer | 07:30 | worker2 |
| report-generator | 08:00 | worker3 |

**Deployment(상시, replicas:1, liveness probe, resource limit)**
| Pod | 내부포트 | NodePort | liveness |
|-----|---------|----------|----------|
| fastapi-server | 8000 | 30080 | `/health` |
| dashboard | 3000 | 30000 | `/` |
| realtime-tracker | 8001 | - | - |

---

## 9. ⭐ 알려진 불일치 & 결정 로그

> 보고서/코드/mockup 간 어긋나는 부분과, 팀이 합의한 결정. **계약을 바꾸면 여기에 날짜+한 줄 추가.**

- **[배점]** 보고서 5.2 표(거래량 15·뉴스 10) vs 6.3.1 ConfigMap 가중치(거래량 0.20·뉴스 0.15) 불일치 → **5.2 기준으로 통일 결정.** ConfigMap 값 수정 필요.
- **[점수 예시]** 5.3.1 Top3 예시 90/80/70 vs 화면 mockup 83/80/78 → 통일 예정.
- **[financial.date]** 보고서 4.4.4엔 `date` 컬럼 있으나 **실제 dart_collector 출력엔 없음.** → 코드에 추가할지 보고서에서 뺄지 결정 필요.
- **[수집기 개수]** 보고서 본문 "수집기 3종"이나 리포엔 4개(upbit 포함). upbit은 **확장(우선순위 낮음)** 이므로 카운트 제외 — 모순 아님.
- **[LLM 감성분석]** 아키텍처 그림엔 크게 그려졌으나 **현재 미구현(향후 계획).** 뉴스 점수는 일단 키워드/단순 처리.
- _(이후 결정은 여기에 계속 추가)_
