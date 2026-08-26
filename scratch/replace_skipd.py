import os
import re

ROOT_DIR = r"d:\ecommers"

EXCLUDE_DIRS = {".git", ".next", "node_modules", ".pytest_cache", "venv", "__pycache__"}
EXCLUDE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".ico", ".pdf", ".zip", ".tar", ".gz", ".lock"}

def process_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        if "e-com" not in content.lower():
            return False

        new_content = content

        # Replace exact case variations
        new_content = re.sub(r'\bSKIPD\b', 'E-COM', new_content)
        new_content = re.sub(r'\bSkipd\b', 'E-com', new_content)
        new_content = re.sub(r'\bskipd\b', 'e-com', new_content)

        # Replace in strings like ecom_user, ecom_token, etc.
        new_content = re.sub(r'ecom_', 'ecom_', new_content)
        new_content = re.sub(r'ECOM_', 'ECOM_', new_content)
        new_content = re.sub(r'Ecom_', 'Ecom_', new_content)

        # Replace in emails like admin@e-com.in
        new_content = re.sub(r'@e-com\.in', '@e-com.in', new_content)

        if new_content != content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"[REPLACED] {os.path.relpath(file_path, ROOT_DIR)}")
            return True
    except Exception as e:
        pass
    return False

def main():
    count = 0
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in EXCLUDE_EXTS:
                continue
            file_path = os.path.join(root, file)
            if process_file(file_path):
                count += 1
    print(f"\nTotal files updated: {count}")

if __name__ == "__main__":
    main()
