import MainLayout from "../layout/MainLayout";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import LayerConfig from "../components/LayerConfig";
import RoomDetection from "../components/RoomDetection";
import DuctLayout from "../components/DuctLayout";
import TRCFMTable from "../components/TRCFMTable";
import HeatLoad from "../components/HeatLoad";


// Add these functions for export
const exportToPDF = (currentProject, roomsData) => {
    // Simple print-based PDF export
    const printContent = `
        <html>
        <head>
            <title>${currentProject?.name} - Project Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #2563eb; }
                h2 { color: #374151; margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f3f4f6; }
                .header { text-align: center; margin-bottom: 30px; }
                .info { margin: 20px 0; }
                .info p { margin: 5px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${currentProject?.name || "Project"} - HVAC Report</h1>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="info">
                <h2>Project Information</h2>
                <p><strong>Description:</strong> ${currentProject?.description || "N/A"}</p>
                <p><strong>Location:</strong> ${currentProject?.location || "N/A"}</p>
                <p><strong>ASHRAE Zone:</strong> ${currentProject?.zone || "N/A"}</p>
                <p><strong>Summer Temp:</strong> ${currentProject?.summer || "N/A"}°C</p>
                <p><strong>Winter Temp:</strong> ${currentProject?.winter || "N/A"}°C</p>
            </div>
            <h2>Room Details</h2>
            <table>
                <thead>
                    <tr><th>Room ID</th><th>Room Name</th><th>Type</th><th>Area (m²)</th><th>TR</th><th>CFM</th><th>Total Heat (W)</th></tr>
                </thead>
                <tbody>
                    ${roomsData.map(r => `
                        <tr>
                            <td>${r.id}</td>
                            <td>${r.name}</td>
                            <td>${r.type}</td>
                            <td>${r.area?.toFixed(2) || 0}</td>
                            <td>${r.tr || (r.totalHeat / 3500).toFixed(3)}</td>
                            <td>${r.cfm || Math.round(r.totalHeat / (1.1 * 18))}</td>
                            <td>${r.totalHeat || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
};

const exportToExcel = (currentProject, roomsData) => {
    // Prepare data for CSV
    const headers = ['Room ID', 'Room Name', 'Type', 'Area (m²)', 'TR', 'CFM', 'Total Heat (W)'];
    const rows = roomsData.map(r => [
        r.id,
        r.name,
        r.type,
        r.area?.toFixed(2) || 0,
        r.tr || (r.totalHeat / 3500).toFixed(3),
        r.cfm || Math.round(r.totalHeat / (1.1 * 18)),
        r.totalHeat || 0
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject?.name || 'project'}_report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const STEPS = [
    "Project Details",
    "Layer Configuration",
    "Room Detection",
    "Heat Load",
    "TR / CFM",
    "Duct Layout",
    "Export",
];

export default function ProjectWorkflow() {
    const navigate = useNavigate();
    const { id } = useParams();
    const user = JSON.parse(localStorage.getItem("user"));

    const [projects, setProjects] = useState(
        JSON.parse(localStorage.getItem(`projects_${user?.email}`)) || []
    );

    const currentProject = projects.find((p) => p.id === Number(id));
    const [step, setStep] = useState(currentProject?.step || 0);
    // DXF viewer visibility - initially true, persists based on project data
    const [showDxfViewer, setShowDxfViewer] = useState(() => {
        // If project has step 0, show viewer, otherwise hide
        return currentProject?.step === 0 || !currentProject?.step;
    });
    const [open, setOpen] = useState(false);

    // Get rooms data for export
    const [exportRoomsData, setExportRoomsData] = useState([]);

    // Load rooms data from localStorage for export
    useEffect(() => {
        const detectedRooms = JSON.parse(localStorage.getItem("detectedRooms") || "[]");
        const roomsWithCalculations = detectedRooms.map(room => {
            const wall = (room.area || 0) * 20;
            const glass = room.type === "glass" ? (room.area || 0) * 80 : 0;
            const people = (room.area || 0) * 5;
            const totalHeat = wall + glass + people;
            return {
                ...room,
                totalHeat,
                tr: (totalHeat / 3500).toFixed(3),
                cfm: Math.round(totalHeat / (1.1 * 18))
            };
        });
        setExportRoomsData(roomsWithCalculations);
    }, []);

    const updateProjectStep = (newStep) => {
        const updatedProjects = projects.map((p) =>
            p.id === Number(id)
                ? { ...p, step: newStep, updatedAt: new Date().toISOString() }
                : p
        );

        setProjects(updatedProjects);

        localStorage.setItem(
            `projects_${user.email}`,
            JSON.stringify(updatedProjects)
        );

        setStep(newStep);

        // Only hide DXF viewer when moving past project details AND not coming back
        if (newStep > 0) {
            setShowDxfViewer(false);
        }
    };

    const [file, setFile] = useState(currentProject?.file || null);

    // Handle proceed from project details
    const handleProceedToLayers = () => {
        updateProjectStep(1);
    };

    // Handle back to project details - show DXF viewer again
    const handleBackToProjectDetails = () => {
        setStep(0);
        setShowDxfViewer(true);
    };

    // Format date for display
    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <>
            {/* Header */}
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

            {/* Main Content - Add padding top to account for fixed header */}
            <div className="p-6 h-full pt-24">
                {/* Page Title with Project Info */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">
                        Project Workflow
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {currentProject?.name || "Untitled"}
                    </p>
                </div>

                {/* Simple Button Navigation */}
                <div className="flex gap-3 mb-6 border-b pb-4 overflow-x-auto">
                    {STEPS.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                if (i <= step) {
                                    setStep(i);
                                    // Show DXF viewer only when going back to step 0
                                    if (i === 0) {
                                        setShowDxfViewer(true);
                                    } else {
                                        setShowDxfViewer(false);
                                    }
                                }
                            }}
                            className={`
                                px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                                ${step === i
                                    ? "bg-blue-600 text-white shadow-md"
                                    : step > i
                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }
                            `}
                            disabled={i > step}
                        >
                            {step > i && "✓ "}{s}
                        </button>
                    ))}
                </div>

                {/* Two Column Layout */}
                <div className={`flex gap-6 ${step === 0 ? '' : 'h-[calc(100vh-200px)]'}`}>

                    {/* LEFT COLUMN - Workflow Content */}
                    <div className={`${step === 0 ? 'flex-1' : 'w-full'} overflow-y-auto`}>

                        {/* Workflow Content Area */}
                        <div className="bg-white p-6 rounded-xl shadow">

                            {/* STEP 0: PROJECT DETAILS IN A SINGLE CARD */}
                            {step === 0 && (
                                <div>
                                    <h2 className="text-2xl font-semibold mb-6">Project Details</h2>

                                    {/* Single Card for all project details */}
                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden mb-8">
                                        {/* Card Header */}
                                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
                                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                                <span>📋</span> Project Information
                                            </h3>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Left Column */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Project Name</label>
                                                        <p className="text-lg font-bold text-gray-800 mt-1">
                                                            {currentProject?.name || "-"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</label>
                                                        <p className="text-gray-700 mt-1 flex items-center gap-2">
                                                            <span>📍</span> {currentProject?.location || "Not specified"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Building Type</label>
                                                        <p className="text-gray-700 mt-1">
                                                            {currentProject?.buildingType || "Commercial"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right Column */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Area</label>
                                                        <p className="text-gray-700 mt-1">
                                                            {currentProject?.area ? `${currentProject.area} m²` : "Not specified"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Created Date</label>
                                                        <p className="text-gray-700 mt-1">
                                                            {formatDate(currentProject?.createdAt || currentProject?.date)}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                                                        <div className="mt-1">
                                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentProject?.step === 5
                                                                ? "bg-green-100 text-green-700"
                                                                : currentProject?.step === 0
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-yellow-100 text-yellow-700"
                                                                }`}>
                                                                {currentProject?.step === 5
                                                                    ? "✓ Completed"
                                                                    : currentProject?.step === 0
                                                                        ? "○ Not Started"
                                                                        : "⏳ In Progress"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Description - Full Width */}
                                                <div className="md:col-span-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                                                    <p className="text-gray-700 mt-1 leading-relaxed bg-gray-50 p-3 rounded-lg">
                                                        {currentProject?.description || "No description provided"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t">
                                        <button
                                            onClick={handleProceedToLayers}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-2 text-lg font-semibold"
                                        >
                                            Proceed to Layer Configuration
                                            <span>→</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 1: LAYER CONFIG */}
                            {step === 1 && (
                                <div>
                                    <div className="mb-4 flex justify-between items-center">
                                        <h2 className="text-xl font-semibold">Layer Configuration</h2>
                                        <button
                                            onClick={handleBackToProjectDetails}
                                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                        >
                                            ← Back to Project Details
                                        </button>
                                    </div>
                                    <LayerConfig onNext={() => updateProjectStep(2)} />
                                </div>
                            )}

                            {/* STEP 2: ROOM DETECTION */}
                            {step === 2 && (
                                <div>
                                    <div className="mb-4 flex justify-between items-center">
                                        <h2 className="text-xl font-semibold">Room Detection</h2>
                                        <button
                                            onClick={() => setStep(1)}
                                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                        >
                                            ← Back to Layer Config
                                        </button>
                                    </div>
                                    <RoomDetection onNext={() => updateProjectStep(3)} />
                                </div>
                            )}

                            {/* STEP 3: HEAT LOAD */}
                            {step === 3 && (
                                <div>
                                    <div className="mb-4 flex justify-between items-center">
                                        <h2 className="text-xl font-semibold">Heat Load Analysis</h2>
                                        <button
                                            onClick={() => setStep(2)}
                                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                        >
                                            ← Back to Room Detection
                                        </button>
                                    </div>
                                    <HeatLoad onNext={() => updateProjectStep(4)} />
                                </div>
                            )}

                            {/* STEP 4: TR / CFM */}
                            {step === 4 && (
                                <div>
                                    <div className="mb-4 flex justify-between items-center">
                                        <h2 className="text-xl font-semibold">TR / CFM Calculation</h2>
                                        <button
                                            onClick={() => setStep(3)}
                                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                        >
                                            ← Back to Heat Load
                                        </button>
                                    </div>
                                    <TRCFMTable onNext={() => updateProjectStep(5)} />
                                </div>
                            )}

                            {/* STEP 5: DUCT LAYOUT */}
                            {step === 5 && (
                                <div>
                                    <div className="mb-4 flex justify-between items-center">
                                        <h2 className="text-xl font-semibold">Duct Layout Design</h2>
                                        <button
                                            onClick={() => setStep(4)}
                                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                        >
                                            ← Back to TR / CFM
                                        </button>
                                    </div>
                                    <DuctLayout onNext={() => updateProjectStep(6)} />
                                </div>
                            )}

                            {/* STEP 6: EXPORT */}
                            {step === 6 && (
                                <div className="text-center">
                                    <h2 className="font-semibold text-xl mb-4">
                                        Export Report
                                    </h2>

                                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                                        <h3 className="font-medium mb-3">Project Summary</h3>
                                        <div className="grid grid-cols-2 gap-4 text-left">
                                            <div>
                                                <p className="text-sm text-gray-500">Project Name</p>
                                                <p className="font-medium">{currentProject?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Location</p>
                                                <p className="font-medium">{currentProject?.location}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Status</p>
                                                <p className="text-green-600 font-medium">Completed ✓</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Completed Date</p>
                                                <p className="font-medium">{new Date().toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => updateProjectStep(4)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded transition-colors"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            onClick={() => exportToPDF(currentProject, exportRoomsData)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors"
                                        >
                                            📄 Export PDF
                                        </button>
                                        <button
                                            onClick={() => exportToExcel(currentProject, exportRoomsData)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
                                        >
                                            📊 Export Excel
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* RIGHT COLUMN - DXF File Viewer (Only visible on step 0) */}
                    {step === 0 && showDxfViewer && (
                        <div className="w-96 bg-white rounded-xl shadow-lg flex flex-col overflow-hidden border border-gray-200">
                            {/* Viewer Header */}
                            <div className="bg-gray-100 border-b border-gray-200 p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg"></span>
                                    <span className="font-medium text-gray-700">DXF File Viewer</span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="text-gray-600 hover:text-gray-800 transition-colors px-2" title="Zoom In">
                                        🔍+
                                    </button>
                                    <button className="text-gray-600 hover:text-gray-800 transition-colors px-2" title="Zoom Out">
                                        🔍-
                                    </button>
                                    <button className="text-gray-600 hover:text-gray-800 transition-colors px-2" title="Fit to Screen">
                                        ⊞
                                    </button>
                                </div>
                            </div>

                            {/* Viewer Content - Light Background */}
                            <div className="flex-1 bg-gray-50 relative overflow-hidden" style={{ minHeight: "400px" }}>
                                {currentProject?.dxfFile || file ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-center p-8">
                                            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4 border-2 border-gray-300">
                                                <span className="text-5xl">📐</span>
                                            </div>
                                            <p className="text-gray-600 text-sm font-medium">
                                                {currentProject?.dxfFile?.name || file?.name || "drawing.dxf"}
                                            </p>
                                            <p className="text-gray-400 text-xs mt-2">
                                                DXF Preview Area
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-center p-8">
                                            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4 border-2 border-gray-300">
                                                <span className="text-5xl">📄</span>
                                            </div>
                                            <p className="text-gray-600 text-sm">
                                                No DXF file viewed
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Viewer Footer */}
                            <div className="bg-gray-100 border-t border-gray-200 text-gray-500 text-xs p-2 flex justify-between">
                                <span>Coordinates: X: 0, Y: 0</span>
                                <span>Zoom: 100%</span>
                                <span>Layer: All</span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}