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
    const [isFetchingTemp, setIsFetchingTemp] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        location: "",
        coords: null,
        summer: "",
        winter: "",
        monsoon: "",
        zone: "",
        dwgFile: null,
    });

    // Fetch temperature data from Open-Meteo API
    const fetchTemperature = async (lat, lng) => {
        if (!lat || !lng) {
            console.error("Invalid coordinates:", { lat, lng });
            return;
        }

        setIsFetchingTemp(true);
        setError("");

        try {
            // Fetch Summer data (June-August)
            const summerUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=2023-06-01&end_date=2023-08-31&daily=temperature_2m_max&timezone=auto`;
            const summerResponse = await fetch(summerUrl);

            if (!summerResponse.ok) {
                throw new Error(`Weather API error: ${summerResponse.status}`);
            }

            const summerData = await summerResponse.json();
            console.log("Summer data received:", summerData);

            // Fetch Winter data (December-February)
            const winterUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=2023-12-01&end_date=2024-02-28&daily=temperature_2m_min&timezone=auto`;
            const winterResponse = await fetch(winterUrl);
            const winterData = await winterResponse.json();

            // Fetch Monsoon data (June-September)
            const monsoonUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=2023-06-01&end_date=2023-09-30&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
            const monsoonResponse = await fetch(monsoonUrl);
            const monsoonData = await monsoonResponse.json();

            let summerTemp = 28;
            let winterTemp = 20;
            let monsoonTemp = 24;

            // Process Summer data
            if (summerData.daily && summerData.daily.temperature_2m_max && summerData.daily.temperature_2m_max.length > 0) {
                const summerMax = summerData.daily.temperature_2m_max;
                summerTemp = Math.round(summerMax.reduce((a, b) => a + b, 0) / summerMax.length);
            }

            // Process Winter data
            if (winterData.daily && winterData.daily.temperature_2m_min && winterData.daily.temperature_2m_min.length > 0) {
                const winterMin = winterData.daily.temperature_2m_min;
                winterTemp = Math.round(winterMin.reduce((a, b) => a + b, 0) / winterMin.length);
            }

            // Process Monsoon data (average of max and min during monsoon season)
            if (monsoonData.daily && monsoonData.daily.temperature_2m_max && monsoonData.daily.temperature_2m_max.length > 0) {
                const monsoonMax = monsoonData.daily.temperature_2m_max;
                const monsoonMin = monsoonData.daily.temperature_2m_min;
                const monsoonAvg = monsoonMax.map((max, i) => (max + monsoonMin[i]) / 2);
                monsoonTemp = Math.round(monsoonAvg.reduce((a, b) => a + b, 0) / monsoonAvg.length);
            }

            setForm((prev) => ({
                ...prev,
                summer: summerTemp,
                winter: winterTemp,
                monsoon: monsoonTemp,
            }));

            setError("");

        } catch (err) {
            console.error("Temperature fetch error:", err);
            setError(`Could not fetch weather data: ${err.message}. Using fallback values.`);

            // Fallback to latitude-based estimation if API fails
            const absLat = Math.abs(lat);
            let summerFallback = 32;
            let winterFallback = 22;
            let monsoonFallback = 26;

            if (absLat > 40) {
                summerFallback = 22;
                winterFallback = 0;
                monsoonFallback = 12;
            } else if (absLat > 25) {
                summerFallback = 30;
                winterFallback = 10;
                monsoonFallback = 20;
            } else if (absLat > 10) {
                summerFallback = 34;
                winterFallback = 18;
                monsoonFallback = 26;
            } else {
                summerFallback = 32;
                winterFallback = 24;
                monsoonFallback = 28;
            }

            setForm((prev) => ({
                ...prev,
                summer: summerFallback,
                winter: winterFallback,
                monsoon: monsoonFallback,
            }));
        } finally {
            setIsFetchingTemp(false);
        }
    };

    // Handle DWG file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const validExtensions = ['.dwg', '.dxf'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            setError("Please upload a valid DWG or DXF file");
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            setError("File size must be less than 50MB");
            return;
        }

        setIsUploading(true);

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
                monsoon: form.monsoon,
                zone: form.zone,
                id: projectId,
                email: user.email,
                step: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                dwgFileName: uploadedFile?.name || null,
                dwgFileSize: uploadedFile?.size || null,
            };

            try {
                projects.push(newProject);
                localStorage.setItem(key, JSON.stringify(projects));
            } catch (storageErr) {
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

                    {/* DWG Upload Button */}
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
                            placeholder="Select a location first"
                            className="w-full border rounded px-3 py-2 bg-gray-50"
                            readOnly
                        />
                        {isFetchingTemp && (
                            <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                                <span className="inline-block w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                                Fetching climate data...
                            </p>
                        )}
                        {!isFetchingTemp && form.summer && (
                            <p className="text-xs text-green-600 mt-1">
                                ✓ Fetched from Open-Meteo API
                            </p>
                        )}
                    </div>

                    {/* Winter Temperature */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Winter Design Temperature (°C)
                        </label>
                        <input
                            value={form.winter || ""}
                            placeholder="Select a location first"
                            className="w-full border rounded px-3 py-2 bg-gray-50"
                            readOnly
                        />
                        {isFetchingTemp && (
                            <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                                <span className="inline-block w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                                Fetching climate data...
                            </p>
                        )}
                        {!isFetchingTemp && form.winter && (
                            <p className="text-xs text-green-600 mt-1">
                                ✓ Fetched from Open-Meteo API
                            </p>
                        )}

                    </div>

                    {/* Monsoon Temperature */}
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monsoon Design Temperature (°C)
                        </label>
                        <input
                            value={form.monsoon || ""}
                            placeholder="Select a location first"
                            className="w-full border rounded px-3 py-2 bg-gray-50"
                            readOnly
                        />
                        {isFetchingTemp && (
                            <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                                <span className="inline-block w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                                Fetching climate data...
                            </p>
                        )}
                        {!isFetchingTemp && form.monsoon && (
                            <p className="text-xs text-green-600 mt-1">
                                ✓ Fetched from Open-Meteo API
                            </p>
                        )}

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

                    {error && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-yellow-700 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isFetchingTemp}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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