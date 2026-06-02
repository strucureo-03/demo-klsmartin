import pdfplumber
import os
import json

def extract_pdf(filepath, output_txt, max_pages=None):
    """Extract text from a PDF file, page by page."""
    print(f"\n{'='*80}")
    print(f"Extracting: {os.path.basename(filepath)}")
    print(f"{'='*80}")
    
    with pdfplumber.open(filepath) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total pages: {total_pages}")
        
        all_text = []
        tables_found = []
        
        pages_to_process = min(total_pages, max_pages) if max_pages else total_pages
        
        for i in range(pages_to_process):
            page = pdf.pages[i]
            text = page.extract_text()
            
            if text and text.strip():
                all_text.append(f"\n--- PAGE {i+1} ---\n{text}")
            
            # Try to extract tables
            tables = page.extract_tables()
            if tables:
                for t_idx, table in enumerate(tables):
                    tables_found.append({
                        'page': i+1,
                        'table_index': t_idx,
                        'data': table
                    })
        
        # Write extracted text
        with open(output_txt, 'w', encoding='utf-8') as f:
            f.write(f"PDF: {os.path.basename(filepath)}\n")
            f.write(f"Total Pages: {total_pages}\n")
            f.write(f"Pages Processed: {pages_to_process}\n")
            f.write("="*80 + "\n")
            f.write('\n'.join(all_text))
        
        print(f"Text extracted to: {output_txt}")
        print(f"Tables found: {len(tables_found)}")
        
        # Print first few pages as sample
        sample = '\n'.join(all_text[:10])  # first 10 pages
        print(f"\n--- SAMPLE (first pages) ---")
        print(sample[:5000])
        
        return all_text, tables_found

# Extract General Surgery PDF
gs_text, gs_tables = extract_pdf(
    r"d:\Strucureo\klsmartin\General surgery .pdf",
    r"d:\Strucureo\klsmartin\general_surgery_extracted.txt"
)

# Extract Neurosurgery PDF
ns_text, ns_tables = extract_pdf(
    r"d:\Strucureo\klsmartin\Neurosurgery_catalog.pdf",
    r"d:\Strucureo\klsmartin\neurosurgery_extracted.txt"
)

print(f"\n\n{'='*80}")
print(f"SUMMARY")
print(f"General Surgery: {len(gs_text)} pages with text, {len(gs_tables)} tables")
print(f"Neurosurgery: {len(ns_text)} pages with text, {len(ns_tables)} tables")
