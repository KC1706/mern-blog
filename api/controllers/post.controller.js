import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';

export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to create a post'));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }
  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    // The replace() method scans the string for any character not in the set [a-zA-Z0-9-] and removes it by replacing it with an empty string.
    .replace(/[^a-zA-Z0-9-]/g, '');
  
  const newPost = new Post({
    // ... spread operator
    ...req.body,
    slug,
    userId: req.user.id,
  });
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    


      // What’s Happening with the Spread Operator (...)
      // Conditional Object Inclusion:
      
      // For each query parameter (like userId, category, etc.), we check if the parameter exists in req.query:
      // If the parameter exists (i.e., req.query.userId), we include it in the query object using { userId: req.query.userId }.
      // If it doesn't exist, it won't be added to the query object.
      // Combining Multiple Conditions:
      
      // The spread operator (...) merges all the conditional objects into a single query object. This ensures that we build the query dynamically, including only the relevant filters provided by the client.
      // Flexible Query Building:
      
      // This approach allows the query to adapt to different combinations of query parameters. It keeps the code clean and concise, without manually checking each parameter and modifying the query object.
       // The spread operator (...) is used to conditionally include query parameters in the MongoDB query object.
      const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this post'));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json('The post has been deleted');
  } catch (error) {
    next(error);
  }
};

export const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this post'));
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
        },
      },

      
      // Purpose: This option tells Mongoose to return the updated document after the update operation is complete.
      // Default behavior: By default, Mongoose would return the original document before the update.
      // new: true ensures that the response will contain the updated post (with the new values), not the old one
    { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};
