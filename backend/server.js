// server.js
require('dotenv').config();
const app = require('./app');
const pool = require('./db/pool');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Fail fast if the database isn't reachable.
    const conn = await pool.getConnection();
    conn.release();
    console.log('Connected to MySQL database.');

    app.listen(PORT, () => {
      console.log(`MedExpert API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    console.error('Failed to start server — could not connect to the database:');
    console.error(err.message);
    process.exit(1);
  }
}

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
});
