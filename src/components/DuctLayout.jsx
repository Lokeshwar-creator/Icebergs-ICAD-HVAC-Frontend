import { useState, useRef, useEffect, useCallback } from "react";

/* ─── ROOM DATA ─────────────────────────────────────────────── */
const ROOMS_DATA = [
    { id: "R1", name: "Conference Room A", area: 42.3, perim: 26.4, w: 7.2, h: 5.88, gf: 65, type: "glass", q_wall: 855, q_glass: 1507, q_people: 150, q_total: 2512, tr: 0.714, people: 4, objects: "Chair Set, Table", color: "#0ea5e9", fill: "rgba(14,165,233,0.13)" },
    { id: "R2", name: "Office Suite 1", area: 28.7, perim: 21.8, w: 5.4, h: 5.31, gf: 0, type: "wall", q_wall: 1177, q_glass: 0, q_people: 225, q_total: 1402, tr: 0.399, people: 3, objects: "Desk×3, Chair×3", color: "#22c55e", fill: "rgba(34,197,94,0.12)" },
    { id: "R3", name: "Reception", area: 18.4, perim: 17.6, w: 4.6, h: 4.0, gf: 48, type: "glass", q_wall: 495, q_glass: 1478, q_people: 75, q_total: 2048, tr: 0.582, people: 1, objects: "Sofa, Desk", color: "#0ea5e9", fill: "rgba(14,165,233,0.13)" },
    { id: "R4", name: "Server Room", area: 12.1, perim: 14.4, w: 3.8, h: 3.18, gf: 0, type: "wall", q_wall: 778, q_glass: 0, q_people: 75, q_total: 853, tr: 0.243, people: 1, objects: "Rack×2", color: "#f97316", fill: "rgba(249,115,22,0.12)" },
    { id: "R5", name: "Office Suite 2", area: 31.2, perim: 23.1, w: 6.0, h: 5.2, gf: 0, type: "wall", q_wall: 1247, q_glass: 0, q_people: 225, q_total: 1472, tr: 0.419, people: 4, objects: "Desk×4, Chair×4", color: "#22c55e", fill: "rgba(34,197,94,0.12)" },
    { id: "R6", name: "Meeting Pod B", area: 9.8, perim: 12.8, w: 3.5, h: 2.8, gf: 72, type: "glass", q_wall: 194, q_glass: 1606, q_people: 75, q_total: 1875, tr: 0.533, people: 4, objects: "Table, Chair×4", color: "#0ea5e9", fill: "rgba(14,165,233,0.13)" },
    { id: "R7", name: "Pantry", area: 8.2, perim: 11.6, w: 2.8, h: 2.93, gf: 0, type: "wall", q_wall: 626, q_glass: 0, q_people: 75, q_total: 701, tr: 0.199, people: 1, objects: "Cabinet×2", color: "#a855f7", fill: "rgba(168,85,247,0.12)" },
    { id: "R8", name: "Lobby", area: 55.6, perim: 33.2, w: 9.2, h: 6.04, gf: 55, type: "glass", q_wall: 805, q_glass: 3183, q_people: 150, q_total: 4138, tr: 1.177, people: 8, objects: "Sofa×2, Plant×3", color: "#f43f5e", fill: "rgba(244,63,94,0.12)" },
];

/* ─── FLOOR PLAN ROOM POLYGONS (SVG coords) ─────────────────── */
const ROOM_POLYS = [
    { id: "R1", points: [[60, 50], [320, 50], [320, 210], [60, 210]] },
    { id: "R2", points: [[325, 50], [540, 50], [540, 210], [325, 210]] },
    { id: "R3", points: [[545, 50], [700, 50], [700, 190], [545, 190]] },
    { id: "R4", points: [[60, 215], [235, 215], [235, 330], [60, 330]] },
    { id: "R5", points: [[240, 215], [540, 215], [540, 360], [240, 360]] },
    { id: "R6", points: [[545, 195], [700, 195], [700, 300], [545, 300]] },
    { id: "R7", points: [[60, 335], [235, 335], [235, 430], [60, 430]] },
    { id: "R8", points: [[240, 365], [700, 365], [700, 430], [240, 430]] },
];

/* ─── DUCT SIZING (Equal Friction Method) ───────────────────── */
const sizeDuct = (cfm) => {
    const velocity = 500;
    const area_ft2 = cfm / velocity;
    const dia_in = Math.sqrt(area_ft2 * 4 / Math.PI) * 12;
    const w = Math.round(dia_in * 0.9 / 2) * 2 || 6;
    const h = Math.round(dia_in * 0.7 / 2) * 2 || 4;
    return { dia: dia_in.toFixed(1), w, h, velocity, area: area_ft2 };
};

const calcCFM = (q) => Math.round(q / (1.1 * 18));
const calcACH = (cfm, area) => ((cfm * 0.0283168 * 60) / (area * 3)).toFixed(1);
const ptsToStr = (pts) => pts.map(p => p.join(",")).join(" ");
const ptsCentroid = (pts) => {
    const x = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const y = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    return [x, y];
};

// Calculate polygon area
const calculatePolygonArea = (pts) => {
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        area += pts[i].x * pts[j].y;
        area -= pts[j].x * pts[i].y;
    }
    return Math.abs(area / 2);
};

// Calculate perimeter
const calculatePerimeter = (pts) => {
    let perimeter = 0;
    for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        const dx = pts[j].x - pts[i].x;
        const dy = pts[j].y - pts[i].y;
        perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
};

