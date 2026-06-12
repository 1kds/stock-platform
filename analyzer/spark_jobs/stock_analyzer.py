import os

from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    col,
    when,
    lit,
    lower,
    sum as spark_sum,
    lpad,
    concat_ws,
    row_number,
    greatest,
    least,
)
from pyspark.sql.window import Window
from pyspark.sql.types import (
    StructType,
    StructField,
    StringType,
    DoubleType,
)

# =========================================================
# 0. 환경변수 설정
# =========================================================
# 로컬 CSV 테스트 예시:
# export DATA_FORMAT=csv
# export LOCAL_INPUT_BASE=data_sample
# export LOCAL_OUTPUT_BASE=output
# python analyzer/spark_jobs/stock_analyzer.py
#
# HDFS + Parquet 통합 테스트 예시:
# export DATA_FORMAT=parquet
# export HDFS_BASE=hdfs://namenode:9000
# export YEAR=2026
# export MONTH=05
# export DAY=04
# spark-submit analyzer/spark_jobs/stock_analyzer.py

DATA_FORMAT = os.getenv("DATA_FORMAT", "parquet").lower()
HDFS_BASE = os.getenv("HDFS_BASE", "hdfs://localhost:9000")
LOCAL_INPUT_BASE = os.getenv("LOCAL_INPUT_BASE", "data_sample")
LOCAL_OUTPUT_BASE = os.getenv("LOCAL_OUTPUT_BASE", "output")

YEAR = os.getenv("YEAR", "2026")
MONTH = os.getenv("MONTH", "05").zfill(2)
DAY = os.getenv("DAY", "04").zfill(2)
RUN_DATE = f"{YEAR}-{MONTH}-{DAY}"

APPLY_LIQUIDITY_FILTER = os.getenv("APPLY_LIQUIDITY_FILTER", "false").lower() == "true"

# =========================================================
# 1. SparkSession 생성
# =========================================================

spark = (
    SparkSession.builder
    .appName("StockTop3Analyzer")
    .master(os.getenv("SPARK_MASTER", "local[*]"))
    .getOrCreate()
)

spark.sparkContext.setLogLevel("WARN")

# =========================================================
# 2. 스키마 정의
# =========================================================

ohlcv_schema = StructType([
    StructField("symbol", StringType(), True),
    StructField("name", StringType(), True),
    StructField("date", StringType(), True),
    StructField("market", StringType(), True),
    StructField("open", DoubleType(), True),
    StructField("high", DoubleType(), True),
    StructField("low", DoubleType(), True),
    StructField("close", DoubleType(), True),
    StructField("volume", DoubleType(), True),
    StructField("trade_value", DoubleType(), True),
    StructField("change_rate", DoubleType(), True),
    StructField("market_cap", DoubleType(), True),
    StructField("prev_close", DoubleType(), True),
    StructField("close_5d_ago", DoubleType(), True),
    StructField("close_20d_ago", DoubleType(), True),
    StructField("ma5", DoubleType(), True),
    StructField("ma20", DoubleType(), True),
    StructField("ma60", DoubleType(), True),
    StructField("volume_avg_20", DoubleType(), True),
    StructField("volume_ratio_20", DoubleType(), True),
    StructField("high_52w", DoubleType(), True),
    StructField("low_52w", DoubleType(), True),
    StructField("volatility_20", DoubleType(), True),
])

investor_schema = StructType([
    StructField("symbol", StringType(), True),
    StructField("foreign_net_buy_1d", DoubleType(), True),
    StructField("foreign_net_buy_2d", DoubleType(), True),
    StructField("foreign_net_buy_3d", DoubleType(), True),
    StructField("foreign_net_buy_5d", DoubleType(), True),
    StructField("foreign_net_buy_5d_sum", DoubleType(), True),
    StructField("institution_net_buy_1d", DoubleType(), True),
    StructField("institution_net_buy_2d", DoubleType(), True),
    StructField("institution_net_buy_3d", DoubleType(), True),
    StructField("institution_net_buy_5d", DoubleType(), True),
    StructField("institution_net_buy_5d_sum", DoubleType(), True),
    StructField("individual_net_buy_1d", DoubleType(), True),
    StructField("individual_net_buy_2d", DoubleType(), True),
    StructField("individual_net_buy_3d", DoubleType(), True),
    StructField("individual_net_buy_5d", DoubleType(), True),
    StructField("foreign_net_amount_1d", DoubleType(), True),
    StructField("institution_net_amount_1d", DoubleType(), True),
    StructField("foreign_net_buy_amount", DoubleType(), True),
    StructField("institution_net_buy_amount", DoubleType(), True),
    StructField("foreign_holding_ratio", DoubleType(), True),
])

