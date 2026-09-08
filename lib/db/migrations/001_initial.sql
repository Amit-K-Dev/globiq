CREATE TABLE IF NOT EXISTS countries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    iso_code TEXT,
    flag TEXT,
    region TEXT,
    income_group TEXT
);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT
);

CREATE TABLE IF NOT EXISTS metrics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT NOT NULL,
    unit TEXT,
    format_type TEXT,
    description TEXT,
    FOREIGN KEY(category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT,
    license TEXT
);

CREATE TABLE IF NOT EXISTS historical_values (
    country_id TEXT NOT NULL,
    metric_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    value REAL,
    PRIMARY KEY(country_id, metric_id, year),
    FOREIGN KEY(country_id) REFERENCES countries(id),
    FOREIGN KEY(metric_id) REFERENCES metrics(id)
);