// Calculate bounding box dimensions
const calculateBoundingBox = (pts) => {
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
        width: maxX - minX,
        height: maxY - minY,
        minX, maxX, minY, maxY
    };
};

// Check if point is inside polygon
const isPointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const intersect = ((yi > point.y) != (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

export default function DuctLayout({ onNext }) {
    const svgRef = useRef(null);
    const [selected, setSelected] = useState(null);
    const [unit, setUnit] = useState("sqm");
    const [showDucts, setShowDucts] = useState(true);
    const [showDuctDetails, setShowDuctDetails] = useState(true);
    const [roomList, setRoomList] = useState(
        ROOMS_DATA.map(r => ({ ...r, include: true }))
    );

    // Coordinate measurement system
    const [measurePoints, setMeasurePoints] = useState([]);
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [tempPoint, setTempPoint] = useState(null);
    const [completedMeasurements, setCompletedMeasurements] = useState([]);
    const [selectedMeasurement, setSelectedMeasurement] = useState(null);
    const [hoverPoint, setHoverPoint] = useState(null);

    // Edit mode states
    const [editingMeasurement, setEditingMeasurement] = useState(null);
    const [editName, setEditName] = useState("");
    const [editAreaValue, setEditAreaValue] = useState("");
    const [editPerimeterValue, setEditPerimeterValue] = useState("");

    /* ── convert svg coords ── */
    const toSVG = useCallback((e) => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        const vb = svg.viewBox.baseVal;
        return {
            x: ((e.clientX - rect.left) / rect.width) * vb.width,
            y: ((e.clientY - rect.top) / rect.height) * vb.height,
        };
    }, []);

    /* ── Coordinate measurement system ── */
    const startMeasurement = () => {
        setIsMeasuring(true);
        setMeasurePoints([]);
        setSelectedMeasurement(null);
        setSelected(null);
        setEditingMeasurement(null);
    };

    const cancelMeasurement = () => {
        setIsMeasuring(false);
        setMeasurePoints([]);
        setTempPoint(null);
    };

    const addMeasurePoint = (point) => {
        if (!isMeasuring) return;

        const newPoints = [...measurePoints, point];
        setMeasurePoints(newPoints);
        setTempPoint(null);
    };

    const completeMeasurement = () => {
        if (measurePoints.length >= 3) {
            const area = calculatePolygonArea(measurePoints);
            const perimeter = calculatePerimeter(measurePoints);
            const bbox = calculateBoundingBox(measurePoints);

            const newMeasurement = {
                id: Date.now(),
                name: `Area ${completedMeasurements.length + 1}`,
                points: [...measurePoints],
                area: area,
                perimeter: perimeter,
                width: bbox.width,
                height: bbox.height,
                minX: bbox.minX,
                maxX: bbox.maxX,
                minY: bbox.minY,
                maxY: bbox.maxY,
                color: "#0ea5e9"
            };

            setCompletedMeasurements([...completedMeasurements, newMeasurement]);
            setSelectedMeasurement(newMeasurement);
            setIsMeasuring(false);
            setMeasurePoints([]);
            setTempPoint(null);
        }
    };

    const handleRightClick = useCallback((e) => {
        e.preventDefault();
        if (isMeasuring && measurePoints.length >= 3) {
            completeMeasurement();
        }
    }, [isMeasuring, measurePoints]);

    const handleCanvasClick = (e) => {
        if (isMeasuring) {
            const point = toSVG(e);
            addMeasurePoint(point);
        } else {
            const point = toSVG(e);
            let clickedMeasurement = null;

            for (let measurement of completedMeasurements) {
                if (isPointInPolygon(point, measurement.points)) {
                    clickedMeasurement = measurement;
                    break;
                }
            }

            if (clickedMeasurement) {
                setSelectedMeasurement(clickedMeasurement);
                setSelected(null);
                setEditingMeasurement(null);
            } else {
                setSelectedMeasurement(null);
            }
        }
    };

    const handleMouseMove = (e) => {
        if (!isMeasuring) {
            const point = toSVG(e);
            setHoverPoint(point);
        } else {
            const point = toSVG(e);
            setTempPoint(point);
        }
    };

    const deleteMeasurement = (id) => {
        setCompletedMeasurements(completedMeasurements.filter(m => m.id !== id));
        if (selectedMeasurement?.id === id) {
            setSelectedMeasurement(null);
        }
        if (editingMeasurement === id) {
            setEditingMeasurement(null);
        }
    };

    // Start editing a measurement
    const startEditing = (measurement) => {
        setEditingMeasurement(measurement.id);
        setEditName(measurement.name);
        setEditAreaValue(measurement.area.toFixed(2));
        setEditPerimeterValue(measurement.perimeter.toFixed(2));
    };

    // Save edited measurement
    const saveEdit = () => {
        setCompletedMeasurements(prev => prev.map(m =>
            m.id === editingMeasurement
                ? {
                    ...m,
                    name: editName,
                    area: parseFloat(editAreaValue),
                    perimeter: parseFloat(editPerimeterValue)
                }
                : m
        ));

        // Update selected measurement if it was the one being edited
        if (selectedMeasurement?.id === editingMeasurement) {
            setSelectedMeasurement({
                ...selectedMeasurement,
                name: editName,
                area: parseFloat(editAreaValue),
                perimeter: parseFloat(editPerimeterValue)
            });
        }

        setEditingMeasurement(null);
        setEditName("");
        setEditAreaValue("");
        setEditPerimeterValue("");
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingMeasurement(null);
        setEditName("");
        setEditAreaValue("");
        setEditPerimeterValue("");
    };

    const onRoomClick = (id) => {
        if (isMeasuring) return;
        const r = roomList.find(x => x.id === id);
        setSelected(r || null);
        setSelectedMeasurement(null);
        setEditingMeasurement(null);
    };

    const toggleInclude = (id) => {
        setRoomList(prev => prev.map(r => r.id === id ? { ...r, include: !r.include } : r));
    };

    const areaDisplay = (a) => unit === "sqm" ? `${a.toFixed(2)} m²` : `${(a * 10.764).toFixed(2)} sqft`;
    const perimDisplay = (p) => unit === "sqm" ? `${p.toFixed(2)} m` : `${(p * 3.281).toFixed(2)} ft`;

    /* ─── PROFESSIONAL DUCT LAYOUT WITH IMPROVED POSITIONING ── */
    const renderDuctSystem = () => {
        if (!showDucts) return null;

        const mainSupplyDuct = [
            { x: 380, y: 150 },
            { x: 380, y: 250 },
            { x: 380, y: 340 },
        ];

        const leftBranchDuct = [
            { x: 380, y: 250 },
            { x: 220, y: 250 },
            { x: 220, y: 290 },
        ];

        const rightBranchDuct = [
            { x: 380, y: 250 },
            { x: 580, y: 250 },
        ];

        return (
            <g>
                <g>
                    <defs>
                        <linearGradient id="ductGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
                        </linearGradient>
                        <filter id="ductShadow">
                            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
                        </filter>
                    </defs>

                    <polyline
                        points={mainSupplyDuct.map(p => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke="url(#ductGrad)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#ductShadow)"
                    />

                    <polyline
                        points={mainSupplyDuct.map(p => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.5"
                    />

                    {showDuctDetails && (
                        <g transform="translate(400, 295)">
                            <rect x="-55" y="-10" width="110" height="20" rx="4" fill="#1e293b" fillOpacity="0.9" stroke="#0ea5e9" strokeWidth="1.5" />
                            <text x="0" y="4" textAnchor="middle" fill="#0ea5e9" fontSize="7" fontFamily="'Courier New'" fontWeight="800">
                                MAIN SUPPLY
                            </text>
                        </g>
                    )}
                </g>

                <g>
                    <polyline
                        points={leftBranchDuct.map(p => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.8"
                    />

                    <polyline
                        points={leftBranchDuct.map(p => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.4"
                    />

                    <g transform="translate(380, 250)">
                        <circle r="8" fill="#22c55e" stroke="white" strokeWidth="2" />
                        <circle r="3" fill="white" />
                        {showDuctDetails && (
                            <text y="15" textAnchor="middle" fill="#22c55e" fontSize="6" fontWeight="800">START</text>
                        )}
                    </g>

                    {showDuctDetails && (
                        <g transform="translate(290, 245)">
                            <rect x="-45" y="-8" width="90" height="16" rx="3" fill="#1e293b" fillOpacity="0.85" stroke="#22c55e" strokeWidth="1" />
                            <text x="0" y="3" textAnchor="middle" fill="#22c55e" fontSize="6.5" fontWeight="700">
                                LEFT ZONE
                            </text>
                        </g>
                    )}
                </g>

                <g>
                    <polyline
                        points={rightBranchDuct.map(p => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.8"
                    />

                    <polyline
                        points={rightBranchDuct.map(p => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.4"
                    />

                    {showDuctDetails && (
                        <g transform="translate(480, 245)">
                            <rect x="-45" y="-8" width="90" height="16" rx="3" fill="#1e293b" fillOpacity="0.85" stroke="#f59e0b" strokeWidth="1" />
                            <text x="0" y="3" textAnchor="middle" fill="#f59e0b" fontSize="6.5" fontWeight="700">
                                RIGHT ZONE
                            </text>
                        </g>
                    )}
                </g>

                {ROOM_POLYS.map(poly => {
                    const room = roomList.find(r => r.id === poly.id);
                    if (!room || !room.include) return null;

                    const [cx, cy] = ptsCentroid(poly.points);
                    const cfm = calcCFM(room.q_total);
                    const ductSize = sizeDuct(cfm);

                    let connectionPoint = { x: cx, y: cy };
                    let ductPath = [];

                    if (poly.id === "R1" || poly.id === "R2" || poly.id === "R3") {
                        connectionPoint = { x: cx, y: cy - 25 };
                        ductPath = [
                            { x: 380, y: 150 },
                            { x: cx, y: 150 },
                            { x: cx, y: cy - 25 }
                        ];
                    } else if (poly.id === "R4" || poly.id === "R7") {
                        connectionPoint = { x: cx - 25, y: cy };
                        ductPath = [
                            { x: 220, y: 290 },
                            { x: cx - 25, y: 290 },
                            { x: cx - 25, y: cy }
                        ];
                    } else if (poly.id === "R5" || poly.id === "R8") {
                        connectionPoint = { x: cx, y: cy - 20 };
                        ductPath = [
                            { x: 380, y: 340 },
                            { x: cx, y: 340 },
                            { x: cx, y: cy - 20 }
                        ];
                    } else if (poly.id === "R6") {
                        connectionPoint = { x: cx + 25, y: cy };
                        ductPath = [
                            { x: 580, y: 250 },
                            { x: cx + 25, y: 250 },
                            { x: cx + 25, y: cy }
                        ];
                    }

                    return (
                        <g key={`duct-${poly.id}`}>
                            <polyline
                                points={ductPath.map(p => `${p.x},${p.y}`).join(" ")}
                                fill="none"
                                stroke={room.color}
                                strokeWidth={Math.min(6, Math.max(3, cfm / 200))}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray="4 2"
                                opacity="0.7"
                            />

                            <g transform={`translate(${ductPath[0].x}, ${ductPath[0].y})`}>
                                <circle r="5" fill={room.color} stroke="white" strokeWidth="1.5" />
                            </g>

                            <g transform={`translate(${connectionPoint.x}, ${connectionPoint.y})`}>
                                <rect x="-10" y="-6" width="20" height="12" rx="2" fill="white" stroke={room.color} strokeWidth="2" />
                                <text x="0" y="3" textAnchor="middle" fill={room.color} fontSize="5" fontWeight="800">
                                    SUP
                                </text>
                            </g>

                            {showDuctDetails && (
                                <>
                                    <g transform={`translate(${ductPath[1]?.x || cx}, ${(ductPath[1]?.y || cy) - 18})`}>
                                        <rect x="-35" y="-7" width="70" height="14" rx="3" fill="white" fillOpacity="0.95" stroke={room.color} strokeWidth="1" />
                                        <text x="0" y="3" textAnchor="middle" fill={room.color} fontSize="6" fontFamily="'Courier New'" fontWeight="700">
                                            {ductSize.w}"×{ductSize.h}"
                                        </text>
                                    </g>

                                    <g transform={`translate(${ductPath[1]?.x || cx}, ${(ductPath[1]?.y || cy) + 18})`}>
                                        <rect x="-30" y="-6" width="60" height="12" rx="2" fill="#1e293b" fillOpacity="0.85" />
                                        <text x="0" y="2" textAnchor="middle" fill={room.color} fontSize="5.5" fontWeight="700">
                                            {cfm} CFM
                                        </text>
                                    </g>
                                </>
                            )}
                        </g>
                    );
                })}

                <g transform="translate(380, 80)">
                    <rect x="-35" y="-25" width="70" height="50" rx="8" fill="#1e293b" stroke="#0ea5e9" strokeWidth="3" filter="url(#ductShadow)" />

                    <circle cx="-20" cy="-12" r="3" fill="#10b981">
                        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="-10" cy="-12" r="3" fill="#0ea5e9" />
                    <circle cx="0" cy="-12" r="3" fill="#f59e0b" />

                    <text x="0" y="2" textAnchor="middle" fill="#0ea5e9" fontSize="10" fontFamily="'Courier New'" fontWeight="800">
                        AHU-01
                    </text>
                    <text x="0" y="14" textAnchor="middle" fill="#64748b" fontSize="6" fontWeight="600">
                        CENTRAL UNIT
                    </text>

                    {showDuctDetails && (
                        <g transform="translate(0, 30)">
                            <rect x="-25" y="-4" width="50" height="8" rx="2" fill="#0ea5e9" fillOpacity="0.3" />
                            <text x="0" y="2" textAnchor="middle" fill="#0ea5e9" fontSize="5" fontWeight="700">
                                SUPPLY AIR →
                            </text>
                        </g>
                    )}
                </g>

                {showDuctDetails && (
                    <g transform="translate(300, 460)">
                        <rect x="-120" y="-8" width="240" height="30" rx="6" fill="white" fillOpacity="0.96" stroke="#cbd5e1" strokeWidth="1.5" filter="url(#ductShadow)" />

                        <line x1="-110" y1="6" x2="-95" y2="6" stroke="#0ea5e9" strokeWidth="4" />
                        <text x="-90" y="9" fill="#64748b" fontSize="6">Main</text>

                        <line x1="-70" y1="6" x2="-55" y2="6" stroke="#22c55e" strokeWidth="3" strokeDasharray="3 2" />
                        <text x="-50" y="9" fill="#64748b" fontSize="6">Branch</text>

                        <rect x="-25" y="2" width="10" height="6" rx="1" fill="white" stroke="#f59e0b" strokeWidth="1.5" />
                        <text x="-10" y="9" fill="#64748b" fontSize="6">Diffuser</text>

                        <circle cx="20" cy="6" r="3" fill="#f59e0b" stroke="white" strokeWidth="1" />
                        <text x="30" y="9" fill="#64748b" fontSize="6">Start</text>

                        <line x1="60" y1="6" x2="75" y2="6" stroke="#10b981" strokeWidth="2" />
                        <text x="80" y="9" fill="#64748b" fontSize="6">Supply</text>
                    </g>
                )}
            </g>
        );
    };

    /* ─── RENDER MEASUREMENT POLYGONS ─────────────────────────── */
    const renderMeasurements = () => {
        return (
            <g>
                {completedMeasurements.map(measurement => {
                    const isSelected = selectedMeasurement?.id === measurement.id;
                    const pointsStr = measurement.points.map(p => `${p.x},${p.y}`).join(" ");
                    const [cx, cy] = [
                        measurement.points.reduce((s, p) => s + p.x, 0) / measurement.points.length,
                        measurement.points.reduce((s, p) => s + p.y, 0) / measurement.points.length
                    ];

                    return (
                        <g key={measurement.id}>
                            <polygon
                                points={pointsStr}
                                fill={isSelected ? "rgba(14,165,233,0.25)" : "rgba(14,165,233,0.12)"}
                                stroke={isSelected ? "#0ea5e9" : "#6366f1"}
                                strokeWidth={isSelected ? 3 : 2}
                                strokeDasharray={isSelected ? "none" : "4 4"}
                                style={{ cursor: "pointer" }}
                            />

                            {(isSelected || (hoverPoint && isPointInPolygon(hoverPoint, measurement.points))) && (
                                <g transform={`translate(${cx}, ${cy - 15})`}>
                                    <rect x="-90" y="-14" width="180" height="28" rx="4" fill="white" fillOpacity="0.95" stroke="#0ea5e9" strokeWidth="1.5" />
                                    <text x="0" y="-3" textAnchor="middle" fill="#0ea5e9" fontSize="6.5" fontFamily="'Courier New'" fontWeight="800">
                                        {measurement.name}
                                    </text>
                                    <text x="0" y="7" textAnchor="middle" fill="#6366f1" fontSize="6" fontFamily="'Courier New'" fontWeight="700">
                                        Area: {areaDisplay(measurement.area)} | Perim: {perimDisplay(measurement.perimeter)}
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}

                {measurePoints.map((point, idx) => (
                    <g key={idx}>
                        <circle cx={point.x} cy={point.y} r="6" fill="#0ea5e9" stroke="white" strokeWidth="2.5" />
                        <text x={point.x + 8} y={point.y - 5} fill="#0ea5e9" fontSize="8" fontFamily="'Courier New'" fontWeight="800">
                            P{idx + 1}
                        </text>
                    </g>
                ))}

                {tempPoint && isMeasuring && (
                    <g>
                        <circle cx={tempPoint.x} cy={tempPoint.y} r="5" fill="rgba(14,165,233,0.4)" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 4" />
                        {measurePoints.length >= 2 && (
                            <line
                                x1={measurePoints[measurePoints.length - 1].x}
                                y1={measurePoints[measurePoints.length - 1].y}
                                x2={tempPoint.x}
                                y2={tempPoint.y}
                                stroke="#0ea5e9"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                            />
                        )}
                    </g>
                )}

                {measurePoints.length >= 2 && (
                    <polyline
                        points={measurePoints.map(p => `${p.x},${p.y}`).join(" ")}
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {measurePoints.length >= 3 && tempPoint && (
                    <line
                        x1={measurePoints[measurePoints.length - 1].x}
                        y1={measurePoints[measurePoints.length - 1].y}
                        x2={measurePoints[0].x}
                        y2={measurePoints[0].y}
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="6 3"
                        opacity="0.6"
                    />
                )}
            </g>
        );
    };

    return (
        <div
            style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "0" }}
            onContextMenu={handleRightClick}
        >
            <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>iC</div>
                    <div>
                        <div style={{ color: "black", fontWeight: 700, fontSize: ".9rem", letterSpacing: ".5px" }}>Duct Layout Designer</div>
                        <div style={{ color: "black", fontSize: ".65rem" }}>ASHRAE 90.1 · Professional Duct Layout · Right-Click to Complete</div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={startMeasurement}
                        disabled={isMeasuring}
                        style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${isMeasuring ? "#cbd5e1" : "#0ea5e9"}`, background: isMeasuring ? "#f1f5f9" : "rgba(14,165,233,.1)", color: isMeasuring ? "#94a3b8" : "#0ea5e9", fontSize: ".72rem", fontWeight: 600, cursor: isMeasuring ? "not-allowed" : "pointer" }}
                    >
                        📐 Measure Area
                    </button>
                    {isMeasuring && (
                        <>
                            <button onClick={cancelMeasurement} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #ef4444", background: "rgba(239,68,68,.1)", color: "#ef4444", fontSize: ".72rem", fontWeight: 600, cursor: "pointer" }}>
                                Cancel
                            </button>
                            {measurePoints.length >= 3 && (
                                <button onClick={completeMeasurement} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #10b981", background: "rgba(16,185,129,.1)", color: "#10b981", fontSize: ".72rem", fontWeight: 600, cursor: "pointer" }}>
                                    Complete
                                </button>
                            )}
                        </>
                    )}
                    <button onClick={() => setShowDucts(v => !v)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${showDucts ? "#0ea5e9" : "#cbd5e1"}`, background: showDucts ? "rgba(14,165,233,.1)" : "transparent", color: showDucts ? "#0ea5e9" : "#64748b", fontSize: ".72rem", fontWeight: 600, cursor: "pointer" }}>
                        {showDucts ? "Hide Ducts" : "Show Ducts"}
                    </button>
                    {showDucts && (
                        <button onClick={() => setShowDuctDetails(v => !v)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${showDuctDetails ? "#10b981" : "#cbd5e1"}`, background: showDuctDetails ? "rgba(16,185,129,.1)" : "transparent", color: showDuctDetails ? "#10b981" : "#64748b", fontSize: ".72rem", fontWeight: 600, cursor: "pointer" }}>
                            {showDuctDetails ? "Hide Details" : "Show Details"}
                        </button>
                    )}
                    <button onClick={() => setUnit(u => u === "sqm" ? "sqft" : "sqm")} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #cbd5e1", background: "transparent", color: "#64748b", fontSize: ".72rem", fontWeight: 600, cursor: "pointer" }}>
                        {unit === "sqm" ? "→ sqft" : "→ m²"}
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", height: "calc(100vh - 57px)" }}>
                <div style={{ background: "white", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10, background: "rgba(255,255,255,0.96)", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: ".65rem", color: "#475569", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", pointerEvents: "none" }}>
                        <div style={{ color: "#0ea5e9", fontWeight: 700, marginBottom: 4 }}>📐 HVAC Duct Layout</div>
                        <div>🔵 Main Trunk | 🟢 🟠 Branch Ducts</div>
                        <div>📍 Branch Start | 🟨 Supply Diffuser</div>
                        <div>🖱 Click rooms | 📏 Measure Area | ✏️ Edit measurements</div>
                    </div>

                    <svg
                        ref={svgRef}
                        viewBox="0 0 760 490"
                        style={{ width: "100%", height: "100%", cursor: isMeasuring ? "crosshair" : "default", backgroundColor: "#ffffff" }}
                        onClick={handleCanvasClick}
                        onMouseMove={handleMouseMove}
                    >
                        <defs>
                            <filter id="selglow">
                                <feGaussianBlur stdDeviation="4" result="b" />
                                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                            <filter id="ductShadow">
                                <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
                            </filter>
                        </defs>

                        <rect x="55" y="45" width="650" height="390" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />

                        <g opacity="0.1">
                            {[...Array(20)].map((_, i) => (
                                <line key={`v-${i}`} x1={50 + i * 35} y1={40} x2={50 + i * 35} y2={440} stroke="#94a3b8" strokeWidth="0.5" />
                            ))}
                            {[...Array(15)].map((_, i) => (
                                <line key={`h-${i}`} x1={50} y1={40 + i * 30} x2={710} y2={40 + i * 30} stroke="#94a3b8" strokeWidth="0.5" />
                            ))}
                        </g>

                        {renderDuctSystem()}

                        {ROOM_POLYS.map(poly => {
                            const room = roomList.find(r => r.id === poly.id);
                            if (!room) return null;
                            const isSel = selected?.id === room.id;
                            const isIncl = room.include;
                            const [cx, cy] = ptsCentroid(poly.points);
                            const cfm = calcCFM(room.q_total);
                            const ductSize = sizeDuct(cfm);

                            return (
                                <g
                                    key={poly.id}
                                    onClick={() => onRoomClick(poly.id)}
                                    style={{ cursor: isMeasuring ? "crosshair" : "pointer" }}
                                >
                                    <polygon
                                        points={ptsToStr(poly.points)}
                                        fill={isIncl ? room.fill : "rgba(30,41,59,0.2)"}
                                        stroke={isSel ? room.color : (isIncl ? room.color : "#cbd5e1")}
                                        strokeWidth={isSel ? 3 : 1.5}
                                        opacity={isIncl ? 1 : 0.5}
                                    />

                                    {isSel && (
                                        <polygon points={ptsToStr(poly.points)} fill={room.color} opacity="0.08" />
                                    )}

                                    <rect x={cx - 50} y={cy - 20} width="100" height="34" rx="5" fill="white" fillOpacity="0.95" stroke={room.color} strokeWidth="1.5" filter="url(#ductShadow)" />

                                    <text x={cx} y={cy - 9} textAnchor="middle" fill={isSel ? room.color : "#1e293b"} fontSize="7.5" fontFamily="'Courier New'" fontWeight="800">
                                        {room.id} · {room.name.length > 10 ? room.name.slice(0, 9) + "…" : room.name}
                                    </text>

                                    <text x={cx} y={cy + 2} textAnchor="middle" fill="#64748b" fontSize="6">
                                        {areaDisplay(room.area)} · {perimDisplay(room.perim)}
                                    </text>

                                    {showDucts && showDuctDetails && (
                                        <>
                                            <line x1={cx - 40} y1={cy + 6} x2={cx + 40} y2={cy + 6} stroke={room.color} strokeWidth="0.5" opacity="0.3" />
                                            <text x={cx} y={cy + 13} textAnchor="middle" fill={room.color} fontSize="5.5" fontFamily="'Courier New'" fontWeight="700">
                                                Duct: {ductSize.w}"×{ductSize.h} | {cfm} CFM
                                            </text>
                                        </>
                                    )}
                                </g>
                            );
                        })}

                        {renderMeasurements()}
                    </svg>
                </div>

                <div style={{ background: "#f8fafc", borderLeft: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {isMeasuring ? (
                        <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
                            <div style={{ background: "linear-gradient(135deg, #0ea5e915, #6366f115)", border: "2px solid #0ea5e9", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                    <div style={{ fontSize: 24 }}>📐</div>
                                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "#0ea5e9" }}>Drawing Mode Active</div>
                                </div>
                                <div style={{ fontSize: ".75rem", color: "#475569", marginBottom: 12 }}>
                                    Click points on the floor plan to define a polygon. Minimum 3 points required.
                                </div>
                                <div style={{ background: "white", borderRadius: 8, padding: "12px", marginBottom: 12 }}>
                                    <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", marginBottom: 8 }}>📍 Defined Points: {measurePoints.length}</div>
                                    {measurePoints.map((p, idx) => (
                                        <div key={idx} style={{ fontSize: ".7rem", fontFamily: "'Courier New'", color: "#0ea5e9", marginBottom: 4 }}>
                                            P{idx + 1}: ({p.x.toFixed(1)}, {p.y.toFixed(1)})
                                        </div>
                                    ))}
                                </div>
                                {measurePoints.length >= 3 && (
                                    <div style={{ background: "#10b98110", border: "1px solid #10b981", borderRadius: 8, padding: "12px" }}>
                                        <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#10b981", marginBottom: 4 }}>✅ Ready to complete!</div>
                                        <div style={{ fontSize: ".65rem", color: "#065f46" }}>Right-click anywhere or press Complete button</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : selectedMeasurement ? (
                        <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                            <div style={{ background: "linear-gradient(135deg, #0ea5e915, #6366f115)", border: "2px solid #0ea5e9", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                    {editingMeasurement === selectedMeasurement.id ? (
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #0ea5e9", fontSize: ".9rem", fontWeight: 700, width: "60%" }}
                                            autoFocus
                                        />
                                    ) : (
                                        <div style={{ fontWeight: 800, fontSize: "1rem", color: "#0ea5e9" }}>
                                            📐 {selectedMeasurement.name}
                                        </div>
                                    )}
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {editingMeasurement === selectedMeasurement.id ? (
                                            <>
                                                <button onClick={saveEdit} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #10b981", background: "rgba(16,185,129,.1)", color: "#10b981", fontSize: ".65rem", cursor: "pointer" }}>
                                                    Save
                                                </button>
                                                <button onClick={cancelEdit} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #f59e0b", background: "rgba(245,158,11,.1)", color: "#f59e0b", fontSize: ".65rem", cursor: "pointer" }}>
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEditing(selectedMeasurement)} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #0ea5e9", background: "rgba(14,165,233,.1)", color: "#0ea5e9", fontSize: ".65rem", cursor: "pointer" }}>
                                                    ✏️ Edit
                                                </button>
                                                <button onClick={() => deleteMeasurement(selectedMeasurement.id)} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #ef4444", background: "rgba(239,68,68,.1)", color: "#ef4444", fontSize: ".65rem", cursor: "pointer" }}>
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: "#fff", borderRadius: 10, padding: "14px", marginBottom: 12, border: "1px solid #e2e8f0" }}>
                                <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#64748b", marginBottom: 12 }}>📊 Dimensions</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                    <div>
                                        <div style={{ fontSize: ".6rem", color: "#94a3b8" }}>Area</div>
                                        {editingMeasurement === selectedMeasurement.id ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                <input
                                                    type="number"
                                                    value={editAreaValue}
                                                    onChange={(e) => setEditAreaValue(e.target.value)}
                                                    step="0.01"
                                                    style={{ width: "80px", padding: "4px 6px", borderRadius: 4, border: "1px solid #0ea5e9", fontSize: ".8rem" }}
                                                />
                                                <span style={{ fontSize: ".7rem" }}>m²</span>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: ".9rem", fontWeight: 800, color: "#0ea5e9" }}>{areaDisplay(selectedMeasurement.area)}</div>
                                        )}
                                    </div>

                                    <div>
                                        <div style={{ fontSize: ".6rem", color: "#94a3b8" }}>Perimeter</div>
                                        {editingMeasurement === selectedMeasurement.id ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                <input
                                                    type="number"
                                                    value={editPerimeterValue}
                                                    onChange={(e) => setEditPerimeterValue(e.target.value)}
                                                    step="0.01"
                                                    style={{ width: "80px", padding: "4px 6px", borderRadius: 4, border: "1px solid #0ea5e9", fontSize: ".8rem" }}
                                                />
                                                <span style={{ fontSize: ".7rem" }}>m</span>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: ".9rem", fontWeight: 800, color: "#6366f1" }}>{perimDisplay(selectedMeasurement.perimeter)}</div>
                                        )}
                                    </div>

                                    <div>
                                        <div style={{ fontSize: ".6rem", color: "#94a3b8" }}>Width (BBox)</div>
                                        <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#10b981" }}>{unit === "sqm" ? selectedMeasurement.width.toFixed(2) : (selectedMeasurement.width * 3.281).toFixed(2)} {unit === "sqm" ? "m" : "ft"}</div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: ".6rem", color: "#94a3b8" }}>Height (BBox)</div>
                                        <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#10b981" }}>{unit === "sqm" ? selectedMeasurement.height.toFixed(2) : (selectedMeasurement.height * 3.281).toFixed(2)} {unit === "sqm" ? "m" : "ft"}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: "#fff", borderRadius: 10, padding: "14px", marginBottom: 12, border: "1px solid #e2e8f0" }}>
                                <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#64748b", marginBottom: 8 }}>📍 Points ({selectedMeasurement.points.length})</div>
                                {selectedMeasurement.points.map((p, idx) => (
                                    <div key={idx} style={{ fontSize: ".7rem", fontFamily: "'Courier New'", color: "#475569", marginBottom: 4 }}>
                                        P{idx + 1}: ({p.x.toFixed(1)}, {p.y.toFixed(1)})
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: "#fef3c7", borderRadius: 8, padding: "8px 12px" }}>
                                <div style={{ fontSize: ".6rem", color: "#92400e" }}>
                                    💡 Tip: Click "Edit" to modify area name, area value, or perimeter value. Width/Height are auto-calculated from bounding box.
                                </div>
                            </div>
                        </div>
                    ) : selected ? (
                        <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
                            <div style={{ background: `linear-gradient(135deg,${selected.color}15,${selected.color}05)`, border: `2px solid ${selected.color}30`, borderRadius: 12, padding: "14px", marginBottom: 12 }}>
                                <div style={{ fontWeight: 800, fontSize: ".95rem", color: "#0f172a" }}>{selected.name}</div>
                                <div style={{ fontSize: ".68rem", color: "#64748b", marginTop: 4 }}>{selected.id} · {selected.objects}</div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                                <div style={{ background: "#fff", borderRadius: 8, padding: "10px", border: "1px solid #e2e8f0" }}>
                                    <div style={{ fontSize: ".6rem", color: "#94a3b8" }}>Area</div>
                                    <div style={{ fontSize: ".85rem", fontWeight: 700 }}>{areaDisplay(selected.area)}</div>
                                </div>
                                <div style={{ background: "#fff", borderRadius: 8, padding: "10px", border: "1px solid #e2e8f0" }}>
                                    <div style={{ fontSize: ".6rem", color: "#94a3b8" }}>Perimeter</div>
                                    <div style={{ fontSize: ".85rem", fontWeight: 700 }}>{perimDisplay(selected.perim)}</div>
                                </div>
                                <div style={{ background: "#fff", borderRadius: 8, padding: "10px", border: "1px solid #e2e8f0" }}>
                                    <div style={{ fontSize: ".6rem", color: "#94a3b8" }}>Heat Load</div>
                                    <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#ef4444" }}>{selected.q_total} W</div>
                                </div>
                                <div style={{ background: "#fff", borderRadius: 8, padding: "10px", border: "1px solid #e2e8f0" }}>
                                    <div style={{ fontSize: ".6rem", color: "#94a3b8" }}>Cooling (TR)</div>
                                    <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#8b5cf6" }}>{selected.tr} TR</div>
                                </div>
                            </div>

                            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px", marginBottom: 12 }}>
                                <div style={{ fontSize: ".65rem", fontWeight: 700, color: "#64748b", marginBottom: 8 }}>💨 Airflow & Duct Sizing</div>
                                {(() => {
                                    const cfm = calcCFM(selected.q_total);
                                    const duct = sizeDuct(cfm);
                                    return (
                                        <>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                                <span style={{ fontSize: ".7rem" }}>Airflow (CFM):</span>
                                                <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#0ea5e9" }}>{cfm} CFM</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                                <span style={{ fontSize: ".7rem" }}>Duct Size:</span>
                                                <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#6366f1" }}>{duct.w}" × {duct.h}"</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ fontSize: ".7rem" }}>Velocity:</span>
                                                <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#10b981" }}>{duct.velocity} FPM</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px" }}>
                                <span style={{ fontSize: ".78rem", fontWeight: 600 }}>Include in Analysis</span>
                                <button onClick={() => toggleInclude(selected.id)} style={{ width: 42, height: 22, borderRadius: 99, border: "none", cursor: "pointer", background: selected.include ? "#0ea5e9" : "#cbd5e1", position: "relative" }}>
                                    <div style={{ position: "absolute", top: 3, left: selected.include ? 22 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .25s" }} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 16, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>📐</div>
                            <div style={{ fontWeight: 700, color: "#374151" }}>Select a Room or Measure Area</div>
                            <div style={{ fontSize: ".75rem", textAlign: "center", color: "#64748b" }}>
                                Click "Measure Area" to draw custom polygons<br />
                                or click any room to view its details<br />
                                <span style={{ color: "#0ea5e9" }}>✏️ Edit measurements after drawing!</span>
                            </div>
                            {completedMeasurements.length > 0 && (
                                <div style={{ width: "100%", marginTop: 12 }}>
                                    <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#64748b", marginBottom: 8 }}>📊 Saved Measurements: {completedMeasurements.length}</div>
                                    {completedMeasurements.map(m => (
                                        <div
                                            key={m.id}
                                            onClick={() => setSelectedMeasurement(m)}
                                            style={{
                                                background: selectedMeasurement?.id === m.id ? `${m.color || "#0ea5e9"}15` : "#fff",
                                                borderRadius: 6,
                                                padding: "8px",
                                                marginBottom: 6,
                                                border: selectedMeasurement?.id === m.id ? `1px solid ${m.color || "#0ea5e9"}` : "1px solid #e2e8f0",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <div style={{ fontSize: ".7rem", fontWeight: 600, color: "#0ea5e9" }}>
                                                📐 {m.name}
                                            </div>
                                            <div style={{ fontSize: ".65rem", color: "#64748b" }}>
                                                Area: {areaDisplay(m.area)} | Perim: {perimDisplay(m.perimeter)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ padding: "12px 16px", borderTop: "1px solid #e2e8f0", background: "#fff" }}>
                        <button onClick={() => { onNext && onNext(); }} style={{ width: "100%", padding: "11px", borderRadius: 9, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "#fff", fontWeight: 700, fontSize: ".85rem", border: "none", cursor: "pointer" }}>
                            Proceed to Export →
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ background: "#fff", borderTop: "1px solid #e2e8f0", maxHeight: "200px", overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".7rem" }}>
                    <thead style={{ position: "sticky", top: 0, background: "#f8fafc" }}>
                        <tr>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>Room</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>Name</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>Area</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>Q Total</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>TR</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>CFM</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>Duct Size</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>Velocity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roomList.filter(r => r.include).map(r => {
                            const cfm = calcCFM(r.q_total);
                            const duct = sizeDuct(cfm);
                            return (
                                <tr key={r.id} onClick={() => onRoomClick(r.id)} style={{ cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "6px 10px", fontWeight: 700, color: r.color }}>{r.id}</td>
                                    <td style={{ padding: "6px 10px" }}>{r.name}</td>
                                    <td style={{ padding: "6px 10px" }}>{areaDisplay(r.area)}</td>
                                    <td style={{ padding: "6px 10px", color: "#ef4444" }}>{r.q_total}W</td>
                                    <td style={{ padding: "6px 10px", color: "#8b5cf6" }}>{r.tr}</td>
                                    <td style={{ padding: "6px 10px", color: "#0ea5e9" }}>{cfm}</td>
                                    <td style={{ padding: "6px 10px", fontFamily: "'Courier New'" }}>{duct.w}"×{duct.h}"</td>
                                    <td style={{ padding: "6px 10px", color: "#10b981" }}>{duct.velocity} FPM</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}