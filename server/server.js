require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ Error:", error));

// Import models
const Task = require("./models/Task");
const Session = require("./models/Session");

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "FocusTools API",
    status: "Running",
    endpoints: {
      tasks: "/api/tasks",
      sessions: "/api/sessions",
    },
  });
});


//Add a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, completed } = req.body;

    //check if title exists
    if (!title || title.trim() === '') {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Title is required' 
      });
    }

    //Create new task
    const newTask = new Task({
      title: title.trim(),
      completed: completed || false
    });

    //Save to database
    const savedTask = await newTask.save();

    //Return created task with 201 status
    res.status(201).json(savedTask);

  } catch (err) {
    //Handle validation errors from Mongoose
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        message: err.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Server error',
      message: err.message 
    });
  }
});
//Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    //Retrieve all tasks from database
    const tasks = await Task.find();
    
    //Return tasks array
    res.status(200).json(tasks);

  } catch (err) {
    res.status(500).json({ 
      error: 'Server error',
      message: err.message 
    });
  }
});


//Get a specific task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    //Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: 'Invalid task ID format' 
      });
    }

    //Find task by ID
    const task = await Task.findById(id);

    // Check if task exists
    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: `Task with ID ${id} not found` 
      });
    }

    // Return the task
    res.status(200).json(task);

  } catch (err) {
    res.status(500).json({ 
      error: 'Server error',
      message: err.message 
    });
  }
});


//Modify a task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    //Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: 'Invalid task ID format' 
      });
    }

    //Validate that title isn't empty if provided
    if (updates.title !== undefined && updates.title.trim() === '') {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Title cannot be empty' 
      });
    }

    //Find and update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { 
        new: true,
        runValidators: true 
      }
    );

    //Check if task exists
    if (!updatedTask) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: `Task not found` 
      });
    }

    //Return updated task
    res.status(200).json(updatedTask);

  } catch (err) {
    //Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        message: err.message 
      });
    }

    res.status(500).json({ 
      error: 'Server error',
      message: err.message 
    });
  }
});

//Remove a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    //Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: 'Invalid task ID format' 
      });
    }

    //Find and delete task
    const deletedTask = await Task.findByIdAndDelete(id);

    //Check if task exists
    if (!deletedTask) {
      return res.status(404).json({ 
        error: 'Task not found',
        message: `Task not found` 
      });
    }

    //Return success message with deleted task
    res.status(200).json({
      message: 'Task deleted successfully',
      task: deletedTask
    });

  } catch (err) {
    res.status(500).json({ 
      error: 'Server error',
      message: err.message 
    });
  }
});


// TODO: Add your Task routes here
// POST /api/tasks
// GET /api/tasks
// GET /api/tasks/:id
// PUT /api/tasks/:id
// DELETE /api/tasks/:id


//Log a Pomodoro session
app.post('/api/sessions', async (req, res) => {
  try {
    const { taskId, duration, startTime, completed } = req.body;

    // Validation
    if (!taskId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Task ID is required'
      });
    }

    if (!duration) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Duration is required'
      });
    }
    

    if (!startTime) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Start time is required'
      });
    }

    //Validate format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid task ID format'
      });
    }

    // Verify that the task exists
    const taskExists = await Task.findById(taskId);
    if (!taskExists) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Task with ID ${taskId} does not exist`
      });
    }

    //Create new session
    const newSession = new Session({
      taskId,
      duration,
      startTime,
      completed: completed !== undefined ? completed : true
    });

    //save to database
    const savedSession = await newSession.save();

    //return created session with 201 status
    res.status(201).json(savedSession);

  } catch (err) {
    //handle validation errors from nongoose
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: err.message
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: err.message
    });
  }
});

//Get all Pomodoro sessions

app.get('/api/sessions', async (req, res) => {
  try {
    // Retrieve all sessions
    const sessions = await Session.find().populate('taskId');

    //Return sessions
    res.status(200).json(sessions);

  } catch (err) {
    res.status(500).json({
      error: 'Server error',
      message: err.message
    });
  }
});
// TODO: Add your Session routes here
// POST /api/sessions
// GET /api/sessions

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
