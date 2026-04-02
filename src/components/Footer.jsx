export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 text-sm py-3">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">

                {/* Left */}
                <p className="text-xs">
                    © {new Date().getFullYear()} IcebergTech. All rights reserved.
                </p>

                {/* Right */}
                <p className="text-xs mt-1 md:mt-0">
                    HVAC Design Platform
                </p>

            </div>
        </footer>
    );
}