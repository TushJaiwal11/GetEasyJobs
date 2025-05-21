// src/pages/Dashboard.js

import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../components/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({});
    const [posts, setPosts] = useState([]);
    const token = localStorage.getItem("token");

    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        toast.error("Session expired or user not found. Please login again.");
        navigate("/login");
    }, [navigate]);

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


    useEffect(() => {
        const fetchProfileAndPosts = async () => {
            try {
                const res = await axiosInstance.get('/api/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProfile(res.data);

                const postRes = await axiosInstance.get("/api/admin/get-post", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPosts(postRes.data);

            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 404) {
                    handleLogout();
                } else {
                    toast.error("Error: " + (err.response?.data || err.message));
                }
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        fetchProfileAndPosts();
    }, [handleLogout, navigate, token]);

    return (
        <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
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
        </div>
    );
};

export default Dashboard;