financial_schema = StructType([
    StructField("symbol", StringType(), True),
    StructField("name", StringType(), True),
    StructField("sector", StringType(), True),
    StructField("market", StringType(), True),
    StructField("date", StringType(), True),
    StructField("per", DoubleType(), True),
    StructField("pbr", DoubleType(), True),
    StructField("roe", DoubleType(), True),
    StructField("eps", DoubleType(), True),
    StructField("bps", DoubleType(), True),
    StructField("dividend_yield", DoubleType(), True),
    StructField("per_q25", DoubleType(), True),
    StructField("pbr_q25", DoubleType(), True),
    StructField("market_cap", DoubleType(), True),
    StructField("debt_ratio", DoubleType(), True),
    StructField("operating_margin", DoubleType(), True),
    StructField("revenue_growth", DoubleType(), True),
    StructField("operating_profit_growth", DoubleType(), True),
])

news_schema = StructType([
    StructField("symbol", StringType(), True),
    StructField("date", StringType(), True),
    StructField("published_at", StringType(), True),
    StructField("source", StringType(), True),
    StructField("title", StringType(), True),
    StructField("sentiment_score", DoubleType(), True),
])

# =========================================================
# 3. 경로 설정
# =========================================================

def get_input_paths():
    if DATA_FORMAT == "csv":
        return {
            "ohlcv": f"{LOCAL_INPUT_BASE}/ohlcv.csv",
            "investor": f"{LOCAL_INPUT_BASE}/investor.csv",
            "financial": f"{LOCAL_INPUT_BASE}/financial.csv",
            "news": f"{LOCAL_INPUT_BASE}/news.csv",
        }

    if DATA_FORMAT == "parquet":
        return {
            "ohlcv": f"{HDFS_BASE}/data/stock/ohlcv/year={YEAR}/month={MONTH}/day={DAY}/",
            "investor": f"{HDFS_BASE}/data/stock/investor/year={YEAR}/month={MONTH}/day={DAY}/",
            "financial": f"{HDFS_BASE}/data/stock/financial/year={YEAR}/month={MONTH}/day={DAY}/",
            "news": f"{HDFS_BASE}/data/stock/news/year={YEAR}/month={MONTH}/day={DAY}/",
        }

    raise ValueError(f"Unsupported DATA_FORMAT: {DATA_FORMAT}")


def get_output_paths():
    if DATA_FORMAT == "csv":
        return {
            "daily_score": f"{LOCAL_OUTPUT_BASE}/daily_score",
            "top3": f"{LOCAL_OUTPUT_BASE}/top3",
            "top3_json": f"{LOCAL_OUTPUT_BASE}/top3_json",
        }

    return {
        "daily_score": f"{HDFS_BASE}/result/daily_score/year={YEAR}/month={MONTH}/day={DAY}/",
        "top3": f"{HDFS_BASE}/result/top3/year={YEAR}/month={MONTH}/day={DAY}/",
        "top3_json": f"{HDFS_BASE}/result/top3_json/year={YEAR}/month={MONTH}/day={DAY}/",
    }


def read_data(path):
    if DATA_FORMAT == "csv":
        return (
            spark.read
            .option("header", True)
            .option("inferSchema", True)
            .csv(path)
        )

    if DATA_FORMAT == "parquet":
        return spark.read.parquet(path)

    raise ValueError(f"Unsupported DATA_FORMAT: {DATA_FORMAT}")


def empty_df(schema):
    return spark.createDataFrame([], schema)


