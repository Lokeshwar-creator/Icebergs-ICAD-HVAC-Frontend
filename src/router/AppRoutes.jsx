import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "../pages/SignUp";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import NewProject from "../pages/NewProject";
import Projects from "../pages/Projects";
import UploadPage from "../pages/UploadPage";
import ProjectWorkflow from "../pages/ProjectWorkflow";
import ForgotPassword from "../pages/ForgotPassword";


// simple auth check (later replace with real auth)
const isAuthenticated = () => {
    const user = localStorage.getItem("user");
    return user && user !== "undefined";
};

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Default route */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Auth pages */}
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/new-project" element={<NewProject />} />

                {/* Protected routes */}
                <Route
                    path="/dashboard"
                    element={
                        isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />
                    }
                />
                <Route path="/projects" element={<Projects />} />
                <Route
                    path="/upload/:id"
                    element={
                        isAuthenticated() ? <UploadPage /> : <Navigate to="/login" />
                    }
                />
                <Route
                    path="/project/:id"
                    element={
                        isAuthenticated()
                            ? <ProjectWorkflow />
                            : <Navigate to="/login" />
                    }
                />
                <Route
                    path="/profile"
                    element={
                        isAuthenticated() ? <Profile /> : <Navigate to="/login" />
                    }
                />
                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />


                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}