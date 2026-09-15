import sys
import openpyxl

sys.stdout.reconfigure(encoding='utf-8')

f1 = r"d:\FE-Projects\headcount-planning\.docs\Khung định biên nhân sự.xlsx"
f2 = r"d:\FE-Projects\headcount-planning\.docs\Xây dựng vòng đời chức danh PCD.xlsx"

wb1 = openpyxl.load_workbook(f1, data_only=True)
wb2 = openpyxl.load_workbook(f2, data_only=True)

print("################################################################################")
print("1. KHỐI PLP (Pháp lý dự án) - File 1: Khung định biên nhân sự.xlsx -> Sheet 'PLP'")
print("################################################################################")
sheet_plp = wb1['PLP']
for r in range(5, 14):
    row_vals = [str(sheet_plp.cell(r, c).value or '').strip() for c in range(1, 10)]
    print(f"R{r:02d}: " + " | ".join(row_vals))

print("\n################################################################################")
print("2. KHỐI DMD (Quản lý thiết kế) - File 1 -> Sheet 'DMD-NTT' & 'DMD-NCT'")
print("################################################################################")
sheet_dmd = wb1['DMD-NTT']
for r in range(5, 19):
    row_vals = [str(sheet_dmd.cell(r, c).value or '').strip() for c in range(1, 10)]
    print(f"R{r:02d}: " + " | ".join(row_vals))

print("\n################################################################################")
print("3. KHỐI PMD (Điều hành dự án) - File 1 -> Sheet 'PMD.THẤP TẦNG' & 'PMD.CAO TẦNG'")
print("################################################################################")
sheet_pmd = wb1['PMD.THẤP TẦNG']
for r in range(5, 12):
    row_vals = [str(sheet_pmd.cell(r, c).value or '').strip() for c in range(1, 10)]
    print(f"R{r:02d}: " + " | ".join(row_vals))

print("\n################################################################################")
print("4. KHỐI PCD (Quản lý xây dựng) - File 1 -> Sheet 'PCD.CỌC-HTKT-NHÀ THẤP TẦNG'")
print("################################################################################")
sheet_pcd = wb1['PCD.CỌC-HTKT-NHÀ THẤP TẦNG']
for r in range(5, 40):
    row_vals = [str(sheet_pcd.cell(r, c).value or '').strip() for c in range(1, 9)]
    if any(row_vals):
        print(f"R{r:02d}: " + " | ".join(row_vals))

print("\n################################################################################")
print("5. HỆ SỐ THÁNG T (Hệ số tối ưu nhân lực PCD) - File 2: Sheet 'Hệ số tối ưu nhân lực'")
print("################################################################################")
sheet_opt = wb2['Hệ số tối ưu nhân lực']
for r in range(21, 45):
    row_vals = [str(sheet_opt.cell(r, c).value or '').strip() for c in range(1, 20)]
    if any(row_vals):
        print(f"R{r:02d}: " + " | ".join(row_vals[:12]))