def read_optional_data(name, path, schema):
    """
    investor / financial / news처럼 없어도 분석이 계속되어야 하는 입력용.
    경로 없음, 파일 없음, 스키마 불일치 등이 발생하면 빈 DataFrame으로 대체한다.
    """
    try:
        df = read_data(path)
        print(f"[INFO] {name} loaded: {path}")
        return df
    except Exception as exc:
        print(f"[WARN] {name} not available. Use empty DataFrame.")
        print(f"[WARN] {name} path: {path}")
        print(f"[WARN] {name} error: {exc}")
        return empty_df(schema)


# =========================================================
# 4. 공통 보정 함수
# =========================================================

def ensure_column(df, column_name, default_value, data_type):
    if column_name not in df.columns:
        return df.withColumn(column_name, lit(default_value).cast(data_type))
    return df.withColumn(column_name, col(column_name).cast(data_type))


def ensure_string_column(df, column_name, default_value=""):
    return ensure_column(df, column_name, default_value, "string")


def ensure_double_column(df, column_name, default_value=0.0):
    return ensure_column(df, column_name, default_value, "double")


def normalize_symbol(df):
    df = ensure_string_column(df, "symbol", "")
    return df.withColumn("symbol", lpad(col("symbol").cast("string"), 6, "0"))


def rename_if_exists(df, old_name, new_name):
    if old_name in df.columns and new_name not in df.columns:
        return df.withColumnRenamed(old_name, new_name)
    return df


# =========================================================
# 5. 데이터 읽기
# =========================================================

paths = get_input_paths()
out_paths = get_output_paths()

print("===== ENV CHECK =====")
print(f"DATA_FORMAT={DATA_FORMAT}")
print(f"HDFS_BASE={HDFS_BASE}")
print(f"YEAR={YEAR}, MONTH={MONTH}, DAY={DAY}, RUN_DATE={RUN_DATE}")
print("=====================")

# OHLCV는 핵심 입력이므로 없으면 실패시키는 것이 맞음
ohlcv = read_data(paths["ohlcv"])

# 아래 3개는 없어도 분석 가능하도록 빈 DataFrame 대체
investor = read_optional_data("investor", paths["investor"], investor_schema)
financial = read_optional_data("financial", paths["financial"], financial_schema)
news = read_optional_data("news", paths["news"], news_schema)

ohlcv = normalize_symbol(ohlcv)
investor = normalize_symbol(investor)
financial = normalize_symbol(financial)
news = normalize_symbol(news)

# =========================================================
# 6. 입력 컬럼 보정
# =========================================================

# ---------- OHLCV ----------
ohlcv = ensure_string_column(ohlcv, "name", "")
ohlcv = ensure_string_column(ohlcv, "date", RUN_DATE)
ohlcv = ensure_string_column(ohlcv, "market", "KOSPI")

ohlcv_numeric_cols = {
    "open": 0.0,
    "high": 0.0,
    "low": 0.0,
    "close": 0.0,
    "volume": 0.0,
    "trade_value": 0.0,
    "change_rate": 0.0,
    "market_cap": 0.0,
    "prev_close": 0.0,
    "close_5d_ago": 0.0,
    "close_20d_ago": 0.0,
    "ma5": 0.0,
    "ma20": 0.0,
    "ma60": 0.0,
    "volume_avg_20": 0.0,
    "volume_ratio_20": 0.0,
    "high_52w": 0.0,
    "low_52w": 0.0,
    "volatility_20": 0.0,
}

for c, default in ohlcv_numeric_cols.items():
    ohlcv = ensure_double_column(ohlcv, c, default)

ohlcv = (
    ohlcv
    .withColumn(
        "date",
        when((col("date").isNull()) | (col("date") == ""), lit(RUN_DATE)).otherwise(col("date")),
    )
    .withColumn(
        "volume_ratio_20",
        when(
            (col("volume_ratio_20") == 0) & (col("volume_avg_20") > 0),
            col("volume") / col("volume_avg_20"),
        ).otherwise(col("volume_ratio_20")),
    )
    .withColumn(
        "trade_value",
        when(col("trade_value") == 0, col("close") * col("volume")).otherwise(col("trade_value")),
    )
    .withColumn(
        "change_rate",
        when(
            (col("change_rate") == 0) & (col("prev_close") > 0),
            (col("close") - col("prev_close")) / col("prev_close") * 100,
        ).otherwise(col("change_rate")),
    )
    .withColumn("ma60", when(col("ma60") == 0, col("ma20")).otherwise(col("ma60")))
    .withColumn("high_52w", when(col("high_52w") == 0, col("high")).otherwise(col("high_52w")))
    .withColumn("low_52w", when(col("low_52w") == 0, col("low")).otherwise(col("low_52w")))
)

