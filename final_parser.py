"""
Final comprehensive parser for KLS Martin catalogs.
Extracts structured product data suitable for the React demo website.
"""
import re
import json

def extract_products_final(filepath, catalog_type):
    """Extract structured products from the extracted catalog text."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pages = content.split('--- PAGE ')
    ref_pattern = re.compile(r'(\d{2}-\d{3}-\d{2}-\d{2})')
    size_pattern = re.compile(r'(\d+(?:,\d+)?)\s*cm\s*/\s*(\d+\s*\d*/\d*\s*"?)')
    mm_pattern = re.compile(r'(\d+)\s*mm')
    
    # Track product groups (pages that share the same heading)
    product_groups = []
    current_group = None
    
    # Known English product type names mapped from the catalogs
    english_names = {
        # Scalpels section
        'Anatomische Skalpelle': 'Dissecting Knives',
        'Skalpellgriffe': 'Scalpel Handles',
        'Skalpellklingen': 'Scalpel Blades',
        'Einmalskalpelle': 'Disposable Scalpels',
        'Amputationsmesser': 'Amputation Knives',
        'Dermatom': 'Dermatome',
        'Klingenhalter': 'Blade Holders',
        
        # Scissors section
        'Chirurgische Scheren': 'Operating Scissors',
        'Präparierscheren': 'Dissecting Scissors',
        'Fadenscheren': 'Suture Scissors',
        'Verbandsscheren': 'Bandage Scissors',
        'Drahtscheren': 'Wire Cutting Scissors',
        'Gefäßscheren': 'Vascular Scissors',
        'Mikro-Scheren': 'Micro Scissors',
        'Nahtmaterialscheren': 'Suture Material Scissors',
        
        # Forceps section
        'Anatomische Pinzetten': 'Anatomical Forceps',
        'Chirurgische Pinzetten': 'Surgical Forceps',
        'Gewebefasspinzetten': 'Tissue Forceps',
        'Splitterpinzetten': 'Splinter Forceps',
        'Verbandpinzetten': 'Dressing Forceps',
        'Mikro-Pinzetten': 'Micro Forceps',
        'Bipolare Pinzetten': 'Bipolar Forceps',
        'Bayonett-Pinzetten': 'Bayonet Forceps',
        
        # Clamps section
        'Arterienklemmen': 'Artery Forceps',
        'Gefäßklemmen': 'Vascular Clamps',
        'Darmklemmen': 'Intestinal Clamps',
        
        # Needle Holders
        'Nadelhalter': 'Needle Holders',
        'Mikro-Nadelhalter': 'Micro Needle Holders',
        
        # Retractors
        'Wundhaken': 'Retractors',
        'Scharfe Wundhaken': 'Sharp Retractors',
        'Stumpfe Wundhaken': 'Blunt Retractors',
        'Bauchdeckenhaken': 'Abdominal Retractors',
        'Selbsthaltende Wundsperrer': 'Self-Retaining Retractors',
        'Rippenspreizer': 'Rib Spreaders',
        'Hirnspatel': 'Brain Spatulas',
        
        # Rongeurs
        'Laminektomiestanzen': 'Laminectomy Punches',
        'Rongeure': 'Rongeurs',
        'Knochenstanzen': 'Bone Punches',
        'Hohlmeißelzangen': 'Bone Rongeurs',
        
        # Bone instruments
        'Knochenscheren': 'Bone Cutting Scissors',
        'Osteotome': 'Osteotomes',
        'Meißel': 'Chisels',
        'Raspatorien': 'Raspatories',
        'Knochenküretten': 'Bone Curettes',
        'Knochenfaßzangen': 'Bone Holding Forceps',
        'Drahtzangen': 'Wire Instruments',
        
        # Suction
        'Sauger': 'Suction Tubes',
        'Saugrohre': 'Suction Tubes',
        
        # Suture
        'Naht': 'Suture Instruments',
        'Wundnadeln': 'Suture Needles',
        
        # Neurosurgery specific
        'Hypophysen-Instrumente': 'Pituitary Instruments',
        'Hypophysenzangen': 'Pituitary Rongeurs',
        'Hypophysenlöffel': 'Pituitary Curettes',
    }
    
    # Eponymous name detection
    eponymous_names = [
        'Metzenbaum', 'Mayo', 'Iris', 'Stevens', 'Potts', 'Stille', 'Wullstein',
        'Adson', 'DeBakey', 'De Bakey', 'Cooley', 'Deaver', 'Richardson',
        'Langenbeck', 'Kocher', 'Kelly', 'Halsted', 'Mosquito', 'Crile',
        'Allis', 'Babcock', 'Mixter', 'Overholt', 'Satinsky', 'Castroviejo',
        'Webster', 'Hegar', 'Mathieu', 'Ryder', 'Finochietto', 'Balfour',
        'Weitlaner', 'Gelpi', 'Beckmann', 'Farabeuf', 'Volkmann', 'Cushing',
        'Penfield', 'Kerrison', 'Leksell', 'Cloward', 'Scoville', 'Love',
        'Raney', 'Yasargil', 'Hardy', 'Dandy', 'Frazier', 'Taylor',
        'Jansen', 'Olivecrona', 'Gigli', 'Horsley', 'Hajek',
        'Collin', 'Troutman', 'Kaye', 'Virchow', 'Knapp', 'Liston',
        'Senn', 'Doyen', 'Roeder', 'Wertheim', 'Heaney',
        'Sims', 'Auvard', 'Breisky', 'Fritsch', 'Bozeman',
        'Hartmann', 'Dennis', 'Rochester', 'Pean', 'Spencer Wells',
        'Mikulicz', 'Ochsner', 'Backhaus', 'Jones',
        'Jacobson', 'Semken', 'Gerald', 'Gillies',
        'Stille-Luer', 'Beyer', 'Kleinert-Kutz',
        'Rhoton', 'Scott', 'Malis', 'Greenwood', 'Toennis',
        'Ferris-Smith-Kerrison', 'Ferris-Smith', 'Humby', 'Schink', 'Silver',
        'Salyer', 'Dietrich', 'Bengolea', 'Crafoord', 'Dandy',
        'Hudson', 'Raney', 'Penfield', 'Woodson', 'Adson-Brown',
        'Potts-Smith', 'Mayo-Hegar', 'Crile-Wood', 'Olsen-Hegar',
        'Wangensteen', 'Sauerbruch', 'Zenker', 'O\'Sullivan-O\'Connor',
        'Toennis-Adson', 'Meyerding', 'Taylor', 'Army-Navy',
    ]
    
    # Category assignment based on German/English keywords in page text
    def detect_category(text):
        text_lower = text.lower()
        if any(w in text_lower for w in ['skalpell', 'scalpel', 'messer', 'knive', 'dermatom']):
            return 'Scalpels'
        if any(w in text_lower for w in ['schere', 'scissor', 'forbici']):
            return 'Scissors'
        if any(w in text_lower for w in ['pinzett', 'forceps', 'pinze', 'bipolar']):
            return 'Forceps'
        if any(w in text_lower for w in ['arterienklemm', 'artery forceps', 'klemm', 'clamp', 'hemosta']):
            return 'Clamps'
        if any(w in text_lower for w in ['nadelhalter', 'needle holder', 'portaghi']):
            return 'Needle Holders'
        if any(w in text_lower for w in ['wundhak', 'retract', 'divaricator', 'spatel', 'spatula', 'specula', 'haken']):
            return 'Retractors'
        if any(w in text_lower for w in ['stanz', 'punch', 'rongeur', 'hohlmei']):
            return 'Rongeurs'
        if any(w in text_lower for w in ['kürette', 'curette', 'löffel']):
            return 'Curettes'
        if any(w in text_lower for w in ['knochen', 'bone', 'osteotom', 'meißel', 'chisel', 'raspat', 'rasp', 'säge', 'saw']):
            return 'Bone Instruments'
        if any(w in text_lower for w in ['saug', 'suction', 'aspirat']):
            return 'Suction Instruments'
        if any(w in text_lower for w in ['kanüle', 'cannula']):
            return 'Cannulas'
        if any(w in text_lower for w in ['trokar', 'trocar']):
            return 'Trocars'
        if any(w in text_lower for w in ['naht', 'suture', 'nadel', 'needle']):
            return 'Suture Instruments'
        if any(w in text_lower for w in ['hypophys', 'pituitary']):
            return 'Pituitary Instruments'
        if any(w in text_lower for w in ['diagnostik', 'diagnostic']):
            return 'Diagnostics'
        if any(w in text_lower for w in ['tupfer', 'kornzang', 'cotton swap', 'sponge']):
            return 'Cotton Swap Forceps'
        if any(w in text_lower for w in ['narko', 'anaesth', 'anestesi']):
            return 'Anaesthesia'
        if any(w in text_lower for w in ['verband', 'dressing']):
            return 'Dressings'
        if any(w in text_lower for w in ['urolog']):
            return 'Urology'
        if any(w in text_lower for w in ['gynäkolog', 'gynecol']):
            return 'Gynecology'
        if any(w in text_lower for w in ['otolog', 'otology']):
            return 'Otology'
        if any(w in text_lower for w in ['rhinolog', 'rhinology']):
            return 'Rhinology'
        if any(w in text_lower for w in ['hirnspat', 'brain spat']):
            return 'Brain Spatulas'
        if any(w in text_lower for w in ['laminekt', 'laminect']):
            return 'Laminectomy Punches'
        return None
    
    def detect_english_name(text):
        for de, en in english_names.items():
            if de.lower() in text.lower():
                return en
        return None
    
    def detect_eponymous(text):
        found = []
        for ep in eponymous_names:
            if ep.lower() in text.lower():
                found.append(ep)
        return found
    
    # Process each page
    all_groups = {}
    current_heading = ''
    current_category = 'General'
    current_english = ''
    
    for i, page in enumerate(pages):
        if i < 2:
            continue
        
        page_match = re.match(r'(\d+)\s*---', page)
        if not page_match:
            continue
        page_num = int(page_match.group(1))
        
        lines = page.strip().split('\n')
        
        # Get header lines (first ~12 non-empty, non-ref lines)
        header_text = '\n'.join(lines[:15])
        
        # Detect category from header
        cat = detect_category(header_text)
        if cat:
            current_category = cat
        
        # Detect English product name
        en_name = detect_english_name(header_text)
        if en_name:
            current_english = en_name
        
        # Detect eponymous names
        eponyms = detect_eponymous(page)
        
        # Extract REF numbers
        refs_found = ref_pattern.findall(page)
        if not refs_found:
            continue
        
        # Extract sizes from page
        sizes = size_pattern.findall(page)
        mms = mm_pattern.findall(page)
        
        # Group REFs with this product type
        group_key = f"{current_category}|{current_english}"
        if group_key not in all_groups:
            all_groups[group_key] = {
                'category': current_category,
                'product_type': current_english,
                'refs': [],
                'eponymous_names': set(),
                'sizes': set(),
                'pages': set(),
            }
        
        group = all_groups[group_key]
        for ref in refs_found:
            if ref not in group['refs']:
                group['refs'].append(ref)
        for ep in eponyms:
            group['eponymous_names'].add(ep)
        for s in sizes:
            group['sizes'].add(f"{s[0]} cm")
        for m in mms:
            group['sizes'].add(f"{m} mm")
        group['pages'].add(page_num)
    
    return all_groups

# Process both catalogs
print("Processing General Surgery catalog...")
gs_groups = extract_products_final(
    r"d:\Strucureo\klsmartin\general_surgery_extracted.txt",
    "general-surgery"
)

print("Processing Neurosurgery catalog...")
ns_groups = extract_products_final(
    r"d:\Strucureo\klsmartin\neurosurgery_extracted.txt",
    "neurosurgery"
)

# Build the final product data for the React demo
demo_products = []
product_id = 1

def build_demo_products(groups, catalog_type, start_id):
    """Build demo-ready product entries from parsed groups."""
    products = []
    pid = start_id
    
    for key, group in groups.items():
        category = group['category']
        product_type = group['product_type'] or category
        eponymous = sorted(group['eponymous_names'])
        refs = group['refs']
        sizes = sorted(group['sizes'])
        num_pages = len(group['pages'])
        
        if not refs:
            continue
        
        # For the demo, we create one product entry per eponymous name found
        # If no eponymous names, create one entry for the product type
        if eponymous:
            for ep_name in eponymous[:10]:  # Limit to prevent explosion
                # Find REFs that are likely associated with this eponymous name
                sample_refs = refs[:5]  # Take first few
                
                product = {
                    'id': f"{'GS' if catalog_type == 'general-surgery' else 'NS'}-{pid:03d}",
                    'name': f"{ep_name} {product_type}",
                    'catalog': catalog_type,
                    'category': category,
                    'productType': product_type,
                    'brand': 'KLS Martin',
                    'manufacturer': 'KLS Martin Group',
                    'eponymousName': ep_name,
                    'refNumbers': sample_refs,
                    'primaryRef': sample_refs[0] if sample_refs else '',
                    'availableSizes': sizes[:8],
                    'totalVariants': len(refs),
                    'catalogPages': sorted(group['pages']),
                }
                products.append(product)
                pid += 1
        else:
            sample_refs = refs[:5]
            product = {
                'id': f"{'GS' if catalog_type == 'general-surgery' else 'NS'}-{pid:03d}",
                'name': product_type,
                'catalog': catalog_type,
                'category': category,
                'productType': product_type,
                'brand': 'KLS Martin',
                'manufacturer': 'KLS Martin Group',
                'eponymousName': '',
                'refNumbers': sample_refs,
                'primaryRef': sample_refs[0] if sample_refs else '',
                'availableSizes': sizes[:8],
                'totalVariants': len(refs),
                'catalogPages': sorted(group['pages']),
            }
            products.append(product)
            pid += 1
    
    return products, pid

gs_products, next_id = build_demo_products(gs_groups, 'general-surgery', 1)
ns_products, _ = build_demo_products(ns_groups, 'neurosurgery', next_id)

all_products = gs_products + ns_products

# Print summary
print(f"\n{'='*80}")
print(f"FINAL DATA SUMMARY")
print(f"{'='*80}")
print(f"General Surgery products: {len(gs_products)}")
print(f"Neurosurgery products: {len(ns_products)}")
print(f"Total demo products: {len(all_products)}")

print(f"\n--- General Surgery Categories ---")
gs_cats = {}
for p in gs_products:
    gs_cats[p['category']] = gs_cats.get(p['category'], 0) + 1
for cat, count in sorted(gs_cats.items(), key=lambda x: -x[1]):
    print(f"  {cat}: {count} products")

print(f"\n--- Neurosurgery Categories ---")
ns_cats = {}
for p in ns_products:
    ns_cats[p['category']] = ns_cats.get(p['category'], 0) + 1
for cat, count in sorted(ns_cats.items(), key=lambda x: -x[1]):
    print(f"  {cat}: {count} products")

print(f"\n--- Sample Products (General Surgery) ---")
for p in gs_products[:20]:
    print(f"  [{p['category']}] {p['name']} | REF: {p['primaryRef']} | Variants: {p['totalVariants']} | Sizes: {len(p['availableSizes'])}")

print(f"\n--- Sample Products (Neurosurgery) ---")
for p in ns_products[:20]:
    print(f"  [{p['category']}] {p['name']} | REF: {p['primaryRef']} | Variants: {p['totalVariants']} | Sizes: {len(p['availableSizes'])}")

# Save final data
output = {
    'metadata': {
        'source': 'KLS Martin Product Catalogs',
        'catalogs': ['General Surgery', 'Neurosurgery'],
        'totalProducts': len(all_products),
        'generalSurgeryProducts': len(gs_products),
        'neurosurgeryProducts': len(ns_products),
        'extractedFrom': ['General surgery .pdf (872 pages)', 'Neurosurgery_catalog.pdf (368 pages)'],
    },
    'products': all_products,
}

with open(r"d:\Strucureo\klsmartin\final_product_data.json", 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"\nFinal data saved to: final_product_data.json")
