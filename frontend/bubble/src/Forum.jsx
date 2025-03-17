import React, { useState, useEffect } from "react";
import axios from "axios";

const Forum = ({ topic }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [comments, setComments] = useState({}); // Stores comments for each post

  // Fetch forum posts for the given topic
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/forum/posts/${topic}`);
        setPosts(response.data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };

    fetchPosts();
  }, [topic]);

  // Handle creating a new post
  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
  
    const token = localStorage.getItem("token"); // Retrieve the token from storage
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }
  
    const payload = {
      userId: 1, // Replace with logged-in user ID
      topic: "example-topic", // Replace with the actual topic
      content: newPost,
    };
  
    console.log("Sending payload:", payload);
  
    try {
      const response = await axios.post("http://localhost:5000/forum/post", payload, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      });
  
      console.log("Post created successfully:", response.data);
      setPosts([response.data, ...posts]); // Add new post to the list
      setNewPost(""); // Clear input
    } catch (error) {
      console.error("Failed to create post:", error.response?.data || error.message);
    }
  };

  // Fetch comments for a specific post
  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(`http://localhost:5000/forum/post/comments/${postId}`);
      setComments((prev) => ({ ...prev, [postId]: response.data }));
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  // Handle adding a comment to a post
  const handleAddComment = async (postId, comment) => {
    if (!comment.trim()) return;

    try {
      const response = await axios.post("http://localhost:5000/forum/post/comment", {
        postId,
        userId: 1, // Replace with logged-in user ID
        comment,
      });

      // Update comments for the post
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), response.data],
      }));
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <div className="forum">
      <h2>Forum: {topic}</h2>

      {/* Create a new post */}
      <div className="create-post">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts..."
        />
        <button onClick={handleCreatePost}>Post</button>
      </div>

      {/* Display posts */}
      <div className="posts">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <div className="post-header">
              <img src={post.profile_pic} alt={post.username} />
              <span>{post.username}</span>
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </div>
            <p>{post.content}</p>

            {/* Display comments */}
            <button onClick={() => fetchComments(post.id)}>View Comments</button>
            {comments[post.id]?.map((comment) => (
              <div key={comment.id} className="comment">
                <img src={comment.profile_pic} alt={comment.username} />
                <span>{comment.username}</span>
                <p>{comment.comment}</p>
              </div>
            ))}

            {/* Add a comment */}
            <textarea
              placeholder="Add a comment..."
              onBlur={(e) => handleAddComment(post.id, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forum;