# ---------- Investor ----------
investor = rename_if_exists(investor, "foreign_net_buy_5d", "foreign_net_buy_5d_sum")
investor = rename_if_exists(investor, "institution_net_buy_5d", "institution_net_buy_5d_sum")
investor = rename_if_exists(investor, "foreign_net_amount_1d", "foreign_net_buy_amount")
investor = rename_if_exists(investor, "institution_net_amount_1d", "institution_net_buy_amount")

investor_numeric_cols = {
    "foreign_net_buy_1d": 0.0,
    "foreign_net_buy_2d": 0.0,
    "foreign_net_buy_3d": 0.0,
    "foreign_net_buy_5d_sum": 0.0,
    "institution_net_buy_1d": 0.0,
    "institution_net_buy_2d": 0.0,
    "institution_net_buy_3d": 0.0,
    "institution_net_buy_5d_sum": 0.0,
    "individual_net_buy_1d": 0.0,
    "individual_net_buy_2d": 0.0,
    "individual_net_buy_3d": 0.0,
    "individual_net_buy_5d": 0.0,
    "foreign_net_buy_amount": 0.0,
    "institution_net_buy_amount": 0.0,
    "foreign_holding_ratio": 0.0,
}

for c, default in investor_numeric_cols.items():
    investor = ensure_double_column(investor, c, default)

investor = (
    investor
    .withColumn(
        "foreign_net_buy_5d_sum",
        when(
            col("foreign_net_buy_5d_sum") == 0,
            col("foreign_net_buy_1d") + col("foreign_net_buy_2d") + col("foreign_net_buy_3d"),
        ).otherwise(col("foreign_net_buy_5d_sum")),
    )
    .withColumn(
        "institution_net_buy_5d_sum",
        when(
            col("institution_net_buy_5d_sum") == 0,
            col("institution_net_buy_1d") + col("institution_net_buy_2d") + col("institution_net_buy_3d"),
        ).otherwise(col("institution_net_buy_5d_sum")),
    )
)

# ---------- Financial ----------
financial = ensure_string_column(financial, "name", "")
financial = ensure_string_column(financial, "sector", "미분류")
financial = ensure_string_column(financial, "market", "KOSPI")
financial = ensure_string_column(financial, "date", RUN_DATE)

financial_numeric_cols = {
    "per": 0.0,
    "pbr": 0.0,
    "roe": 0.0,
    "eps": 0.0,
    "bps": 0.0,
    "dividend_yield": 0.0,
    "per_q25": 0.0,
    "pbr_q25": 0.0,
    "market_cap": 0.0,
    "debt_ratio": 0.0,
    "operating_margin": 0.0,
    "revenue_growth": 0.0,
    "operating_profit_growth": 0.0,
}

for c, default in financial_numeric_cols.items():
    financial = ensure_double_column(financial, c, default)

if "financial_market_cap" not in financial.columns:
    financial = financial.withColumnRenamed("market_cap", "financial_market_cap")
else:
    financial = financial.drop("market_cap")

financial = ensure_double_column(financial, "financial_market_cap", 0.0)

# ---------- News ----------
news = ensure_string_column(news, "date", RUN_DATE)
news = ensure_string_column(news, "published_at", "")
news = ensure_string_column(news, "source", "unknown")
news = ensure_string_column(news, "title", "")
news = ensure_double_column(news, "sentiment_score", 0.0)

# =========================================================
# 7. 재무 점수 계산
# =========================================================

per_condition = (col("per_q25") > 0) & (col("per") > 0) & (col("per") <= col("per_q25"))
pbr_condition = (col("pbr_q25") > 0) & (col("pbr") > 0) & (col("pbr") <= col("pbr_q25"))
roe_condition = col("roe") >= 15

