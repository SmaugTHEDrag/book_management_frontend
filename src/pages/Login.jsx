import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';

export default function Login() {
    const [errorMessage, setErrorMessage] = useState('');
    const { setUser } = useContext(AuthContext);
    const [notVerified, setNotVerified] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname;
    const redirectTo = from && from.startsWith('/admin/dashboard') ? "/admin/dashboard" : "/";

    const handleLogin = async (event) => {
        event.preventDefault();
        const form = event.target;
        const login = form.email.value;
        const password = form.password.value;

        try {
            const response = await fetch("https://book-management-backend-d481.onrender.com/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login, password }),
            });

            if (!response.ok) {
            throw new Error("Invalid credentials");
            }

            const data = await response.json();
            const token = data.token;

            // Lưu token vào localStorage
            localStorage.setItem("token", token);

            // Lưu user bao gồm login và role
            const user = {
            login: data.login,
            role: data.role,
            };
            localStorage.setItem("username", data.login);
            localStorage.setItem("user", JSON.stringify(user));

            // Cập nhật context
            setUser(user);

            // Điều hướng sau login
            navigate(redirectTo, { replace: true });
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage("Email or password is invalid.");
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        {notVerified ? (
                            <h2 className="text-center text-2xl font-semibold mb-4">Please verify your email</h2>
                        ) : (
                            <>
                                <div>
                                    <h1 className="text-3xl font-semibold">Please Login to Dashboard</h1>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    <form onSubmit={handleLogin} className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                        <div className="relative">
                                            <label htmlFor="email" className="sr-only">Email or Username</label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="text"
                                                className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600"
                                                placeholder="Email or Username"
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <label htmlFor="password" className="sr-only">Password</label>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600"
                                                placeholder="Password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={togglePasswordVisibility}
                                                className="absolute right-2 top-2 text-gray-600 hover:text-gray-800"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                    </svg>
                                                )}
                                            </button>
                                            {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
                                        </div>
                                        <div>
                                            <p className="text-base mt-1">
                                                If you haven't an account. Please create here <Link to="/create-user" className="underline text-blue-600">Sign Up</Link>
                                            </p>
                                        </div>
                                        <div className="relative">
                                            <button type="submit" className="bg-blue-500 text-white rounded px-6 py-1">Login</button>
                                        </div>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}