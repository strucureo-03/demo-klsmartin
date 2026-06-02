import json

with open('final_product_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print('Metadata:')
print(json.dumps(data['metadata'], indent=2))
print()
print('Total products:', len(data['products']))
print()
print('Sample product (General Surgery):')
print(json.dumps(data['products'][0], indent=2))
print()
print('Sample product (Neurosurgery):')
for p in data['products']:
    if p['catalog'] == 'neurosurgery':
        print(json.dumps(p, indent=2))
        break

cats = set()
for p in data['products']:
    cats.add(p['category'])
print()
print('All categories ({}): {}'.format(len(cats), sorted(cats)))

all_refs = set()
for p in data['products']:
    all_refs.update(p['refNumbers'])
print('Total unique REF numbers:', len(all_refs))
