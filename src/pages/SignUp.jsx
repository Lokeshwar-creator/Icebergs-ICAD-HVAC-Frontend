import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        name: "",
        email: "",
        role: "",
        password: "",
        confirmPassword: "",
        agree: false,
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: ""
    });

    const roleOptions = [
        { value: "", label: "Select your role" },
        { value: "HVAC Engineer", label: "HVAC Engineer" },
        { value: "MEP Consultant", label: "MEP Consultant" },
        { value: "Architect", label: "Architect" },
        { value: "Project Manager", label: "Project Manager" },
        { value: "CAD Draughtsman", label: "CAD Draughtsman" },
        { value: "Energy Analyst", label: "Energy Analyst" },
        { value: "Site Supervisor", label: "Site Supervisor" },
        { value: "Facility Manager", label: "Facility Manager" },
        { value: "Other", label: "Other" },
    ];

    const calculatePasswordStrength = (password) => {
        let score = 0;
        let message = "";

        if (password.length >= 8) score++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^a-zA-Z0-9]/)) score++;

        if (score === 0) message = "";
        else if (score === 1) message = "Weak";
        else if (score === 2) message = "Fair";
        else if (score === 3) message = "Good";
        else if (score === 4) message = "Strong";

        return { score, message };
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setForm({ ...form, password: newPassword });
        setPasswordStrength(calculatePasswordStrength(newPassword));

        if (errors.password) setErrors({ ...errors, password: null });
        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
    };

    const validate = () => {
        let err = {};

        // Username validation
        if (!form.username) {
            err.username = "Username is required";
        } else if (form.username.length < 3) {
            err.username = "Username must be at least 3 characters";
        } else if (form.username.length > 20) {
            err.username = "Username must be less than 20 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
            err.username = "Username can only contain letters, numbers, and underscores";
        } else {
            const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
            if (storedUsers.some(u => u.username === form.username)) {
                err.username = "Username already taken";
            }
        }

        // Name validation
        if (!form.name) {
            err.name = "Full name is required";
        } else if (form.name.length < 2) {
            err.name = "Name must be at least 2 characters";
        }

        // Email validation
        if (!form.email) {
            err.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            err.email = "Please enter a valid email address";
        } else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(form.email)) {
            err.email = "Invalid email format";
        } else {
            const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
            if (storedUsers.some(u => u.email === form.email)) {
                err.email = "Email already registered";
            }
        }


        // Role validation
        if (!form.role) {
            err.role = "Please select your role";
        }
        

        // Password validation
        if (!form.password) {
            err.password = "Password is required";
        } else if (form.password.length < 8) {
            err.password = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(form.password)) {
            err.password = "Password must contain at least one uppercase letter";
        } else if (!/[a-z]/.test(form.password)) {
            err.password = "Password must contain at least one lowercase letter";
        } else if (!/[0-9]/.test(form.password)) {
            err.password = "Password must contain at least one number";
        } else if (!/[^A-Za-z0-9]/.test(form.password)) {
            err.password = "Password must contain at least one special character";
        }

        // Confirm password validation
        if (!form.confirmPassword) {
            err.confirmPassword = "Please confirm your password";
        } else if (form.password !== form.confirmPassword) {
            err.confirmPassword = "Passwords do not match";
        }

        // Terms agreement validation
        if (!form.agree) {
            err.agree = "You must agree to the Terms of Service and Privacy Policy";
        }

        return err;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setSuccessMessage("");
            return;
        }

        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const newUser = {
            id: Date.now(),
            username: form.username,
            name: form.name,
            email: form.email,
            role: form.role,
            password: form.password,
            createdAt: new Date().toISOString(),
            joinedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        setForm({
            username: "",
            name: "",
            email: "",
            role: "",
            password: "",
            confirmPassword: "",
            agree: false,
        });

        setSuccessMessage("Account created successfully! Redirecting to login page...");
        setErrors({});

        setTimeout(() => {
            navigate("/login");
        }, 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transition-all duration-300 hover:shadow-2xl">

                {/* Logo Section */}
                <div className="flex justify-center mb-6">
                    <img
                        src="/logo.jpg"
                        alt="Company Logo"
                        className="w-20 h-20 object-contain"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%233B82F6' viewBox='0 0 24 24'%3E%3Cpath d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'/%3E%3C/svg%3E";
                        }}
                    />
                </div>

                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    Create Account
                </h2>
                <p className="text-center text-gray-500 mb-6">
                    Join our HVAC platform
                </p>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 text-sm text-center">{successMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Username *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Choose a username (e.g., john_doe)"
                                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.username
                                    ? "border-red-400 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                                    }`}
                                value={form.username}
                                onChange={(e) => {
                                    setForm({ ...form, username: e.target.value });
                                    if (errors.username) setErrors({ ...errors, username: null });
                                    setSuccessMessage("");
                                }}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span>⚠️</span> {errors.username}
                            </p>
                        )}
                        <p className="text-gray-400 text-xs mt-1">
                            Only letters, numbers, and underscores (3-20 characters)
                        </p>
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.name
                                    ? "border-red-400 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                                    }`}
                                value={form.name}
                                onChange={(e) => {
                                    setForm({ ...form, name: e.target.value });
                                    if (errors.name) setErrors({ ...errors, name: null });
                                    setSuccessMessage("");
                                }}
                            />
                        </div>
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span>⚠️</span> {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.email
                                    ? "border-red-400 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                                    }`}
                                value={form.email}
                                onChange={(e) => {
                                    setForm({ ...form, email: e.target.value });
                                    if (errors.email) setErrors({ ...errors, email: null });
                                    setSuccessMessage("");
                                }}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span>⚠️</span> {errors.email}
                            </p>
                        )}
                    </div>
                    {/* Role Selection - NEW FIELD */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Role / Department *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <select
                                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all appearance-none ${errors.role
                                    ? "border-red-400 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                                    }`}
                                value={form.role}
                                onChange={(e) => {
                                    setForm({ ...form, role: e.target.value });
                                    if (errors.role) setErrors({ ...errors, role: null });
                                    setSuccessMessage("");
                                }}
                            >
                                {roleOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        {errors.role && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span>⚠️</span> {errors.role}
                            </p>
                        )}
                        <p className="text-gray-400 text-xs mt-1">
                            Select your professional role in the HVAC industry
                        </p>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                value={form.password}
                                onChange={handlePasswordChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {form.password && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${passwordStrength.score === 1 ? "w-1/4 bg-red-500" :
                                                passwordStrength.score === 2 ? "w-2/4 bg-yellow-500" :
                                                    passwordStrength.score === 3 ? "w-3/4 bg-blue-500" :
                                                        passwordStrength.score === 4 ? "w-full bg-green-500" : "w-0"
                                                }`}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${passwordStrength.score === 1 ? "text-red-500" :
                                        passwordStrength.score === 2 ? "text-yellow-500" :
                                            passwordStrength.score === 3 ? "text-blue-500" :
                                                passwordStrength.score === 4 ? "text-green-500" : "text-gray-400"
                                        }`}>
                                        {passwordStrength.message}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-xs mt-1">
                                    Min 8 chars with uppercase, lowercase, number & special char
                                </p>
                            </div>
                        )}
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span>⚠️</span> {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm Password *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword
                                    ? "border-red-400 focus:ring-red-200"
                                    : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                                    }`}
                                value={form.confirmPassword}
                                onChange={(e) => {
                                    setForm({ ...form, confirmPassword: e.target.value });
                                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                                    setSuccessMessage("");
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showConfirmPassword ? (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span>⚠️</span> {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            id="terms"
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            onChange={(e) => {
                                setForm({ ...form, agree: e.target.checked });
                                if (errors.agree) setErrors({ ...errors, agree: null });
                                setSuccessMessage("");
                            }}
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                            I agree to the{" "}
                            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">
                                Privacy Policy
                            </a>
                        </label>
                    </div>
                    {errors.agree && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <span>⚠️</span> {errors.agree}
                        </p>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                    >
                        Create Account
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-gray-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}