"""
Vẽ cây tổ chức dạng tree (top-down) bằng Plotly.
- Bỏ NSG (NOVA SERVICE GROUP)
- Hiển thị đến MAX_LEVEL
- Click vào legend để ẩn/hiện theo loại
Chạy: python scripts/org_tree_chart.py
"""

import json
import sys
import os

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

try:
    import plotly.graph_objects as go
except ImportError:
    print("Pip install plotly")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────
ROOT_CODE    = "NVG"
EXCLUDE_CODES = {"NSG", "NRG"}   # bỏ NOVA SERVICE GROUP
MAX_LEVEL    = 4
OUTPUT_HTML  = "mock-data/org_tree_nvg.html"

TYPE_COLORS = {
    "Khối"    : "#1a5276",
    "Ban"     : "#1f618d",
    "Phòng"   : "#2e86c1",
    "Bộ phận" : "#5dade2",
    "Nhóm"    : "#aed6f1",
}
NODE_SIZE = {
    "Khối"    : 22,
    "Ban"     : 18,
    "Phòng"   : 14,
    "Bộ phận" : 11,
    "Nhóm"    : 9,
}

# ── Load ──────────────────────────────────────────────────────────────────────
print("[*] Loading departments.json...")
with open("mock-data/departments.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# ── Helpers ───────────────────────────────────────────────────────────────────
def find_node(nodes, code):
    for n in nodes:
        if n["code"] == code:
            return n
        found = find_node(n.get("children", []), code)
        if found:
            return found
    return None

def prune(node, exclude, max_level, current_level=0):
    """Cắt bỏ các node trong exclude và giới hạn depth."""
    children = []
    for child in node.get("children", []):
        if child["code"] in exclude:
            continue
        if current_level + 1 <= max_level:
            pruned = prune(child, exclude, max_level, current_level + 1)
            children.append(pruned)
    return {**node, "children": children}

def count_leaves(node):
    """Đếm số lá để tính chiều rộng layout."""
    children = node.get("children", [])
    if not children:
        return 1
    return sum(count_leaves(c) for c in children)

def count_subtree(node):
    total = 1
    for c in node.get("children", []):
        total += count_subtree(c)
    return total

# ── Layout engine (Reingold-Tilford style) ────────────────────────────────────
def layout(node, level=0, x_left=0.0, nodes_out=None, edges_out=None, parent_pos=None):
    if nodes_out is None:
        nodes_out, edges_out = [], []

    children = node.get("children", [])
    leaf_w   = count_leaves(node)
    x_center = x_left + leaf_w / 2.0
    y        = -level * 1.8          # khoảng cách dọc giữa các cấp

    # Thêm node
    full_name = node["name"]
    label = full_name if len(full_name) <= 30 else full_name[:28] + "…"
    subtree_total = count_subtree(node)

    nodes_out.append({
        "code"   : node["code"],
        "name"   : full_name,
        "label"  : label,
        "type"   : node["type"],
        "level"  : node["level"],
        "x"      : x_center,
        "y"      : y,
        "subtree": subtree_total,
    })

    # Thêm edge từ parent
    if parent_pos is not None:
        edges_out.append((parent_pos[0], parent_pos[1], x_center, y))

    # Đệ quy children
    cx = x_left
    for child in children:
        cw = count_leaves(child)
        layout(child, level + 1, cx, nodes_out, edges_out, (x_center, y))
        cx += cw

    return nodes_out, edges_out

# ── Build ─────────────────────────────────────────────────────────────────────
root = find_node(data["tree"], ROOT_CODE)
if not root:
    print(f"Không tìm thấy {ROOT_CODE}")
    sys.exit(1)

root_pruned = prune(root, EXCLUDE_CODES, MAX_LEVEL)
all_nodes, all_edges = layout(root_pruned)

excluded_total = sum(
    count_subtree(c) for c in root.get("children", []) if c["code"] in EXCLUDE_CODES
)
print(f"[*] Root       : [{root['code']}] {root['name']}")
print(f"[*] Loại bỏ   : {EXCLUDE_CODES} ({excluded_total:,} nodes)")
print(f"[*] Nodes vẽ  : {len(all_nodes)}")
print(f"[*] Edges      : {len(all_edges)}")

# ── Plotly Figure ─────────────────────────────────────────────────────────────
fig = go.Figure()

# 1. Vẽ edges (lines)
edge_x, edge_y = [], []
for x0, y0, x1, y1 in all_edges:
    # Đường gấp khúc vuông góc: đi thẳng ngang rồi xuống
    mid_y = (y0 + y1) / 2
    edge_x += [x0, x0, x1, x1, None]
    edge_y += [y0, mid_y, mid_y, y1, None]

fig.add_trace(go.Scatter(
    x=edge_x, y=edge_y,
    mode="lines",
    line=dict(color="#b0bec5", width=1.2),
    hoverinfo="none",
    showlegend=False,
    name="edges",
))

# 2. Vẽ nodes theo từng type (để có legend)
for type_name, color in TYPE_COLORS.items():
    group = [n for n in all_nodes if n["type"] == type_name]
    if not group:
        continue

    fig.add_trace(go.Scatter(
        x=[n["x"] for n in group],
        y=[n["y"] for n in group],
        mode="markers+text",
        name=type_name,
        marker=dict(
            size=NODE_SIZE.get(type_name, 12),
            color=color,
            line=dict(color="white", width=1.5),
            symbol="circle",
        ),
        text=[n["label"] for n in group],
        textposition="bottom center",
        textfont=dict(size=8, color="#212121"),
        hovertemplate=(
            "<b>%{customdata[0]}</b><br>"
            "Mã: %{customdata[1]}<br>"
            "Loại: %{customdata[2]}<br>"
            "Level: %{customdata[3]}<br>"
            "Toàn cây: %{customdata[4]:,} đơn vị"
            "<extra></extra>"
        ),
        customdata=[
            [n["name"], n["code"], n["type"], n["level"], n["subtree"]]
            for n in group
        ],
    ))

# ── Layout ────────────────────────────────────────────────────────────────────
excluded_str = ", ".join(sorted(EXCLUDE_CODES))
root_subtree = count_subtree(root_pruned)

fig.update_layout(
    title=dict(
        text=(
            f"<b>Cây tổ chức: {root['name']} ({ROOT_CODE})</b>"
            f"<br><sup>Hiển thị {root_subtree:,} đơn vị đến Level {MAX_LEVEL}"
            f" | Loại bỏ: {excluded_str}</sup>"
        ),
        x=0.5,
        font=dict(size=17, family="Arial"),
    ),
    xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
    yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
    plot_bgcolor="white",
    paper_bgcolor="#f5f7fa",
    legend=dict(
        title="<b>Loại đơn vị</b>",
        orientation="v",
        x=1.01, y=1,
        bgcolor="rgba(255,255,255,0.9)",
        bordercolor="#ccc",
        borderwidth=1,
    ),
    width=1600,
    height=950,
    margin=dict(t=100, b=80, l=40, r=200),
    hovermode="closest",
)

# ── Export ────────────────────────────────────────────────────────────────────
fig.write_html(
    OUTPUT_HTML,
    include_plotlyjs="cdn",
    full_html=True,
    config={
        "scrollZoom": True,
        "displayModeBar": True,
        "toImageButtonOptions": {"format": "png", "scale": 2},
    },
)

abs_path = os.path.abspath(OUTPUT_HTML)
print(f"\n[Done] → {abs_path}")

try:
    import webbrowser
    webbrowser.open(f"file:///{abs_path.replace(chr(92), '/')}")
    print("[*] Đã mở trình duyệt.")
except Exception:
    pass
