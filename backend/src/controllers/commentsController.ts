import Comment from "../models/commentsModel";
import Job from "../models/jobModel";
import User from "../models/userModel";

// POST /comments
export const createComment = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const { content, job_id }: any = req.body;
    const authHeader = req.headers.authorization as string | undefined;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or malformed Authorization header" });
    }

    // Strip off "Bearer " and parse the JSON payload
    const jsonPayload = authHeader.slice("Bearer ".length);
    let user: { id: number; name: string; email: string; };
    try {
      user = JSON.parse(jsonPayload);
    } catch (err) {
      return res.status(400).json({ message: "Invalid JSON in Bearer payload" });
    }

    const author_id = user.id;

    const comment: any = await Comment.create({ content, job_id, author_id });

    // ✅ Increment comments_count in the Job model
    const post: any = await Job.findByPk(job_id);
    if (post) {
      post.comments_count += 1;
      await post.save();
    }

    return res.status(201).json({ success: true, comment });
  } catch (error: any) {
    console.error("Comment creation error:", error);
    return res.status(500).json({ success: false, message: "Failed to create comment" });
  }
};

// GET /comments/:postId
export const getCommentsForPost = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const { postId }: any = req.params;
    console.log(req.params)
    const comments: any[] = await Comment.findAll({
      where: { job_id: postId },
      // only pull the fields you need
      attributes: ['id', 'content', 'job_id', 'author_id', 'createdAt'],
      order: [['createdAt', 'ASC']],
      raw: true
    });

    // 2) Gather unique author_ids
    const authorIds = Array.from(new Set(comments.map(c => c.author_id)));

    // 3) Fetch those users in one go
    const users: any[] = await User.findAll({
      where: { id: authorIds },
      attributes: ['id', 'name']
    });

    // 4) Build a lookup map
    const userMap: Record<number, any> = {};
    users.forEach(u => {
      userMap[u.id] = u;
    });

    // 5) Attach each comment’s author object
    const commentsWithAuthor = comments.map(c => ({
      ...c,
      author: userMap[c.author_id] || null
    }));

    return res.status(200).json({ success: true, comments: commentsWithAuthor });
  } catch (error: any) {
    console.error("Failed to fetch comments:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
};

// PUT /comments/:commentId
export const updateComment = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const { commentId }: any = req.params;
    const { content }: any = req.body;
    const comment: any = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.author_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    comment.content = content;
    await comment.save();

    return res.json({ success: true, comment });
  } catch (error: any) {
    console.error("Updating comment error:", error);
    return res.status(500).json({ success: false, message: "Failed to update comment" });
  }
};

// DELETE /comments/:commentId
export const deleteComment = async (
  req: any,
  res: any
): Promise<any> => {
  try {
    const { commentId }: any = req.params;
    const comment: any = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (comment.author_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await comment.destroy();

    return res.json({ success: true, message: "Comment deleted" });
  } catch (error: any) {
    console.error("Deleting comment error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
};