condition_count = (
    per_condition.cast("int")
    + pbr_condition.cast("int")
    + roe_condition.cast("int")
)

financial_score = (
    financial
    .withColumn(
        "undervaluation_score",
        when(condition_count == 3, 25)
        .when(condition_count == 2, 18)
        .when(condition_count == 1, 10)
        .otherwise(0),
    )
    .withColumn(
        "earnings_score",
        when(
            (col("revenue_growth") > 0)
            & (col("operating_profit_growth") > 0)
            & (col("operating_margin") > 0),
            10,
        )
        .when((col("revenue_growth") > 0) & (col("operating_profit_growth") > 0), 7)
        .when((col("revenue_growth") > 0) | (col("operating_profit_growth") > 0), 4)
        .otherwise(0),
    )
)

financial_score = ensure_string_column(financial_score, "sector", "미분류")
financial_score = ensure_string_column(financial_score, "name", "")
financial_score = ensure_string_column(financial_score, "market", "KOSPI")
financial_score = ensure_double_column(financial_score, "financial_market_cap", 0.0)

# =========================================================
# 8. 수급 점수 계산
# =========================================================

investor_score = (
    investor
    .withColumn(
        "investor_flow_score",
        when(col("foreign_net_buy_5d_sum") > 0, 10).otherwise(0)
        + when(col("institution_net_buy_5d_sum") > 0, 10).otherwise(0),
    )
)

# =========================================================
# 9. 거래량 / 모멘텀 점수 계산
# =========================================================

volume_score = (
    ohlcv
    .withColumn(
        "volume_spike_score",
        when(col("volume_ratio_20") >= 3, 15)
        .when(col("volume_ratio_20") >= 2, 12)
        .when(col("volume_ratio_20") >= 1.5, 8)
        .otherwise(0),
    )
)

momentum_score = (
    volume_score
    .withColumn(
        "return_5d",
        when(
            col("close_5d_ago") > 0,
            (col("close") - col("close_5d_ago")) / col("close_5d_ago") * 100,
        ).otherwise(0),
    )
    .withColumn(
        "return_20d",
        when(
            col("close_20d_ago") > 0,
            (col("close") - col("close_20d_ago")) / col("close_20d_ago") * 100,
        ).otherwise(0),
    )
    .withColumn(
        "momentum_score",
        when((col("return_5d") > 0) & (col("return_20d") > 0) & (col("close") > col("ma20")), 20)
        .when((col("return_5d") > 0) & (col("return_20d") > 0), 15)
        .when(col("return_5d") > 0, 5)
        .otherwise(0),
    )
)

# =========================================================
# 10. 뉴스 점수 계산
# =========================================================

positive_keywords = [
    "수주", "공급계약", "흑자전환", "실적개선", "증설", "신규투자",
    "승인", "자사주", "배당", "계약", "신제품", "호재",
]

negative_keywords = [
    "적자", "소송", "상장폐지", "감자", "횡령", "배임",
    "실적악화", "불성실공시", "악재", "감사의견",
]

news_score_base = news.withColumn("title_lower", lower(col("title")))

positive_condition = None
for keyword in positive_keywords:
    condition = col("title").contains(keyword)
    positive_condition = condition if positive_condition is None else (positive_condition | condition)

negative_condition = None
for keyword in negative_keywords:
    condition = col("title").contains(keyword)
    negative_condition = condition if negative_condition is None else (negative_condition | condition)

news_score_base = (
    news_score_base
    .withColumn("positive_hit", when(positive_condition, 1).otherwise(0))
    .withColumn("negative_hit", when(negative_condition, 1).otherwise(0))
)

news_score = (
    news_score_base
    .groupBy("symbol")
    .agg(
        spark_sum("positive_hit").alias("positive_news_count"),
        spark_sum("negative_hit").alias("negative_news_count"),
        spark_sum("sentiment_score").alias("sentiment_sum"),
    )
    .withColumn(
        "keyword_based_score",
        when(col("negative_news_count") > 0, -10)
        .when(col("positive_news_count") >= 2, 10)
        .when(col("positive_news_count") == 1, 6)
        .otherwise(0),
    )
    .withColumn(
        "sentiment_based_score",
        greatest(lit(-10.0), least(lit(10.0), col("sentiment_sum"))),
    )
    .withColumn(
        "news_keyword_score",
        when(col("sentiment_sum") != 0, col("sentiment_based_score")).otherwise(col("keyword_based_score")),
    )
)

