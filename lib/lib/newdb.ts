import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.NEW_DB_HOST,
  user: process.env.NEW_DB_USER,
  password: process.env.NEW_DB_PASSWORD,
  database: process.env.NEW_DB_NAME || "cpct_in01_new_exams",
  port: Number(process.env.NEW_DB_PORT),

  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
});

export default pool;