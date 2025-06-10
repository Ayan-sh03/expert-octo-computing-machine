from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from mp_api.client import MPRester
from dotenv import load_dotenv  
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)
CORS(app)  

MP_API_KEY = os.getenv('MP_API_KEY')

POPULAR_FORMULAS = ['Si', 'GaAs', 'NaCl', 'Fe2O3', 'TiO2', 'Al2O3', 'MgO', 'CaF2']

# Cache for popular materials that expires after 1 hour
popular_materials_cache = {
    'data': None,
    'timestamp': None
}

def filter_material_data(material_dict):
    """Filter material data to only include essential fields for frontend"""
    # Essential fields matching frontend Material interface
    essential_fields = {
        'material_id',
        'formula_pretty', 
        'nsites',
        'volume',
        'density',
        'band_gap',
        'formation_energy_per_atom',
        'energy_above_hull',
        'is_stable',
        'theoretical'
    }
    
    # Create filtered dictionary
    filtered = {}
    for field in essential_fields:
        if field in material_dict:
            filtered[field] = material_dict[field]
    
    # Handle symmetry - extract crystal_system for frontend
    if 'symmetry' in material_dict and material_dict['symmetry']:
        symmetry = material_dict['symmetry']
        filtered['crystal_system'] = str(symmetry.get('crystal_system', ''))
        filtered['space_group'] = {
            'symbol': symmetry.get('symbol', '')
        }
    
    return filtered

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Materials API is running"})

@app.route('/api/materials/popular', methods=['GET'])
def get_popular_materials():
    """Get popular materials for homepage"""
    global popular_materials_cache
    
    # Check if we have valid cached data (less than 1 hour old)
    if (popular_materials_cache['data'] is not None and 
        popular_materials_cache['timestamp'] is not None and
        datetime.now() - popular_materials_cache['timestamp'] < timedelta(hours=1)):
        return jsonify({
            "success": True,
            "data": popular_materials_cache['data'],
            "count": len(popular_materials_cache['data']),
            "cached": True
        })

    try:
        materials = []
        
        with MPRester(MP_API_KEY) as mpr:
            for formula in POPULAR_FORMULAS:  
                try:
                    docs = mpr.materials.summary.search(
                        formula=formula,
                        fields=[
                            "material_id", 
                            "formula_pretty", 
                            "nsites",
                            "volume",
                            "density",
                            "symmetry",
                            "band_gap",
                            "formation_energy_per_atom",
                            "energy_above_hull",
                            "is_stable",
                            "theoretical"
                        ],
                        
                    )

                    if docs and len(docs) > 0:
                        material_dict = docs[0].model_dump()
                        filtered_material = filter_material_data(material_dict)
                        materials.append(filtered_material)
                        
                except Exception as e:
                    print(f"Error fetching {formula}: {str(e)}")
                    continue
        
        # Update cache
        popular_materials_cache['data'] = materials
        popular_materials_cache['timestamp'] = datetime.now()
        
        return jsonify({
            "success": True,
            "data": materials,
            "count": len(materials),
            "cached": False
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch popular materials: {str(e)}"
        }), 500

@app.route('/api/materials/search', methods=['GET'])
def search_materials():
    """Search materials by formula or elements"""
    try:
        query = request.args.get('q', '').strip()
        limit = int(request.args.get('limit', 10))
        
        if not query or len(query) < 2:
            return jsonify({
                "success": False,
                "error": "Query must be at least 2 characters long"
            }), 400
        
        materials = []
        
        with MPRester(MP_API_KEY) as mpr:
            fields = [
                "material_id", 
                "formula_pretty", 
                "nsites",
                "volume",
                "density",
                "symmetry",
                "band_gap",
                "formation_energy_per_atom",
                "energy_above_hull",
                "is_stable",
                "theoretical"
            ]
            
            # Try formula search first, then elements
            docs = []
            try:
                docs = mpr.materials.summary.search(formula=query, fields=fields)
            except:
                try:
                    elements = [elem.strip() for elem in query.replace(',', ' ').split() if elem.strip()]
                    docs = mpr.materials.summary.search(elements=elements, fields=fields)
                except:
                    pass
            
            docs = docs[:limit] if docs else []
            
            for doc in docs:
                material_dict = doc.model_dump()
                filtered_material = filter_material_data(material_dict)
                materials.append(filtered_material)
        
        return jsonify({
            "success": True,
            "data": materials,
            "count": len(materials),
            "query": query
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Search failed: {str(e)}"
        }), 500

@app.route('/api/materials/<material_id>', methods=['GET'])
def get_material_details(material_id):
    """Get material details for comparison"""
    try:
        with MPRester(MP_API_KEY) as mpr:
            docs = mpr.materials.summary.search(
                material_ids=[material_id],
                fields=[
                    "material_id", 
                    "formula_pretty", 
                    "nsites",
                    "volume",
                    "density",
                    "symmetry",
                    "band_gap",
                    "formation_energy_per_atom",
                    "energy_above_hull",
                    "is_stable",
                    "theoretical"
                ]
            )
            
            if not docs:
                return jsonify({
                    "success": False,
                    "error": f"Material {material_id} not found"
                }), 404
            
            material_dict = docs[0].model_dump()
            filtered_material = filter_material_data(material_dict)
            
            return jsonify({
                "success": True,
                "data": filtered_material
            })
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to fetch material: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    print(f"Starting Materials API server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug) 