const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',  // References Task model
    required: true
  },
  duration: {
    type: Number,  // Duration in seconds
    required: true,
    min: 1
  },
  completed: {
    type: Boolean,
    default: true  // Assume completed when logged
  },
  startTime: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;