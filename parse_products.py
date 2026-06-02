import re
import json

def parse_general_surgery(filepath):
    """Parse General Surgery catalog text to extract products."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pages = content.split('--- PAGE ')
    
    # Category mapping based on table of contents (page 20-22)
    # Page ranges for each category
    categories = {
        'Scalpels': {'pages': range(23, 40), 'de': 'Skalpelle'},
        'Scissors': {'pages': range(40, 150), 'de': 'Scheren'},
        'Forceps': {'pages': range(150, 200), 'de': 'Pinzetten'},
        'Artery Forceps': {'pages': range(200, 260), 'de': 'Arterienklemmen'},
        'Cotton Swap Forceps': {'pages': range(260, 275), 'de': 'Tupfer- und Kornzangen'},
        'Retractors': {'pages': range(275, 400), 'de': 'Wundhaken'},
        'Probes & Spatulas': {'pages': range(400, 420), 'de': 'Sonden, Watteträger, Spatel'},
        'Diagnostics': {'pages': range(420, 435), 'de': 'Diagnostik'},
        'Trocars & Suction Tubes': {'pages': range(435, 460), 'de': 'Trokare, Sauger'},
        'Anaesthesia': {'pages': range(460, 480), 'de': 'Narkose'},
        'Suture': {'pages': range(480, 520), 'de': 'Naht'},
        'Dressings': {'pages': range(520, 535), 'de': 'Verband'},
        'Bone Surgery': {'pages': range(535, 620), 'de': 'Knochenchirurgie'},
        'Stomach & Intestines': {'pages': range(620, 660), 'de': 'Magen, Darm, Rektum'},
        'Liver & Kidney': {'pages': range(660, 680), 'de': 'Leber, Galle, Niere'},
        'Urology': {'pages': range(680, 700), 'de': 'Urologie'},
        'Gynecology': {'pages': range(700, 750), 'de': 'Gynäkologie'},
        'Obstetrics': {'pages': range(750, 770), 'de': 'Geburtshilfe'},
        'Otology': {'pages': range(770, 800), 'de': 'Otologie'},
        'Rhinology': {'pages': range(800, 830), 'de': 'Rhinologie'},
        'Tonsillectomy': {'pages': range(830, 850), 'de': 'Tonsillektomie'},
        'Dental & Oral Surgery': {'pages': range(850, 860), 'de': 'Dental'},
        'Miscellaneous': {'pages': range(860, 880), 'de': 'Verschiedenes'},
    }
    
    # Extract all REF numbers and associated data
    ref_pattern = re.compile(r'(\d{2}-\d{3}-\d{2}-\d{2})')
    size_pattern = re.compile(r'(\d+(?:,\d+)?(?:\.\d+)?\s*(?:cm|mm)\s*/\s*\d+\s*\d*/\d*\s*"?)')
    
    products = []
    seen_refs = set()
    
    for i, page in enumerate(pages):
        if i < 23:  # Skip intro pages
            continue
        
        # Find REF numbers on this page
        refs = ref_pattern.findall(page)
        if not refs:
            continue
        
        # Get page number
        page_match = re.match(r'(\d+)\s*---', page)
        page_num = int(page_match.group(1)) if page_match else i
        
        # Determine category
        category = 'General'
        for cat_name, cat_info in categories.items():
            if page_num in cat_info['pages']:
                category = cat_name
                break
        
        # Get product name from page - look for English name
        lines = page.strip().split('\n')
        product_name = ''
        for line in lines[:10]:
            line = line.strip()
            # Skip page numbers, empty lines, catalog refs
            if line and not re.match(r'^\d+$', line) and not ref_pattern.match(line):
                if len(line) > 3 and not line.startswith('---'):
                    product_name = line
                    break
        
        # Extract sizes
        sizes = size_pattern.findall(page)
        
        for ref in refs:
            if ref not in seen_refs:
                seen_refs.add(ref)
                products.append({
                    'ref': ref,
                    'page': page_num,
                    'category': category,
                    'name_raw': product_name,
                })
    
    return products

def parse_neurosurgery(filepath):
    """Parse Neurosurgery catalog text to extract products."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pages = content.split('--- PAGE ')
    
    ref_pattern = re.compile(r'(\d{2}-\d{3}-\d{2}-\d{2})')
    
    products = []
    seen_refs = set()
    
    for i, page in enumerate(pages):
        if i < 15:  # Skip intro pages
            continue
        
        refs = ref_pattern.findall(page)
        if not refs:
            continue
        
        page_match = re.match(r'(\d+)\s*---', page)
        page_num = int(page_match.group(1)) if page_match else i
        
        lines = page.strip().split('\n')
        product_name = ''
        for line in lines[:10]:
            line = line.strip()
            if line and not re.match(r'^\d+$', line) and not ref_pattern.match(line):
                if len(line) > 3 and not line.startswith('---'):
                    product_name = line
                    break
        
        for ref in refs:
            if ref not in seen_refs:
                seen_refs.add(ref)
                products.append({
                    'ref': ref,
                    'page': page_num,
                    'name_raw': product_name,
                })
    
    return products


# Parse both catalogs
print("Parsing General Surgery catalog...")
gs_products = parse_general_surgery(r"d:\Strucureo\klsmartin\general_surgery_extracted.txt")
print(f"Found {len(gs_products)} unique REF numbers")

print("\nParsing Neurosurgery catalog...")
ns_products = parse_neurosurgery(r"d:\Strucureo\klsmartin\neurosurgery_extracted.txt")
print(f"Found {len(ns_products)} unique REF numbers")

# Show category breakdown for General Surgery
print("\n=== GENERAL SURGERY - Category Breakdown ===")
cat_counts = {}
for p in gs_products:
    cat = p['category']
    cat_counts[cat] = cat_counts.get(cat, 0) + 1
for cat, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
    print(f"  {cat}: {count} products")

# Show sample products from each category
print("\n=== SAMPLE PRODUCTS (General Surgery) ===")
shown_cats = set()
for p in gs_products:
    if p['category'] not in shown_cats and len(shown_cats) < 15:
        shown_cats.add(p['category'])
        print(f"  [{p['category']}] REF: {p['ref']} - {p['name_raw'][:60]}")

print("\n=== SAMPLE PRODUCTS (Neurosurgery) ===")
for p in ns_products[:20]:
    print(f"  REF: {p['ref']} - {p['name_raw'][:60]}")

# Save all parsed data
with open(r"d:\Strucureo\klsmartin\parsed_gs_products.json", 'w', encoding='utf-8') as f:
    json.dump(gs_products, f, indent=2, ensure_ascii=False)

with open(r"d:\Strucureo\klsmartin\parsed_ns_products.json", 'w', encoding='utf-8') as f:
    json.dump(ns_products, f, indent=2, ensure_ascii=False)

print(f"\nSaved to parsed_gs_products.json and parsed_ns_products.json")
print(f"\nTOTAL: {len(gs_products) + len(ns_products)} unique products across both catalogs")
