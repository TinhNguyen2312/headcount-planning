"""
Parse organization.json → departments.json (cấu trúc cây có children).
- Chỉ lấy nhánh gốc: NVG (NOVAGROUP)
- Loại bỏ các nhánh: NSG, NRG
- Chỉ giữ ACTIVE (status == "1")
"""

import json
import sys
import os
from collections import defaultdict
from datetime import datetime, timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# ── Config ────────────────────────────────────────────────────────────────────
ROOT_CODE     = "NVG"
EXCLUDE_CODES = {"NSG", "NRG"}       # bỏ các nhánh này
ACTIVE_ONLY   = True                  # chỉ giữ status == "1"
INPUT_FILE    = "mock-data/organization.json"
OUTPUT_FILE   = "mock-data/departments.json"

# ── Load ──────────────────────────────────────────────────────────────────────
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    raw = json.load(f)

items = raw.get("list", [])
print(f"[*] Loaded {len(items):,} raw records from {INPUT_FILE}")

# ── Dedup: giữ record tốt nhất cho mỗi code ──────────────────────────────────
# Ưu tiên: status="1" > level != -1 > updatedAt mới nhất
def sort_key(x):
    return (
        1 if x.get("status") == "1" else 0,
        0 if x.get("level") == -1 else 1,
        x.get("updatedAt") or "",
    )

dedup: dict[str, dict] = {}
for item in sorted(items, key=sort_key):
    code = item.get("code")
    if code:
        dedup[code] = item

print(f"[*] After dedup: {len(dedup):,} unique codes")

# ── Filter: chỉ ACTIVE ────────────────────────────────────────────────────────
if ACTIVE_ONLY:
    before = len(dedup)
    dedup = {c: d for c, d in dedup.items() if d.get("status") == "1"}
    print(f"[*] After ACTIVE filter: {len(dedup):,} (removed {before - len(dedup):,} INACTIVE)")

# ── Helpers ───────────────────────────────────────────────────────────────────
ALL_CODES = set(dedup.keys())

def infer_type(name: str, level: int) -> str:
    u = (name or "").upper()
    if any(k in u for k in ["TẬP ĐOÀN", "GROUP", "HOLDING"]):
        return "Khối"
    if any(k in u for k in ["TỔNG CÔNG TY", "CÔNG TY", "CHI NHÁNH"]):
        return "Phòng"
    if any(k in u for k in ["BAN ĐIỀU HÀNH", "BAN QL", "BAN QT", "HỘI ĐỒNG", "ỦY BAN"]):
        return "Ban"
    if "KHỐI" in u:
        return "Khối"
    if "BAN " in u:
        return "Ban"
    if any(k in u for k in ["PHÒNG", "TRUNG TÂM", "VIỆN"]):
        return "Phòng"
    if any(k in u for k in ["BỘ PHẬN", "TỔ ", "ĐỘI ", "NHÓM"]):
        return "Bộ phận"
    if level <= 0:
        return "Khối"
    if level == 1:
        return "Ban"
    if level <= 3:
        return "Phòng"
    if level <= 5:
        return "Bộ phận"
    return "Nhóm"

def safe_date(val) -> str | None:
    if not val:
        return None
    try:
        d = datetime.fromisoformat(val.replace("Z", "+00:00"))
        if d.year > 9000:
            return None
        return d.date().isoformat()
    except Exception:
        return None

# ── Build parent map & break cycles ──────────────────────────────────────────
parent_of: dict[str, str | None] = {}
for code, item in dedup.items():
    p = item.get("parentCode")
    if p and p != code and p in ALL_CODES:
        parent_of[code] = p
    else:
        parent_of[code] = None

def break_cycles():
    for code in list(dedup.keys()):
        visited: set[str] = set()
        curr: str | None = code
        while curr is not None:
            if curr in visited:
                parent_of[code] = None
                break
            visited.add(curr)
            curr = parent_of.get(curr)

for _ in range(10):
    break_cycles()

