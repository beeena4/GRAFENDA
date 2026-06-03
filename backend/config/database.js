const { Pool } = require('pg');
require('dotenv').config();

const config = {
  ssl: { rejectUnauthorized: false }
};

if (process.env.DATABASE_URL) {
  config.connectionString = process.env.DATABASE_URL;
} else {
  config.host = process.env.DB_HOST;
  config.user = process.env.DB_USER;
  config.password = process.env.DB_PASSWORD;
  config.database = process.env.DB_NAME;
  config.port = parseInt(process.env.DB_PORT) || 5432;
}

const pool = new Pool(config);

// Helper function to translate MySQL queries and parameters to PostgreSQL
const mysqlToPgQuery = (sql, params = []) => {
  let pgSql = sql;
  let pgParams = [...params];

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let resultSql = '';
  let paramIndex = 1;

  for (let i = 0; i < pgSql.length; i++) {
    const char = pgSql[i];
    if (char === "'" && !inDoubleQuote && !inBacktick) {
      inSingleQuote = !inSingleQuote;
      resultSql += char;
    } else if (char === '"' && !inSingleQuote && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
      resultSql += char;
    } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
      resultSql += '"';
    } else if (char === '?' && !inSingleQuote && !inDoubleQuote && !inBacktick) {
      resultSql += `$${paramIndex++}`;
    } else {
      resultSql += char;
    }
  }
  pgSql = resultSql;

  // Replace case-insensitive LIKE with ILIKE for standard PG search behavior
  pgSql = pgSql.replace(/\s+like\s+/ig, ' ILIKE ');

  // Replace MySQL style boolean comparisons like `is_active = 1` or `is_read = 0` with `is_active = true` or `is_read = false`
  pgSql = pgSql.replace(/(\b(?:is_[a-zA-Z0-9_]+))\s*=\s*([01])\b/g, (match, col, val) => {
    return `${col} = ${val === '1' ? 'true' : 'false'}`;
  });

  // Automatically append RETURNING id for inserts if not already present
  const isInsert = /^\s*insert\s+into/i.test(pgSql);
  if (isInsert && !/returning/i.test(pgSql)) {
    pgSql += ' RETURNING id';
  }

  // Parse LIMIT and OFFSET placeholders, ensuring they are actual integers
  const limitOffsetMatches = pgSql.match(/(?:limit|offset)\s+\$(\d+)/ig);
  if (limitOffsetMatches) {
    for (const match of limitOffsetMatches) {
      const paramNum = parseInt(match.match(/\d+/)[0]);
      if (pgParams[paramNum - 1] !== undefined) {
        pgParams[paramNum - 1] = parseInt(pgParams[paramNum - 1]);
      }
    }
  }

  // Coerce string numbers to actual numbers to prevent PostgreSQL type errors (except phone numbers with leading zeros)
  pgParams = pgParams.map(param => {
    if (typeof param === 'string' && /^(?:[1-9]\d*|0)$/.test(param)) {
      return parseInt(param, 10);
    }
    return param;
  });

  return { pgSql, pgParams, isInsert };
};

// Main direct query utility function
const query = async (sql, params = []) => {
  const { pgSql, pgParams, isInsert } = mysqlToPgQuery(sql, params);
  try {
    const res = await pool.query(pgSql, pgParams);
    const rows = res.rows || [];
    
    // Attach compatibility properties for insertId and affectedRows
    if (isInsert && rows.length > 0) {
      rows.insertId = rows[0].id;
    }
    rows.affectedRows = res.rowCount;
    
    return rows;
  } catch (error) {
    console.error('Database query error:', error.message);
    console.error('SQL:', pgSql);
    console.error('Params:', pgParams);
    throw error;
  }
};

const pgPoolQuery = async (sql, params = []) => {
  const { pgSql, pgParams, isInsert } = mysqlToPgQuery(sql, params);
  const res = await pool.query(pgSql, pgParams);
  const rows = res.rows || [];
  if (isInsert && rows.length > 0) {
    rows.insertId = rows[0].id;
  }
  rows.affectedRows = res.rowCount;
  return [rows, null];
};

const getConnection = async () => {
  const client = await pool.connect();
  
  const connectionWrapper = {
    query: async (sql, params = []) => {
      const { pgSql, pgParams, isInsert } = mysqlToPgQuery(sql, params);
      const res = await client.query(pgSql, pgParams);
      const rows = res.rows || [];
      if (isInsert && rows.length > 0) {
        rows.insertId = rows[0].id;
      }
      rows.affectedRows = res.rowCount;
      return [rows, null];
    },
    execute: async (sql, params = []) => {
      const { pgSql, pgParams, isInsert } = mysqlToPgQuery(sql, params);
      const res = await client.query(pgSql, pgParams);
      const rows = res.rows || [];
      if (isInsert && rows.length > 0) {
        rows.insertId = rows[0].id;
      }
      rows.affectedRows = res.rowCount;
      return [rows, null];
    },
    beginTransaction: async () => {
      await client.query('BEGIN');
    },
    commit: async () => {
      await client.query('COMMIT');
    },
    rollback: async () => {
      await client.query('ROLLBACK');
    },
    release: () => {
      client.release();
    }
  };
  
  return connectionWrapper;
};

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database terhubung: Supabase PostgreSQL siap digunakan.');
    client.release();
  } catch (err) {
    console.error('❌ Gagal terhubung ke Supabase PostgreSQL:', err.message);
  }
};

testConnection();

// Create a poolWrapper matching the mysql2 pool interface
const poolWrapper = {
  query: pgPoolQuery,
  execute: pgPoolQuery,
  getConnection
};

module.exports = {
  query,
  getConnection,
  pool: poolWrapper
};