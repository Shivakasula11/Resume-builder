"""
Run this script to find the correct ilovepdf tool name for PDF→Word conversion.
Usage: python test_ilovepdf.py
Make sure ILOVEPDF_PUBLIC_KEY is set in your .env file.
"""
import requests
from dotenv import load_dotenv
import os

load_dotenv()
KEY = os.environ.get("ILOVEPDF_PUBLIC_KEY", "")
if not KEY:
    print("ERROR: ILOVEPDF_PUBLIC_KEY not set in .env")
    exit(1)

print(f"Using key: {KEY[:12]}…\n")

# Step 1: Authenticate
r = requests.post("https://api.ilovepdf.com/v1/auth", data={"public_key": KEY}, timeout=15)
if r.status_code != 200:
    print(f"Auth failed: {r.text}"); exit(1)
token = r.json()["token"]
hdrs  = {"Authorization": f"Bearer {token}"}
print(f"Auth OK. Token: {token[:30]}…\n")

# Step 2: Try every possible tool name
tool_names = [
    "pdftoword",
    "pdftodocx",
    "pdf_to_word",
    "pdf_to_docx",
    "pdftooffice",
    "pdftopowerpoint",
    "pdftoofficex",
    "word",
    "docx",
    "htmlpdf",
    "pdftoxls",
    "pdftoexcel",
]

print("Testing tool names against /start/{tool}:")
print("-" * 50)
for tool in tool_names:
    r = requests.get(f"https://api.ilovepdf.com/v1/start/{tool}",
                     headers=hdrs, timeout=10)
    if r.status_code == 200:
        print(f"  ✓ WORKS: '{tool}'  →  server={r.json().get('server','?')}")
    else:
        err = r.json().get("error", {}).get("param", {})
        print(f"  ✗ {r.status_code}: '{tool}'  →  {err}")