#!/bin/sh
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  SELECT 'CREATE DATABASE ${OPENFGA_POSTGRES_DB:-openfga}'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${OPENFGA_POSTGRES_DB:-openfga}')\gexec
EOSQL
