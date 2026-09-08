-- Rebuild metric_registry to act as the single authoritative semantic data-contract layer
DROP TABLE IF EXISTS metric_registry;

CREATE TABLE metric_registry (
    canonical_id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    semantic_definition TEXT NOT NULL,
    unit TEXT,
    source_id TEXT REFERENCES sources(id),
    source_indicator_code TEXT,
    methodology TEXT,
    temporal_coverage TEXT,
    resolution_table TEXT NOT NULL,
    resolution_column TEXT NOT NULL
);
