// connection.js
import pg from "pg";

const { Client } = pg;

const connection = async () => {
  const client = new Client({
    user: "postgres",
    password: "12",
    host: "localhost",
    port: 5432,
    database: "postgr1",
  });

  try {
    await client.connect();

    // Check if the "tasks" table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'tasks'
      );
    `;

    const { rows } = await client.query(checkTableQuery);
    const tableExists = rows[0].exists;

    if (!tableExists) {
      // If the "tasks" table doesn't exist, create it
      const createTableQuery = `
        CREATE TABLE tasks (
          title TEXT NOT NULL,
          description TEXT,
          id SERIAL PRIMARY KEY,
          date DATE NOT NULL,
          status BOOLEAN DEFAULT FALSE
        );
      `;
      await client.query(createTableQuery);
      console.log("Created 'tasks' table");
    } else {
      console.log("The 'tasks' table already exists");
    }

    return client;
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error);
    throw error;
  }
};

export default connection;
