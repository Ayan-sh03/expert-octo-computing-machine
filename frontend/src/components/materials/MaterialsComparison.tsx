'use client';

import { useState, useEffect } from 'react';
import { Material } from '@/types/materials';


export default function MaterialsComparison() {
  const [currentPage, setCurrentPage] = useState<'home' | 'comparison'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
  const [searchResults, setSearchResults] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popularMaterials, setPopularMaterials] = useState<Material[]>([]);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  
  // Fetch popular materials on component mount
  useEffect(() => {
    fetchPopularMaterials();
  }, []);

  const fetchPopularMaterials = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/materials/popular`);
      const data = await response.json();
      
      if (data.success) {
        setPopularMaterials(data.data);
      }
    } catch (error) {
      console.error('Error fetching popular materials:', error);
    }
  };

  const searchMaterials = async (query: string) => {
    if (query.length < 2) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/materials/search?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
      } else {
        setError(data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addMaterial = (material: Material) => {
    // Check if the material is already selected
    if (selectedMaterials.length < 2 && !selectedMaterials.find(m => m.material_id === material.material_id)) {
      setSelectedMaterials([...selectedMaterials, material]);
    }
    setSearchResults([]);
    setSearchQuery('');
  };

  const removeMaterial = (materialId: string) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.material_id !== materialId));
  };

  const startComparison = () => {
    if (selectedMaterials.length === 2) {
      setCurrentPage('comparison');
    }
  };

  if (currentPage === 'comparison') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Material Comparison</h1>
            <button 
              onClick={() => setCurrentPage('home')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Search
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedMaterials.map((material) => (
              <div key={material.material_id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">{material.formula_pretty}</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">ID:</span> {material.material_id}</p>
                  <p><span className="font-medium">Crystal System:</span> {material.crystal_system || 'N/A'}</p>
                  <p><span className="font-medium">Band Gap:</span> {material.band_gap?.toFixed(3) || 'N/A'} eV</p>
                  <p><span className="font-medium">Density:</span> {material.density?.toFixed(3) || 'N/A'} g/cm³</p>
                  <p><span className="font-medium">Volume:</span> {material.volume?.toFixed(2) || 'N/A'} Ų</p>
                  <p><span className="font-medium">Sites:</span> {material.nsites || 'N/A'}</p>
                  <p><span className="font-medium">Formation Energy:</span> {material.formation_energy_per_atom?.toFixed(3) || 'N/A'} eV/atom</p>
                  <p><span className="font-medium">Energy Above Hull:</span> {material.energy_above_hull?.toFixed(3) || 'N/A'} eV/atom</p>
                  <p><span className="font-medium">Stable:</span> {material.is_stable ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Theoretical:</span> {material.theoretical ? 'Yes' : 'No'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Materials Search & Compare</h1>
        
        {/* Search Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Search Materials</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.length >= 2) {
                  searchMaterials(e.target.value);
                }
              }}
              placeholder="Search by formula (e.g., Si, Fe2O3) or element (e.g., Fe)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          
          {isLoading && <p className="mt-2 text-blue-500">Searching...</p>}
          {error && <p className="mt-2 text-red-500">{error}</p>}
          
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-medium">Search Results:</h3>
              {searchResults.map((material) => (
                <div key={material.material_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{material.formula_pretty}</span>
                    <span className="text-sm text-gray-600 ml-2">({material.material_id})</span>
                  </div>
                  <button
                    onClick={() => addMaterial(material)}
                    disabled={selectedMaterials.length >= 2 || selectedMaterials.find(m => m.material_id === material.material_id) !== undefined}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Materials */}
        {selectedMaterials.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-bold mb-4">Selected Materials ({selectedMaterials.length}/2)</h2>
            <div className="space-y-2">
              {selectedMaterials.map((material) => (
                <div key={material.material_id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="font-medium">{material.formula_pretty}</span>
                  <button
                    onClick={() => removeMaterial(material.material_id)}
                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {selectedMaterials.length === 2 && (
              <button
                onClick={startComparison}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Compare Materials
              </button>
            )}
          </div>
        )}

        {/* Popular Materials */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Popular Materials</h2>
          {popularMaterials.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularMaterials.map((material) => (
                <button
                  key={material.material_id}
                  onClick={() => addMaterial(material)}
                  disabled={selectedMaterials.length >= 2 || selectedMaterials.find(m => m.material_id === material.material_id) !== undefined}
                  className="p-4 bg-gray-50 hover:bg-blue-50 rounded border text-center disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  <div className="font-bold">{material.formula_pretty}</div>
                  <div className="text-sm text-gray-600">{material.crystal_system}</div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Loading popular materials...</p>
          )}
        </div>
      </div>
    </div>
  );
} 