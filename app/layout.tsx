import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "Precision AI Scout | VC Intelligence",
    description: "Thesis-driven discovery workflow for modern venture capital.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} font-sans`}>
                <div className="flex min-h-screen">
                    <Sidebar />
                    <div className="flex-1 flex flex-col bg-bgDark">
                        <header className="sticky top-0 z-10 bg-bgDark/80 backdrop-blur-md px-8 py-4 border-b border-borderDark/40">
                            <SearchBar />
                        </header>
                        <main className="flex-1 p-8 overflow-y-auto">
                            <div className="max-w-7xl mx-auto">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
}
