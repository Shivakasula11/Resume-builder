"""
Test script — LibreOffice PDF→DOCX (free, local, no API key)
=============================================================
1. Install LibreOffice: https://www.libreoffice.org/download/download-libreoffice/
2. Run:
       python test_libreoffice.py yourresume.pdf
"""

import sys
import time
import subprocess
import shutil
from pathlib import Path


LIBREOFFICE_PATHS = [
    r"C:\Program Files\LibreOffice\program\soffice.exe",
    r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
    r"C:\Program Files\LibreOffice 7\program\soffice.exe",
    r"C:\Program Files\LibreOffice 24\program\soffice.exe",
    r"C:\Program Files\LibreOffice 25\program\soffice.exe",
]


def find_libreoffice():
    if shutil.which("soffice"):
        return "soffice"
    for path in LIBREOFFICE_PATHS:
        if Path(path).exists():
            return path
    return None


def convert(pdf_path_str: str):
    pdf = Path(pdf_path_str).resolve()
    if not pdf.exists():
        print(f"❌ File not found: {pdf_path_str}")
        sys.exit(1)

    soffice = find_libreoffice()
    if not soffice:
        print("❌ LibreOffice not found!")
        print("   Install from: https://www.libreoffice.org/download/download-libreoffice/")
        sys.exit(1)

    print(f"\n✓ LibreOffice found: {soffice}")
    print(f"📄 Converting: {pdf.name}")

    out_dir = pdf.parent
    expected_out = out_dir / (pdf.stem + ".docx")

    t0 = time.time()

    cmd = [
        soffice,
        "--headless",
        "--infilter=writer_pdf_import",
        "--convert-to", "docx:MS Word 2007 XML",
        "--outdir", str(out_dir),
        str(pdf),
    ]

    print("⏳ Running LibreOffice headless...")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

    if result.returncode != 0:
        print(f"❌ LibreOffice failed (exit code {result.returncode})")
        print(f"   stdout: {result.stdout}")
        print(f"   stderr: {result.stderr}")
        sys.exit(1)

    if not expected_out.exists():
        print(f"❌ Output file not created: {expected_out}")
        print(f"   stdout: {result.stdout}")
        print(f"   stderr: {result.stderr}")
        sys.exit(1)

    size = expected_out.stat().st_size
    print(f"\n✅ Done in {time.time()-t0:.1f}s — {expected_out.name} ({size:,} bytes)")
    print(f"📂 Open: {expected_out.resolve()}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_libreoffice.py <resume.pdf>")
        sys.exit(1)
    convert(sys.argv[1])