# =========================================================
# 11. Join
# =========================================================

score_df = (
    momentum_score
    .join(
        financial_score.select(
            "symbol",
            "sector",
            "per",
            "pbr",
            "roe",
            "eps",
            "bps",
            "dividend_yield",
            "per_q25",
            "pbr_q25",
            "financial_market_cap",
            "debt_ratio",
            "operating_margin",
            "revenue_growth",
            "operating_profit_growth",
            "undervaluation_score",
            "earnings_score",
        ),
        "symbol",
        "left",
    )
    .join(
        investor_score.select(
            "symbol",
            "investor_flow_score",
            "foreign_net_buy_5d_sum",
            "institution_net_buy_5d_sum",
            "foreign_net_buy_amount",
            "institution_net_buy_amount",
            "foreign_holding_ratio",
        ),
        "symbol",
        "left",
    )
    .join(
        news_score.select(
            "symbol",
            "news_keyword_score",
            "positive_news_count",
            "negative_news_count",
            "sentiment_sum",
        ),
        "symbol",
        "left",
    )
    .fillna(0)
)

score_df = ensure_string_column(score_df, "name", "")
score_df = ensure_string_column(score_df, "sector", "미분류")
score_df = ensure_string_column(score_df, "market", "KOSPI")
score_df = ensure_string_column(score_df, "date", RUN_DATE)
score_df = ensure_double_column(score_df, "financial_market_cap", 0.0)
score_df = ensure_double_column(score_df, "market_cap", 0.0)

score_df = (
    score_df
    .withColumn(
        "name",
        when((col("name").isNull()) | (col("name") == ""), col("symbol")).otherwise(col("name")),
    )
    .withColumn(
        "sector",
        when((col("sector").isNull()) | (col("sector") == ""), lit("미분류")).otherwise(col("sector")),
    )
    .withColumn(
        "market",
        when((col("market").isNull()) | (col("market") == ""), lit("KOSPI")).otherwise(col("market")),
    )
    .withColumn(
        "date",
        when((col("date").isNull()) | (col("date") == ""), lit(RUN_DATE)).otherwise(col("date")),
    )
    .withColumn(
        "market_cap",
        when(col("market_cap") == 0, col("financial_market_cap")).otherwise(col("market_cap")),
    )
)

# =========================================================
# 12. risk_penalty 계산
# =========================================================

score_df = score_df.withColumn("risk_penalty", lit(0.0))

score_df = score_df.withColumn(
    "risk_penalty",
    when(col("news_keyword_score") < 0, col("risk_penalty") + 10).otherwise(col("risk_penalty")),
)

score_df = score_df.withColumn(
    "risk_penalty",
    when(col("debt_ratio") >= 200, col("risk_penalty") + 5).otherwise(col("risk_penalty")),
)

score_df = score_df.withColumn(
    "risk_penalty",
    when(col("change_rate") >= 10, col("risk_penalty") + 5)
    .when(col("volatility_20") >= 8, col("risk_penalty") + 5)
    .otherwise(col("risk_penalty")),
)

score_df = score_df.withColumn("risk_score", -col("risk_penalty"))

# =========================================================
# 13. base_score / final_score 계산
# =========================================================

score_df = (
    score_df
    .withColumn(
        "base_score",
        col("undervaluation_score")
        + col("investor_flow_score")
        + col("volume_spike_score")
        + col("news_keyword_score")
        + col("momentum_score")
        + col("earnings_score"),
    )
    .withColumn("final_score", col("base_score") - col("risk_penalty"))
)

# =========================================================
# 14. 선정 이유 / 위험 신호 생성
# =========================================================

