"""데이터 소스 추상화.

현재(1단계): mock/*.json 반환.
나중(3단계): USE_MOCK=false 시 pyarrow로 HDFS Parquet/JSON 읽기로 교체.
→ 엔드포인트(main.py)와 프론트 코드는 그대로 두고 여기만 바꾸면 됨.
"""

import json

import config


def _load_mock(name: str) -> dict:
    with open(config.MOCK_DIR / f"{name}.json", encoding="utf-8") as f:
        return json.load(f)


def get_top3(date: str | None = None) -> dict:
    """오늘의 Top3. date 없으면 최신. (HDFS: /result/top3_json/)"""
    if config.USE_MOCK:
        return _load_mock("top3")
    raise NotImplementedError("HDFS 연동 예정 (pyarrow, /result/top3_json/)")


def get_scores(date: str | None = None) -> dict:
    """전체 종목 점수. (HDFS: /result/daily_score/)"""
    if config.USE_MOCK:
        return _load_mock("scores")
    raise NotImplementedError("HDFS 연동 예정 (pyarrow, /result/daily_score/)")


def get_tracking(period: str = "all") -> dict:
    """추천 이력·적중률. (HDFS: /result/top3/ + ohlcv)"""
    if config.USE_MOCK:
        return _load_mock("tracking")
    raise NotImplementedError("HDFS 연동 예정 (pyarrow, /result/top3/ + ohlcv)")


def get_backtest(start: str, end: str, hold: int = 5) -> dict:
    """백테스팅. (HDFS: /result/daily_score/ + /data/stock/ohlcv/)"""
    if config.USE_MOCK:
        data = _load_mock("backtest")
        # mock이라 입력 파라미터를 응답에 반영만 해줌 (계산은 3단계에서)
        data["period"] = {"start": start, "end": end}
        data["hold"] = hold
        return data
    raise NotImplementedError("HDFS 연동 예정 (수익률 계산은 analytics.py)")
