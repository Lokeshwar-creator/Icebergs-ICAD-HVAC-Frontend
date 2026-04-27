import MainLayout from "../layout/MainLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Projects() {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    const [projects, setProjects] = useState(
        JSON.parse(localStorage.getItem(`projects_${user?.email}`)) || []
    );

    // ✅ FILTER STATES
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [stepFilter, setStepFilter] = useState("all");

    // ✅ STEP LABELS (UPDATED ORDER - Heat Load before TR/CFM)
    const STEP_LABELS = [
        "Upload",
        "Layer",
        "Room",
        "Heat Load",
        "TR/CFM",
        "Duct Layout",
        "Export"
    ];

    // ✅ STATUS FROM STEP
    const getStatus = (step) => {
        if (step === 0) return "open";
        if (step === 6) return "completed";
        if (step > 0 && step < 6) return "inprogress";
        return "inprogress";
    };

    // ✅ Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-600";
            case "open":
                return "bg-blue-100 text-blue-600";
            case "inprogress":
                return "bg-yellow-100 text-yellow-600";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    // ✅ Get step badge color
    const getStepColor = (step) => {
        switch (step) {
            case 5:
                return "bg-green-100 text-green-700";
            case 4:
                return "bg-purple-100 text-purple-700";
            case 3:
                return "bg-blue-100 text-blue-700";
            case 2:
                return "bg-indigo-100 text-indigo-700";
            case 1:
                return "bg-cyan-100 text-cyan-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // ✅ DATE FORMATTER
    const formatDate = (date) => {
        if (!date) return "-";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    // ✅ DELETE
    const deleteProject = (id) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            const updated = projects.filter((p) => p.id !== id);
            setProjects(updated);
            localStorage.setItem(`projects_${user.email}`, JSON.stringify(updated));
        }
    };

    // ✅ FILTER LOGIC
    const filteredProjects = projects.filter((p) => {
        const status = getStatus(p.step);

        return (
            p.name.toLowerCase().includes(search.toLowerCase()) &&
            (statusFilter === "all" || status === statusFilter) &&
            (stepFilter === "all" || String(p.step) === stepFilter)
        );
    });

    // ✅ Get project statistics
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.step === 5).length;
    const inProgressProjects = projects.filter(p => p.step > 0 && p.step < 5).length;
    const openProjects = projects.filter(p => p.step === 0).length;

    return (
        <MainLayout>
            <div className="p-6">

                {/* HEADER WITH STATS */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Projects</h1>
                    <button
                        onClick={() => navigate("/new-project")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <span>+</span> New Project
                    </button>
                </div>



                {/* 🔥 FILTER BAR */}
                <div className="flex gap-4 mb-4 flex-wrap">
                    {/* SEARCH */}
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search by project name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* STATUS FILTER */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="inprogress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>

                    {/* STEP FILTER */}
                    <select
                        value={stepFilter}
                        onChange={(e) => setStepFilter(e.target.value)}
                        className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Steps</option>
                        {STEP_LABELS.map((label, index) => (
                            <option key={index} value={index}>
                                {index + 1}. {label}
                            </option>
                        ))}
                    </select>

                    {/* CLEAR FILTERS BUTTON */}
                    {(search || statusFilter !== "all" || stepFilter !== "all") && (
                        <button
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("all");
                                setStepFilter("all");
                            }}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 text-gray-600 text-sm">
                                <tr>
                                    <th className="p-3">ID</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Step</th>
                                    <th className="p-3">Location</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Created</th>
                                    <th className="p-3">Last Updated</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredProjects.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center p-6 text-gray-500">
                                            No projects found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProjects.map((p) => {
                                        const status = getStatus(p.step);

                                        return (
                                            <tr
                                                key={p.id}
                                                className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => navigate(`/project/${p.id}`)}
                                            >
                                                <td className="p-3 text-sm text-gray-500">
                                                    #{p.id}
                                                </td>
                                                <td className="p-3 font-medium text-gray-800">
                                                    {p.name}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStepColor(p.step)}`}>
                                                        {STEP_LABELS[p.step] || "Upload"}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm text-gray-600">
                                                    {p.location || "-"}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                                        {status === "completed" ? "✓ Completed" :
                                                            status === "open" ? "○ Open" :
                                                                "⏳ In Progress"}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm text-gray-500">
                                                    {formatDate(p.createdAt || p.date)}
                                                </td>
                                                <td className="p-3 text-sm text-gray-500">
                                                    {formatDate(p.updatedAt || p.date)}
                                                </td>
                                                <td
                                                    className="p-3 text-center space-x-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        onClick={() => navigate(`/project/${p.id}`)}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                                    >
                                                        Open
                                                    </button>
                                                    <button
                                                        onClick={() => deleteProject(p.id)}
                                                        className="text-red-600 hover:text-red-800 hover:underline text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FOOTER WITH COUNT */}
                {filteredProjects.length > 0 && (
                    <div className="mt-4 text-sm text-gray-500 text-right">
                        Showing {filteredProjects.length} of {projects.length} projects
                    </div>
                )}
            </div>
        </MainLayout>
    );
}