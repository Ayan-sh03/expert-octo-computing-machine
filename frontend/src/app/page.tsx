'use client';
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Materials Compare</h1>
        <p className="text-lg text-gray-600 mb-8">
          Search and compare materials using the Materials Project database
        </p>
        <Link 
          href="/materials"
          className="inline-block bg-blue-500 text-white px-8 py-3 rounded text-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Start Comparing Materials
        </Link>
      </div>
    </div>
  );
}
