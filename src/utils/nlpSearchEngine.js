// NLP Search Engine (Heuristic-based)
// Parses natural language queries to extract semantic intent for medical tools.

export const CATEGORY_MAP = {
  'cutting': ['Scalpels', 'Scissors', 'Knives', 'Osteotomes', 'Rongeurs', 'Blade', 'Curettes'],
  'holding': ['Forceps', 'Clamps', 'Needle Holders'],
  'grasping': ['Forceps', 'Clamps'],
  'pulling': ['Retractors'],
  'opening': ['Retractors', 'Speculums'],
  'drilling': ['Bone Instruments', 'Burrs', 'Drills'],
  'suction': ['Suction Instruments', 'Cannulas'],
  'stitching': ['Suture Instruments', 'Needle Holders'],
  'closing': ['Suture Instruments', 'Needle Holders']
};

const CATALOG_MAP = {
  'neuro': 'neurosurgery',
  'brain': 'neurosurgery',
  'spine': 'neurosurgery',
  'general': 'general-surgery',
  'abdo': 'general-surgery',
  'abdominal': 'general-surgery'
};

/**
 * Parses a natural language query and extracts semantic intents.
 * @param {string} query 
 * @returns {Object} Extracted parameters: sizes, categories, catalog, remainingQuery
 */
export const parseNLPQuery = (query) => {
  if (!query) return null;

  const lowerQuery = query.toLowerCase();
  
  // 1. Extract Sizes (e.g., "18 cm", "18cm", "5 mm", "1/2 inch")
  //    Also generate unit-converted equivalents so "17mm" matches "17 cm" etc.
  const sizeRegex = /\b(\d+(?:[.,]\d+)?(?:[\s-]*)(?:cm|mm|inch|in))\b/gi;
  const sizes = [];
  let match;
  while ((match = sizeRegex.exec(lowerQuery)) !== null) {
    // Normalize space (e.g. "18cm" -> "18 cm")
    let sizeStr = match[1].replace(/([a-z]+)/i, ' $1').trim().replace(/\s+/g, ' ');
    sizes.push(sizeStr);

    // Generate unit-converted equivalents
    const numMatch = sizeStr.match(/^([\d.,]+)\s*(cm|mm|inch|in)$/i);
    if (numMatch) {
      const num = parseFloat(numMatch[1].replace(',', '.'));
      const unit = numMatch[2].toLowerCase();
      if (unit === 'mm') {
        // 170 mm -> also try "17 cm", "17cm"
        const cmVal = num / 10;
        if (cmVal === Math.floor(cmVal) || (cmVal * 10) % 1 === 0) {
          sizes.push(`${cmVal} cm`);
          sizes.push(`${cmVal}cm`);
        }
        // Also try the raw number without unit (products might just say "170")
        sizes.push(`${num} mm`);
        sizes.push(`${num}mm`);
      } else if (unit === 'cm') {
        // 17 cm -> also try "170 mm", "170mm"
        const mmVal = num * 10;
        sizes.push(`${mmVal} mm`);
        sizes.push(`${mmVal}mm`);
        // Also push without space variant
        sizes.push(`${num}cm`);
      }
    }
  }
  // Deduplicate
  const uniqueSizes = [...new Set(sizes)];

  // 2. Extract Catalog/Department
  let matchedCatalog = null;
  let catalogReasoning = null;
  for (const [keyword, catalog] of Object.entries(CATALOG_MAP)) {
    if (lowerQuery.includes(keyword)) {
      matchedCatalog = catalog;
      catalogReasoning = keyword;
      break; // Pick the first match
    }
  }

  // 3. Extract Categories based on Intent Synonyms
  const matchedCategories = new Set();
  const intentReasoning = [];
  for (const [intent, categories] of Object.entries(CATEGORY_MAP)) {
    if (lowerQuery.includes(intent)) {
      intentReasoning.push(intent);
      categories.forEach(c => matchedCategories.add(c));
    }
  }

  // Also check if they explicitly typed a category
  const allCategories = ['Forceps', 'Scissors', 'Retractors', 'Scalpels', 'Bone Instruments', 'Needle Holders', 'Curettes', 'Suction Instruments', 'Suture Instruments', 'Clamps', 'Rongeurs', 'Pituitary Instruments', 'Cannulas', 'Gynecology', 'Urology', 'Otology', 'Rhinology', 'Anaesthesia', 'General'];
  for (const cat of allCategories) {
    if (lowerQuery.includes(cat.toLowerCase())) {
      matchedCategories.add(cat);
      intentReasoning.push(cat.toLowerCase());
    }
  }

  // 4. Strip extracted entities to leave the "core" search term for fuzzy fallback
  let remainingQuery = lowerQuery;
  
  // Strip sizes
  remainingQuery = remainingQuery.replace(sizeRegex, '');
  // Strip catalog keywords
  for (const keyword of Object.keys(CATALOG_MAP)) {
    remainingQuery = remainingQuery.replace(new RegExp(`\\b${keyword}\\w*\\b`, 'gi'), '');
  }
  // Strip intents
  for (const intent of Object.keys(CATEGORY_MAP)) {
    remainingQuery = remainingQuery.replace(new RegExp(`\\b${intent}\\b`, 'gi'), '');
  }
  
  // Clean up extra spaces and stop words
  const stopWords = ['i', 'need', 'want', 'looking', 'for', 'some', 'a', 'an', 'the', 'show', 'me', 'tools', 'instruments', 'instrument', 'tool', 'something', 'that', 'can', 'is', 'are'];
  let cleanWords = remainingQuery.split(/\s+/).filter(w => !stopWords.includes(w) && w.length > 1);
  remainingQuery = cleanWords.join(' ').trim();

  // If we didn't extract anything meaningful, return null so we just do standard fuzzy search
  if (uniqueSizes.length === 0 && matchedCatalog === null && matchedCategories.size === 0) {
    return null;
  }

  return {
    sizes: uniqueSizes,
    catalog: matchedCatalog,
    catalogReasoning,
    categories: Array.from(matchedCategories),
    intentReasoning,
    remainingQuery,
    originalQuery: query
  };
};
