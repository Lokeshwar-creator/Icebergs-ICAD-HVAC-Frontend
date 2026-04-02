import MainLayout from "../layout/MainLayout";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";

export default function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const projects = JSON.parse(localStorage.getItem(`projects_${user?.email}`)) || [];

    // ✅ Calculate stats from projects
    const totalProjects = projects.length;

    // Calculate projects in progress (step between 1 and 4, not 0 or 5)
    const inProgressProjects = projects.filter(p => p.step > 0 && p.step < 5).length;

    // Calculate open projects (step === 0)
    const openProjects = projects.filter(p => p.step === 0).length;

    // Calculate completed projects (step === 5)
    const completedProjects = projects.filter(p => p.step === 5).length;

    return (
        <MainLayout>
            <div className="p-6">

                {/* Welcome */}
                <h2 className="text-xl mb-4">
                    Welcome back, <span className="text-blue-600">{user?.name || user?.email}</span>
                </h2>

                {/* Header Row */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Project Dashboard</h1>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-100 p-4 rounded mb-4 flex justify-between">
                    <div>
                        <button
                            onClick={() => navigate("/new-project")}
                            className="bg-blue-600 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700 transition-colors"
                        >
                            + New Project
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="border px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Total Projects Card */}
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-500">Total Projects</p>
                        <p className="text-2xl font-bold text-gray-800">{totalProjects}</p>
                        <p className="text-xs text-gray-400 mt-1">All projects</p>
                    </div>

                    {/* Open Projects Card */}
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-500">Open</p>
                        <p className="text-2xl font-bold text-blue-600">{openProjects}</p>
                        <p className="text-xs text-gray-400 mt-1">Ready to start</p>
                    </div>

                    {/* In Progress Card */}
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-500">In Progress</p>
                        <p className="text-2xl font-bold text-yellow-600">{inProgressProjects}</p>
                        <p className="text-xs text-gray-400 mt-1">Active projects</p>
                    </div>

                    {/* Completed Card */}
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{completedProjects}</p>
                        <p className="text-xs text-gray-400 mt-1">Finished projects</p>
                    </div>
                </div>

                {/* Projects Section */}
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Your Projects</h3>
                        {projects.length > 0 && (
                            <span className="text-sm text-gray-500">
                                Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {projects.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <div className="text-6xl mb-4">📁</div>
                            <p className="text-gray-500 mb-4">No projects yet</p>
                            <button
                                onClick={() => navigate("/new-project")}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            >
                                Create your first project
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((p, i) => (
                                <ProjectCard key={p.id || i} project={p} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}