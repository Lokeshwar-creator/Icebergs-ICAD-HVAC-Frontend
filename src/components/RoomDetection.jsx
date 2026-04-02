import { useState } from "react";

/* ✅ ALL 8 ROOMS */
const roomsData = [
    { id: "R1", area: 42.3, type: "glass" },
    { id: "R2", area: 28.7, type: "wall" },
    { id: "R3", area: 18.4, type: "glass" },
    { id: "R4", area: 12.1, type: "wall" },
    { id: "R5", area: 31.2, type: "wall" },
    { id: "R6", area: 9.8, type: "glass" },
    { id: "R7", area: 8.2, type: "wall" },
    { id: "R8", area: 55.6, type: "glass" },
];

/* ✅ UNIT CONVERSION */
const toSqft = (area) => (area * 10.764).toFixed(1);

export default function RoomDetectionAdvanced({ onNext }) {

    /* ✅ ALL ROOMS INCLUDED BY DEFAULT */
    const [roomList, setRoomList] = useState(
        roomsData.map((r, i) => ({
            ...r,
            name: `Room ${i + 1}`,
            include: true,
        }))
    );

    const [selected, setSelected] = useState(null);
    const [unit, setUnit] = useState("sqm");

    /* ✅ TOGGLE INCLUDE */
    const toggleInclude = (id) => {
        const updated = roomList.map((r) =>
            r.id === id ? { ...r, include: !r.include } : r
        );
        setRoomList(updated);
    };

    return (
        <div className="p-6">

            {/* HEADER */}
            <h2 className="font-semibold text-lg mb-4">
                Floor Plan — Room Detection
            </h2>

            <div className="grid grid-cols-3 gap-6">

                <div className="col-span-2 bg-black p-2 rounded-xl shadow">

                    <svg viewBox="0 0 1000 500" className="w-full h-[450px]">

                        {/* BACKGROUND */}
                        <rect x="0" y="0" width="1000" height="500" fill="#0b0f19" />

                        {/* ROOM 1 */}
                        <polygon
                            points="50,50 300,50 300,200 50,200"
                            fill="#2a3b4c"
                            stroke="#8ecae6"
                            strokeWidth="1.5"
                            onClick={() => setSelected(roomList[0])}
                        />
                        <text x="110" y="120" fill="white" fontSize="11" fontFamily="monospace">
                            Room 1
                        </text>
                        <text x="110" y="140" fill="#9ca3af" fontSize="10">
                            {toSqft(roomList[0].area)} sqft
                        </text>

                        {/* ROOM 2 */}
                        <polygon
                            points="300,50 550,50 550,200 300,200"
                            fill="#3d405b"
                            stroke="#cdb4db"
                            strokeWidth="1.5"
                            onClick={() => setSelected(roomList[1])}
                        />
                        <text x="370" y="120" fill="white" fontSize="11" fontFamily="monospace">
                            Room 2
                        </text>
                        <text x="370" y="140" fill="#9ca3af" fontSize="10">
                            {toSqft(roomList[1].area)} sqft
                        </text>

                        {/* ROOM 3 */}
                        <polygon
                            points="50,200 300,200 250,350 50,350"
                            fill="#344e41"
                            stroke="#95d5b2"
                            strokeWidth="1.5"
                            onClick={() => setSelected(roomList[2])}
                        />
                        <text x="110" y="270" fill="white" fontSize="11" fontFamily="monospace">
                            Room 3
                        </text>
                        <text x="110" y="290" fill="#9ca3af" fontSize="10">
                            {toSqft(roomList[2].area)} sqft
                        </text>

                        {/* ROOM 4 */}
                        <polygon
                            points="300,200 550,200 550,350 250,350"
                            fill="#4a4e69"
                            stroke="#9a8c98"
                            strokeWidth="1.5"
                            onClick={() => setSelected(roomList[3])}
                        />
                        <text x="370" y="270" fill="white" fontSize="11" fontFamily="monospace">
                            Room 4
                        </text>
                        <text x="370" y="290" fill="#9ca3af" fontSize="10">
                            {toSqft(roomList[3].area)} sqft
                        </text>

                        {/* ROOM 5 */}
                        <polygon
                            points="550,50 900,50 900,250 550,200"
                            fill="#2b2d42"
                            stroke="#adb5bd"
                            strokeWidth="1.5"
                            onClick={() => setSelected(roomList[4])}
                        />
                        <text x="700" y="140" fill="white" fontSize="11" fontFamily="monospace">
                            Room 5
                        </text>
                        <text x="700" y="160" fill="#9ca3af" fontSize="10">
                            {toSqft(roomList[4].area)} sqft
                        </text>

                        {/* ROOM 6 */}
                        <polygon
                            points="550,200 900,250 900,400 550,350"
                            fill="#1b4332"
                            stroke="#74c69d"
                            strokeWidth="1.5"
                            onClick={() => setSelected(roomList[5])}
                        />
                        <text x="700" y="300" fill="white" fontSize="11" fontFamily="monospace">
                            Room 6
                        </text>
                        <text x="700" y="320" fill="#9ca3af" fontSize="10">
                            {toSqft(roomList[5].area)} sqft
                        </text>

                        {/* ROOM 7 */}
                        <polygon
                            points="50,350 250,350 250,450 50,450"
                            fill="#3a5a40"
                            stroke="#a3b18a"
                            strokeWidth="1.5"
                            onClick={() => setSelected(roomList[6])}
                        />
                        <text x="110" y="410" fill="white" fontSize="11" fontFamily="monospace">
                            Room 7
                        </text>
                        <text x="110" y="430" fill="#9ca3af" fontSize="10">
                            {toSqft(roomList[6].area)} sqft
                        </text>

                        {/* ROOM 8 */}
                        <polygon
                            points="250,350 550,350 550,450 250,450"
                            fill="#22223b"
                            stroke="#c9ada7"
                            strokeWidth="1.5"
                            onClick={() => setSelected(roomList[7])}
                        />
                        <text x="350" y="410" fill="white" fontSize="11" fontFamily="monospace">
                            Room 8
                        </text>
                        <text x="350" y="430" fill="#9ca3af" fontSize="10">
                            {toSqft(roomList[7].area)} sqft
                        </text>

                    </svg>
                </div>



            </div>

            {/* 🔥 UNIT TOGGLE */}
            <div className="flex justify-end mt-4">
                <button
                    onClick={() =>
                        setUnit(unit === "sqm" ? "sqft" : "sqm")
                    }
                    className="px-4 py-2 bg-gray-200 rounded"
                >
                    Toggle to {unit === "sqm" ? "sqft" : "m²"}
                </button>
            </div>

            {/* 🔥 TABLE */}
            <div className="mt-6 bg-white rounded-xl shadow overflow-hidden">

                <h3 className="p-4 font-semibold border-b">
                    Room Data
                </h3>

                <table className="w-full text-sm text-center">

                    <thead className="bg-gray-100">
                        <tr>
                            <th>Room</th>
                            <th>Type</th>
                            <th>Area</th>
                            <th>Perimeter</th>
                            <th>Include</th>
                        </tr>
                    </thead>

                    <tbody>
                        {roomList.map((r) => {
                            const perimeter = (Math.sqrt(r.area) * 4).toFixed(1);

                            return (
                                <tr key={r.id} className="border-t">

                                    <td className="font-medium">{r.name}</td>

                                    <td>
                                        <span className={`px-2 py-1 rounded text-xs ${r.type === "glass"
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-green-100 text-green-600"
                                            }`}>
                                            {r.type}
                                        </span>
                                    </td>

                                    <td>
                                        {unit === "sqm"
                                            ? `${r.area} m²`
                                            : `${toSqft(r.area)} sqft`}
                                    </td>

                                    <td>{perimeter} m</td>

                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={r.include}
                                            onChange={() => toggleInclude(r.id)}
                                        />
                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>

                </table>
            </div>

            {/* 🔥 NEXT BUTTON */}
            <div className="flex justify-end mt-6">
                <button
                    onClick={() => {
                        const selectedRooms = roomList.filter((r) => r.include);

                        localStorage.setItem(
                            "detectedRooms",
                            JSON.stringify(selectedRooms)
                        );

                        onNext();
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Proceed →
                </button>
            </div>

        </div>
    );
}