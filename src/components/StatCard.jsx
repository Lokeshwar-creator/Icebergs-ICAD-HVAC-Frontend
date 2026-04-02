import { Folder, CheckCircle, Clock } from "lucide-react";

export default function StatCard({ title, value }) {
    let Icon;

    if (title.includes("Total")) Icon = Folder;
    else if (title.includes("Completed")) Icon = CheckCircle;
    else Icon = Clock;

    return (
        <div className="bg-white p-4 rounded-xl shadow flex items-center justify-between">

            {/* Left */}
            <div>
                <h4 className="text-gray-500 text-sm">{title}</h4>
                <p className="text-2xl font-bold">{value}</p>
            </div>

            {/* Right Icon */}
            <div className="bg-blue-100 p-3 rounded-full">
                <Icon className="text-blue-600" size={22} />
            </div>

        </div>
    );
}