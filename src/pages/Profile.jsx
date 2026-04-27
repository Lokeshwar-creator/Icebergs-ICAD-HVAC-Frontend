import MainLayout from "../layout/MainLayout";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";

export default function Profile() {
    const user = JSON.parse(localStorage.getItem("user"));
    const projects = JSON.parse(localStorage.getItem(`projects_${user?.email}`)) || [];

    // Get all users to find the current user's full details
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const userDetails = allUsers.find(u => u.email === user?.email);

    // Calculate project stats
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.step === 5).length;
    const inProgressProjects = projects.filter(p => p.step > 0 && p.step < 5).length;
    const openProjects = projects.filter(p => p.step === 0).length;

    // Format date
    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <MainLayout>
            <div className="p-6 space-y-6">

                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-3xl font-bold text-blue-600">
                                {userDetails?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        {/* User Info */}
                        <div>
                            <h1 className="text-2xl font-bold">{userDetails?.name || user?.name || "User"}</h1>
                            <p className="text-blue-100">{userDetails?.email || user?.email}</p>
                            <p className="text-blue-100 text-sm mt-1">
                                Member since {formatDate(userDetails?.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-500">Total Projects</p>
                        <p className="text-2xl font-bold text-gray-800">{totalProjects}</p>
                        <p className="text-xs text-gray-400 mt-1">All projects</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-500">Open Projects</p>
                        <p className="text-2xl font-bold text-blue-600">{openProjects}</p>
                        <p className="text-xs text-gray-400 mt-1">Ready to start</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-500">In Progress</p>
                        <p className="text-2xl font-bold text-yellow-600">{inProgressProjects}</p>
                        <p className="text-xs text-gray-400 mt-1">Active projects</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{completedProjects}</p>
                        <p className="text-xs text-gray-400 mt-1">Finished projects</p>
                    </div>
                </div>

                {/* User Details Card */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span>👤</span> User Information
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="border-b pb-3">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                                    <p className="text-gray-800 font-medium mt-1">
                                        {userDetails?.name || user?.name || "Not specified"}
                                    </p>
                                </div>

                                <div className="border-b pb-3">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</label>
                                    <p className="text-gray-800 font-medium mt-1">
                                        @{userDetails?.username || user?.username || "Not specified"}
                                    </p>
                                </div>

                                <div className="border-b pb-3">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                                    <p className="text-gray-800 font-medium mt-1">
                                        {userDetails?.email || user?.email}
                                    </p>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="border-b pb-3">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</label>
                                    <p className="text-gray-800 font-medium mt-1">
                                        {userDetails?.role || user?.role || "HVAC Engineer"}
                                    </p>
                                </div>

                                <div className="border-b pb-3">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Member Since</label>
                                    <p className="text-gray-800 font-medium mt-1">
                                        {formatDate(userDetails?.createdAt || user?.createdAt || user?.joinedAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Section */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span>📁</span> Your Projects
                        </h2>
                        {projects.length > 0 && (
                            <span className="text-sm text-gray-500">
                                Total: {projects.length} project{projects.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    <div className="p-6">
                        {projects.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📂</div>
                                <p className="text-gray-500 mb-4">No projects yet</p>
                                <button
                                    onClick={() => window.location.href = "/new-project"}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Create Your First Project
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

            </div>
        </MainLayout>
    );
}