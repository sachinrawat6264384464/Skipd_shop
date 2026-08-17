import sqlite3

conn = sqlite3.connect("ecommers.db")
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [t[0] for t in cursor.fetchall()]
print("SQLite Tables:", tables)
print()

for tbl in tables:
    try:
        cursor.execute(f"SELECT COUNT(*) FROM {tbl}")
        count = cursor.fetchone()[0]
        print(f"  {tbl}: {count} rows")
        if count > 0 and "user" in tbl.lower():
            cursor.execute(f"SELECT * FROM {tbl} LIMIT 20")
            rows = cursor.fetchall()
            cursor.execute(f"PRAGMA table_info({tbl})")
            cols = [c[1] for c in cursor.fetchall()]
            print(f"  Columns: {cols}")
            for r in rows:
                print(f"  {dict(zip(cols, r))}")
    except Exception as e:
        print(f"  {tbl}: ERROR - {e}")

conn.close()
