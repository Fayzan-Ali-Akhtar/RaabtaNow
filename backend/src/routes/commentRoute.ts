import express from 'express';
import { createComment, updateComment, deleteComment, getCommentsForPost } from '../controllers/commentsController';

const CommentRouter = express.Router();

// Routes

// POST a new comment on a post
CommentRouter.post('/createcomment', createComment);

// PATCH update a comment (only if the comment belongs to the user)
CommentRouter.patch('/updatecomment/:commentId',  updateComment);

// DELETE a comment (only if the comment belongs to the user)
CommentRouter.delete('/deletecomment/:commentId', deleteComment);

// GET all comments for a post
CommentRouter.get('/postcomment/:postId', getCommentsForPost);

export default CommentRouter;
