import MainLayout from "../layout/MainLayout";
import { useParams } from "react-router-dom";
import { useState } from "react";

export default function UploadPage() {
    const { id } = useParams();
    const [file, setFile] = useState(null);

    const handleUpload = () => {
        if (!file) {
            alert("Please select a DWG file");
            return;
        }

        console.log("Uploading:", file.name);

        // 🔥 later → send to backend
        alert("DWG Uploaded Successfully!");
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-3xl mx-auto">

                <h1 className="text-2xl font-bold mb-6">
                    Upload DWG for Project
                </h1>

                <div className="bg-white p-6 rounded-xl shadow">

                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 p-10 text-center rounded-lg">

                        <p className="text-gray-500 mb-3">
                            Drag & Drop your DWG file here
                        </p>

                        <input
                            type="file"
                            accept=".dwg"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="mb-4"
                        />

                        {file && (
                            <p className="text-sm text-gray-600">
                                Selected: {file.name}
                            </p>
                        )}
                        <button
                            onClick={handleUpload}
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
                        >
                            Upload File
                        </button>
                    </div>

                </div>

            </div>
        </MainLayout>
    );
}