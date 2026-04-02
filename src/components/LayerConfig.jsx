import { useState } from "react";

const initialLayers = [
    { name: "MAIN", entities: 1842, type: "wall", include: true },
    { name: "MAIN-4", entities: 632, type: "wall", include: true },
    { name: "A-WALL", entities: 411, type: "wall", include: true },
    { name: "BASE", entities: 298, type: "wall", include: true },
    { name: "GLASS", entities: 187, type: "glass", include: true },
    { name: "FURNITURE", entities: 543, type: "furniture", include: true },
    { name: "DOORS", entities: 124, type: "furniture", include: true },
    { name: "TEXT", entities: 309, type: "other", include: false },
    { name: "DIM", entities: 214, type: "other", include: false },
];

const typeColors = {
    wall: "bg-green-100 text-green-700",
    glass: "bg-blue-100 text-blue-700",
    furniture: "bg-yellow-100 text-yellow-700",
    other: "bg-gray-100 text-gray-500",
};

export default function LayerConfig({ onNext }) {
    const [layers, setLayers] = useState(initialLayers);
    const [error, setError] = useState("");

    // Threshold state
    const [thresholds, setThresholds] = useState({
        minArea: 2.0,
        maxArea: 500.0,
        minPerimeter: 5.0,
        maxPerimeter: 100.0,
    });

    const toggleInclude = (index) => {
        const updated = [...layers];
        updated[index].include = !updated[index].include;
        setLayers(updated);
    };

    const selectAll = () => {
        setLayers(layers.map(l => ({ ...l, include: true })));
    };

    const clearAll = () => {
        setLayers(layers.map(l => ({ ...l, include: false })));
    };

    const handleThresholdChange = (field, value) => {
        setThresholds({
            ...thresholds,
            [field]: parseFloat(value) || 0
        });
    };

    /* 🔥 VALIDATION FUNCTION */
    const validate = () => {
        const selected = layers.filter(l => l.include);
        const wallSelected = selected.some(l => l.type === "wall");

        if (selected.length === 0) {
            return "At least one layer must be selected";
        }

        if (!wallSelected) {
            return "At least one WALL layer must be selected";
        }

        // Validate thresholds
        if (thresholds.minArea >= thresholds.maxArea) {
            return "Minimum area cannot be greater than or equal to maximum area";
        }

        if (thresholds.minPerimeter >= thresholds.maxPerimeter) {
            return "Minimum perimeter cannot be greater than or equal to maximum perimeter";
        }

        if (thresholds.minArea < 0 || thresholds.maxArea < 0) {
            return "Area values cannot be negative";
        }

        if (thresholds.minPerimeter < 0 || thresholds.maxPerimeter < 0) {
            return "Perimeter values cannot be negative";
        }

        return "";
    };

    const handleNext = () => {
        const validationError = validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");

        // Save thresholds to localStorage or pass to parent
        localStorage.setItem("detection_thresholds", JSON.stringify(thresholds));

        onNext();
    };

    const grouped = {
        wall: layers.filter(l => l.type === "wall" && l.include),
        glass: layers.filter(l => l.type === "glass" && l.include),
        furniture: layers.filter(l => l.type === "furniture" && l.include),
    };

    return (
        <div>



            {/* FILE INFO */}
            <div className="bg-green-50 border border-green-300 text-green-700 p-3 rounded mb-4 text-sm">
                ✔ House2.dwg loaded — {layers.length} layers detected
            </div>

            <div className="grid grid-cols-2 gap-6">

                {/* LEFT TABLE */}
                <div className="bg-white p-4 rounded-xl shadow">

                    <div className="flex justify-between mb-3">
                        <p className="font-semibold text-sm">Layers in File</p>

                        <div className="flex gap-2">
                            <button onClick={selectAll} className="text-xs border px-2 py-1 rounded hover:bg-gray-50">
                                Select All
                            </button>
                            <button onClick={clearAll} className="text-xs border px-2 py-1 rounded hover:bg-gray-50">
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-gray-500 text-xs border-b">
                                <tr>
                                    <th className="text-left p-2">Layer</th>
                                    <th className="text-center">Entities</th>
                                    <th className="text-center">Type</th>
                                    <th className="text-center">Include</th>
                                </tr>
                            </thead>

                            <tbody>
                                {layers.map((layer, i) => (
                                    <tr key={i} className="border-t hover:bg-gray-50">

                                        <td className="p-2 font-medium">{layer.name}</td>
                                        <td className="text-center">{layer.entities}</td>

                                        <td className="text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${typeColors[layer.type]}`}>
                                                {layer.type}
                                            </span>
                                        </td>

                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={layer.include}
                                                onChange={() => toggleInclude(i)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="space-y-4">

                    <div className="bg-white p-4 rounded-xl shadow">
                        <p className="text-sm font-semibold mb-2">Wall / Base Layers</p>
                        <div className="flex flex-wrap gap-2">
                            {grouped.wall.length > 0 ? (
                                grouped.wall.map(l => (
                                    <span key={l.name} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                        {l.name}
                                    </span>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400">No wall layers selected</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow">
                        <p className="text-sm font-semibold mb-2">Glass Layers</p>
                        <div className="flex flex-wrap gap-2">
                            {grouped.glass.length > 0 ? (
                                grouped.glass.map(l => (
                                    <span key={l.name} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                        {l.name}
                                    </span>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400">No glass layers selected</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow">
                        <p className="text-sm font-semibold mb-2">Furniture / Door Layers</p>
                        <div className="flex flex-wrap gap-2">
                            {grouped.furniture.length > 0 ? (
                                grouped.furniture.map(l => (
                                    <span key={l.name} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                        {l.name}
                                    </span>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400">No furniture layers selected</p>
                            )}
                        </div>
                    </div>

                    {/* 🔥 NEW THRESHOLD INPUTS SECTION */}
                    <div className="bg-white p-4 rounded-xl shadow">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">🎯</span>
                            <p className="text-sm font-semibold">Detection Thresholds</p>
                        </div>

                        <div className="space-y-3">
                            {/* Area Thresholds */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Room Area (m²)
                                </label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={thresholds.minArea}
                                            onChange={(e) => handleThresholdChange("minArea", e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Min"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Minimum</p>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={thresholds.maxArea}
                                            onChange={(e) => handleThresholdChange("maxArea", e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Max"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Maximum</p>
                                    </div>
                                </div>
                            </div>

                            {/* Perimeter Thresholds */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Room Perimeter (m)
                                </label>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={thresholds.minPerimeter}
                                            onChange={(e) => handleThresholdChange("minPerimeter", e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Min"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Minimum</p>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={thresholds.maxPerimeter}
                                            onChange={(e) => handleThresholdChange("maxPerimeter", e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Max"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Maximum</p>
                                    </div>
                                </div>
                            </div>

                            {/* Helper Text */}
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-600">
                                💡 Rooms outside these thresholds will be filtered out during detection
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* 🔥 ERROR MESSAGE */}
            {error && (
                <div className="mt-4 text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded">
                    ⚠ {error}
                </div>
            )}

            {/* FOOTER */}
            <div className="mt-6 flex justify-between items-center">
                <div className="text-xs text-gray-400">
                    Selected {layers.filter(l => l.include).length} of {layers.length} layers
                </div>

                <button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors disabled:opacity-50"
                >
                    Run Room Detection →
                </button>
            </div>

        </div>
    );
}