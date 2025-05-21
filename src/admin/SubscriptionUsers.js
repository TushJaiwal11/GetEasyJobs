import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../components/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        localStorage.removeItem("token");
        toast.error("Session expired or user not found. Please login again.");
        navigate("/login");
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            handleLogout();
            return;
        }

        const fetchUsers = async () => {
            try {
                const res = await axiosInstance.get('/api/admin/subscription-users', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const fetchedUsers = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data.users)
                        ? res.data.users
                        : [];

                setAllUsers(fetchedUsers);
                setUsers(fetchedUsers);
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 404) {
                    handleLogout();
                } else {
                    toast.error("Error fetching users");
                    setAllUsers([]);
                    setUsers([]);
                }
            }
        };

        fetchUsers();
    }, [handleLogout]);

    useEffect(() => {
        const search = keyword.toLowerCase();
        const filtered = allUsers.filter((user) =>
            user.email?.toLowerCase().includes(search) ||
            user.fullName?.toLowerCase().includes(search) ||
            (user.activeSubscription?.toString().toLowerCase().includes(search))
        );
        setUsers(keyword ? filtered : allUsers);
    }, [keyword, allUsers]);

    return (
        <div className="p-6 bg-black min-h-screen text-white">
            <ToastContainer position="top-right" />
            <h2 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">All Subscribed Users</h2>

            <div className="flex justify-end mb-4">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search by name, email, subscription..."
                    className="w-72 p-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none border border-gray-600"
                />
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full text-sm divide-y divide-gray-800">
                    <thead className="bg-gray-800 text-gray-300 text-left">
                        <tr>
                            <th className="px-6 py-3 font-semibold">#</th>
                            <th className="px-6 py-3 font-semibold">Image</th>
                            <th className="px-6 py-3 font-semibold">Full Name</th>
                            <th className="px-6 py-3 font-semibold">Email</th>
                            <th className="px-6 py-3 font-semibold">Active Subscription</th>
                            <th className="px-6 py-3 font-semibold">Subscription Expiry</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {users.map((user, index) => (
                            <tr key={user.id} className="hover:bg-gray-800 transition duration-150">
                                <td className="px-6 py-4">{index + 1}</td>
                                <td className="px-6 py-4">
                                    {user.image ? (
                                        <img
                                            src={`data:image/jpeg;base64,${user.image}`}
                                            alt="Profile"
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold text-lg">
                                            {user.fullName?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">{user.fullName}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    {user.activeSubscription === 1 ? "Yes" : "No"}
                                </td>
                                <td className="px-6 py-4">
                                    {user.subscriptionExpiryDate
                                        ? new Date(user.subscriptionExpiryDate).toLocaleDateString()
                                        : "NA"}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-gray-400">
                                    No subscribed users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
