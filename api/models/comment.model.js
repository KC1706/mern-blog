import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    postId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    likes: {
      type: Array,
      default: [],
    },
    numberOfLikes: {
      type: Number,
      default: 0,
    },
  },

  // This option automatically adds two fields: createdAt and updatedAt to the schema.
  // createdAt is the date when the comment was created.
  // updatedAt is the date when the comment was last updated.
  { timestamps: true }
);

// Purpose: This line creates the Mongoose model for the Comment schema. The model will be used to interact with the comments collection in your MongoDB database.
// Comment is the name of the model, and it will be mapped to a comments collection (Mongoose automatically pluralizes the model name).
// Usage: With this model, you can perform database operations like creating, reading, updating, and deleting comments in the comments collection.
const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
