import mongoose from 'mongoose';

// Store project-level comments in the shared 'comments' collection so they are
// visible alongside task comments in the same place in the database.
const projectCommentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Force this model to use the existing 'comments' collection so the data
// appears in the same MongoDB collection the rest of the app expects.
export default mongoose.model('ProjectComment', projectCommentSchema, 'comments');
