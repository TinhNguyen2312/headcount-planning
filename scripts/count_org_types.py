import json
import sys
from collections import defaultdict, Counter

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('mock-data/organization.json', 'r', encoding='utf-8'))
items = data.get('list', [])

# Dedup by code - ưu tiên: status "1" > level != -1 > updatedAt mới nhất
def sort_key(x):
    status_score = 1 if x.get('status') == '1' else 0
    level_score = 0 if x.get('level') == -1 else 1
    updated = x.get('updatedAt') or ''
    return (status_score, level_score, updated)

dedup = {}
for x in sorted(items, key=sort_key):
    code = x.get('code')
    if code:
        dedup[code] = x

def infer_type(name, level):
    u = (name or '').upper()
    if any(k in u for k in ['TẬP ĐOÀN', 'GROUP', 'HOLDING']): return 'Khối'
    if any(k in u for k in ['TỔNG CÔNG TY', 'CÔNG TY', 'CHI NHÁNH']): return 'Phòng'
    if any(k in u for k in ['BAN ĐIỀU HÀNH', 'BAN QL', 'BAN QT', 'HỘI ĐỒNG', 'ỦY BAN']): return 'Ban'
    if 'KHỐI' in u: return 'Khối'
    if 'BAN ' in u: return 'Ban'
    if any(k in u for k in ['PHÒNG', 'TRUNG TÂM', 'VIỆN']): return 'Phòng'
    if any(k in u for k in ['BỘ PHẬN', 'TỔ ', 'ĐỘI ', 'NHÓM']): return 'Bộ phận'
    if level <= 0: return 'Khối'
    if level == 1: return 'Ban'
    if level <= 3: return 'Phòng'
    if level <= 5: return 'Bộ phận'
    return 'Nhóm'

# Đếm
type_counter = Counter()
type_examples = defaultdict(list)

for code, item in dedup.items():
    t = infer_type(item.get('name', ''), item.get('level', 1))
    type_counter[t] += 1
    if len(type_examples[t]) < 3:
        type_examples[t].append({
            'code': code,
            'name': item.get('name'),
            'level': item.get('level')
        })

print(f'Tổng unique departments: {len(dedup)}\n')
print(f'{"Type":<12}  {"Số lượng":>10}  {"Tỉ lệ":>7}')
print('-' * 38)
for t, cnt in type_counter.most_common():
    pct = cnt / len(dedup) * 100
    print(f'{t:<12}  {cnt:>10}  {pct:>6.1f}%')

print()
print('--- Ví dụ từng loại ---')
for t, cnt in type_counter.most_common():
    print(f'\n[{t}]')
    for ex in type_examples[t]:
        lvl = ex['level']
        code = ex['code']
        name = (ex['name'] or '')[:65]
        print(f'  Level {lvl:>3} | {code:<20} | {name}')
