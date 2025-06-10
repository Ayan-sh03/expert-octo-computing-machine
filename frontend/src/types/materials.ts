export interface SpaceGroup {
  symbol: string;
}

export interface Material {
  material_id: string;
  formula_pretty: string;
  crystal_system?: string;
  space_group?: {
    symbol: string;
  };
  band_gap?: number;
  density?: number;
  formation_energy_per_atom?: number;
  volume?: number;
  nsites?: number;
  energy_above_hull?: number;
  is_stable?: boolean;
  theoretical?: boolean;
}

export interface MaterialsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedMaterials: Material[];
  searchResults: Material[];
  isLoading: boolean;
  error: string | null;
  popularMaterials: Material[];
  searchMaterials: (query: string) => void;
  addMaterial: (material: Material) => void;
  removeMaterial: (materialId: string) => void;
  startComparison: () => void;
} 