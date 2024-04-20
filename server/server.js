// import pg from "pg";
// // import main from "/connection";
// const { Client } = pg;
// import express from "express";
// import connection from "./connection.js";
// import cors from "cors"; // Import the cors middleware
// const app = express();
// const PORT = 3000;
// // connection()
// // Middleware to parse JSON request bodies
// app.use(cors());
// app.use(express.json());
// // Your route handlers here
// // Log incoming requests to check if they are reaching the server
// app.use((req, res, next) => {
//   console.log(`${req.method} request received at ${req.url}`);
//   next();
// });

// // Route to handle POST requests to add tasks
// app.post("/insertTask", async (req, res) => {
//   try {
//     // Extract task data from request body
//     const { title, description, date } = req.body;

//     // Validate task data
//     if (!title || !date) {
//       return res
//         .status(400)
//         .json({ error: "Task title and date are required" });
//     }
//     connection();
//     console.log("Received insert task request:", { title, description, date });
//     const result = await client.query(
//       "INSERT INTO tasks (title, description, date) VALUES ($1, $2, $3)",
//       [title, description, date]
//     );
//     // Connect to the PostgreSQL database

//     // Insert task data into the "tasks" table
//     // Send the inserted task data as a JSON response
//     res.status(201).json({ message: "Task inserted successfully" });
//   } catch (err) {
//     // Handle errors
//     console.error("Error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// console.log("Starting server...");
// app.listen(PORT, (err) => {
//   if (err) {
//     console.error("Error starting server:", err);
//     return;
//   }

//   console.log(`Server is running on http://localhost:${PORT}`);
// });
import express from "express";
import connection from "./connection.js";
import cors from "cors";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} request received at ${req.url}`);
  next();
});

// Route to handle POST requests to add tasks
app.post("/insertTask", async (req, res) => {
  try {
    // Extract task data from request body
    const { title, description, date } = req.body;

    // Validate task data
    if (!title || !date) {
      return res
        .status(400)
        .json({ error: "Task title and date are required" });
    }

    console.log("Received insert task request:", { title, description, date });

    // Establish connection to the database
    const client = await connection();

    // Execute the INSERT query
    await client.query(
      "INSERT INTO tasks (title, description, date) VALUES ($1, $2, $3)",
      [title, description, date]
    );

    // Close the database connection
    await client.end();

    // Send the response
    res.status(201).json({ message: "Task inserted successfully" });
  } catch (err) {
    // Handle errors
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to handle GET requests to fetch tasks for a specific date
app.get("/tasks", async (req, res) => {
  try {
    // Retrieve tasks from the database based on the provided date
    const { date } = req.query;
    const client = await connection();
    const result = await client.query("SELECT * FROM tasks");
    await client.end();
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.put('/tasks/:taskId', async (req, res) => {
    try {
      const { taskId } = req.params;
      const { completed } = req.body;
      const client = await connection();
      // Run the SQL query to update task completion status
      const query = 'UPDATE tasks SET status = $1 WHERE id = $2';
      const values = [completed, taskId];
      await client.query(query, values);
  
      res.status(200).json({ message: "Task completion status updated successfully" });
    } catch (error) {
      console.error("Error updating task completion status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  // Assuming you're using Express.js for your server

// Assuming you're using Express.js for your server

app.put('/tasks/:taskId/:newDate', async (req, res) => {
    try {
        const taskId = req.params.taskId; // Ensure taskId is treated as a string
        const newDate = req.params.newDate;

        const client = await connection(); // Assuming you have a function to establish a database connection

        // Run the SQL query to update the task's date
        const query = 'UPDATE tasks SET date = $1 WHERE id = $2';
        const values = [newDate, taskId];
        await client.query(query, values);

        res.status(200).json({ message: "Task date updated successfully" });
    } catch (error) {
        console.error("Error updating task date:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



app.delete("/tasks/:id", async (req, res) => {
  const taskId = req.params.id;
  try {
    const client = await connection();
    const deleteTaskQuery = "DELETE FROM tasks WHERE id = $1";
    await client.query(deleteTaskQuery, [taskId]);
    await client.end();
    res.status(204).end(); // Return 204 No Content if successful
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
