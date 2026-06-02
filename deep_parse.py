import re
import json

def deep_parse_catalog(filepath, catalog_name):
    """Deep parse a catalog to extract product names, REF numbers, sizes, and categories."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pages = content.split('--- PAGE ')
    
    # REF number pattern (e.g., 10-002-01-07)
    ref_pattern = re.compile(r'(\d{2}-\d{3}-\d{2}-\d{2})')
    # Size pattern (e.g., "15 cm / 5 7/8"" or "180mm")
    size_cm_pattern = re.compile(r'(\d+(?:,\d+)?(?:\.\d+)?\s*cm)')
    size_mm_pattern = re.compile(r'(\d+(?:,\d+)?(?:\.\d+)?\s*mm)')
    
    # Known product type keywords (English names from the catalog)
    product_keywords = {
        # Scalpels
        'Scalpel Handles': 'Scalpels', 'Scalpel Blades': 'Scalpels', 'Dissecting Knives': 'Scalpels',
        'Blade Holders': 'Scalpels', 'Blade Breakers': 'Scalpels',
        # Scissors
        'Scissors': 'Scissors', 'Operating Scissors': 'Scissors', 'Bandage Scissors': 'Scissors',
        'Dissecting Scissors': 'Scissors', 'Wire Cutting Scissors': 'Scissors',
        'Suture Scissors': 'Scissors', 'Micro Scissors': 'Scissors',
        # Forceps
        'Forceps': 'Forceps', 'Dressing Forceps': 'Forceps', 'Tissue Forceps': 'Forceps',
        'Dissecting Forceps': 'Forceps', 'Micro Forceps': 'Forceps',
        'Bipolar Forceps': 'Forceps', 'Splinter Forceps': 'Forceps',
        # Clamps
        'Artery Forceps': 'Clamps', 'Clamp': 'Clamps', 'Hemostatic': 'Clamps',
        'Ligature Forceps': 'Clamps', 'Bulldog': 'Clamps',
        # Needle Holders
        'Needle Holders': 'Needle Holders', 'Needle Holder': 'Needle Holders',
        # Retractors
        'Retractor': 'Retractors', 'Retractors': 'Retractors', 'Hook': 'Retractors',
        'Spatula': 'Retractors', 'Specula': 'Retractors',
        # Rongeurs (Neurosurgery)
        'Rongeur': 'Rongeurs', 'Rongeurs': 'Rongeurs',
        # Curettes
        'Curette': 'Curettes', 'Curettes': 'Curettes',
        # Bone instruments
        'Bone': 'Bone Instruments', 'Osteotome': 'Bone Instruments', 'Chisel': 'Bone Instruments',
        'Mallet': 'Bone Instruments', 'Rasp': 'Bone Instruments', 'Gouge': 'Bone Instruments',
        # Suction & Probes
        'Suction': 'Suction Instruments', 'Probe': 'Probes', 'Cannula': 'Cannulas',
        'Trocar': 'Trocars',
        # Suture
        'Suture': 'Suture Instruments',
    }
    
    # Known eponymous names in surgical instruments
    eponymous = [
        'Metzenbaum', 'Mayo', 'Iris', 'Stevens', 'Potts', 'Stille', 'Wullstein',
        'Adson', 'DeBakey', 'De Bakey', 'Cooley', 'Deaver', 'Richardson',
        'Langenbeck', 'Kocher', 'Kelly', 'Halsted', 'Mosquito', 'Crile',
        'Allis', 'Babcock', 'Mixter', 'Overholt', 'Satinsky', 'Castroviejo',
        'Webster', 'Hegar', 'Mathieu', 'Ryder', 'Finochietto', 'Balfour',
        'Weitlaner', 'Gelpi', 'Beckmann', 'Farabeuf', 'Volkmann', 'Cushing',
        'Penfield', 'Kerrison', 'Leksell', 'Cloward', 'Scoville', 'Love',
        'Raney', 'Yasargil', 'Hardy', 'Dandy', 'Frazier', 'Taylor',
        'Jansen', 'Olivecrona', 'Gigli', 'Horsley', 'Hajek',
        'Collin', 'Troutman', 'Chris', 'Kaye', 'Virchow',
        'Senn', 'Army-Navy', 'Doyen', 'Roeder', 'Wertheim', 'Heaney',
        'Sims', 'Auvard', 'Breisky', 'Fritsch', 'Bozeman',
        'Hartmann', 'Dennis', 'Rochester', 'Pean', 'Spencer Wells',
        'Mikulicz', 'Ochsner', 'Gemini', 'Backhaus', 'Jones',
        'Jacobson', 'Semken', 'Gerald', 'Gillies', 'Debakey',
        'Micro', 'Titanium', 'TC', 'SuperCut', 'Solid Black',
        'Liston', 'Stille-Luer', 'Beyer', 'Kleinert-Kutz',
        'Rhoton', 'Scott', 'Malis', 'Greenwood', 'Toennis',
    ]
    
    # Build a mapping of page groups to product names
    products_by_group = {}
    current_product_name = ''
    current_category = ''
    current_section = ''
    
    all_products = []
    
    for i, page in enumerate(pages):
        if i < 2:
            continue
            
        page_match = re.match(r'(\d+)\s*---', page)
        if not page_match:
            continue
        page_num = int(page_match.group(1))
        
        lines = page.strip().split('\n')
        
        # Look for product names and categories
        page_title_lines = []
        for line in lines[:15]:
            line = line.strip()
            if not line or re.match(r'^\d+$', line) or line.startswith('---'):
                continue
            if ref_pattern.search(line):
                continue
            page_title_lines.append(line)
        
        # Try to identify the product type from page titles
        found_name = ''
        found_category = ''
        found_eponymous = ''
        
        for title_line in page_title_lines:
            # Check for eponymous names
            for ep in eponymous:
                if ep.lower() in title_line.lower():
                    found_eponymous = ep
                    break
            
            # Check for product type keywords
            for keyword, cat in product_keywords.items():
                if keyword.lower() in title_line.lower():
                    found_category = cat
                    found_name = title_line
                    break
            
            if found_category:
                break
        
        # Extract REF numbers from this page
        refs = ref_pattern.findall(page)
        if not refs:
            continue
        
        # Extract sizes
        sizes_cm = size_cm_pattern.findall(page)
        sizes_mm = size_mm_pattern.findall(page)
        
        # Update current tracking
        if found_name:
            current_product_name = found_name
        if found_category:
            current_category = found_category
        
        # Build product entries
        for ref in refs:
            product = {
                'ref': ref,
                'page': page_num,
                'category': current_category or 'General',
                'name_hint': current_product_name,
                'eponymous': found_eponymous,
            }
            all_products.append(product)
    
    return all_products

print("=== Deep parsing General Surgery ===")
gs = deep_parse_catalog(r"d:\Strucureo\klsmartin\general_surgery_extracted.txt", "General Surgery")
print(f"Total refs: {len(gs)}")

# Category breakdown
cats = {}
for p in gs:
    c = p['category']
    cats[c] = cats.get(c, 0) + 1
print("\nCategory breakdown:")
for c, n in sorted(cats.items(), key=lambda x: -x[1]):
    print(f"  {c}: {n}")

# Show some with names
print("\nSample named products:")
shown = set()
for p in gs:
    key = (p['category'], p['eponymous'])
    if key not in shown and p['eponymous'] and len(shown) < 30:
        shown.add(key)
        print(f"  [{p['category']}] {p['eponymous']} - REF: {p['ref']} (pg {p['page']})")

print("\n\n=== Deep parsing Neurosurgery ===")
ns = deep_parse_catalog(r"d:\Strucureo\klsmartin\neurosurgery_extracted.txt", "Neurosurgery")
print(f"Total refs: {len(ns)}")

cats2 = {}
for p in ns:
    c = p['category']
    cats2[c] = cats2.get(c, 0) + 1
print("\nCategory breakdown:")
for c, n in sorted(cats2.items(), key=lambda x: -x[1]):
    print(f"  {c}: {n}")

print("\nSample named products:")
shown2 = set()
for p in ns:
    key = (p['category'], p['eponymous'])
    if key not in shown2 and p['eponymous'] and len(shown2) < 30:
        shown2.add(key)
        print(f"  [{p['category']}] {p['eponymous']} - REF: {p['ref']} (pg {p['page']})")