score_df = (
    score_df
    .withColumn(
        "selected_reason",
        concat_ws(
            ", ",
            when(col("undervaluation_score") >= 18, lit("저평가 조건 충족")),
            when(col("investor_flow_score") >= 10, lit("외국인·기관 수급 양호")),
            when(col("volume_spike_score") >= 8, lit("거래량 증가")),
            when(col("news_keyword_score") > 0, lit("긍정 뉴스·공시")),
            when(col("momentum_score") >= 15, lit("가격 모멘텀 양호")),
            when(col("earnings_score") >= 7, lit("실적 개선 신호")),
        ),
    )
    .withColumn(
        "risk_signal",
        concat_ws(
            ", ",
            when(col("news_keyword_score") < 0, lit("부정 뉴스·공시")),
            when(col("debt_ratio") >= 200, lit("부채비율 과다")),
            when(col("change_rate") >= 10, lit("단기 급등 가능성")),
            when(col("volatility_20") >= 8, lit("변동성 과다")),
        ),
    )
    .withColumn(
        "selected_reason",
        when(col("selected_reason") == "", lit("일부 조건 충족")).otherwise(col("selected_reason")),
    )
    .withColumn(
        "risk_signal",
        when(col("risk_signal") == "", lit("특이 위험 신호 없음")).otherwise(col("risk_signal")),
    )
    .withColumn("reason", col("selected_reason"))
)

# =========================================================
# 15. 유동성 필터
# =========================================================

if APPLY_LIQUIDITY_FILTER:
    score_df = score_df.filter(
        (col("trade_value") >= 5_000_000_000)
        & (col("market_cap") >= 100_000_000_000)
    )

# =========================================================
# 16. rank / Top3 선정
# =========================================================

rank_window = Window.orderBy(
    col("final_score").desc(),
    col("base_score").desc(),
    col("symbol").asc(),
)

score_df = score_df.withColumn("rank", row_number().over(rank_window))
top3 = score_df.filter(col("rank") <= 3).orderBy(col("rank").asc())

# =========================================================
# 17. 출력 컬럼 정리
# =========================================================

daily_score_cols = [
    "symbol",
    "name",
    "sector",
    "market",
    "date",
    "undervaluation_score",
    "investor_flow_score",
    "volume_spike_score",
    "news_keyword_score",
    "momentum_score",
    "earnings_score",
    "risk_penalty",
    "risk_score",
    "base_score",
    "final_score",
    "rank",
    "selected_reason",
    "reason",
    "risk_signal",
]

top3_cols = [
    "rank",
    "symbol",
    "name",
    "sector",
    "market",
    "date",
    "final_score",
    "base_score",
    "risk_penalty",
    "risk_score",
    "undervaluation_score",
    "investor_flow_score",
    "volume_spike_score",
    "news_keyword_score",
    "momentum_score",
    "earnings_score",
    "selected_reason",
    "reason",
    "risk_signal",
]

for c in daily_score_cols:
    if c not in score_df.columns:
        if c in ["symbol", "name", "sector", "market", "date", "selected_reason", "reason", "risk_signal"]:
            score_df = ensure_string_column(score_df, c, "")
        else:
            score_df = ensure_double_column(score_df, c, 0.0)

daily_score = score_df.select(*daily_score_cols)
top3_result = top3.select(*top3_cols)

# =========================================================
# 18. 결과 출력
# =========================================================

print("===== INPUT COUNT =====")
print(f"ohlcv: {ohlcv.count()}")
print(f"investor: {investor.count()}")
print(f"financial: {financial.count()}")
print(f"news: {news.count()}")

print("===== 전체 종목 점수 =====")
daily_score.show(truncate=False)

print("===== Top 3 종목 =====")
top3_result.show(truncate=False)

# =========================================================
# 19. 결과 저장
# =========================================================

daily_score.write.mode("overwrite").parquet(out_paths["daily_score"])
top3_result.write.mode("overwrite").parquet(out_paths["top3"])
top3_result.coalesce(1).write.mode("overwrite").json(out_paths["top3_json"])

print("===== OUTPUT PATHS =====")
print(f"daily_score: {out_paths['daily_score']}")
print(f"top3: {out_paths['top3']}")
print(f"top3_json: {out_paths['top3_json']}")

spark.stop()