# ── Convert item → node dict ──────────────────────────────────────────────────
def make_node(item: dict) -> dict:
    code  = item["code"]
    level = item.get("level", 1)
    if level == -1:
        level = 0
    name = (item.get("name") or "").strip()
    return {
        "code"       : code,
        "name"       : name,
        "type"       : infer_type(name, level),
        "level"      : level,
        "status"     : "ACTIVE" if item.get("status") == "1" else "INACTIVE",
        "parentCode" : parent_of.get(code),
        "source"     : item.get("source"),
        "startDate"  : safe_date(item.get("startDate")),
        "endDate"    : safe_date(item.get("endDate")),
        "createdAt"  : item.get("createdAt"),
        "updatedAt"  : item.get("updatedAt"),
        "children"   : [],
    }

nodes: dict[str, dict] = {code: make_node(item) for code, item in dedup.items()}

# ── Assemble full tree ────────────────────────────────────────────────────────
all_roots: list[dict] = []
for code, node in nodes.items():
    p = parent_of.get(code)
    if p and p in nodes:
        nodes[p]["children"].append(node)
    else:
        all_roots.append(node)

# ── Extract chỉ nhánh ROOT_CODE ──────────────────────────────────────────────
def find_node(node_list: list[dict], code: str) -> dict | None:
    for n in node_list:
        if n["code"] == code:
            return n
        found = find_node(n["children"], code)
        if found:
            return found
    return None

root_node = find_node(all_roots, ROOT_CODE)
if not root_node:
    print(f"[!] Không tìm thấy root '{ROOT_CODE}' trong cây. Kiểm tra lại dữ liệu.")
    sys.exit(1)

print(f"[*] Root node  : [{root_node['code']}] {root_node['name']}")

# ── Prune: bỏ EXCLUDE_CODES (và toàn bộ subtree của chúng) ───────────────────
def prune_excluded(node: dict, exclude: set[str]) -> dict:
    kept_children = []
    for child in node["children"]:
        if child["code"] in exclude:
            continue
        pruned_child = prune_excluded(child, exclude)
        kept_children.append(pruned_child)
    return {**node, "children": kept_children}

root_node = prune_excluded(root_node, EXCLUDE_CODES)
print(f"[*] Excluded   : {EXCLUDE_CODES}")

# ── Sort children at every level ──────────────────────────────────────────────
def sort_tree(node_list: list[dict]) -> list[dict]:
    node_list.sort(key=lambda n: (n["level"], n["name"]))
    for n in node_list:
        if n["children"]:
            n["children"] = sort_tree(n["children"])
    return node_list

root_node["children"] = sort_tree(root_node["children"])

# ── Stats ─────────────────────────────────────────────────────────────────────
def count_nodes(node: dict) -> int:
    return 1 + sum(count_nodes(c) for c in node["children"])

def max_depth(node: dict, d: int = 0) -> int:
    if not node["children"]:
        return d
    return max(max_depth(c, d + 1) for c in node["children"])

def count_by(node: dict, key: str, counter=None):
    if counter is None:
        counter = defaultdict(int)
    counter[node[key]] += 1
    for c in node["children"]:
        count_by(c, key, counter)
    return counter

total      = count_nodes(root_node)
depth      = max_depth(root_node)
by_type    = dict(count_by(root_node, "type"))
by_status  = dict(count_by(root_node, "status"))

print(f"\n[Stats]")
print(f"  Total nodes : {total:,}")
print(f"  Max depth   : {depth}")
print(f"  By type     : {by_type}")
print(f"  By status   : {by_status}")

# ── Write output ──────────────────────────────────────────────────────────────
output = {
    "meta": {
        "root"       : ROOT_CODE,
        "excluded"   : sorted(EXCLUDE_CODES),
        "activeOnly" : ACTIVE_ONLY,
        "totalNodes" : total,
        "maxDepth"   : depth,
        "byType"     : by_type,
        "byStatus"   : by_status,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
    },
    "tree": root_node,
}

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

size_kb = os.path.getsize(OUTPUT_FILE) / 1024
print(f"\n[Done] Written → {OUTPUT_FILE} ({size_kb:.1f} KB)")
