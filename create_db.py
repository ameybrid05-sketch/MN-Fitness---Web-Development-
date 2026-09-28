import pymysql

print("Connecting to MySQL...")
try:
    conn = pymysql.connect(host='localhost', user='root', password='swamisamarth@0905')
    cur = conn.cursor()
    cur.execute("CREATE DATABASE IF NOT EXISTS mn_fitness CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    conn.commit()
    cur.execute("SHOW DATABASES LIKE 'mn_fitness'")
    result = cur.fetchone()
    conn.close()
    if result:
        print("SUCCESS: Database 'mn_fitness' is ready!")
    else:
        print("ERROR: Database was not created.")
except Exception as e:
    print(f"ERROR: {e}")
