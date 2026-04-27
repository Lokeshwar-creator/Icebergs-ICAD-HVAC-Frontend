import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: ""
    });

    // Generate random OTP
    const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    // Send email notification (simulated)
    const sendEmailNotification = async (email, otpCode) => {
        console.log(`Sending OTP ${otpCode} to ${email}`);

        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.setItem(`reset_otp_${email}`, otpCode);
                localStorage.setItem(`reset_otp_expiry_${email}`, Date.now() + 5 * 60 * 1000);
                resolve(true);
            }, 1000);
        });
    };

    // Calculate password strength
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
        const newPw = e.target.value;
        setNewPassword(newPw);
        setPasswordStrength(calculatePasswordStrength(newPw));
        if (errors.newPassword) setErrors({ ...errors, newPassword: null });
        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
    };

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();

        if (!email) {
            setErrors({ email: "Email is required" });
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: "Please enter a valid email address" });
            return;
        }

        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const userExists = users.find(u => u.email === email);

        if (!userExists) {
            setErrors({ email: "No account found with this email address" });
            return;
        }

        setIsLoading(true);

        const otpCode = generateOTP();
        setGeneratedOtp(otpCode);

        await sendEmailNotification(email, otpCode);

        setMessage(`OTP sent to ${email}. Please check your email (Demo OTP: ${otpCode})`);
        setErrors({});

        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        setIsLoading(false);
        setStep(2);
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = (e) => {
        e.preventDefault();

        if (!otp) {
            setErrors({ otp: "OTP is required" });
            return;
        }

        const storedOtp = localStorage.getItem(`reset_otp_${email}`);
        const expiryTime = localStorage.getItem(`reset_otp_expiry_${email}`);

        if (!storedOtp || !expiryTime) {
            setErrors({ otp: "OTP expired or not found. Please request a new one." });
            return;
        }

        if (Date.now() > parseInt(expiryTime)) {
            setErrors({ otp: "OTP has expired. Please request a new one." });
            localStorage.removeItem(`reset_otp_${email}`);
            localStorage.removeItem(`reset_otp_expiry_${email}`);
            return;
        }

        if (otp !== storedOtp) {
            setErrors({ otp: "Invalid OTP. Please try again." });
            return;
        }

        setMessage("OTP verified successfully! Please set your new password.");
        setErrors({});
        setStep(3);
    };

    // Resend OTP
    const handleResendOTP = async () => {
        if (countdown > 0) return;

        setIsLoading(true);
        const otpCode = generateOTP();
        setGeneratedOtp(otpCode);
        await sendEmailNotification(email, otpCode);
        setMessage(`New OTP sent to ${email} (Demo OTP: ${otpCode})`);

        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        setIsLoading(false);
    };

    // Step 3: Update Password
    const handleUpdatePassword = (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!newPassword) {
            newErrors.newPassword = "Password is required";
        } else if (newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(newPassword)) {
            newErrors.newPassword = "Password must contain at least one uppercase letter";
        } else if (!/[a-z]/.test(newPassword)) {
            newErrors.newPassword = "Password must contain at least one lowercase letter";
        } else if (!/[0-9]/.test(newPassword)) {
            newErrors.newPassword = "Password must contain at least one number";
        } else if (!/[^A-Za-z0-9]/.test(newPassword)) {
            newErrors.newPassword = "Password must contain at least one special character";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const updatedUsers = users.map(u => {
            if (u.email === email) {
                return { ...u, password: newPassword };
            }
            return u;
        });

        localStorage.setItem("users", JSON.stringify(updatedUsers));

        localStorage.removeItem(`reset_otp_${email}`);
        localStorage.removeItem(`reset_otp_expiry_${email}`);

        setMessage("Password updated successfully! Redirecting to login...");

        setTimeout(() => {
            navigate("/login");
        }, 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
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
                    Forgot Password
                </h2>
                <p className="text-center text-gray-500 mb-6">
                    {step === 1 && "Enter your email to receive an OTP"}
                    {step === 2 && "Enter the OTP sent to your email"}
                    {step === 3 && "Create a new password"}
                </p>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                            }`}>1</div>
                        <div className={`w-12 h-0.5 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                            }`}>2</div>
                        <div className={`w-12 h-0.5 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                            }`}>3</div>
                    </div>
                </div>

                {/* Message Display */}
                {message && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 text-sm text-center">{message}</p>
                    </div>
                )}

                {/* Step 1: Email Input */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    placeholder="Enter your registered email"
                                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.email ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                                        }`}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors({});
                                    }}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors font-semibold disabled:opacity-50"
                        >
                            {isLoading ? "Sending OTP..." : "Send Reset OTP →"}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Enter OTP
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7h.01M12 7h.01M9 7h.01M6 7h.01M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.otp ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                                        }`}
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value);
                                        setErrors({});
                                    }}
                                />
                            </div>
                            {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors font-semibold"
                        >
                            Verify OTP →
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={countdown > 0}
                                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                            >
                                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 3 && (
                    <form onSubmit={handleUpdatePassword} className="space-y-5">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    value={newPassword}
                                    onChange={handlePasswordChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>

                            {/* Password Strength Meter */}
                            {newPassword && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-300 ${passwordStrength.score === 1 ? "w-1/4 bg-red-500" :
                                                passwordStrength.score === 2 ? "w-2/4 bg-yellow-500" :
                                                    passwordStrength.score === 3 ? "w-3/4 bg-blue-500" :
                                                        passwordStrength.score === 4 ? "w-full bg-green-500" : "w-0"
                                                }`} />
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
                            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm new password"
                                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                                        }`}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setErrors({ ...errors, confirmPassword: null });
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition-colors font-semibold"
                        >
                            Update Password →
                        </button>
                    </form>
                )}

                {/* Back to Login Link */}
                <div className="mt-6 text-center">
                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}