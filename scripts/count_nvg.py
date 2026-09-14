import json
import sys
from collections import Counter, defaultdict

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

data = json.load(open("mock-data/departments.json", "r", encoding="utf-8"))
tree = data["tree"]

def count_tree(node, by_type, by_level):
    by_type[node["type"]] += 1
    by_level[node["level"]] += 1
    for child in node.get("children", []):
        count_tree(child, by_type, by_level)

def find_node(nodes, code):
    for n in nodes:
        if n["code"] == code:
            return n
        found = find_node(n.get("children", []), code)
        if found:
            return found
    return None

nvg = find_node(tree, "NVG")
if not nvg:
    print("Khong tim thay NVG!")
else:
    by_type = Counter()
    by_level = Counter()
    count_tree(nvg, by_type, by_level)

    direct = len(nvg.get("children", []))
    total = sum(by_type.values())

    print("=== Thong ke duoi code NVG (NOVAGROUP) ===")
    print(f"  Ten    : {nvg['name']}")
    print(f"  Level  : {nvg['level']}")
    print(f"  Status : {nvg['status']}")
    print()
    print(f"  Con truc tiep  : {direct}")
    print(f"  Tong (ca NVG)  : {total}")
    print(f"  Tong (bo NVG)  : {total - 1}")
    print()
    print("--- Phan bo theo Type ---")
    for t, cnt in by_type.most_common():
        print(f"  {t:<12}: {cnt:>5}")
    print()
    print("--- Phan bo theo Level ---")
    for lvl in sorted(by_level.keys()):
        print(f"  Level {lvl:<3}: {by_level[lvl]:>5}")
    print()
    print("--- Con truc tiep cua NVG ---")
    for child in sorted(nvg.get("children", []), key=lambda x: x["name"]):
        child_count = Counter()
        child_level = Counter()
        count_tree(child, child_count, child_level)
        subtotal = sum(child_count.values())
        print(f"  [{child['code']:<20}] {child['name'][:50]:<50} | subtree: {subtotal:>5}")
