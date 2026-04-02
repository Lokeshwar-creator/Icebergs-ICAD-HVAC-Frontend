import { useNavigate } from "react-router-dom";

export default function ProjectCard({ project }) {
    const navigate = useNavigate();

    return (
        <div className="bg-white p-4 rounded shadow">

            <h3 className="font-semibold">{project.name}</h3>

            <p className="text-sm text-gray-500">
                Last modified: {project.date}
            </p>

            <p className="text-sm">{project.email}</p>
            <p className="text-sm">{project.location}</p>

            <p className="text-xs text-gray-400">
                Project ID: {project.id}
            </p>

            {/* 🔥 NAVIGATION */}
            <button
                onClick={() => navigate(`/project/${project.id}`)}
                className="text-blue-600 mt-2 hover:underline"
            >
                Open Project →
            </button>
        </div>
    );
}