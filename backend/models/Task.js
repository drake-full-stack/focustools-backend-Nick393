const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  pomodoroCount: {
  type: Number,
  default: 0
}
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;