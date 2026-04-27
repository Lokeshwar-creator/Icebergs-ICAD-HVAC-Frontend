import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";

export default function Header() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [open, setOpen] = useState(false);

    return (
        <header className="bg-white shadow fixed top-0 w-full z-50 flex justify-between items-center px-6 py-3">

            {/* Left - Logo */}
            <div className="flex items-center gap-2">
                <img src="/logo.jpg" alt="logo" className="h-10" />
                <span className="font-bold text-lg text-gray-700">
                    IcebergTech ICAD HVAC
                </span>
            </div>


            {/* Center Menu */}
            <div className="flex gap-8 font-medium">
                <button onClick={() => navigate("/dashboard")}>Home</button>
                <button onClick={() => navigate("/projects")}>Projects</button>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4 relative">

                {/* Avatar */}
                <div onClick={() => setOpen(!open)} className="cursor-pointer">
                    <User />
                </div>

                {/* Dropdown */}
                {open && (
                    <div className="absolute right-0 top-10 bg-white shadow rounded w-40">
                        <button
                            className="block w-full px-4 py-2 hover:bg-gray-100"
                            onClick={() => navigate("/profile")}
                        >
                            View Profile
                        </button>
                        <button className="block w-full px-4 py-2 hover:bg-gray-100">
                            Settings
                        </button>
                    </div>
                )}
                {/* Logout */}
                <LogOut
                    className="cursor-pointer"
                    onClick={() => {
                        localStorage.removeItem("user");
                        navigate("/login");
                    }}
                />
            </div>
        </header>
    );
}