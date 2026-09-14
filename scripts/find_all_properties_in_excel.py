import sys
sys.stdout.reconfigure(encoding='utf-8')
import openpyxl

f1 = r"d:\FE-Projects\headcount-planning\.docs\Khung định biên nhân sự.xlsx"
f2 = r"d:\FE-Projects\headcount-planning\.docs\Xây dựng vòng đời chức danh PCD.xlsx"

def extract_from_workbook(filepath, wb_name):
    wb = openpyxl.load_workbook(filepath, data_only=True)
    print(f"\n************************************************************")
    print(f"WORKBOOK: {wb_name}")
    print(f"************************************************************")
    
    for sname in wb.sheetnames:
        sheet = wb[sname]
        # find header rows that have "CƠ SỞ ĐỊNH BIÊN" or similar
        found = False
        for r in range(1, min(60, sheet.max_row + 1)):
            for c in range(1, min(20, sheet.max_column + 1)):
                val = str(sheet.cell(r, c).value or "").strip()
                if "cơ sở định biên" in val.lower() or "tiêu chí" in val.lower():
                    print(f"\n--- Sheet: '{sname}' | Cell ({r}, {c}): '{val.replace('\n', ' ')}' ---")
                    # print surrounding context / columns in that row and next rows
                    header_row = [str(sheet.cell(r, col).value or "").strip().replace('\n', ' ') for col in range(1, min(15, sheet.max_column + 1))]
                    print(f"  Header Row {r}: " + " | ".join([h for h in header_row if h]))
                    
                    # Print next 15 values in column c and surrounding columns
                    for next_r in range(r + 1, min(r + 20, sheet.max_row + 1)):
                        cell_val = str(sheet.cell(next_r, c).value or "").strip().replace('\n', ' ')
                        other_vals = [str(sheet.cell(next_r, col).value or "").strip().replace('\n', ' ') for col in range(1, min(10, sheet.max_column + 1))]
                        if any(other_vals):
                            print(f"    R{next_r:02d}: " + " | ".join([v for v in other_vals if v][:6]))
                    found = True
                    break
            if found:
                break

extract_from_workbook(f1, "Khung định biên nhân sự.xlsx")
extract_from_workbook(f2, "Xây dựng vòng đời chức danh PCD.xlsx")
