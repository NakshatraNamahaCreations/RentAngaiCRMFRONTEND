import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import lgImg from "../assets/images/lg.jpg";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const ApiURL = "https://api.rentangadi.in"; 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter a valid email");
      return;
    }

    if (!password) {
      toast.error("Please enter a valid password");
      return;
    }

    const data = { email, password };

    try {
      const response = await axios.post(`${ApiURL}/api/adminLogin`, data);

      if (response.status === 200) {
        toast.success("Login successfully");

        // Set token in localStorage if needed
        localStorage.setItem("token", response.data.token);
        navigate("/home");
      } else {
        toast.error("Failed to login");
      }
    } catch (error) {
      console.error("Error :", error.message || error);
      toast.error("An error occurred while logging into the account");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <Toaster />
      <div className="flex bg-white shadow-lg rounded-lg overflow-hidden max-w-7xl w-full  ">
        {/* Left Side - Image Section */}
        <div className="flex-1 hidden md:block">
          <img src={lgImg} alt="Login" className="object-cover h-full w-full" />
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">
            Login to Your Account
          </h1>

          {/* Email Field */}
          <div className="mb-4 w-full">
            <label
              className="block text-gray-700 font-semibold mb-2"
              htmlFor="email"
            >
              EMAIL <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Field */}
          <div className="mb-6 w-full">
            <label
              className="block text-gray-700 font-semibold mb-2"
              htmlFor="password"
            >
              PASSWORD <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your password"
            />
          </div>

          {/* Login Button */}
          <button
            type="button"
            className="w-full bg-orange-600 text-white py-2 rounded-md font-semibold text-lg hover:bg-orange-700 transition duration-200 mt-7"
            onClick={handleSubmit}
          >
            Login
          </button>

          {/* Additional Links */}
          {/* <div className="mt-4 text-center w-full">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Login;
