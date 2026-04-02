import MainLayout from "../layout/MainLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GeoSearch from "../components/GeoSearch";

export default function NewProject() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        location: "",
        coords: null,
        summer: "",
        winter: "",
        zone: "",
        dwgFile: null,
    });

    // Auto temperature fetch
    const fetchTemperature = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
            );
            const data = await res.json();

            setForm((prev) => ({
                ...prev,
                summer: data.daily.temperature_2m_max[0],
                winter: data.daily.temperature_2m_min[0],
            }));
        } catch (err) {
            console.error(err);
        }
    };

    // Handle DWG file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // Check file type
        const validExtensions = ['.dwg', '.dxf'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            setError("Please upload a valid DWG or DXF file");
            return;
        }

        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            setError("File size must be less than 50MB");
            return;
        }

        setIsUploading(true);

        // Simulate upload process (replace with actual API call)
        setTimeout(() => {
            setUploadedFile(file);
            setForm(prev => ({ ...prev, dwgFile: file }));
            setIsUploading(false);
            setError("");
        }, 1000);
    };

    const validate = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Project Name is required";
        }

        if (!form.description.trim()) {
            newErrors.description = "Description is required";
        }

        if (!form.location.trim()) {
            newErrors.location = "Location is required";
        }

        if (!uploadedFile && !form.dwgFile) {
            newErrors.dwg = "DWG/DXF file is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setError("");

    try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.email) {
            setError("User session not found. Please log in again.");
            setIsSubmitting(false);
            return;
        }

        const key = `projects_${user.email}`;
        const projects = JSON.parse(localStorage.getItem(key)) || [];
        const projectId = Date.now();

        const newProject = {
            name: form.name,
            description: form.description,
            location: form.location,
            coords: form.coords,
            summer: form.summer,
            winter: form.winter,
            zone: form.zone,
            id: projectId,
            email: user.email,
            step: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dwgFileName: uploadedFile?.name || null,
            dwgFileSize: uploadedFile?.size || null,
            // ❌ REMOVED: dwgFileData — never store file binary in localStorage
        };

        try {
            projects.push(newProject);
            localStorage.setItem(key, JSON.stringify(projects));
        } catch (storageErr) {
            // QuotaExceededError
            setError("Storage limit exceeded. Please clear old projects and try again.");
            setIsSubmitting(false);
            return;
        }

        navigate(`/project/${projectId}`, { replace: true });

    } catch (err) {
        console.error("Submit error:", err);
        setError("Something went wrong. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
};

    return (
        <MainLayout>
            <div className="p-6 grid grid-cols-2 gap-6">

                {/* LEFT COLUMN - Project Info */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="font-bold mb-4 text-lg">Project Information</h2>

                    {/* Project Name */}
                    <input
                        placeholder="Project Name *"
                        className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.name}
                        onChange={(e) => {
                            setForm(prev => ({ ...prev, name: e.target.value }));
                            setErrors(prev => ({ ...prev, name: null }));
                        }}
                    />
                    {errors.name && <p className="text-red-500 text-sm mb-2">{errors.name}</p>}

                    {/* Project Description */}
                    <textarea
                        placeholder="Project Description *"
                        rows="3"
                        className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form.description}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, description: e.target.value }))
                        }
                    />
                    {errors.description && <p className="text-red-500 text-sm mb-2">{errors.description}</p>}

                    {/* GeoSearch */}
                    <div className="relative mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location *
                        </label>
                        <GeoSearch
                            setLocation={(loc) => {
                                const coords = { lat: loc.lat, lng: loc.lng };

                                setForm(prev => ({
                                    ...prev,
                                    location: loc.address,
                                    coords,
                                }));

                                fetchTemperature(loc.lat, loc.lng);
                            }}
                        />
                    </div>
                    {errors.location && <p className="text-red-500 text-sm mb-2">{errors.location}</p>}

                    {/* DWG Upload Button - Bold & Prominent */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            DWG/DXF File Upload *
                        </label>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                            <input
                                type="file"
                                accept=".dwg,.dxf"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="dwg-upload"
                            />
                            <label
                                htmlFor="dwg-upload"
                                className="cursor-pointer inline-block"
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-4xl">📁</span>
                                    <span className="font-bold text-blue-600 hover:text-blue-700">
                                        {isUploading ? "Uploading..." : "Click to Upload DWG/DXF"}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Supported formats: .dwg, .dxf (Max 50MB)
                                    </span>
                                </div>
                            </label>
                        </div>

                        {/* Upload Status */}
                        {uploadedFile && (
                            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2">
                                <span className="text-green-600">✓</span>
                                <span className="text-sm text-green-700">
                                    {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
                                </span>
                            </div>
                        )}

                        {errors.dwg && (
                            <p className="text-red-500 text-sm mt-2">{errors.dwg}</p>
                        )}

                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN - Climate & Zone */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="font-bold mb-4 text-lg">Climate Information</h2>

                    {/* Summer Temperature */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Summer Design Temperature (°C)
                        </label>
                        <input
                            value={form.summer || ""}
                            placeholder="Auto-fetched from location"
                            className="w-full border rounded px-3 py-2 bg-gray-50"
                            readOnly
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Automatically fetched based on location
                        </p>
                    </div>

                    {/* Winter Temperature */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Winter Design Temperature (°C)
                        </label>
                        <input
                            value={form.winter || ""}
                            placeholder="Auto-fetched from location"
                            className="w-full border rounded px-3 py-2 bg-gray-50"
                            readOnly
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Automatically fetched based on location
                        </p>
                    </div>

                    {/* ASHRAE Zone */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ASHRAE Climate Zone
                        </label>
                        <select
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) =>
                                setForm(prev => ({ ...prev, zone: e.target.value }))
                            }
                            value={form.zone}
                        >
                            <option value="">Select ASHRAE Zone</option>
                            <option value="1A">1A Very Hot - Humid</option>
                            <option value="2A">2A Hot - Humid</option>
                            <option value="3A">3A Warm - Humid</option>
                            <option value="4A">4A Mixed - Humid</option>
                            <option value="5A">5A Cool - Humid</option>
                            <option value="6A">6A Cold - Humid</option>
                            <option value="7">7 Very Cold</option>
                            <option value="8">8 Subarctic</option>
                        </select>
                    </div>

                    {/* Proceed Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating Project...
                            </div>
                        ) : (
                            "Proceed to Project →"
                        )}
                    </button>
                </div>

            </div>
        </MainLayout>
    );
}