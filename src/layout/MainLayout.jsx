import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">

            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-grow pt-16 px-4 md:px-6">
                {children}
            </main>

            {/* Footer */}
            <Footer />

        </div>
    );
}