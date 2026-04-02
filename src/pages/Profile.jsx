import MainLayout from "../layout/MainLayout";
import StatCard from "../components/StatCard";
import ProjectCard from "../components/ProjectCard";

export default function Profile() {
    const user = JSON.parse(localStorage.getItem("user"));
    const projects =
        JSON.parse(localStorage.getItem(`projects_${user?.email}`)) || [];

    return (
        <MainLayout>
            <div className="p-6 space-y-6">

                {/* User */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold">User Profile</h2>
                    <p className="mt-2">Email: {user?.email}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard title="Total Projects" value={projects.length} />
                    <StatCard
                        title="Completed Projects"
                        value={projects.filter(p => p.status === "completed").length}
                    />
                    <StatCard
                        title="In Progress"
                        value={projects.filter(p => p.status === "in-progress").length}
                    />
                </div>

                {/* Projects */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Your Projects</h3>

                    <div className="grid grid-cols-2 gap-4">
                        {projects.map((p, i) => (
                            <ProjectCard key={i} project={p} />
                        ))}
                    </div>
                </div>

            </div>
        </MainLayout>
    );
}