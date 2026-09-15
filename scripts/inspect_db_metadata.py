import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

conn_str = ''
with open('.env', 'r', encoding='utf-8') as f:
    for line in f:
        if line.startswith('DATABASE_URL=') or line.startswith('SUPABASE_POSTGRES_URL='):
            conn_str = line.split('=', 1)[1].strip().strip('"').strip("'")
            if conn_str:
                break

if '5432' in conn_str:
    conn_str = conn_str.replace('5432', '6543')

try:
    import psycopg2
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()

    cur.execute('SELECT id, code, name FROM departments ORDER BY id')
    print('=== DEPARTMENTS ===')
    for r in cur.fetchall():
        print(r)

    cur.execute('SELECT id, code, name, department_id FROM roles ORDER BY id')
    print('\n=== ROLES ===')
    for r in cur.fetchall():
        print(r)

    cur.execute('SELECT id, code, name FROM milestones ORDER BY id')
    print('\n=== MILESTONES ===')
    for r in cur.fetchall():
        print(r)

    cur.execute('SELECT id, code, name, data_type FROM properties ORDER BY id')
    print('\n=== PROPERTIES ===')
    for r in cur.fetchall():
        print(r)

    conn.close()
except Exception as e:
    print('Error:', e)
