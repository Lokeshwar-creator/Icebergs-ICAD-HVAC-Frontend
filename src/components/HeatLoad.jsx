import { useEffect, useState } from "react";

/* CALCULATIONS */
const calcWall = (area) => area * 20;
const calcGlass = (area, type) => (type === "glass" ? area * 80 : 0);
const calcPeople = (area) => area * 5;

export default function HeatLoad({ onNext }) {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("detectedRooms")) || [];
        setRooms(data);
    }, []);

    return (
        <div className="p-6">
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-center text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3">Room ID</th>
                            <th>Room Name</th>
                            <th>Type</th>
                            <th>TR</th>
                            <th>CFM</th>
                            <th>Q Wall (W)</th>
                            <th>Q Glass (W)</th>
                            <th>Q People (W)</th>
                            <th>Total Heat (W)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((r) => {
                            const wall = calcWall(r.area);
                            const glass = calcGlass(r.area, r.type);
                            const people = calcPeople(r.area);

                            const total = wall + glass + people;
                            const tr = (total / 3500).toFixed(3);
                            const cfm = Math.round(total / (1.1 * 18));

                            return (
                                <tr key={r.id} className="border-t">
                                    <td className="p-3">{r.id}</td>
                                    <td>{r.name}</td>
                                    <td>
                                        <span className={`px-2 py-1 rounded text-xs ${r.type === "glass"
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-green-100 text-green-600"
                                            }`}>
                                            {r.type}
                                        </span>
                                    </td>
                                    <td className="font-semibold text-blue-600">{tr}</td>
                                    <td className="font-semibold text-purple-600">{cfm}</td>
                                    <td>{wall}</td>
                                    <td>{glass}</td>
                                    <td>{people}</td>
                                    <td className="font-semibold">{total}</td>
                                </tr>
                            );
                        })}
                    </tbody>

                </table>
            </div>

            <div className="flex justify-end mt-6">
                <button
                    onClick={onNext}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Proceed →
                </button>
            </div>

        </div>
    );
} 