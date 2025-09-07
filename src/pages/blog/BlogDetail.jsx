import React, { useContext, useEffect, useState, memo, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthProvider";
import { AiOutlineHeart, AiFillHeart, AiOutlineMessage, AiOutlineLeft, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { Spinner } from "flowbite-react";
import Chatbot from "../shared/ChatBot";

const Comment = memo(({ comment, onReply, onDelete, onEdit, depth = 0, blogOwner, currentUser }) => {
  const { user } = useContext(AuthContext);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  // Determine if current user can delete this comment
  const canDeleteComment = useMemo(() => {
    if (!user?.login) return false;
    
    // Admin can delete any comment
    if (user.role === "ADMIN") return true;
    
    // Comment owner can delete their own comment
    if (user.login === comment.username) return true;
    
    // Blog owner can delete any comment on their blog
    if (user.login === blogOwner) return true;
    
    return false;
  }, [user, comment.username, blogOwner]);

  // Determine if current user can edit this comment
  const canEditComment = useMemo(() => {
    if (!user?.login) return false;
    
    // Only comment owner can edit their own comment
    if (user.login === comment.username) return true;
    
    return false;
  }, [user, comment.username]);

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent.trim());
      setReplyContent("");
      setShowReplyInput(false);
    }
  };

  const handleReplyCancel = () => {
    setReplyContent("");
    setShowReplyInput(false);
  };

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent.trim() !== comment.content) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'} relative`}>
      {depth > 0 && (
        <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 to-transparent"></div>
      )}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white text-base font-medium">
                {comment.username?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg">{comment.username}</span>
                {comment.username === blogOwner && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Author</span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 px-3 py-2 rounded-lg min-h-[80px] transition-all resize-none text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      handleEditSubmit();
                    }
                    if (e.key === "Escape") {
                      handleEditCancel();
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Press Ctrl+Enter to save, Esc to cancel</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditCancel}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditSubmit}
                      disabled={!editContent.trim()}
                      className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 text-lg leading-6 mt-3">{comment.content}</p>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <div className="flex items-center gap-4 mt-4">
            {user?.login && (
              <button
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                <AiOutlineMessage className="w-4 h-4" />
                Reply
              </button>
            )}
            {canEditComment && (
              <button
                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 hover:bg-green-50 px-3 py-1.5 rounded-md transition-colors"
                onClick={() => setIsEditing(true)}
                title="Edit your comment"
              >
                <AiOutlineEdit className="w-4 h-4" />
                Edit
              </button>
            )}
            {canDeleteComment && (
              <button
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                onClick={() => {
                  const confirmMessage = user.login === comment.username 
                    ? "Delete your comment?" 
                    : user.login === blogOwner 
                      ? "Delete this comment from your blog?" 
                      : "Delete this comment?";
                  
                  if (confirm(confirmMessage)) {
                    onDelete(comment.id);
                  }
                }}
                title={
                  user.login === comment.username 
                    ? "Delete your comment" 
                    : user.login === blogOwner 
                      ? "Delete comment (as blog owner)" 
                      : "Delete comment"
                }
              >
                <AiOutlineDelete className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Reply Input */}
      {showReplyInput && !isEditing && (
        <div className="mt-3 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
          <div className="space-y-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${comment.username}...`}
              className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 px-4 py-3 rounded-xl min-h-[80px] transition-all resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  handleReplySubmit();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Press Ctrl+Enter to submit</p>
              <div className="flex gap-2">
                <button
                  onClick={handleReplyCancel}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {comment.replies?.map((reply) => (
        <Comment
          key={reply.id}
          comment={reply}
          onReply={onReply}
          onDelete={onDelete}
          onEdit={onEdit}
          depth={depth + 1}
          blogOwner={blogOwner}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
});

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);

  const token = localStorage.getItem("token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const isLoggedIn = Boolean(user?.login);
  
  // Separate logic for editing and deleting blogs
  const canEditBlog = useMemo(() => {
    if (!blog || !isLoggedIn) return false;
    // Only the blog owner can edit their own blog
    return blog.username === user?.login;
  }, [blog, isLoggedIn, user?.login]);

  const canDeleteBlog = useMemo(() => {
    if (!blog || !isLoggedIn) return false;
    // Admin can delete any blog OR blog owner can delete their own blog
    return user?.role === "ADMIN" || blog.username === user?.login;
  }, [blog, isLoggedIn, user?.role, user?.login]);

  useEffect(() => {
    fetchBlogDetail();
  }, [id]);

  const fetchBlogDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://book-management-backend-d481.onrender.com/api/blogs/${id}`, {
        headers: authHeaders,
      });
      
      let hasLiked = false;
      if (isLoggedIn) {
        try {
          const likeRes = await axios.get(
            `https://book-management-backend-d481.onrender.com/api/blogs/${id}/likes/has`,
            { headers: authHeaders }
          );
          hasLiked = likeRes.data;
        } catch (e) {
          hasLiked = false;
        }
      }
      
      setBlog({ ...res.data, hasLiked });
    } catch (err) {
      setError(err.response?.status === 404 ? "Blog not found" : "Failed to load blog");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!isLoggedIn || !blog) return;
    try {
      if (blog.hasLiked) {
        await axios.delete(`https://book-management-backend-d481.onrender.com/api/blogs/${id}/likes`, {
          headers: authHeaders,
        });
      } else {
        await axios.post(
          `https://book-management-backend-d481.onrender.com/api/blogs/${id}/likes`,
          {},
          { headers: authHeaders }
        );
      }
      fetchBlogDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const addComment = async (content, parentId = null) => {
    try {
      await axios.post(
        `https://book-management-backend-d481.onrender.com/api/blogs/${id}/comments`,
        {
          blogId: id,
          content,
          parentCommentId: parentId ?? undefined,
        },
        { headers: authHeaders }
      );
      fetchBlogDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const editComment = async (commentId, content) => {
    try {
      await axios.put(
        `https://book-management-backend-d481.onrender.com/api/blogs/comments/${commentId}`,
        { content },
        { headers: authHeaders }
      );
      fetchBlogDetail();
    } catch (err) {
      console.error("Failed to edit comment:", err);
      alert("Failed to edit comment. Please try again.");
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`https://book-management-backend-d481.onrender.com/api/blogs/comments/${commentId}`, {
        headers: authHeaders,
      });
      fetchBlogDetail();
    } catch (err) {
      console.error("Failed to delete comment:", err);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const startEdit = () => {
    setEditing({
      title: blog.title || "",
      content: blog.content || "",
      image: blog.image || "",
    });
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await axios.put(
        `https://book-management-backend-d481.onrender.com/api/blogs/${id}`,
        {
          title: editing.title.trim(),
          content: editing.content.trim(),
          image: (editing.image || "").trim() || undefined,
        },
        { headers: authHeaders }
      );
      setEditing(null);
      fetchBlogDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const removeBlog = async () => {
    try {
      await axios.delete(`https://book-management-backend-d481.onrender.com/api/blogs/${id}`, {
        headers: authHeaders,
      });
      navigate('/blog');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-16 h-16 text-blue-600" />
          <p className="mt-4 text-gray-600 font-medium">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-[calc(100vh-64px)] pt-16">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">{error || "Blog not found"}</h2>
        <Link
          to="/blog"
          className="text-blue-700 hover:underline flex items-center gap-2 text-2xl font-semibold"
        >
          <AiOutlineLeft className="text-3xl" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[calc(100vh-64px)] pt-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/blog"
          className="flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold mb-8 text-2xl"
        >
          <AiOutlineLeft className="w-4 h-4" />
          Back to All Blogs
        </Link>

        {/* Blog Post */}
        <article className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Cover Image */}
          {blog.image && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img 
                src={blog.image} 
                alt={blog.title} 
                loading="lazy"
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0YzRjRGNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjNTU1NTU1IiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white text-lg font-bold">
                {blog.username?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{blog.username}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Edit or View Mode */}
            {editing ? (
              <div className="space-y-6 mb-8">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Title</label>
                  <input
                    value={editing.title}
                    onChange={(e) => setEditing((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full border-2 border-gray-200 focus:border-blue-500 px-3 py-2 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Content</label>
                  <textarea
                    value={editing.content}
                    onChange={(e) => setEditing((prev) => ({ ...prev, content: e.target.value }))}
                    className="w-full border-2 border-gray-200 focus:border-blue-500 px-3 py-2 rounded-lg min-h-[200px] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Cover Image (Optional)</label>
                  <input
                    value={editing.image}
                    onChange={(e) => setEditing((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="Image URL"
                    className="w-full border-2 border-gray-200 focus:border-blue-500 px-3 py-2 rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
                    onClick={saveEdit}
                  >
                    Save
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {blog.title}
                </h1>

                {/* Content */}
                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {blog.content}
                  </p>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 py-6 border-y border-gray-200">
              <button
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                  blog.hasLiked 
                    ? "bg-blue-700 text-white shadow-lg shadow-blue-700/25" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } ${isLoggedIn ? "" : "opacity-60 cursor-not-allowed hover:scale-100"}`}
                onClick={toggleLike}
                disabled={!isLoggedIn}
              >
                {blog.hasLiked ? <AiFillHeart className="w-5 h-5" /> : <AiOutlineHeart className="w-5 h-5" />}
                <span>{blog.likeCount} {blog.likeCount === 1 ? 'Like' : 'Likes'}</span>
              </button>
              {!editing && canEditBlog && (
                <button
                  className="p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={startEdit}
                  title="Edit your post"
                >
                  <AiOutlineEdit className="w-5 h-5" />
                </button>
              )}
              {!editing && canDeleteBlog && (
                <button
                  className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => {
                    const confirmMessage = user?.role === "ADMIN" && blog.username !== user?.login
                      ? `Delete this post by ${blog.username}? (Admin action)`
                      : "Delete your post?";
                    if (confirm(confirmMessage)) {
                      removeBlog();
                    }
                  }}
                  title={
                    user?.role === "ADMIN" && blog.username !== user?.login
                      ? "Delete post (Admin)"
                      : "Delete your post"
                  }
                >
                  <AiOutlineDelete className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-6">
                <AiOutlineMessage className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Comments</h2>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                  {blog.comments?.length || 0}
                </span>
              </div>

              {/* Add Comment */}
              {isLoggedIn && (
                <div className="mb-8">
                  <input
                    type="text"
                    placeholder="Share your thoughts..."
                    className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 px-4 py-3 rounded-xl transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        addComment(e.target.value.trim());
                        e.target.value = "";
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">Press Enter to post your comment</p>
                </div>
              )}

              {/* Comments List */}
              {blog.comments?.length ? (
                <div className="space-y-2">
                  {blog.comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      onReply={(parentId, content) => addComment(content, parentId)}
                      onDelete={deleteComment}
                      onEdit={editComment}
                      blogOwner={blog.username}
                      currentUser={user}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AiOutlineMessage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No comments yet</p>
                  <p className="text-gray-400 text-sm">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <Chatbot />
      </div>
    </div>
  );
};

export default BlogDetail;