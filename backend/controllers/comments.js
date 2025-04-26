import Comment from "../models/comments.js";
import Job from "../models/job.js";
import User from "../models/user.js";

export const createComment = async (req, res) => {
  try {
    const { content, job_id } = req.body;
    const author_id = req.user.id;

    const comment = await Comment.create({ content, job_id, author_id });

    // ✅ Increment comments_count in the Job model
    const post = await Job.findByPk(job_id);
    if (post) {
      post.comments_count += 1;
      await post.save();
    }

    return res.status(201).json({ success: true, comment });
  } catch (error) {
    console.error("Comment creation error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create comment" });
  }
};

export const getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.findAll({
      where: { job_id: postId },
      include: [
        {
          model: User,
          attributes: ["id", "name"], // only return id and name
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch comments" });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const comment = await Comment.findByPk(commentId);

    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });

    if (comment.author_id !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    comment.content = content;
    await comment.save();

    return res.json({ success: true, comment });
  } catch (error) {
    console.error("Updating comment error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update comment" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findByPk(commentId);

    if (!comment)
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });

    if (comment.author_id !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await comment.destroy();

    return res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    console.error("Deleting comment error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete comment" });
  }
};
