import { useEffect, useState } from "react";

// Thumb Rule: 140 sq ft = 1 TR, 1 TR = 400 CFM
const calcTRBySqft = (areaSqft) => {
    return (areaSqft / 140).toFixed(2);
};

const calcCFMByTR = (tr) => {
    return Math.round(tr * 400);
};

// For m²: 1 m² = 10.764 sq ft, so TR = (area_m2 * 10.764) / 140 = area_m2 * 0.0768857
const calcTRBySqm = (areaSqm) => {
    return (areaSqm * 10.764 / 140).toFixed(2);
};

const calcCFMBySqm = (areaSqm) => {
    const tr = areaSqm * 10.764 / 140;
    return Math.round(tr * 400);
};

export default function TRCFMTable({ onNext }) {
    const [rooms, setRooms] = useState([]);
    const [areaUnit, setAreaUnit] = useState("sqm"); // "sqm" or "sqft"

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("detectedRooms")) || [];
        setRooms(data);
    }, []);

    // Get area value based on selected unit
    const getAreaValue = (areaSqm) => {
        if (areaUnit === "sqm") {
            return areaSqm;
        } else {
            return areaSqm * 10.764;
        }
    };

    // Get display area string
    const getDisplayArea = (areaSqm) => {
        if (areaUnit === "sqm") {
            return areaSqm.toFixed(2);
        } else {
            return (areaSqm * 10.764).toFixed(0);
        }
    };

    // Calculate TR based on selected unit
    const getTR = (areaSqm) => {
        if (areaUnit === "sqm") {
            return calcTRBySqm(areaSqm);
        } else {
            return calcTRBySqft(areaSqm * 10.764);
        }
    };

    // Calculate CFM based on selected unit
    const getCFM = (areaSqm) => {
        if (areaUnit === "sqm") {
            return calcCFMBySqm(areaSqm);
        } else {
            const tr = parseFloat(calcTRBySqft(areaSqm * 10.764));
            return calcCFMByTR(tr);
        }
    };

    const getAreaLabel = () => {
        return areaUnit === "sqm" ? "Area (m²)" : "Area (sq ft)";
    };

    // Calculate totals based on selected unit
    const totalArea = rooms.reduce((sum, r) => sum + getAreaValue(r.area), 0);
    const totalTR = rooms.reduce((sum, r) => sum + parseFloat(getTR(r.area)), 0);
    const totalCFM = rooms.reduce((sum, r) => sum + getCFM(r.area), 0);

    return (
        <div className="p-6">

            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold">TR / CFM by Thumb Rule</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Thumb Rule: 140 sq ft = 1 TR | 1 TR = 400 CFM
                    </p>
                </div>

                {/* Toggle Button for Area Unit */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setAreaUnit("sqm")}
                        className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${areaUnit === "sqm"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        m²
                    </button>
                    <button
                        onClick={() => setAreaUnit("sqft")}
                        className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${areaUnit === "sqft"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        sq ft
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">

                <table className="w-full text-center text-sm">

                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">Room ID</th>
                            <th>Room Name</th>
                            <th>Type</th>
                            <th>{getAreaLabel()}</th>
                            <th>TR (Thumb Rule)</th>
                            <th>CFM (Thumb Rule)</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rooms.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    No rooms detected yet. Please run room detection first.
                                </td>
                            </tr>
                        ) : (
                            rooms.map((r) => {
                                return (
                                    <tr key={r.id} className="border-t hover:bg-gray-50">
                                        <td className="p-3 font-medium">{r.id}</td>
                                        <td className="p-3">{r.name}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${r.type === "glass"
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-green-100 text-green-600"
                                                }`}>
                                                {r.type}
                                            </span>
                                        </td>
                                        <td className="p-3 font-medium">{getDisplayArea(r.area)}</td>
                                        <td className="p-3 font-semibold text-blue-600">{getTR(r.area)}</td>
                                        <td className="p-3 font-semibold text-purple-600">{getCFM(r.area).toLocaleString()}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>

                    {rooms.length > 0 && (
                        <tfoot className="bg-gray-50 font-semibold">
                            <tr className="border-t">
                                <td colSpan="3" className="p-3 text-right">TOTAL:</td>
                                <td className="p-3">{totalArea.toFixed(areaUnit === "sqm" ? 2 : 0)}</td>
                                <td className="p-3 text-blue-600">{totalTR.toFixed(2)}</td>
                                <td className="p-3 text-purple-600">{totalCFM.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    )}

                </table>
            </div>
            <div className="flex justify-end mt-6">
                <button
                    onClick={onNext}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                    disabled={rooms.length === 0}
                >
                    Proceed →
                </button>
            </div>

        </div>
    );
}