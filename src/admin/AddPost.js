import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../components/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const AddPost = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({});
    const [post, setPost] = useState({ title: "", description: "" });
    const [posts, setPosts] = useState([]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        toast.error("Session expired or user not found. Please login again.");
        navigate("/login");
    }, [navigate]);

    const fetchPosts = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axiosInstance.get("/api/admin/get-post", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPosts(res.data);
        } catch (err) {
            toast.error("Error fetching posts.");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get('/api/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProfile(res.data);
                fetchPosts();
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 404) {
                    handleLogout();
                } else {
                    toast.error("Session expired. Please login again.");
                }
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        fetchProfile();
    }, [handleLogout, navigate]);

    const handleChange = (e) => {
        setPost({ ...post, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            await axiosInstance.post("/api/admin/create-post", post, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Post created successfully!");
            setPost({ title: "", description: "" });
            fetchPosts();
        } catch (error) {
            toast.error("Error creating post: " + (error.response?.data || error.message));
        }
    };

    // 🔍 Function to highlight email addresses and URLs in the text
   const highlightText = (text) => {
    if (!text) return null;

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const urlRegex = /https?:\/\/[^\s]+/g;
    const combinedRegex = new RegExp(`${emailRegex.source}|${urlRegex.source}`, 'g');

    // Split the text into lines first
    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
        const elements = [];
        let lastIndex = 0;

        for (const match of line.matchAll(combinedRegex)) {
            const start = match.index;
            const end = start + match[0].length;

            // Add text before the match
            if (start > lastIndex) {
                elements.push(line.slice(lastIndex, start));
            }

            const value = match[0];
            const isEmail = emailRegex.test(value);

            if (isEmail) {
                elements.push(
                    <a key={`${lineIndex}-${start}`} href={`mailto:${value}`} style={{ color: "blue", fontWeight: "bold" }}>
                        {value}
                    </a>
                );
            } else {
                elements.push(
                    <a key={`${lineIndex}-${start}`} href={value} target="_blank" rel="noopener noreferrer" style={{ color: "green", fontWeight: "bold" }}>
                        {value}
                    </a>
                );
            }

            lastIndex = end;
        }

        // Add remaining text after the last match
        if (lastIndex < line.length) {
            elements.push(line.slice(lastIndex));
        }

        return <div key={lineIndex}>{elements}</div>;
    });
};




    return (
        <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
            <h2 style={{ textAlign: "center" }}>Create New Post</h2>
            <form onSubmit={handleSubmit} style={{
                backgroundColor: "#f9f9f9",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                marginBottom: "40px"
            }}>
                <div>
                    <label><strong>Title</strong></label>
                    <input
                        type="text"
                        name="title"
                        value={post.title}
                        onChange={handleChange}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            margin: "10px 0",
                            borderRadius: "4px",
                            border: "1px solid #ccc"
                        }}
                    />
                </div>
                <div>
                    <label><strong>Description</strong></label>
                    <textarea
                        name="description"
                        value={post.description}
                        onChange={handleChange}
                        required
                        rows="8"
                        style={{
                            width: "100%",
                            padding: "10px",
                            margin: "10px 0",
                            borderRadius: "4px",
                            border: "1px solid #ccc"
                        }}
                    ></textarea>
                </div>
                <button type="submit" style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}>
                    Create Post
                </button>
            </form>

            <h3>Current Openings</h3>
            <div>
                {posts.map((p, index) => (
                    <div key={index} style={{
                        backgroundColor: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "15px",
                        marginBottom: "15px",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                    }}>
                        <h4 style={{ marginBottom: "8px", color: "#333" }}>{p.title}</h4>
                        <div style={{
                            marginBottom: "5px",
                            color: "#555",
                            whiteSpace: "pre-wrap"
                        }}>
                            {highlightText(p.description)}
                        </div>
                        <p style={{ fontSize: "12px", color: "#888" }}>
                            Created At: {new Date(p.createdAt).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
            <ToastContainer />
        </div>
    );
};

export default AddPost;
