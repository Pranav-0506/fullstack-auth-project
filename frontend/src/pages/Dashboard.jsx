import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { logout } = useAuth(); // ✅ use same logout as Navbar

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        setUser(data);
      } catch (error) {
        console.error(error);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, logout]);

  // ✅ FIXED LOGOUT (same system as Navbar)
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6">

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Dashboard 🔐
        </h1>

        {user ? (
          <div className="space-y-3">

            <p className="text-gray-700">
              <span className="font-semibold">Name:</span> {user.name}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Email:</span> {user.email}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">User ID:</span> {user.id}
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>

          </div>
        ) : (
          <p className="text-gray-500">No user data</p>
        )}

      </div>
    </div>
  );
}

export default Dashboard;