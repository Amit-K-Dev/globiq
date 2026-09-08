-- Add Provenance columns to existing tables
ALTER TABLE historical_values ADD COLUMN source_id TEXT REFERENCES sources(id);
ALTER TABLE historical_values ADD COLUMN source_indicator_code TEXT;
ALTER TABLE historical_values ADD COLUMN last_updated DATETIME;

ALTER TABLE metrics ADD COLUMN methodology TEXT;
ALTER TABLE metrics ADD COLUMN source_dataset TEXT;

-- Canonical Metric Registry (Semantic Registry)
CREATE TABLE IF NOT EXISTS metric_registry (
    canonical_id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    semantic_definition TEXT,
    temporal_coverage TEXT,
    unit TEXT,
    scale TEXT
);

-- Specialized Domain: Institutions
CREATE TABLE IF NOT EXISTS institutions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country_id TEXT,
    FOREIGN KEY(country_id) REFERENCES countries(id)
);

CREATE TABLE IF NOT EXISTS institution_metrics (
    institution_id TEXT NOT NULL,
    metric_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    value REAL,
    rank INTEGER,
    source_id TEXT,
    source_indicator_code TEXT,
    last_updated DATETIME,
    PRIMARY KEY(institution_id, metric_id, year),
    FOREIGN KEY(institution_id) REFERENCES institutions(id),
    FOREIGN KEY(metric_id) REFERENCES metrics(id),
    FOREIGN KEY(source_id) REFERENCES sources(id)
);

-- Specialized Domain: Entertainment
CREATE TABLE IF NOT EXISTS entertainment_entities (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    release_date TEXT,
    primary_country_id TEXT,
    FOREIGN KEY(primary_country_id) REFERENCES countries(id)
);

CREATE TABLE IF NOT EXISTS entertainment_metrics (
    entity_id TEXT NOT NULL,
    metric_id TEXT NOT NULL,
    market_country_id TEXT,
    period TEXT NOT NULL,
    value REAL,
    source_id TEXT,
    source_indicator_code TEXT,
    last_updated DATETIME,
    PRIMARY KEY(entity_id, metric_id, market_country_id, period),
    FOREIGN KEY(entity_id) REFERENCES entertainment_entities(id),
    FOREIGN KEY(market_country_id) REFERENCES countries(id),
    FOREIGN KEY(metric_id) REFERENCES metrics(id),
    FOREIGN KEY(source_id) REFERENCES sources(id)
);

-- Specialized Domain: Minerals & Commodities
CREATE TABLE IF NOT EXISTS commodities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT
);

CREATE TABLE IF NOT EXISTS commodity_trade_production (
    country_id TEXT NOT NULL,
    commodity_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    production_volume REAL,
    export_value_usd REAL,
    import_value_usd REAL,
    reserves_volume REAL,
    source_id TEXT,
    last_updated DATETIME,
    PRIMARY KEY(country_id, commodity_id, year),
    FOREIGN KEY(country_id) REFERENCES countries(id),
    FOREIGN KEY(commodity_id) REFERENCES commodities(id),
    FOREIGN KEY(source_id) REFERENCES sources(id)
);
