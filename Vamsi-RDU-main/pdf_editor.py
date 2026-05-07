"""
pdf_editor.py — Direct PDF text editing using PyMuPDF
=====================================================
Replaces text directly in PDF preserving fonts, icons, layout.
No lossy PDF → DOCX → PDF round-trip.

Install: pip install PyMuPDF
"""

import re
import json
from pathlib import Path


def _sidecar_path(pdf_path):
    return Path(str(pdf_path) + ".inserted.json")

def _load_inserted_positions(pdf_path):
    """Return set of (page, y_round) for inserted text positions."""
    p = _sidecar_path(pdf_path)
    if p.exists():
        try:
            data = json.loads(p.read_text())
            return {(item["page"], item["y"]) for item in data}
        except Exception:
            pass
    return set()

def _save_inserted_position(pdf_path, page_num, insert_y):
    """Append an inserted position to the sidecar JSON."""
    p = _sidecar_path(pdf_path)
    data = []
    if p.exists():
        try:
            data = json.loads(p.read_text())
        except Exception:
            pass
    data.append({"page": page_num, "y": round(insert_y, 2)})
    p.write_text(json.dumps(data))

try:
    import fitz  # PyMuPDF
    PYMUPDF_SUPPORT = True
except ImportError:
    PYMUPDF_SUPPORT = False


# ═══════════════════════════════════════════
#  FONT MAPPING
# ═══════════════════════════════════════════

_FONT_MAP = {
    "arial": "helv",
    "helvetica": "helv",
    "calibri": "helv",
    "verdana": "helv",
    "tahoma": "helv",
    "trebuchet": "helv",
    "segoe": "helv",
    "roboto": "helv",
    "opensans": "helv",
    "lato": "helv",
    "montserrat": "helv",
    "raleway": "helv",
    "poppins": "helv",
    "nunito": "helv",
    "sourcesans": "helv",
    "inter": "helv",
    "times": "tiro",
    "timesnewroman": "tiro",
    "georgia": "tiro",
    "garamond": "tiro",
    "palatino": "tiro",
    "bookman": "tiro",
    "cambria": "tiro",
    "cmr": "tiro",
    "cmb": "tiro",
    "cmt": "tiro",
    "cms": "tiro",
    "lmroman": "tiro",
    "lmsans": "helv",
    "lmmono": "cour",
    "computermodern": "tiro",
    "latinmodern": "tiro",
    "cmbx": "tiro",
    "cmti": "tiro",
    "cmss": "helv",
    "cmtt": "cour",
    "courier": "cour",
    "couriernew": "cour",
    "consolas": "cour",
    "lucidaconsole": "cour",
}


def _clean_font_name(name):
    if not name:
        return ""
    clean = name.replace("-", "").replace(" ", "").replace(",", "").replace("_", "")
    for suffix in ["Bold", "Italic", "BoldItalic", "Regular", "Light", "Medium",
                    "Semibold", "SemiBold", "ExtraBold", "Thin", "Black", "Heavy",
                    "Condensed", "Narrow", "Wide", "Oblique", "MT", "PS"]:
        clean = clean.replace(suffix, "")
    return clean.lower()


def _map_to_base_font(font_name):
    cleaned = _clean_font_name(font_name)
    for key, val in _FONT_MAP.items():
        if key in cleaned or cleaned in key:
            return val
    return "helv"


def _is_bold_font(font_name, flags=0):
    if flags & (1 << 18):
        return True
    if flags & (1 << 4):
        return True
    name = (font_name or "").lower()
    if any(b in name for b in ["bold", "heavy", "black", "semibold"]):
        return True
    clean = name.split("+")[-1] if "+" in name else name
    if clean.startswith("cmbx") or clean.startswith("cmbsy"):
        return True
    return False


def _is_italic_font(font_name, flags=0):
    if flags & (1 << 6):
        return True
    if flags & (1 << 1):
        return True
    name = (font_name or "").lower()
    if any(b in name for b in ["italic", "oblique"]):
        return True
    clean = name.split("+")[-1] if "+" in name else name
    if clean.startswith("cmti") or clean.startswith("cmmi") or clean.startswith("cmbxti"):
        return True
    return False


# ═══════════════════════════════════════════
#  FONT EXTRACTION FROM PDF
# ═══════════════════════════════════════════

def _try_extract_font(doc, page, font_name):
    if not font_name:
        return None
    try:
        page_fonts = page.get_fonts(full=True)
        target = _clean_font_name(font_name)

        for f in page_fonts:
            xref = f[0]
            fname = f[3] if len(f) > 3 else ""
            if not fname:
                continue

            candidate = _clean_font_name(fname)
            matched = False

            if font_name in fname or fname in font_name:
                matched = True
            elif candidate and target and (target in candidate or candidate in target):
                matched = True
            elif candidate and target and len(target) >= 4 and len(candidate) >= 4 and target[:4] == candidate[:4]:
                matched = True
            elif "+" in fname:
                base_fname = fname.split("+", 1)[1] if "+" in fname else fname
                if font_name.endswith(base_fname) or base_fname.endswith(font_name) or \
                   _clean_font_name(base_fname) == target:
                    matched = True

            if not matched:
                continue

            try:
                extracted = doc.extract_font(xref)
                if extracted and len(extracted) > 3 and extracted[3]:
                    font_bytes = extracted[3]
                    if len(font_bytes) > 100:
                        font = fitz.Font(fontbuffer=font_bytes)
                        print(f"[PDF-Edit] ✓ Extracted font: {fname} ({len(font_bytes)} bytes)")
                        return font
            except Exception as e:
                print(f"[PDF-Edit] Font extraction failed for {fname}: {e}")
                continue

        if not target:
            return None

        for f in page_fonts:
            xref = f[0]
            fname = f[3] if len(f) > 3 else ""
            if not fname:
                continue
            candidate = _clean_font_name(fname)
            if candidate and target and len(target) >= 3 and len(candidate) >= 3:
                if target[:3] == candidate[:3]:
                    try:
                        extracted = doc.extract_font(xref)
                        if extracted and len(extracted) > 3 and extracted[3]:
                            font_bytes = extracted[3]
                            if len(font_bytes) > 100:
                                font = fitz.Font(fontbuffer=font_bytes)
                                print(f"[PDF-Edit] ✓ Extracted similar font: {fname} (wanted {font_name})")
                                return font
                    except Exception:
                        continue

    except Exception as e:
        print(f"[PDF-Edit] Font search error: {e}")
    return None


def _get_font_for_span(doc, page, span_info):
    font_name = span_info.get("font", "")
    extracted = _try_extract_font(doc, page, font_name)
    if extracted:
        return extracted

    base = _map_to_base_font(font_name)
    bold = _is_bold_font(font_name, span_info.get("flags", 0))
    italic = _is_italic_font(font_name, span_info.get("flags", 0))

    if bold and italic:
        base += "bi"
    elif bold:
        base += "bo"
    elif italic:
        base += "it"

    try:
        font = fitz.Font(base)
        print(f"[PDF-Edit] ⚠ Using fallback font '{base}' for '{font_name}'")
        return font
    except Exception:
        print(f"[PDF-Edit] ⚠ Using helv fallback for '{font_name}'")
        return fitz.Font("helv")


# ═══════════════════════════════════════════
#  CONTENT STREAM TEXT REPLACEMENT
# ═══════════════════════════════════════════

def _replace_in_content_stream(doc, page, old_text, new_text, set_bold=None):
    old_clean = old_text.strip()
    new_clean = new_text.strip()
    
    page.clean_contents()
    contents_xrefs = page.get_contents()
    if not contents_xrefs:
        return False
    
    stream_bytes = doc.xref_stream(contents_xrefs[0])
    stream = stream_bytes.decode('latin-1', errors='replace')
    
    tj_pattern = re.compile(r'\[([^\]]*)\]TJ')
    
    for match in tj_pattern.finditer(stream):
        tj_content = match.group(1)
        
        text_parts = re.findall(r'\(([^)]*)\)', tj_content)
        plain_text = ''.join(text_parts)
        plain_unescaped = plain_text.replace('\\(', '(').replace('\\)', ')').replace('\\\\', '\\')
        
        old_no_spaces = old_clean.replace(' ', '')
        plain_no_spaces = plain_unescaped.replace(' ', '')
        if old_clean not in plain_unescaped and old_no_spaces not in plain_no_spaces:
            continue
        
        print(f"[PDF-Edit] Found text in content stream TJ operator")
        
        tokens = []
        pos = 0
        while pos < len(tj_content):
            if tj_content[pos] == '(':
                depth = 1
                end = pos + 1
                while end < len(tj_content) and depth > 0:
                    if tj_content[end] == '(' and tj_content[end-1] != '\\':
                        depth += 1
                    elif tj_content[end] == ')' and tj_content[end-1] != '\\':
                        depth -= 1
                    end += 1
                tokens.append(('text', tj_content[pos+1:end-1]))
                pos = end
            elif tj_content[pos] in '-0123456789.':
                end = pos + 1
                while end < len(tj_content) and tj_content[end] in '0123456789.eE+-':
                    end += 1
                tokens.append(('kern', float(tj_content[pos:end])))
                pos = end
            elif tj_content[pos] == '<':
                end = tj_content.index('>', pos) + 1
                tokens.append(('hex', tj_content[pos:end]))
                pos = end
            else:
                pos += 1
        
        char_positions = []
        for ti, (ttype, tval) in enumerate(tokens):
            if ttype == 'text':
                for ci, ch in enumerate(tval):
                    char_positions.append((ch, ti, ci))
            elif ttype == 'kern' and abs(tval) > 100:
                char_positions.append((' ', ti, -1))
        
        full_text = ''.join(cp[0] for cp in char_positions)
        full_unescaped = full_text.replace('\\(', '(').replace('\\)', ')').replace('\\\\', '\\')
        
        idx = full_unescaped.find(old_clean)
        if idx == -1:
            import re as _re
            normalized_full = _re.sub(r'\s+', ' ', full_unescaped)
            normalized_old = _re.sub(r'\s+', ' ', old_clean)
            idx = normalized_full.find(normalized_old)
            if idx >= 0:
                full_unescaped = normalized_full
        if idx == -1:
            continue
        
        start_cp = char_positions[idx]
        end_cp = char_positions[idx + len(old_clean) - 1]
        start_token = start_cp[1]
        end_token = end_cp[1]
        start_char = start_cp[2]
        end_char = end_cp[2]
        
        new_tokens = []
        
        for ti in range(start_token):
            new_tokens.append(tokens[ti])
        
        if start_char != -1 and tokens[start_token][0] == 'text':
            prefix = tokens[start_token][1][:start_char]
            if prefix:
                new_tokens.append(('text', prefix))
        
        escaped_new = new_clean.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        new_tokens.append(('text', escaped_new))
        
        if end_char != -1 and tokens[end_token][0] == 'text':
            suffix = tokens[end_token][1][end_char + 1:]
            if suffix:
                new_tokens.append(('text', suffix))
        
        span_info = _get_text_span_info(page, old_clean)
        fontsize = span_info.get("size", 10.9091) if span_info else 10.9091
        font_name = span_info.get("font", "") if span_info else ""
        
        old_width_pt = 0
        new_width_pt = 0
        try:
            font_obj = _try_extract_font(doc, page, font_name)
            if font_obj:
                old_width_pt = font_obj.text_length(old_clean, fontsize=fontsize)
                if all(font_obj.has_glyph(ord(c)) != 0 for c in new_clean if c != ' '):
                    new_width_pt = font_obj.text_length(new_clean, fontsize=fontsize)
                else:
                    fallback = fitz.Font(_map_to_base_font(font_name) or "tiro")
                    new_width_pt = fallback.text_length(new_clean, fontsize=fontsize)
        except Exception:
            pass
        
        width_diff_pt = old_width_pt - new_width_pt
        width_diff_tj = width_diff_pt / fontsize * 1000
        
        remaining_start = end_token + 1
        has_remaining = remaining_start < len(tokens)
        if abs(width_diff_tj) > 1 and has_remaining:
            new_tokens.append(('kern', -width_diff_tj))
        
        for ti in range(remaining_start, len(tokens)):
            new_tokens.append(tokens[ti])
        
        new_tj_parts = []
        for ttype, tval in new_tokens:
            if ttype == 'text':
                new_tj_parts.append(f'({tval})')
            elif ttype == 'kern':
                new_tj_parts.append(f'{tval:.5f}')
            elif ttype == 'hex':
                new_tj_parts.append(tval)
        
        new_tj_content = ''.join(new_tj_parts)
        new_tj = f'[{new_tj_content}]TJ'
        
        new_stream = stream[:match.start()] + new_tj + stream[match.end():]
        
        is_subsetted = "+" in font_name
        if not is_subsetted:
            try:
                for pf in page.get_fonts():
                    pf_name = pf[3] if len(pf) > 3 else ""
                    if pf_name and (font_name in pf_name or pf_name in font_name):
                        if "+" in pf_name:
                            is_subsetted = True
                            break
            except Exception:
                pass
        
        needs_font_change = False
        if is_subsetted:
            try:
                font_obj_check = _try_extract_font(doc, page, font_name)
                if font_obj_check:
                    needs_font_change = not all(font_obj_check.has_glyph(ord(c)) != 0 for c in new_clean if c != ' ')
            except Exception:
                needs_font_change = True
        
        current_bold = _is_bold_font(font_name, span_info.get("flags", 0) if span_info else 0)
        bold_changed = set_bold is not None and set_bold != current_bold
        if bold_changed:
            needs_font_change = True
        
        if needs_font_change:
            base_font = _map_to_base_font(font_name) or "tiro"
            target_bold = set_bold if set_bold is not None else current_bold
            if target_bold:
                base_font = {"tiro": "tibo", "helv": "hebo", "cour": "cobo"}.get(base_font, base_font)
            else:
                base_font = {"tibo": "tiro", "hebo": "helv", "cobo": "cour"}.get(base_font, base_font)
            
            try:
                page.insert_font(fontname=base_font)
            except Exception:
                pass
            
            new_font_ref = None
            orig_font_ref = None
            for pf in page.get_fonts():
                pf_name = pf[3] if len(pf) > 3 else ""
                pf_ref = pf[4] if len(pf) > 4 else ""
                if pf_ref and pf_ref.lower() == base_font.lower():
                    new_font_ref = pf_ref
                elif pf_name and base_font.lower().replace('-','') in pf_name.lower().replace('-',''):
                    new_font_ref = pf_ref
                if pf_name and (font_name in pf_name or pf_name in font_name):
                    orig_font_ref = pf_ref
            
            if not new_font_ref:
                print(f"[PDF-Edit] Could not find page ref for {base_font}")
                return False
            
            if not orig_font_ref:
                pre_stream = stream[:match.start()]
                font_refs = re.findall(r'/(F\d+)\s', pre_stream)
                if font_refs:
                    orig_font_ref = font_refs[-1]
            
            if not orig_font_ref:
                print(f"[PDF-Edit] Could not find original font ref")
                return False
            
            print(f"[PDF-Edit] Font switch: /{orig_font_ref} → /{new_font_ref} for replacement text")
            
            pre_tokens = []
            for ti in range(start_token):
                pre_tokens.append(tokens[ti])
            if tokens[start_token][0] == 'text':
                prefix = tokens[start_token][1][:start_char]
                if prefix:
                    pre_tokens.append(('text', prefix))
            
            post_tokens = []
            if tokens[end_token][0] == 'text':
                suffix = tokens[end_token][1][end_char + 1:]
                if suffix:
                    post_tokens.append(('text', suffix))
            
            remaining_start = end_token + 1
            for ti in range(remaining_start, len(tokens)):
                post_tokens.append(tokens[ti])
            
            def tokens_to_tj(toks):
                if not toks:
                    return ""
                parts = []
                for ttype, tval in toks:
                    if ttype == 'text':
                        parts.append(f'({tval})')
                    elif ttype == 'kern':
                        parts.append(f'{tval:.5f}')
                    elif ttype == 'hex':
                        parts.append(tval)
                return f'[{"".join(parts)}]TJ'
            
            escaped_new = new_clean.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
            
            segments = []
            if pre_tokens:
                segments.append(tokens_to_tj(pre_tokens))
            
            segments.append(f' /{new_font_ref} {fontsize:.4f} Tf ')
            
            if abs(width_diff_tj) > 1 and post_tokens:
                segments.append(f'[({escaped_new}){-width_diff_tj:.5f}]TJ')
            else:
                segments.append(f'[({escaped_new})]TJ')
            
            segments.append(f' /{orig_font_ref} {fontsize:.4f} Tf ')
            
            if post_tokens:
                segments.append(tokens_to_tj(post_tokens))
            
            replacement = ''.join(segments)
            new_stream = stream[:match.start()] + replacement + stream[match.end():]
            
            new_stream_bytes = new_stream.encode('latin-1', errors='replace')
            doc.update_stream(contents_xrefs[0], new_stream_bytes)
            
            print(f"[PDF-Edit] ✓ Content stream replacement with font switch: '{old_clean[:30]}' → '{new_clean[:30]}'")
            return True
        
        new_stream_bytes = new_stream.encode('latin-1', errors='replace')
        doc.update_stream(contents_xrefs[0], new_stream_bytes)
        
        print(f"[PDF-Edit] ✓ Content stream replacement: '{old_clean[:30]}' → '{new_clean[:30]}' (spacing adjusted)")
        return True
    
    return False


def _get_text_span_info(page, search_text):
    search_clean = search_text.strip()
    if not search_clean:
        return None

    try:
        blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]
    except Exception:
        return None

    for block in blocks:
        if "lines" not in block:
            continue
        for line in block["lines"]:
            line_text = "".join(s["text"] for s in line["spans"])
            if search_clean not in line_text:
                continue
            idx_in_line = line_text.find(search_clean)
            if idx_in_line == -1:
                continue
            search_end = idx_in_line + len(search_clean)
            best_span = None
            best_overlap = 0
            char_pos = 0
            for span in line["spans"]:
                span_end = char_pos + len(span["text"])
                overlap_start = max(char_pos, idx_in_line)
                overlap_end = min(span_end, search_end)
                overlap = max(0, overlap_end - overlap_start)
                if overlap > best_overlap and span["text"].strip():
                    best_overlap = overlap
                    best_span = span
                char_pos = span_end

            if best_span:
                return best_span

    return None


def _insert_wrapped_text(page, insert_point, text, fontsize, fontname, color, right_margin=36):
    try:
        font = fitz.Font(fontname)
        text_w = font.text_length(text, fontsize=fontsize)
        max_w = page.rect.width - insert_point.x - right_margin
        
        if text_w <= max_w * 1.1:
            tw = fitz.TextWriter(page.rect)
            tw.append(insert_point, text, font=font, fontsize=fontsize)
            tw.write_text(page, color=color)
            return True
        
        words = text.split()
        lines_out = []
        current_line = ""
        for word in words:
            test = current_line + (" " if current_line else "") + word
            w = font.text_length(test, fontsize=fontsize)
            if w > max_w and current_line:
                lines_out.append(current_line)
                current_line = word
            else:
                current_line = test
        if current_line:
            lines_out.append(current_line)
        
        line_spacing = fontsize * 1.3
        tw = fitz.TextWriter(page.rect)
        y_pos = insert_point.y
        for i, line_text in enumerate(lines_out):
            is_last = (i == len(lines_out) - 1)
            line_words = line_text.split()
            
            if not is_last and len(line_words) > 1:
                total_text_w = sum(font.text_length(w, fontsize=fontsize) for w in line_words)
                total_space = max_w - total_text_w
                word_gap = total_space / (len(line_words) - 1)
                x_pos = insert_point.x
                for word in line_words:
                    tw.append(fitz.Point(x_pos, y_pos), word, font=font, fontsize=fontsize)
                    x_pos += font.text_length(word, fontsize=fontsize) + word_gap
            else:
                tw.append(fitz.Point(insert_point.x, y_pos), line_text, font=font, fontsize=fontsize)
            y_pos += line_spacing
        tw.write_text(page, color=color)
        return True
    except Exception as e:
        print(f"[PDF-Edit] _insert_wrapped_text failed: {e}")
        return False


def _get_background_color(page, rect):
    try:
        sample_rect = fitz.Rect(
            rect.x0, max(0, rect.y0 - 2),
            rect.x0 + 3, rect.y0
        )
        pm = page.get_pixmap(clip=sample_rect, dpi=72)
        if pm.width > 0 and pm.height > 0:
            pixel = pm.pixel(0, 0)
            return (pixel[0] / 255.0, pixel[1] / 255.0, pixel[2] / 255.0)
    except Exception:
        pass
    return (1, 1, 1)


# ═══════════════════════════════════════════
#  MAIN: REPLACE TEXT IN PDF
# ═══════════════════════════════════════════

def replace_text_in_pdf(pdf_path, old_text, new_text, output_path=None, set_bold=None):
    if not PYMUPDF_SUPPORT:
        print("[PDF-Edit] PyMuPDF not available")
        return False

    old_clean = old_text.strip()
    new_clean = new_text.strip()
    if not old_clean:
        return False

    inserted_positions = _load_inserted_positions(pdf_path)
    def strip_icons(text):
        while text and (ord(text[0]) > 127 or text[0] in '#§¶†‡•◦▪▫■□●○♦♠♣♥★☆✓✗✦✧'):
            text = text[1:]
        return text.strip()
    
    old_clean = strip_icons(old_clean)
    new_clean = strip_icons(new_clean)
    if not old_clean:
        return False

    src = str(pdf_path)
    out = str(output_path or pdf_path)

    try:
        doc = fitz.open(src)
        for page_num in range(len(doc)):
            page = doc[page_num]
            page_text = page.get_text()
            page_text_clean = page_text.replace('\ufffd', ' ')
            if old_clean not in page_text_clean:
                normalized_page = re.sub(r'\s+', ' ', page_text_clean)
                normalized_old = re.sub(r'\s+', ' ', old_clean)
                if normalized_old not in normalized_page:
                    continue
            
            ok = _replace_in_content_stream(doc, page, old_clean, new_clean, set_bold=set_bold)
            if ok:
                _sync_link_rects(doc, page)
                import tempfile, shutil, os
                tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf", dir=str(Path(out).parent))
                os.close(tmp_fd)
                try:
                    doc.save(tmp_path, garbage=3, deflate=True)
                    doc.close()
                    shutil.move(tmp_path, out)
                    return True
                except Exception as e:
                    print(f"[PDF-Edit] Content stream save failed: {e}")
                    doc.close()
                    try: os.unlink(tmp_path)
                    except: pass
        doc.close()
        print("[PDF-Edit] Content stream approach didn't match, trying redact approach")
    except Exception as e:
        print(f"[PDF-Edit] Content stream approach failed: {e}")
        try: doc.close()
        except: pass

    try:
        doc = fitz.open(src)
    except Exception as e:
        print(f"[PDF-Edit] Cannot open PDF: {e}")
        return False

    replaced = False

    for page_num in range(len(doc)):
        page = doc[page_num]

        rects = page.search_for(old_clean)

        if not rects:
            normalized = re.sub(r'\s+', ' ', old_clean)
            if normalized != old_clean:
                rects = page.search_for(normalized)

        if not rects and len(old_clean) > 30:
            rects = page.search_for(old_clean[:30])

        if not rects:
            page_text = page.get_text()
            pattern = re.sub(r'\s+', r'\\s+', re.escape(old_clean))
            match = re.search(pattern, page_text)
            if match:
                found_text = match.group()
                rects = page.search_for(found_text)

        if not rects:
            continue

        span_info = _get_text_span_info(page, old_clean)
        if not span_info and len(old_clean) > 60:
            span_info = _get_text_span_info(page, old_clean[:40])

        fontsize = 10
        color = (0, 0, 0)
        origin_y = rects[0].y1 - 2
        font = fitz.Font("helv")

        if span_info:
            fontsize = span_info.get("size", 10)
            c = span_info.get("color", 0)
            if isinstance(c, int):
                color = (
                    ((c >> 16) & 0xFF) / 255.0,
                    ((c >> 8) & 0xFF) / 255.0,
                    (c & 0xFF) / 255.0,
                )
            origin_y = span_info.get("origin", (0, rects[0].y1 - 2))[1]
            font = _get_font_for_span(doc, page, span_info)

        bg_color = _get_background_color(page, rects[0])

        target_line = None
        target_span_indices = []
        all_line_spans = []

        try:
            blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]
            for block in blocks:
                if "lines" not in block:
                    continue
                for line in block["lines"]:
                    line_text = ""
                    span_entries = []
                    for si, span in enumerate(line["spans"]):
                        start = len(line_text)
                        line_text += span["text"]
                        end = len(line_text)
                        span_entries.append({
                            "idx": si,
                            "start": start, "end": end,
                            "text": span["text"],
                            "bbox": fitz.Rect(span["bbox"]),
                            "font": span.get("font", ""),
                            "size": span.get("size", 10),
                            "color": span.get("color", 0),
                            "flags": span.get("flags", 0),
                            "origin": span.get("origin", (span["bbox"][0], span["bbox"][3])),
                            "is_icon": _is_icon_or_symbol(span["text"], span.get("font", "")),
                        })

                    idx = line_text.find(old_clean)
                    if idx == -1:
                        normalized_line = re.sub(r'\s+', ' ', line_text)
                        normalized_old = re.sub(r'\s+', ' ', old_clean)
                        idx = normalized_line.find(normalized_old)

                    if idx == -1:
                        continue

                    target_line = line
                    all_line_spans = span_entries
                    end_idx = idx + len(old_clean)

                    for se in span_entries:
                        if se["end"] <= idx or se["start"] >= end_idx:
                            continue
                        if se["is_icon"]:
                            continue
                        target_span_indices.append(se["idx"])
                    break
                if target_line:
                    break
        except Exception as e:
            print(f"[PDF-Edit] Line analysis failed: {e}")

        precise_rects = []
        for si in target_span_indices:
            if si < len(all_line_spans):
                precise_rects.append(all_line_spans[si]["bbox"])

        old_text_width = 0
        if precise_rects:
            old_text_x0 = min(r.x0 for r in precise_rects)
            old_text_x1 = max(r.x1 for r in precise_rects)
            old_text_width = old_text_x1 - old_text_x0
        elif rects:
            old_text_width = rects[0].width

        after_spans = []
        if target_span_indices and all_line_spans:
            max_target_idx = max(target_span_indices)

            for se in all_line_spans:
                if se["idx"] <= max_target_idx:
                    continue
                after_spans.append(se)

            if target_line is not None:
                target_y = target_line["bbox"][1]
                target_x1 = max(all_line_spans[i]["bbox"].x1 for i in target_span_indices)
                try:
                    for block in blocks:
                        if "lines" not in block:
                            continue
                        for line in block["lines"]:
                            if line is target_line:
                                continue
                            line_y = line["bbox"][1]
                            if abs(line_y - target_y) > 5:
                                continue
                            if line["bbox"][0] <= target_x1:
                                continue
                            for span in line["spans"]:
                                after_spans.append({
                                    "idx": -1,
                                    "text": span["text"],
                                    "bbox": fitz.Rect(span["bbox"]),
                                    "font": span.get("font", ""),
                                    "size": span.get("size", 10),
                                    "color": span.get("color", 0),
                                    "flags": span.get("flags", 0),
                                    "origin": span.get("origin", (span["bbox"][0], span["bbox"][3])),
                                    "is_icon": _is_icon_or_symbol(span["text"], span.get("font", "")),
                                })
                except Exception as e:
                    print(f"[PDF-Edit] Cross-line reflow detection error: {e}")

        redact_rects = list(precise_rects) if precise_rects else list(rects)
        
        if not precise_rects and len(old_clean) > 60:
            old_words = old_clean.split()
            first_words = ' '.join(old_words[:4])
            
            para_top = rects[0].y0 if rects else 0
            para_bottom = rects[0].y1 if rects else 0
            para_x0 = rects[0].x0 if rects else 36
            found_start = False
            
            all_page_lines = []
            for block in page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]:
                if "lines" not in block:
                    continue
                for line in block["lines"]:
                    line_text = ''.join(s["text"] for s in line["spans"]).strip()
                    if line_text:
                        all_page_lines.append((line["bbox"][1], line, line_text))
            all_page_lines.sort(key=lambda x: x[0])
            
            start_idx = -1
            for i, (ly, line, lt) in enumerate(all_page_lines):
                if first_words[:20] in lt:
                    start_idx = i
                    para_top = line["bbox"][1]
                    para_bottom = line["bbox"][3]
                    found_start = True
                    break
            
            if found_start:
                para_lines = [all_page_lines[start_idx][1]]
                
                for i in range(start_idx + 1, len(all_page_lines)):
                    ly, line, lt = all_page_lines[i]
                    prev_bottom = para_bottom
                    gap = ly - prev_bottom
                    
                    if gap > 20:
                        break
                    
                    # Don't include inserted lines in the redact rect
                    line_y_bottom = line["bbox"][3]
                    if any(pg == page_num and abs(iy - line_y_bottom) < 6 for (pg, iy) in inserted_positions):
                        break

                    is_header = (lt == lt.upper() and len(lt) < 30 and len(lt) > 2)
                    if is_header:
                        break
                    
                    line_x0 = line["bbox"][0]
                    if line_x0 < para_x0 - 10:
                        break
                    
                    para_bottom = max(para_bottom, line["bbox"][3])
                    para_lines.append(line)
                
                if para_lines:
                    full_rect = fitz.Rect(
                        min(l["bbox"][0] for l in para_lines),
                        para_top,
                        max(l["bbox"][2] for l in para_lines),
                        para_bottom
                    )
                    redact_rects = [full_rect]
                    print(f"[PDF-Edit] Multi-line paragraph redact: {len(para_lines)} lines, area y=[{para_top:.0f}, {para_bottom:.0f}]")
        
        reflow_needed = len(after_spans) > 0 and precise_rects
        reflow_text_spans = []
        if reflow_needed:
            for se in after_spans:
                if se["is_icon"]:
                    continue
                reflow_text_spans.append(se)
                redact_rects.append(se["bbox"])

        page.clean_contents()
        
        for rect in redact_rects:
            annot = page.add_redact_annot(rect)
            annot.set_colors(fill=bg_color)
            annot.update()
        page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

        pre_reflow_done = False
        if rects:
            pre_old_top = min(r.y0 for r in rects)
            pre_old_bottom = max(r.y1 for r in rects)
            pre_old_height = pre_old_bottom - pre_old_top
            
            if pre_old_height < fontsize * 2 and len(old_clean) > 60:
                old_words = old_clean.split()[:5]
                last_words = old_clean.split()[-5:]
                first_key = ' '.join(old_words)
                last_key = ' '.join(last_words)
                true_top = pre_old_top
                true_bottom = pre_old_bottom
                for block in page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]:
                    if "lines" not in block:
                        continue
                    for line in block["lines"]:
                        line_text = ''.join(s["text"] for s in line["spans"])
                        if first_key and first_key[:20] in line_text:
                            true_top = min(true_top, line["bbox"][1])
                        if last_key and last_key[-20:] in line_text:
                            true_bottom = max(true_bottom, line["bbox"][3])
                        if line["bbox"][1] >= true_top - 2 and line["bbox"][3] <= true_bottom + 40:
                            line_clean = line_text.strip()
                            if line_clean and line_clean[:15] in old_clean:
                                true_bottom = max(true_bottom, line["bbox"][3])
                if true_bottom - true_top > pre_old_height + 5:
                    pre_old_top = true_top
                    pre_old_bottom = true_bottom
                    pre_old_height = pre_old_bottom - pre_old_top
            
            if font:
                try:
                    est_text_width = font.text_length(new_clean, fontsize=fontsize)
                except:
                    est_text_width = len(new_clean) * fontsize * 0.5
            else:
                est_text_width = len(new_clean) * fontsize * 0.5
            
            est_available_width = page.rect.width - (precise_rects[0].x0 if precise_rects else rects[0].x0) - 36
            if est_available_width < 50:
                est_available_width = 500
            est_num_lines = max(1, int(est_text_width / est_available_width) + (1 if est_text_width % est_available_width > 0 else 0))
            est_line_height = fontsize * 1.3
            pre_new_height = est_num_lines * est_line_height
            
            pre_height_diff = pre_old_height - pre_new_height

            # Guard: if old and new texts are similar length (within 20%),
            # the line count almost certainly hasn't changed — skip reflow.
            old_len = len(old_clean)
            new_len = len(new_clean)
            similar_length = old_len > 0 and abs(old_len - new_len) / max(old_len, new_len) < 0.20

            if similar_length and abs(pre_height_diff) <= pre_old_height * 0.5:
                print(f"[PDF-Edit] Skipping reflow — text lengths similar ({old_len}→{new_len} chars), height change likely due to truncation")
                pre_height_diff = 0

            if pre_height_diff > 5:
                print(f"[PDF-Edit] Vertical reflow: old_h={pre_old_height:.1f}, new_h={pre_new_height:.1f}, shift_up={pre_height_diff:.1f}pt below y={pre_old_bottom:.1f}")
                _reflow_page_vertical(doc, page, pre_old_bottom, pre_height_diff)
                pre_reflow_done = True
            elif pre_height_diff < -5:
                shift_down = abs(pre_height_diff)
                print(f"[PDF-Edit] Vertical reflow DOWN: old_h={pre_old_height:.1f}, new_h={pre_new_height:.1f}, shift_down={shift_down:.1f}pt below y={pre_old_bottom:.1f}")
                _reflow_page_vertical_down(doc, page, pre_old_bottom, shift_down)
                _handle_page_overflow(doc, page)
                page = doc[page_num]
                pre_reflow_done = True

            # Always remove the white fill rect left by apply_redactions()
            _remove_redact_fills(doc, page, pre_old_top, pre_old_bottom)

        if precise_rects:
            insert_x = precise_rects[0].x0
        else:
            insert_x = rects[0].x0
        insert_point = fitz.Point(insert_x, origin_y)
        inserted = False
        original_font_name = span_info.get("font", "") if span_info else ""

        font_has_all_glyphs = False
        if font:
            try:
                font_has_all_glyphs = True
                for ch in new_clean:
                    if ch == ' ':
                        continue
                    adv = font.glyph_advance(ord(ch))
                    if adv == 0:
                        font_has_all_glyphs = False
                        print(f"[PDF-Edit] Extracted font missing glyph for '{ch}' (U+{ord(ch):04X})")
                        break
                if font_has_all_glyphs:
                    print(f"[PDF-Edit] Extracted font has all needed glyphs ✓")
            except Exception:
                font_has_all_glyphs = False

        if not inserted and font and font_has_all_glyphs:
            try:
                tw = fitz.TextWriter(page.rect)
                text_w = font.text_length(new_clean, fontsize=fontsize)
                available_w = page.rect.width - insert_point.x - 36
                if text_w > available_w * 1.1:
                    orig_line_spacing = fontsize * 1.3
                    if len(rects) >= 2:
                        y_levels = sorted(set(round(r.y0, 1) for r in rects))
                        if len(y_levels) >= 2:
                            orig_line_spacing = y_levels[1] - y_levels[0]
                        if orig_line_spacing < fontsize * 0.8 or orig_line_spacing > fontsize * 3:
                            orig_line_spacing = fontsize * 1.3
                    
                    words = new_clean.split()
                    lines_out = []
                    current_line = ""
                    max_w = page.rect.width - insert_point.x - 36
                    
                    for word in words:
                        test = current_line + (" " if current_line else "") + word
                        w = font.text_length(test, fontsize=fontsize)
                        if w > max_w and current_line:
                            lines_out.append(current_line)
                            current_line = word
                        else:
                            current_line = test
                    if current_line:
                        lines_out.append(current_line)
                    
                    y_pos = insert_point.y
                    for i, line_text in enumerate(lines_out):
                        is_last_line = (i == len(lines_out) - 1)
                        line_words = line_text.split()
                        
                        if not is_last_line and len(line_words) > 1:
                            total_text_w = sum(font.text_length(w, fontsize=fontsize) for w in line_words)
                            total_space = max_w - total_text_w
                            word_gap = total_space / (len(line_words) - 1)
                            
                            x_pos = insert_point.x
                            for wi, word in enumerate(line_words):
                                tw.append(fitz.Point(x_pos, y_pos), word, font=font, fontsize=fontsize)
                                x_pos += font.text_length(word, fontsize=fontsize) + word_gap
                        else:
                            tw.append(fitz.Point(insert_point.x, y_pos), line_text, font=font, fontsize=fontsize)
                        
                        y_pos += orig_line_spacing
                    
                    page._tw_last_point_y = y_pos - orig_line_spacing
                else:
                    tw.append(insert_point, new_clean, font=font, fontsize=fontsize)
                tw.write_text(page, color=color)
                print(f"[PDF-Edit] ✓ Inserted with extracted font (TextWriter)")
                inserted = True
            except Exception as e:
                print(f"[PDF-Edit] TextWriter with extracted font failed: {e}")

        if not inserted and original_font_name and font_has_all_glyphs:
            try:
                page_fonts = page.get_fonts()
                for pf in page_fonts:
                    pf_name = pf[3] if len(pf) > 3 else ""
                    if pf_name and (original_font_name in pf_name or pf_name in original_font_name):
                        fontname_on_page = pf[4] if len(pf) > 4 else pf_name
                        try:
                            rc = page.insert_text(
                                insert_point, new_clean,
                                fontsize=fontsize, fontname=fontname_on_page, color=color,
                            )
                            if rc > 0:
                                print(f"[PDF-Edit] ✓ Inserted with page font: {fontname_on_page}")
                                inserted = True
                                break
                        except Exception:
                            continue
            except Exception as e:
                print(f"[PDF-Edit] Page font approach failed: {e}")

        if not inserted:
            try:
                base = _map_to_base_font(original_font_name)
                bold = _is_bold_font(original_font_name, span_info.get("flags", 0) if span_info else 0)
                italic = _is_italic_font(original_font_name, span_info.get("flags", 0) if span_info else 0)
                if bold:
                    if "tiro" in base:
                        base = "tibo"
                    elif "helv" in base:
                        base = "hebo"
                    elif "cour" in base:
                        base = "cobo"
                if italic and not bold:
                    if "tiro" in base:
                        base = "tiit"
                    elif "helv" in base:
                        base = "heit"
                    elif "cour" in base:
                        base = "coit"

                rc = _insert_wrapped_text(page, insert_point, new_clean, fontsize, base, color)
                if rc:
                    print(f"[PDF-Edit] ✓ Inserted with base font: {base} (original: {original_font_name})")
                    inserted = True
            except Exception as e:
                print(f"[PDF-Edit] Base font insert failed: {e}")

        if not inserted:
            try:
                rc = _insert_wrapped_text(page, insert_point, new_clean, fontsize, "helv", color)
                if rc:
                    print(f"[PDF-Edit] ⚠ Used helv fallback for '{original_font_name}'")
                    inserted = True
                else:
                    page.insert_text(insert_point, new_clean, fontsize=fontsize, fontname="helv", color=color)
                    inserted = True
            except Exception as e2:
                print(f"[PDF-Edit] All insert methods failed: {e2}")
                doc.close()
                return False

        replaced = True

        if reflow_needed and reflow_text_spans:
            new_text_width = 0
            try:
                if font:
                    tl = font.text_length(new_clean, fontsize=fontsize)
                    new_text_width = tl
                else:
                    new_text_width = len(new_clean) * fontsize * 0.5
            except Exception:
                new_text_width = len(new_clean) * fontsize * 0.5

            shift = old_text_width - new_text_width
            if abs(shift) > 0.5:
                print(f"[PDF-Edit] Reflowing {len(reflow_text_spans)} text spans by {shift:.1f}pt (old={old_text_width:.1f}, new={new_text_width:.1f})")

                icon_positions = []
                for se in after_spans:
                    if se["is_icon"]:
                        icon_positions.append(se["bbox"].x0)

                for se in reflow_text_spans:
                    span_orig_x = se["origin"][0]
                    span_new_x = span_orig_x - shift

                    closest_icon_x = None
                    for ix in icon_positions:
                        if ix < span_orig_x:
                            if closest_icon_x is None or ix > closest_icon_x:
                                closest_icon_x = ix

                    if closest_icon_x is not None:
                        if span_new_x < closest_icon_x + 2:
                            span_new_x = span_orig_x
                            print(f"[PDF-Edit] Skipping reflow for '{se['text'][:20]}' (would overlap icon)")

                    span_y = se["origin"][1]
                    span_text = se["text"]
                    span_font_name = se["font"]
                    span_fontsize = se["size"]
                    span_color_int = se["color"]

                    if isinstance(span_color_int, int):
                        sc = (
                            ((span_color_int >> 16) & 0xFF) / 255.0,
                            ((span_color_int >> 8) & 0xFF) / 255.0,
                            (span_color_int & 0xFF) / 255.0,
                        )
                    else:
                        sc = (0, 0, 0)

                    if not span_text.strip():
                        continue

                    span_font_obj = _try_extract_font(doc, page, span_font_name)

                    reflow_inserted = False

                    if span_font_obj:
                        try:
                            all_ok = all(span_font_obj.has_glyph(ord(c)) != 0 for c in span_text if c != ' ')
                            if all_ok:
                                tw = fitz.TextWriter(page.rect)
                                tw.append(fitz.Point(span_new_x, span_y), span_text, font=span_font_obj, fontsize=span_fontsize)
                                tw.write_text(page, color=sc)
                                reflow_inserted = True
                        except Exception:
                            pass

                    if not reflow_inserted:
                        try:
                            base = _map_to_base_font(span_font_name)
                            bold = _is_bold_font(span_font_name, se.get("flags", 0))
                            if bold:
                                base = {"tiro": "tibo", "helv": "hebo", "cour": "cobo"}.get(base, base)
                            page.insert_text(
                                fitz.Point(span_new_x, span_y), span_text,
                                fontsize=span_fontsize, fontname=base, color=sc,
                            )
                        except Exception:
                            try:
                                page.insert_text(fitz.Point(span_new_x, span_y), span_text,
                                                 fontsize=span_fontsize, fontname="helv", color=sc)
                            except Exception:
                                print(f"[PDF-Edit] Could not reflow span: {repr(span_text)}")
            else:
                print(f"[PDF-Edit] No reflow needed (shift={shift:.1f}pt)")

        break

    if replaced:
        import tempfile, shutil
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf", dir=str(Path(out).parent))
        try:
            import os
            os.close(tmp_fd)
            doc.save(tmp_path, garbage=3, deflate=True)
            doc.close()
            shutil.move(tmp_path, out)
        except Exception as e:
            print(f"[PDF-Edit] Save to temp failed: {e}")
            doc.close()
            try:
                os.unlink(tmp_path)
            except:
                pass
            replaced = False
    else:
        doc.close()

    return replaced


def _find_bt_et_blocks(stream):
    blocks = []
    i = 0
    n = len(stream)
    while i < n:
        if stream[i] == '(':
            depth = 1
            i += 1
            while i < n and depth > 0:
                if stream[i] == '\\':
                    i += 2
                    continue
                if stream[i] == '(':
                    depth += 1
                elif stream[i] == ')':
                    depth -= 1
                i += 1
            continue
        if stream[i:i+2] == 'BT' and (i == 0 or not stream[i-1].isalpha()) and (i+2 >= n or not stream[i+2].isalpha()):
            bt_start = i
            j = i + 2
            while j < n:
                if stream[j] == '(':
                    depth = 1
                    j += 1
                    while j < n and depth > 0:
                        if stream[j] == '\\':
                            j += 2
                            continue
                        if stream[j] == '(':
                            depth += 1
                        elif stream[j] == ')':
                            depth -= 1
                        j += 1
                    continue
                if stream[j:j+2] == 'ET' and (j == 0 or not stream[j-1].isalpha()) and (j+2 >= n or not stream[j+2].isalpha()):
                    blocks.append((bt_start, j + 2))
                    i = j + 2
                    break
                j += 1
            else:
                i += 1
            continue
        i += 1
    return blocks


def _remove_redact_fills(doc, page, top_y, bottom_y):
    import re
    try:
        page.clean_contents()
        contents_xrefs = page.get_contents()
        if not contents_xrefs:
            return
        xref = contents_xrefs[0]
        stream = doc.xref_stream(xref).decode('latin-1')
        
        page_height = page.rect.height
        pdf_top_y = page_height - bottom_y
        pdf_bottom_y = page_height - top_y
        
        pattern = re.compile(
            r'q\s+1\s+1\s+1\s+rg\s+1\s+1\s+1\s+RG\s+'
            r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+'
            r're\s+B\s+Q'
        )
        
        def check_fill(m):
            x, y, w, h = float(m.group(1)), float(m.group(2)), float(m.group(3)), float(m.group(4))
            if pdf_top_y - 2 <= y <= pdf_bottom_y + 2:
                return ''
            return m.group(0)
        
        new_stream = pattern.sub(check_fill, stream)
        
        if new_stream != stream:
            doc.update_stream(xref, new_stream.encode('latin-1', errors='replace'))
            print(f"[PDF-Edit] ✓ Removed redaction fill rects in y range [{top_y:.0f}, {bottom_y:.0f}]")
    except Exception as e:
        print(f"[PDF-Edit] Remove redact fills error: {e}")


def _reflow_page_vertical(doc, page, below_y, shift_up):
    import re
    
    if shift_up <= 0:
        return
    
    page_height = page.rect.height
    pdf_below_y = page_height - below_y
    
    try:
        page.clean_contents()
        contents_xrefs = page.get_contents()
        if not contents_xrefs:
            return
        xref = contents_xrefs[0]
        stream = doc.xref_stream(xref).decode('latin-1')
        
        result_parts = []
        pos = 0
        
        bt_blocks = _find_bt_et_blocks(stream)
        
        for bt_start, bt_end in bt_blocks:
            result_parts.append(stream[pos:bt_start])
            
            bt_content = stream[bt_start+2:bt_end-2]
            abs_y = 0
            first_pos_set = False
            new_bt_content = ""
            bt_pos = 0
            
            op_re = re.compile(
                r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(Td|TD)\b'
                r'|'
                r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+Tm\b'
            )
            
            for op_match in op_re.finditer(bt_content):
                new_bt_content += bt_content[bt_pos:op_match.start()]
                
                if op_match.group(3):
                    x_val = float(op_match.group(1))
                    y_val = float(op_match.group(2))
                    op = op_match.group(3)
                    
                    if not first_pos_set:
                        abs_y = y_val
                        first_pos_set = True
                        if abs_y < pdf_below_y:
                            new_y = y_val + shift_up
                            new_bt_content += f'{x_val:.5g} {new_y:.5g} {op}'
                            abs_y = new_y
                        else:
                            new_bt_content += op_match.group(0)
                    else:
                        prev_abs_y = abs_y
                        abs_y += y_val
                        
                        if prev_abs_y >= pdf_below_y and abs_y < pdf_below_y:
                            new_y = y_val + shift_up
                            new_bt_content += f'{x_val:.5g} {new_y:.5g} {op}'
                            abs_y = prev_abs_y + new_y
                        elif abs_y < pdf_below_y and prev_abs_y < pdf_below_y:
                            new_bt_content += op_match.group(0)
                        else:
                            new_bt_content += op_match.group(0)
                
                elif op_match.group(9) is not None or op_match.group(4) is not None:
                    a = float(op_match.group(4))
                    b = float(op_match.group(5))
                    c = float(op_match.group(6))
                    d = float(op_match.group(7))
                    e = float(op_match.group(8))
                    f_val = float(op_match.group(9))
                    abs_y = f_val
                    first_pos_set = True
                    
                    if f_val < pdf_below_y:
                        new_f = f_val + shift_up
                        new_bt_content += f'{a:.5g} {b:.5g} {c:.5g} {d:.5g} {e:.5g} {new_f:.5g} Tm'
                        abs_y = new_f
                    else:
                        new_bt_content += op_match.group(0)
                else:
                    new_bt_content += op_match.group(0)
                
                bt_pos = op_match.end()
            
            new_bt_content += bt_content[bt_pos:]
            result_parts.append(f'BT{new_bt_content}ET')
            pos = bt_end
        
        result_parts.append(stream[pos:])
        new_stream = ''.join(result_parts)
        
        bt_blocks_new = _find_bt_et_blocks(new_stream)
        final_parts = []
        fpos = 0
        for bt_s, bt_e in bt_blocks_new:
            outside = new_stream[fpos:bt_s]
            
            def shift_cm(cm_m):
                vals = [float(cm_m.group(i)) for i in range(1, 7)]
                if vals[5] < pdf_below_y:
                    vals[5] += shift_up
                return f'{vals[0]:.5g} {vals[1]:.5g} {vals[2]:.5g} {vals[3]:.5g} {vals[4]:.5g} {vals[5]:.5g} cm'
            
            outside = re.sub(
                r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+cm\b',
                shift_cm, outside
            )
            final_parts.append(outside)
            final_parts.append(new_stream[bt_s:bt_e])
            fpos = bt_e
        
        final_parts.append(new_stream[fpos:])
        
        new_stream = ''.join(final_parts)
        doc.update_stream(xref, new_stream.encode('latin-1', errors='replace'))
        
    except Exception as e:
        print(f"[PDF-Edit] Vertical reflow stream error: {e}")
        import traceback; traceback.print_exc()
    
    try:
        links = page.get_links()
        links_to_update = []
        for link in links:
            rect = link.get("from", fitz.Rect())
            if not rect.is_empty and rect.y0 > below_y:
                links_to_update.append(link)
        
        for link in links_to_update:
            rect = link["from"]
            new_rect = fitz.Rect(rect.x0, rect.y0 - shift_up, rect.x1, rect.y1 - shift_up)
            page.delete_link(link)
            new_link = {"kind": link.get("kind", 2), "from": new_rect}
            if "uri" in link:
                new_link["uri"] = link["uri"]
            page.insert_link(new_link)
    except Exception as e:
        print(f"[PDF-Edit] Vertical reflow links error: {e}")
    
    print(f"[PDF-Edit] ✓ Vertical reflow: shifted {shift_up:.1f}pt up below y={below_y:.1f}")


def _sync_link_rects(doc, page):
    try:
        links = page.get_links()
        if not links:
            return
        
        blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]
        text_spans = []
        for block in blocks:
            if "lines" not in block:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    text_spans.append({
                        "text": span["text"],
                        "bbox": fitz.Rect(span["bbox"]),
                        "font": span.get("font", ""),
                    })
        
        for i, link in enumerate(links):
            if link.get("kind") != 2:
                continue
            uri = link.get("uri", "")
            if not uri:
                continue
            
            old_rect = link["from"]
            
            row_spans = []
            for sp in text_spans:
                if sp["bbox"].y0 < old_rect.y1 + 2 and sp["bbox"].y1 > old_rect.y0 - 2:
                    if not _is_icon_or_symbol(sp["text"], sp["font"]):
                        row_spans.append(sp)
            
            if not row_spans:
                continue
            
            best_span = None
            best_dist = float("inf")
            for sp in row_spans:
                dist = abs(sp["bbox"].x0 - old_rect.x0)
                if dist < best_dist:
                    best_dist = dist
                    best_span = sp
            
            if best_span and best_dist > 5:
                new_x0 = best_span["bbox"].x0
                new_x1 = best_span["bbox"].x1
                
                for sp in row_spans:
                    if abs(sp["bbox"].y0 - best_span["bbox"].y0) < 3:
                        if abs(sp["bbox"].x0 - new_x1) < 5:
                            new_x1 = sp["bbox"].x1
                
                new_rect = fitz.Rect(new_x0, old_rect.y0, new_x1, old_rect.y1)
                
                page.delete_link(link)
                page.insert_link({
                    "kind": 2,
                    "from": new_rect,
                    "uri": uri,
                })
                print(f"[PDF-Edit] Synced link rect: {uri[:40]} x={old_rect.x0:.0f}→{new_x0:.0f}")
    except Exception as e:
        print(f"[PDF-Edit] Link rect sync error: {e}")


def replace_link_in_pdf(pdf_path, old_url, new_url, output_path=None):
    if not PYMUPDF_SUPPORT:
        return False

    try:
        doc = fitz.open(str(pdf_path))
    except Exception:
        return False

    out = str(output_path or pdf_path)
    replaced = False

    for page in doc:
        for link in page.get_links():
            uri = link.get("uri", "")
            if old_url.strip() in uri or uri in old_url.strip():
                link["uri"] = new_url.strip()
                page.update_link(link)
                replaced = True

    if replaced:
        import tempfile, shutil, os
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf", dir=str(Path(out).parent))
        try:
            os.close(tmp_fd)
            doc.save(tmp_path, garbage=3, deflate=True)
            doc.close()
            shutil.move(tmp_path, out)
        except Exception as e:
            print(f"[PDF-Edit] Link save failed: {e}")
            doc.close()
            try: os.unlink(tmp_path)
            except: pass
            replaced = False
    else:
        doc.close()
    return replaced


# ═══════════════════════════════════════════
#  EXTRACT FIELDS FROM PDF (for future use)
# ═══════════════════════════════════════════

def extract_pdf_text_blocks(pdf_path):
    if not PYMUPDF_SUPPORT:
        return []

    doc = fitz.open(str(pdf_path))
    results = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        blocks = page.get_text("dict")["blocks"]
        for block in blocks:
            if "lines" not in block:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    if span["text"].strip():
                        results.append({
                            "page": page_num,
                            "text": span["text"],
                            "font": span["font"],
                            "size": span["size"],
                            "color": span["color"],
                            "flags": span["flags"],
                            "origin": span["origin"],
                            "bbox": span["bbox"],
                        })
    doc.close()
    return results


# ═══════════════════════════════════════════
#  PDF FIELD EXTRACTION FOR SIDEBAR
# ═══════════════════════════════════════════

_SECTION_PATTERNS = [
    {"key": "summary", "label": "Professional Summary", "color": "#7c3aed",
     "pattern": r"^(professional\s*)?summary|profile|objective|about\s*me"},
    {"key": "skills", "label": "Skills", "color": "#059669",
     "pattern": r"^(technical\s*)?skills|competenc|technologies"},
    {"key": "experience", "label": "Work Experience", "color": "#2563eb",
     "pattern": r"^(work\s*)?experience|employment|work\s*history"},
    {"key": "projects", "label": "Projects", "color": "#dc2626",
     "pattern": r"^projects?"},
    {"key": "education", "label": "Education", "color": "#d97706",
     "pattern": r"^education|academic|qualifications?"},
    {"key": "certifications", "label": "Certifications", "color": "#0891b2",
     "pattern": r"^certifications?|certificates?"},
    {"key": "contact", "label": "Contact", "color": "#6366f1",
     "pattern": r"^contact"},
]


def _detect_section_pdf(text, is_large=False, is_bold=False):
    t = text.strip()
    if len(t) > 60 or len(t) < 3:
        return None
    for s in _SECTION_PATTERNS:
        if re.match(s["pattern"], t, re.IGNORECASE):
            return s
    return None


def _classify_field_pdf(text, section_key):
    if re.search(r'[\w.-]+@[\w.-]+\.\w+', text):
        return "email"
    if re.search(r'^\+?\d[\d\s\-()]{8,}', text):
        return "phone"
    if re.search(r'linkedin\.com|github\.com|linkedin|github', text, re.IGNORECASE):
        return "link"
    return "text"


def _is_icon_or_symbol(text, font_name):
    t = text.strip()
    if not t:
        return True
    font_lower = (font_name or "").lower()
    icon_fonts = ["fontawesome", "symbol", "wingding", "webding", "icon",
                  "dingbat", "zapf", "material", "awesome", "glyphicon",
                  "fa-", "icomoon"]
    if any(f in font_lower for f in icon_fonts):
        return True
    if len(t) == 1 and (ord(t[0]) > 127 or t in "§¶†‡◦▪▫■□●○♦♠♣♥★☆✓✗✦✧#") and t != '•':
        return True
    if len(t) <= 2 and not t.isalnum() and not t in ".,;:!?-–—()[]{}'\"/\\@#$%&*+=<>|~`^_":
        return True
    return False


def _get_links_from_pdf(pdf_path):
    doc = fitz.open(str(pdf_path))
    links = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        for link in page.get_links():
            uri = link.get("uri", "")
            if uri and not uri.startswith("mailto:"):
                rect = link.get("from", fitz.Rect())
                links.append({
                    "page": page_num,
                    "url": uri,
                    "rect": rect,
                })
    doc.close()
    return links


# ═══════════════════════════════════════════
#  COLUMN SPLIT — fixes two-column PDF layouts
#  where section headers share a Y baseline
#  with body text (e.g. shaded sidebar headers)
# ═══════════════════════════════════════════

def _split_spans_by_columns(spans, page_width, min_gap=50.0):
    """
    Split a list of non-icon spans into column groups when a large X gap exists.

    Why this matters: PDFs render every glyph at an absolute (x, y) position.
    PyMuPDF groups glyphs that share the same baseline Y into a single `line`
    object — even if they belong to completely separate visual columns (e.g.
    left-column body text at x≈36 and a right-column section header box at
    x≈430). Without this split, both get concatenated into one field text,
    producing garbled labels like "SK Programming: ...SKILLS NI".

    min_gap=50pt is safe: normal inter-word spacing is 2-6pt, so we only fire
    on genuine column separations (tables, two-column layouts, sidebar headers).
    """
    if not spans:
        return []
    # Sort by x0 so we process left-to-right regardless of span order in the PDF
    sorted_spans = sorted(spans, key=lambda s: s["bbox"][0])
    groups = []
    current = [sorted_spans[0]]
    for span in sorted_spans[1:]:
        prev_x1 = current[-1]["bbox"][2]
        this_x0 = span["bbox"][0]
        if this_x0 - prev_x1 > min_gap:
            groups.append(current)
            current = [span]
        else:
            current.append(span)
    groups.append(current)
    return groups

def delete_field(pdf_path, para_index, field_text=None, output_path=None):
    """
    Delete any field (existing or inserted) from the PDF with no white space.

    Strategy: direct content stream manipulation.
    - Find the BT/ET blocks whose Tm y falls within the line's bbox
    - Remove those blocks entirely (no redact rectangle = no white space)
    - Shift all remaining BT blocks below the deletion upward in the same pass
    - Works for both LaTeX (BT/Tm) PDFs and plain BT/Td PDFs
    """
    import tempfile, shutil, os, json as _json

    src = str(pdf_path)
    out = output_path or src

    # ── 1. Find target field ──────────────────────────────────────────────────
    fields = extract_pdf_fields(src)
    target = None

    for f in fields:
        if f.get("paraIndex") == para_index:
            target = f
            break

    if not target and field_text:
        needle = field_text.strip()
        for f in fields:
            if f.get("text", "").strip() == needle:
                target = f
                break
        if target:
            print(f"[PDF-DeleteField] paraIndex mismatch — matched by text: '{needle[:40]}'")

    if not target:
        print(f"[PDF-DeleteField] ✗ Field not found: paraIndex={para_index} text='{(field_text or '')[:40]}'")
        return False

    is_inserted = bool(target.get("isInserted"))
    page_num    = target.get("page", 0)
    bbox        = target.get("bbox", [0, 0, 0, 0])

    # ── 2. Stream-based delete + reflow ──────────────────────────────────────
    try:
        doc  = fitz.open(src)
        page = doc[page_num]
        page_height = page.rect.height

        line_top_screen    = float(bbox[1])
        line_bottom_screen = float(bbox[3])

        # Convert screen coords (y=0 top) to PDF coords (y=0 bottom)
        line_top_pdf    = page_height - line_bottom_screen
        line_bottom_pdf = page_height - line_top_screen

        print(f"[PDF-DeleteField] Deleting line screen_y=[{line_top_screen:.1f},{line_bottom_screen:.1f}] "
              f"pdf_y=[{line_top_pdf:.1f},{line_bottom_pdf:.1f}] page={page_num}")

        # Merge all content stream fragments into one xref
        page.clean_contents()
        xrefs = page.get_contents()
        if not xrefs:
            print(f"[PDF-DeleteField] No content stream found")
            doc.close()
            return False

        xref = xrefs[0]
        stream = doc.xref_stream(xref).decode('latin-1')

        new_stream, changed = _delete_line_in_stream(stream, line_top_pdf, line_bottom_pdf)

        if not changed:
            print(f"[PDF-DeleteField] ⚠ Stream unchanged — no BT blocks matched the line y range. "
                  f"Falling back to redact-only.")
            # Fallback: redact to at least whiteout the text
            doc.close()
            doc = fitz.open(src)
            page = doc[page_num]
            redact_rect = fitz.Rect(0, line_top_screen - 1, page.rect.width, line_bottom_screen + 1)
            page.add_redact_annot(redact_rect)
            page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)
        else:
            doc.update_stream(xref, new_stream.encode('latin-1', errors='replace'))
            print(f"[PDF-DeleteField] ✓ Stream-deleted and reflowed")

        # Clean sidecar for inserted lines
        if is_inserted:
            sidecar = _sidecar_path(out)
            if sidecar.exists():
                try:
                    data = _json.loads(sidecar.read_text())
                    data = [d for d in data
                            if not (d["page"] == page_num and abs(d["y"] - line_bottom_screen) < 8)]
                    sidecar.write_text(_json.dumps(data))
                except Exception as e:
                    print(f"[PDF-DeleteField] Sidecar update error: {e}")

        # ── 3. Save ───────────────────────────────────────────────────────────
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf", dir=str(Path(out).parent))
        os.close(tmp_fd)
        doc.save(tmp_path, garbage=3, deflate=True)
        doc.close()
        shutil.move(tmp_path, out)
        print(f"[PDF-DeleteField] ✓ Done: '{target.get('text','')[:40]}'")
        return True

    except Exception as e:
        print(f"[PDF-DeleteField] Error: {e}")
        import traceback; traceback.print_exc()
        try: doc.close()
        except: pass
        return False

def delete_inserted_line(pdf_path, para_index, output_path=None):
    """Delete an inserted line by its paraIndex and shift content back up."""
    import tempfile, shutil, os

    src = str(pdf_path)
    out = output_path or src

    # Find the field by paraIndex
    fields = extract_pdf_fields(src)
    target = None
    for f in fields:
        if f.get("paraIndex") == para_index:
            target = f
            break

    if not target:
        print(f"[PDF-DeleteLine] Field paraIndex={para_index} not found")
        return False

    if not target.get("isInserted"):
        print(f"[PDF-DeleteLine] Field paraIndex={para_index} is not an inserted line")
        return False

    try:
        doc = fitz.open(src)
        page_num = target.get("page", 0)
        bbox = target.get("bbox", [0, 0, 0, 0])
        page = doc[page_num]

        line_top_screen    = float(bbox[1])
        line_bottom_screen = float(bbox[3])
        page_height = page.rect.height
        line_top_pdf    = page_height - line_bottom_screen
        line_bottom_pdf = page_height - line_top_screen

        # Stream-based delete + reflow (no redact rectangle)
        page.clean_contents()
        xrefs = page.get_contents()
        if xrefs:
            xref = xrefs[0]
            stream = doc.xref_stream(xref).decode('latin-1')
            new_stream, changed = _delete_line_in_stream(stream, line_top_pdf, line_bottom_pdf)
            if changed:
                doc.update_stream(xref, new_stream.encode('latin-1', errors='replace'))
                print(f"[PDF-DeleteLine] ✓ Stream-deleted inserted line")
            else:
                # Fallback: redact
                page.add_redact_annot(fitz.Rect(0, line_top_screen - 2, page.rect.width, line_bottom_screen + 2))
                page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)
                print(f"[PDF-DeleteLine] Fallback redact for inserted line")

        # Remove from sidecar
        sidecar = _sidecar_path(out)
        if sidecar.exists():
            try:
                data = json.loads(sidecar.read_text())
                data = [d for d in data if not (d["page"] == page_num and abs(d["y"] - line_bottom_screen) < 8)]
                sidecar.write_text(json.dumps(data))
                print(f"[PDF-DeleteLine] ✓ Removed sidecar entry")
            except Exception as e:
                print(f"[PDF-DeleteLine] Sidecar update error: {e}")

        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf", dir=str(Path(out).parent))
        os.close(tmp_fd)
        doc.save(tmp_path, garbage=3, deflate=True)
        doc.close()
        shutil.move(tmp_path, out)
        print(f"[PDF-DeleteLine] ✓ Deleted inserted line paraIndex={para_index}")
        return True

    except Exception as e:
        print(f"[PDF-DeleteLine] Error: {e}")
        return False


def add_text_after_field(pdf_path, after_para_index, new_text, bold=False, output_path=None, after_field_text=None):
    """Add new text below the field identified by after_para_index (with text fallback)."""
    import tempfile, shutil, os
    
    src = str(pdf_path)
    out = output_path or src
    
    try:
        doc = fitz.open(src)
    except Exception as e:
        print(f"[PDF-AddLine] Cannot open PDF: {e}")
        return False
    
    fields = extract_pdf_fields(src)
    target_field = None
    for f in fields:
        if f.get("paraIndex") == after_para_index:
            target_field = f
            break

    # Fallback: match by text if paraIndex is stale
    if not target_field and after_field_text:
        needle = after_field_text.strip()
        for f in fields:
            if f.get("text", "").strip() == needle:
                target_field = f
                break
        if target_field:
            print(f"[PDF-AddLine] paraIndex mismatch — matched by text: '{needle[:40]}'")

    if not target_field:
        print(f"[PDF-AddLine] Field with paraIndex={after_para_index} not found")
        doc.close()
        return False
    
    page_num = target_field.get("page", 0)
    bbox = target_field.get("bbox", [0, 0, 0, 0])
    page = doc[page_num]
    
    fontsize = 10.9091
    target_bottom = bbox[3]

    # ── FIX 1: insert_y places the new text baseline so its bbox top lands
    # exactly INSERT_GAP below target_bottom.
    INSERT_GAP = 3  # pt — visual gap between last line and inserted text
    insert_y = target_bottom + (0.8 * fontsize) + INSERT_GAP
    shift_from_y = target_bottom + 1

    insert_x = float(bbox[0]) if bbox[0] > 0 else 36.0

    has_bullet = target_field.get("hasBullet", False)
    bullet_font = None
    bullet_x = None
    text_x_after_bullet = None
    if has_bullet:
        insert_x = bbox[0]
        for block in page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]:
            if "lines" not in block:
                continue
            for line in block["lines"]:
                for si, span in enumerate(line["spans"]):
                    if span["text"].strip() == "•":
                        bullet_x = span["bbox"][0]
                        bullet_font_name = span["font"]
                        for f_entry in page.get_fonts():
                            fname = f_entry[3]
                            if fname == bullet_font_name or fname.endswith('+' + bullet_font_name) or f_entry[4] == bullet_font_name:
                                try:
                                    bullet_font = fitz.Font(fontbuffer=doc.extract_font(f_entry[0])[-1])
                                except:
                                    pass
                                break
                        for ns in line["spans"][si+1:]:
                            if ns["text"].strip():
                                text_x_after_bullet = ns["bbox"][0]
                                break
                        break
                if bullet_font:
                    break
            if bullet_font:
                break
    
    font_name = "tibo" if bold else "tiro"
    font = fitz.Font(font_name)
    fontsize = 10.9091

    # Detect font BEFORE reflow — scan the page for body text font directly
    try:
        body_span = None
        target_text = target_field.get("text", "")
        # First try: find the exact target field span
        body_span = _get_text_span_info(page, target_text[:30])
        # Second try: find any normal-weight body text span on the page
        if not body_span:
            for block in page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]:
                if "lines" not in block:
                    continue
                for line in block["lines"]:
                    for span in line["spans"]:
                        t = span["text"].strip()
                        fn = span.get("font", "")
                        sz = span.get("size", 0)
                        # Skip headers, icons, tiny text
                        if t and len(t) > 5 and 9 < sz < 14 and not _is_icon_or_symbol(t, fn):
                            body_span = span
                            break
                    if body_span:
                        break
                if body_span:
                    break

        if body_span:
            fontsize = body_span.get("size", fontsize)
            # Try to extract the actual embedded font bytes
            fn = body_span.get("font", "")
            extracted = _try_extract_font(doc, page, fn)
            if extracted:
                font = extracted
                print(f"[PDF-AddLine] ✓ Using extracted font: {fn}")
            else:
                # Map to closest built-in
                base = _map_to_base_font(fn)
                if bold:
                    base = base + "bo" if not base.endswith("bo") else base
                try:
                    font = fitz.Font(base)
                    print(f"[PDF-AddLine] ⚠ Using mapped font: {base} for {fn}")
                except Exception:
                    pass
    except Exception as e:
        print(f"[PDF-AddLine] Font detection error: {e}")

    # ── FIX 2: shift down = one line height only (fontsize + INSERT_GAP)
    new_text_height = fontsize + INSERT_GAP

    _reflow_page_vertical_down(doc, page, shift_from_y, new_text_height)
    
    try:
        origin_y = insert_y
        
        if has_bullet and bullet_font and text_x_after_bullet:
            tw_bullet = fitz.TextWriter(page.rect)
            bx = bullet_x if bullet_x else insert_x
            tw_bullet.append(fitz.Point(bx, origin_y), "•", font=bullet_font, fontsize=fontsize)
            tw_bullet.write_text(page, color=(0, 0, 0))
            tw_text = fitz.TextWriter(page.rect)
            tw_text.append(fitz.Point(text_x_after_bullet, origin_y), new_text, font=font, fontsize=fontsize)
            tw_text.write_text(page, color=(0, 0, 0))
            print(f"[PDF-AddLine] ✓ Inserted '• {new_text[:28]}' at y={insert_y:.1f}")
        else:
            tw = fitz.TextWriter(page.rect)
            text_to_insert = ("• " + new_text) if has_bullet else new_text
            tw.append(fitz.Point(insert_x, origin_y), text_to_insert, font=font, fontsize=fontsize)
            tw.write_text(page, color=(0, 0, 0))
            print(f"[PDF-AddLine] ✓ Inserted '{text_to_insert[:30]}' at y={insert_y:.1f}")
    except Exception as e:
        print(f"[PDF-AddLine] TextWriter failed: {e}, using insert_text")
        try:
            page.insert_text(
                fitz.Point(insert_x, insert_y),
                new_text, fontsize=fontsize, fontname=font_name, color=(0, 0, 0)
            )
        except Exception as e2:
            print(f"[PDF-AddLine] All insert methods failed: {e2}")
            doc.close()
            return False
    
    _handle_page_overflow(doc, page)
    
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pdf", dir=str(Path(out).parent))
    os.close(tmp_fd)
    try:
        doc.save(tmp_path, garbage=3, deflate=True)
        doc.close()
        shutil.move(tmp_path, out)
        _save_inserted_position(out, page_num, insert_y)
        return True
    except Exception as e:
        print(f"[PDF-AddLine] Save failed: {e}")
        doc.close()
        try: os.unlink(tmp_path)
        except: pass
        return False


def _get_bt_abs_y(bt_content):
    """
    Return the first absolute y position from a BT block's content.
    Handles Tm (absolute) and Td/TD (treated as absolute for the first op).
    Returns None if no position operator found.
    """
    tm_re = re.compile(
        r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+Tm\b'
        r'|'
        r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(Td|TD)\b'
    )
    m = tm_re.search(bt_content)
    if not m:
        return None
    if m.group(6) is not None:  # Tm: f is group 6 (index 5, 1-based = 6)
        return float(m.group(6))
    if m.group(8) is not None:  # Td/TD: y is group 8
        return float(m.group(8))
    return None


def _delete_line_in_stream(stream, line_top_pdf, line_bottom_pdf, tolerance=1.0):
    """
    Remove BT/ET blocks that belong to the deleted line and shift everything
    below upward — all in one stream pass. No redact rectangle.

    line_top_pdf / line_bottom_pdf are in PDF coordinates (y=0 at page bottom).
    A BT block "belongs to the line" when its first absolute Tm/Td y lies
    within [line_top_pdf - tolerance, line_bottom_pdf + tolerance].

    All BT blocks whose first Tm y is strictly BELOW line_top_pdf (lower y in PDF
    coords = lower on the page visually) are shifted UP by line_height.

    Also shifts `re` rectangle operators (section divider rules) below the cut.
    """
    bt_blocks = _find_bt_et_blocks(stream)
    if not bt_blocks:
        return stream, False

    line_height = line_bottom_pdf - line_top_pdf
    lo = line_top_pdf - tolerance
    hi = line_bottom_pdf + tolerance

    # Diagnostic: print full BT y-map so we can verify which blocks are dropped/shifted
    print(f"[DeleteStream] Range lo={lo:.1f} hi={hi:.1f} height={line_height:.1f}")
    for bts, bte in bt_blocks:
        y = _get_bt_abs_y(stream[bts+2:bte-2])
        action = 'DROP' if y is not None and lo<=y<=hi else ('SHIFT' if y is not None and y<lo else 'KEEP')
        snippet = stream[bts:bte].replace('\n',' ')[:50]
        print(f"[DeleteStream]   y={y} {action} | {snippet}")

    result = []
    pos = 0
    changed = False

    for bt_start, bt_end in bt_blocks:
        outside = stream[pos:bt_start]
        result.append(outside)

        bt_content = stream[bt_start+2:bt_end-2]
        abs_y = _get_bt_abs_y(bt_content)

        if abs_y is None:
            result.append(stream[bt_start:bt_end])
        elif lo <= abs_y <= hi:
            # Block belongs to the deleted line — drop it
            changed = True
            print(f"[DeleteStream] Dropped BT block at pdf_y={abs_y:.1f} (range [{lo:.1f},{hi:.1f}])")
        elif abs_y < lo:
            # Block is below the deleted line (lower y = lower on page) — shift up
            new_bt = _shift_single_bt(bt_content, line_height)
            result.append(f'BT{new_bt}ET')
            changed = True
        else:
            # Block is above the deleted line — keep unchanged
            result.append(stream[bt_start:bt_end])

        pos = bt_end

    result.append(stream[pos:])
    new_stream = ''.join(result)

    # Shift horizontal rules below the deleted line.
    bt_blocks2 = _find_bt_et_blocks(new_stream)

    def _not_in_bt(pos):
        for bs, be in bt_blocks2:
            if bs <= pos < be:
                return False
        return True

    # Pattern 1: LaTeX hrule — "x1 y1 m [optional ops] x2 y2 l S"
    ml_re = re.compile(
        r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+m\b'
        r'(?P<mid>[\s\S]{0,40}?)'
        r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+l\b'
    )
    # Diagnostic: print all m/l candidates before filtering
    for dbg in ml_re.finditer(new_stream):
        x1d,y1d = float(dbg.group(1)),float(dbg.group(2))
        x2d,y2d = float(dbg.group(4)),float(dbg.group(5))
        print(f"[DeleteStream] m/l candidate: x1={x1d:.1f} y1={y1d:.1f} x2={x2d:.1f} y2={y2d:.1f} span={abs(x2d-x1d):.1f}")
    def shift_ml(m):
        if not _not_in_bt(m.start()):
            return m.group(0)
        x1, y1 = float(m.group(1)), float(m.group(2))
        x2, y2 = float(m.group(4)), float(m.group(5))
        if abs(y1 - y2) > 2 or abs(x2 - x1) < 200 or y1 <= 0:
            return m.group(0)
        avg_y = (y1 + y2) / 2
        if avg_y < lo:
            print(f"[DeleteStream] Shifted m/l rule at pdf_y={avg_y:.1f} up by {line_height:.1f}")
            return f'{x1:.5g} {y1 + line_height:.5g} m{m.group("mid")}{x2:.5g} {y2 + line_height:.5g} l'
        return m.group(0)
    new_stream = ml_re.sub(shift_ml, new_stream)

    # Pattern 2: "x y w h re" rectangle fill (Word/other PDFs)
    bt_blocks3 = _find_bt_et_blocks(new_stream)
    re_re = re.compile(
        r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+re\b'
    )
    def shift_re(m):
        for bs, be in bt_blocks3:
            if bs <= m.start() < be:
                return m.group(0)
        x, y, w, h = float(m.group(1)), float(m.group(2)), float(m.group(3)), float(m.group(4))
        if y < lo:
            print(f"[DeleteStream] Shifted re rect at pdf_y={y:.1f} up by {line_height:.1f}")
            return f'{x:.5g} {y + line_height:.5g} {w:.5g} {h:.5g} re'
        return m.group(0)
    new_stream = re_re.sub(shift_re, new_stream)

    return new_stream, changed


def _shift_single_bt(bt_content, shift_up):
    """
    Shift the first absolute position op in a BT block content upward by shift_up
    (i.e. increase Tm f / first Td y by shift_up, since PDF y increases upward).
    """
    tm_re = re.compile(
        r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+Tm\b'
        r'|'
        r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(Td|TD)\b'
    )
    done = False
    def replacer(m):
        nonlocal done
        if done:
            return m.group(0)
        done = True
        if m.group(6) is not None:  # Tm
            a,b,c,d,e,f = float(m.group(1)),float(m.group(2)),float(m.group(3)),float(m.group(4)),float(m.group(5)),float(m.group(6))
            return f'{a:.5g} {b:.5g} {c:.5g} {d:.5g} {e:.5g} {f + shift_up:.5g} Tm'
        else:  # Td/TD
            x, y, op = float(m.group(7)), float(m.group(8)), m.group(9)
            return f'{x:.5g} {y + shift_up:.5g} {op}'
    return tm_re.sub(replacer, bt_content)


def _shift_stream_content(stream, pdf_below_y, shift_down, has_xobjects=False):
    """
    Shift all content in a PDF main content stream that is below pdf_below_y.

    Strategy depends on PDF type:
    - Pure BT/ET PDF (LaTeX, no XObjects): only shift Td/TD/Tm operators.
    - XObject-based PDF (Word, Illustrator): shift cm operators in main stream
      to reposition XObjects.
    """
    import re as _re

    bt_blocks = _find_bt_et_blocks(stream)

    # ── Pass 1: shift BT/ET text positioning operators ─────────────────────
    result_parts = []
    pos = 0
    for bt_start, bt_end in bt_blocks:
        result_parts.append(stream[pos:bt_start])
        bt_content = stream[bt_start+2:bt_end-2]
        abs_y = 0
        first_pos_set = False
        new_bt = ""
        bp = 0

        op_re = _re.compile(
            r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(Td|TD)\b'
            r'|'
            r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+Tm\b'
        )
        for m in op_re.finditer(bt_content):
            new_bt += bt_content[bp:m.start()]
            if m.group(3):  # Td/TD — relative move
                x_val, y_val, op = float(m.group(1)), float(m.group(2)), m.group(3)
                if not first_pos_set:
                    abs_y = y_val
                    first_pos_set = True
                    if abs_y < pdf_below_y:
                        new_bt += f'{x_val:.5g} {y_val - shift_down:.5g} {op}'
                        abs_y = y_val - shift_down
                    else:
                        new_bt += m.group(0)
                else:
                    prev = abs_y
                    abs_y += y_val
                    if prev >= pdf_below_y and abs_y < pdf_below_y:
                        new_bt += f'{x_val:.5g} {y_val - shift_down:.5g} {op}'
                        abs_y = prev + (y_val - shift_down)
                    else:
                        new_bt += m.group(0)
            else:  # Tm — absolute position
                a, b, c, d, e, f = (float(m.group(i)) for i in range(4, 10))
                first_pos_set = True
                abs_y = f
                if f < pdf_below_y:
                    new_bt += f'{a:.5g} {b:.5g} {c:.5g} {d:.5g} {e:.5g} {f - shift_down:.5g} Tm'
                    abs_y = f - shift_down
                else:
                    new_bt += m.group(0)
            bp = m.end()
        new_bt += bt_content[bp:]
        result_parts.append(f'BT{new_bt}ET')
        pos = bt_end
    result_parts.append(stream[pos:])
    stream = ''.join(result_parts)

    # ── Pass 2: shift cm + re operators (ONLY for XObject-based PDFs) ──────
    if has_xobjects:
        bt_blocks2 = _find_bt_et_blocks(stream)

        def shift_cm_in_stream(s):
            import re as _re2
            token_re = _re2.compile(
                r'(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s+cm\b'
                r'|\bq\b|\bQ\b'
            )
            def in_bt(p):
                for bs, be in bt_blocks2:
                    if bs <= p < be:
                        return True
                return False
            result = []
            last = 0
            for m in token_re.finditer(s):
                if in_bt(m.start()):
                    continue
                tok = m.group(0).strip()
                if tok in ('q', 'Q'):
                    continue
                result.append(s[last:m.start()])
                a, b, c, d, e, f = (float(m.group(i)) for i in range(1, 7))
                if f < pdf_below_y:
                    result.append(f'{a:.5g} {b:.5g} {c:.5g} {d:.5g} {e:.5g} {f - shift_down:.5g} cm')
                else:
                    result.append(m.group(0))
                last = m.end()
            result.append(s[last:])
            return ''.join(result)

        stream = shift_cm_in_stream(stream)

    return stream


def _reflow_page_vertical_down(doc, page, below_y, shift_down):
    """
    Shift all page content below `below_y` (screen/PyMuPDF coords, top=0) by
    `shift_down` points.  Negative = shift UP (delete), Positive = shift DOWN (insert).

    Only modifies the main merged content stream — NOT XObject sub-streams.
    XObjects are repositioned via their cm operator in the main page stream.
    """
    if shift_down == 0:
        return

    page_height = page.rect.height
    # Convert screen y (top=0 downward) → PDF y (bottom=0 upward)
    pdf_below_y = page_height - below_y

    try:
        page.clean_contents()
        contents_xrefs = page.get_contents()
        if not contents_xrefs:
            print(f"[Reflow] No content xrefs found for page {page.number}")
            return
        xref = contents_xrefs[0]
        raw = doc.xref_stream(xref)
        stream = raw.decode('latin-1')

        # Diagnostic: report what kinds of operators exist in the stream
        import re as _re
        has_bt = 'BT' in stream
        has_cm = bool(_re.search(r'\d\s+cm\b', stream))
        has_re = bool(_re.search(r'\d\s+re\b', stream))
        has_do = bool(_re.search(r'/\w+\s+Do\b', stream))
        print(f"[Reflow] Stream ops — BT:{has_bt} cm:{has_cm} re:{has_re} Do(XObj):{has_do} size:{len(stream)}")

        new_stream = _shift_stream_content(stream, pdf_below_y, shift_down, has_xobjects=has_do)

        changed = new_stream != stream
        print(f"[Reflow] Stream {'modified' if changed else 'UNCHANGED — no operators matched below y'}")
        doc.update_stream(xref, new_stream.encode('latin-1', errors='replace'))

    except Exception as e:
        print(f"[Reflow] Stream error: {e}")
        import traceback; traceback.print_exc()

    # Shift hyperlink annotation rects
    try:
        for link in list(page.get_links()):
            rect = link.get("from", fitz.Rect())
            if not rect.is_empty and rect.y0 > below_y:
                new_rect = fitz.Rect(rect.x0, rect.y0 + shift_down,
                                     rect.x1, rect.y1 + shift_down)
                page.delete_link(link)
                new_link = {"kind": link.get("kind", 2), "from": new_rect}
                if "uri" in link:
                    new_link["uri"] = link["uri"]
                page.insert_link(new_link)
    except Exception as e:
        print(f"[Reflow] Links error: {e}")

    print(f"[Reflow] ✓ shift={shift_down:+.1f}pt  below screen_y={below_y:.1f}  pdf_y={pdf_below_y:.1f}")


def _handle_page_overflow(doc, page):
    page_height = page.rect.height
    page_width = page.rect.width
    bottom_margin = 36
    cutoff_y = page_height - bottom_margin
    page_num = page.number
    
    has_overflow = False
    for block in page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]:
        if "lines" not in block:
            continue
        for line in block["lines"]:
            if line["bbox"][1] > cutoff_y:
                has_overflow = True
                break
        if has_overflow:
            break
    
    if not has_overflow:
        return
    
    print(f"[PDF-AddLine] Content overflows page {page_num+1}, moving to next page")
    
    top_margin = 36

    # Collect overflow lines
    overflow_lines = []
    for block in page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]:
        if "lines" not in block:
            continue
        for line in block["lines"]:
            if line["bbox"][1] > cutoff_y:
                spans = [s for s in line["spans"] if s["text"].strip()]
                if spans:
                    overflow_lines.append({"bbox": line["bbox"], "spans": spans})

    if not overflow_lines:
        return

    overflow_links = []
    for link in page.get_links():
        rect = link.get("from", fitz.Rect())
        if not rect.is_empty and rect.y0 > cutoff_y:
            overflow_links.append(link)

    # Redact overflow lines from source page
    for block in page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]:
        if "lines" not in block:
            continue
        for line in block["lines"]:
            if line["bbox"][1] > cutoff_y:
                page.add_redact_annot(fitz.Rect(line["bbox"]))
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)
    for link in overflow_links:
        page.delete_link(link)

    next_page_num = page_num + 1
    if next_page_num < len(doc):
        new_page = doc[next_page_num]
        # Overflow goes at TOP of next page — shift existing content down
        first_span = overflow_lines[0]["spans"][0]
        last_span = overflow_lines[-1]["spans"][-1]
        overflow_height = (last_span["origin"][1] - first_span["origin"][1]) + last_span["size"] + 6
        # Shift existing content on next page down to make room
        _reflow_page_vertical_down(doc, new_page, 0, overflow_height)
    else:
        new_page = doc.new_page(-1, width=page_width, height=page_height)
        src_page = doc[page_num]
        p1_res = doc.xref_get_key(src_page.xref, "Resources")
        if p1_res[0] != "null":
            doc.xref_set_key(new_page.xref, "Resources", p1_res[1])

    insert_start_y = top_margin

    # Build font cache from source page
    font_cache = {}
    src_page = doc[page_num]
    for f_entry in src_page.get_fonts(full=True):
        xref = f_entry[0]
        fname = f_entry[3] if len(f_entry) > 3 else ""
        falias = f_entry[4] if len(f_entry) > 4 else ""
        for key in [fname, falias]:
            if key and key not in font_cache:
                try:
                    extracted = doc.extract_font(xref)
                    if extracted and len(extracted) > 3 and extracted[3] and len(extracted[3]) > 100:
                        font_cache[key] = fitz.Font(fontbuffer=extracted[3])
                except Exception:
                    pass

    # y offset: map first overflow line to insert_start_y
    first_origin_y = overflow_lines[0]["spans"][0]["origin"][1]
    y_delta = insert_start_y - (first_origin_y - cutoff_y + top_margin)

    span_count = 0
    for ol in overflow_lines:
        for span in ol["spans"]:
            try:
                origin_x = span["origin"][0]
                origin_y = span["origin"][1] - cutoff_y + top_margin + y_delta
                text = span["text"]
                size = span["size"]
                fn = span.get("font", "")

                font = font_cache.get(fn)
                if not font:
                    for k, v in font_cache.items():
                        base_k = k.split("+")[-1] if "+" in k else k
                        base_fn = fn.split("+")[-1] if "+" in fn else fn
                        if base_k == base_fn or base_fn in k or k in base_fn:
                            font = v
                            break

                if font:
                    tw = fitz.TextWriter(new_page.rect)
                    tw.append(fitz.Point(origin_x, origin_y), text, font=font, fontsize=size)
                    color = span.get("color", 0)
                    if isinstance(color, int):
                        r = ((color >> 16) & 0xFF) / 255.0
                        g = ((color >> 8) & 0xFF) / 255.0
                        b = (color & 0xFF) / 255.0
                        color = (r, g, b)
                    tw.write_text(new_page, color=color)
                else:
                    new_page.insert_text(
                        fitz.Point(origin_x, origin_y),
                        text, fontsize=size, color=(0, 0, 0)
                    )
                span_count += 1
            except Exception as e:
                print(f"[PDF-Overflow] Failed to copy \'{span['text'][:20]}\': {e}")

    print(f"[PDF-AddLine] ✓ Moved {span_count} spans to page {new_page.number + 1}")
    _handle_page_overflow(doc, new_page)


def extract_pdf_fields(pdf_path):
    if not PYMUPDF_SUPPORT:
        return []

    doc = fitz.open(str(pdf_path))
    fields = []
    field_id = 0
    current_section = {"key": "header", "label": "Header", "color": "#c026d3"}

    all_links = _get_links_from_pdf(str(pdf_path))
    inserted_positions = _load_inserted_positions(pdf_path)  # set of (page, y)

    for page_num in range(len(doc)):
        page = doc[page_num]
        blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]

        all_lines = []
        for block in blocks:
            if "lines" not in block:
                continue
            for line in block["lines"]:
                all_lines.append(line)
        all_lines.sort(key=lambda l: (l["bbox"][1], l["bbox"][0]))

        for line in all_lines:
                spans = line["spans"]
                if not spans:
                    continue

                line_rect = fitz.Rect(line["bbox"])

                is_bold = False
                has_real_text = False
                font_size = 0
                non_icon_spans = []

                for span in spans:
                    text = span["text"]
                    font_name = span.get("font", "")

                    if _is_icon_or_symbol(text, font_name):
                        continue

                    if text.strip():
                        non_icon_spans.append(span)
                        has_real_text = True

                    if span.get("size", 0) > font_size:
                        font_size = span["size"]

                if not has_real_text or not non_icon_spans:
                    continue

                # ── COLUMN SPLIT ──────────────────────────────────────────────
                # Split spans into column groups so that left-column body text
                # and right-column section headers (same Y baseline in PyMuPDF)
                # are kept separate and don't concatenate into garbled fields.
                col_groups = _split_spans_by_columns(non_icon_spans, page.rect.width)
                primary_spans    = col_groups[0]          # leftmost column
                extra_col_groups = col_groups[1:]         # remaining columns

                # Re-derive bold / font_size from primary column only
                bold_chars = 0
                total_chars = 0
                starts_bold = False
                for si, span in enumerate(primary_spans):
                    t = span["text"].strip()
                    if t:
                        n = len(t)
                        total_chars += n
                        span_bold = bool(span.get("flags", 0) & (1 << 4)) or _is_bold_font(span.get("font", ""), span.get("flags", 0))
                        if span_bold:
                            bold_chars += n
                        if not starts_bold and si == 0 and span_bold:
                            starts_bold = True
                is_bold = total_chars > 0 and bold_chars > total_chars * 0.5
                font_size = max((s.get("size", 0) for s in primary_spans), default=font_size)

                # Build text from primary column spans only
                if primary_spans:
                    merged = ""
                    prev_end_x = None
                    for span in primary_spans:
                        span_text = span["text"].replace('\n', ' ').replace('\r', '')
                        if merged and prev_end_x is not None:
                            gap = span["bbox"][0] - prev_end_x
                            if gap > span.get("size", 10) * 0.2:
                                merged += " "
                        merged += span_text
                        prev_end_x = span["bbox"][2]
                    line_text = merged.strip()
                else:
                    line_text = ""
                    extra_col_groups = []

                if not line_text:
                    continue

                text_clean = line_text.replace('\ufffd', ' ')
                text_clean = re.sub(r'\s+', ' ', text_clean).strip()
                
                has_bullet = False
                for span in spans:
                    t = span["text"].strip()
                    if t and t[0] in '•◦▪▸►○●■':
                        has_bullet = True
                        break
                line_bbox = list(line["bbox"])

                if not text_clean:
                    continue

                if starts_bold and not is_bold and not has_bullet:
                    bold_spans = []
                    regular_spans = []
                    in_bold = True
                    for span in primary_spans:
                        t = span["text"]
                        if not t.strip():
                            continue
                        span_bold = bool(span.get("flags", 0) & (1 << 4)) or _is_bold_font(span.get("font", ""), span.get("flags", 0))
                        if in_bold and span_bold:
                            bold_spans.append(span)
                        else:
                            in_bold = False
                            regular_spans.append(span)
                    
                    if bold_spans and regular_spans:
                        b_x0 = min(s["bbox"][0] for s in bold_spans)
                        b_y0 = min(s["bbox"][1] for s in bold_spans)
                        b_x1 = max(s["bbox"][2] for s in bold_spans)
                        b_y1 = max(s["bbox"][3] for s in bold_spans)
                        bold_bbox = [b_x0, b_y0, b_x1, b_y1]
                        bold_text = page.get_textbox(fitz.Rect(b_x0, b_y0, b_x1, b_y1)).strip()
                        if not bold_text:
                            bold_text = re.sub(r'\s+', ' ', ' '.join(s["text"] for s in bold_spans)).strip()
                        
                        r_x0 = min(s["bbox"][0] for s in regular_spans)
                        r_y0 = min(s["bbox"][1] for s in regular_spans)
                        r_x1 = max(s["bbox"][2] for s in regular_spans)
                        r_y1 = max(s["bbox"][3] for s in regular_spans)
                        regular_bbox = [r_x0, r_y0, r_x1, r_y1]
                        regular_text = page.get_textbox(fitz.Rect(r_x0, r_y0, r_x1, r_y1)).strip()
                        if not regular_text:
                            regular_text = re.sub(r'\s+', ' ', ' '.join(s["text"] for s in regular_spans)).strip()
                        
                        regular_text = regular_text.replace('\ufffd', ' ')
                        regular_text = re.sub(r'\s+', ' ', regular_text).strip()
                        is_large_text = font_size > 12
                        section = _detect_section_pdf(text_clean, is_large=is_large_text, is_bold=is_bold)
                        if section:
                            current_section = section
                        
                        fields.append({
                            "id": f"field-{field_id}",
                            "text": bold_text,
                            "originalText": bold_text,
                            "section": dict(current_section),
                            "isHeader": False,
                            "type": _classify_field_pdf(bold_text, current_section["key"]),
                            "paraIndex": field_id,
                            "source": f"pdf-page-{page_num}",
                            "runIndices": None,
                            "format": f"bold, {font_size:.0f}pt",
                            "isBold": True,
                            "hasHyperlink": False,
                            "page": page_num,
                            "bbox": bold_bbox or line_bbox,
                            "hasBullet": False,
                            "startsBold": True,
                        })
                        field_id += 1
                        
                        fields.append({
                            "id": f"field-{field_id}",
                            "text": regular_text,
                            "originalText": regular_text,
                            "section": dict(current_section),
                            "isHeader": False,
                            "type": _classify_field_pdf(regular_text, current_section["key"]),
                            "paraIndex": field_id,
                            "source": f"pdf-page-{page_num}",
                            "runIndices": None,
                            "format": f"{font_size:.0f}pt",
                            "isBold": False,
                            "hasHyperlink": False,
                            "page": page_num,
                            "bbox": regular_bbox or line_bbox,
                            "hasBullet": False,
                            "startsBold": False,
                        })
                        field_id += 1

                        # Inject extra column groups from this line
                        for ecg in extra_col_groups:
                            ecg_merged = ""
                            ecg_prev_x = None
                            for span in ecg:
                                st = span["text"].replace('\n', ' ').replace('\r', '')
                                if ecg_merged and ecg_prev_x is not None:
                                    g = span["bbox"][0] - ecg_prev_x
                                    if g > span.get("size", 10) * 0.2:
                                        ecg_merged += " "
                                ecg_merged += st
                                ecg_prev_x = span["bbox"][2]
                            ecg_text = re.sub(r'\s+', ' ', ecg_merged.replace('\ufffd', ' ')).strip()
                            if ecg_text:
                                _inject_extra_column_field(fields, ecg, ecg_text, page, page_num,
                                                           current_section, font_size, field_id)
                                field_id += 1
                        extra_col_groups = []
                        continue

                is_large_text = font_size > 12
                section = _detect_section_pdf(text_clean, is_large=is_large_text, is_bold=is_bold)
                if section:
                    current_section = section
                    fields.append({
                        "id": f"field-{field_id}",
                        "text": text_clean,
                        "originalText": text_clean,
                        "section": dict(current_section),
                        "isHeader": True,
                        "paraIndex": field_id,
                        "source": f"pdf-page-{page_num}",
                        "runIndices": None,
                        "format": f"section-header ({font_size:.0f}pt)",
                        "isBold": is_bold,
                        "hasHyperlink": False,
                        "page": page_num,
                        "bbox": line_bbox,
                    })
                    field_id += 1

                    # Inject extra column groups
                    for ecg in extra_col_groups:
                        ecg_merged = ""
                        ecg_prev_x = None
                        for span in ecg:
                            st = span["text"].replace('\n', ' ').replace('\r', '')
                            if ecg_merged and ecg_prev_x is not None:
                                g = span["bbox"][0] - ecg_prev_x
                                if g > span.get("size", 10) * 0.2:
                                    ecg_merged += " "
                            ecg_merged += st
                            ecg_prev_x = span["bbox"][2]
                        ecg_text = re.sub(r'\s+', ' ', ecg_merged.replace('\ufffd', ' ')).strip()
                        if ecg_text:
                            _inject_extra_column_field(fields, ecg, ecg_text, page, page_num,
                                                       current_section, font_size, field_id)
                            field_id += 1
                    extra_col_groups = []
                    continue

                has_hyperlink = False
                link_url = None
                line_rect = fitz.Rect(line_bbox)
                best_link_dist = float("inf")
                for lnk in all_links:
                    if lnk["page"] == page_num:
                        lnk_rect = lnk["rect"]
                        if not (line_rect.y0 < lnk_rect.y1 + 2 and line_rect.y1 > lnk_rect.y0 - 2):
                            continue
                        if line_rect.intersects(lnk_rect):
                            dist = 0
                        else:
                            dist = min(abs(line_rect.x0 - lnk_rect.x0),
                                       abs(line_rect.x1 - lnk_rect.x1),
                                       abs(line_rect.x0 - lnk_rect.x1),
                                       abs(line_rect.x1 - lnk_rect.x0))
                        if dist < best_link_dist and dist < 80:
                            best_link_dist = dist
                            has_hyperlink = True
                            link_url = lnk["url"]

                ft = _classify_field_pdf(text_clean, current_section["key"])
                if has_hyperlink and link_url:
                    ft = "link"

                fmt_parts = []
                if is_bold:
                    fmt_parts.append("bold")
                if has_hyperlink:
                    fmt_parts.append("hyperlink")
                fmt_parts.append(f"{font_size:.0f}pt")
                fmt_str = ", ".join(fmt_parts) if fmt_parts else "regular"

                is_inserted = any(
                    pg == page_num and abs(iy - line_bbox[3]) < 6
                    for (pg, iy) in inserted_positions
                )

                fields.append({
                    "id": f"field-{field_id}",
                    "text": text_clean,
                    "originalText": text_clean,
                    "section": dict(current_section),
                    "isHeader": False,
                    "type": ft,
                    "paraIndex": field_id,
                    "source": f"pdf-page-{page_num}",
                    "runIndices": None,
                    "format": fmt_str,
                    "isBold": is_bold,
                    "hasHyperlink": has_hyperlink,
                    "page": page_num,
                    "bbox": line_bbox,
                    "hasBullet": has_bullet,
                    "startsBold": starts_bold,
                    "isInserted": is_inserted,
                })

                if link_url and link_url != text_clean and "://" in link_url:
                    already_added = any(f.get("text") == link_url for f in fields)
                    if not already_added:
                        label = "LinkedIn" if "linkedin" in link_url.lower() else \
                                "GitHub" if "github" in link_url.lower() else "Link"
                        field_id += 1
                        fields.append({
                            "id": f"field-{field_id}",
                            "text": link_url,
                            "originalText": link_url,
                            "section": dict(current_section),
                            "isHeader": False,
                            "type": "icon-link",
                            "paraIndex": field_id,
                            "source": f"pdf-page-{page_num}",
                            "runIndices": None,
                            "format": f"🔗 {label}",
                            "isBold": False,
                            "hasHyperlink": True,
                            "linkLabel": label,
                            "page": page_num,
                            "bbox": line_bbox,
                        })

                # Inject extra column groups from this line as separate fields
                for ecg in extra_col_groups:
                    ecg_merged = ""
                    ecg_prev_x = None
                    for span in ecg:
                        st = span["text"].replace('\n', ' ').replace('\r', '')
                        if ecg_merged and ecg_prev_x is not None:
                            g = span["bbox"][0] - ecg_prev_x
                            if g > span.get("size", 10) * 0.2:
                                ecg_merged += " "
                        ecg_merged += st
                        ecg_prev_x = span["bbox"][2]
                    ecg_text = re.sub(r'\s+', ' ', ecg_merged.replace('\ufffd', ' ')).strip()
                    if ecg_text:
                        _inject_extra_column_field(fields, ecg, ecg_text, page, page_num,
                                                   current_section, font_size, field_id)
                        field_id += 1
                extra_col_groups = []

                field_id += 1

    doc.close()
    
    # ═══ POST-PROCESS: Merge consecutive paragraph lines into single fields ═══
    if fields:
        merged = []
        i = 0
        
        while i < len(fields):
            f = dict(fields[i])
            can_merge = (
                not f.get("isHeader") and
                not f.get("isBold") and
                f.get("type") in ("text", None, "") and
                not f.get("hasHyperlink") and
                f.get("bbox") and
                not f.get("hasBullet")
            )
            if can_merge:
                texts = [f["text"]]
                last_bbox = f["bbox"]
                base_x0 = f["bbox"][0]
                j = i + 1
                while j < len(fields):
                    nf = fields[j]
                    if f.get("startsBold"):
                        n_can = (
                            not nf.get("isHeader") and
                            not nf.get("isBold") and
                            not nf.get("startsBold") and
                            not nf.get("hasBullet") and
                            nf.get("type") in ("text", None, "") and
                            not nf.get("hasHyperlink") and
                            nf.get("bbox") and
                            nf.get("section", {}).get("key") == f.get("section", {}).get("key") and
                            nf.get("page") == f.get("page") and
                            not nf.get("hasBullet")
                        )
                    else:
                        n_can = (
                            not nf.get("isHeader") and
                            not nf.get("isBold") and
                            not nf.get("startsBold") and
                            nf.get("type") in ("text", None, "") and
                            not nf.get("hasHyperlink") and
                            nf.get("bbox") and
                            nf.get("section", {}).get("key") == f.get("section", {}).get("key") and
                            nf.get("page") == f.get("page") and
                            not nf.get("hasBullet")
                        )
                    if not n_can:
                        break
                    if nf.get("isInserted") or f.get("isInserted"):
                        break
                    gap = nf["bbox"][1] - last_bbox[3]
                    if gap > 18:
                        break
                    # Check x-offset alignment
                    x_offset_ok = abs(nf["bbox"][0] - base_x0) <= 15
                    # Allow merge regardless of x-offset if current text ends mid-word
                    cur_text = texts[-1].rstrip()
                    is_word_continuation = (
                        cur_text and
                        cur_text[-1] not in ' \t.,;:!?)-"\'' and
                        nf["text"] and nf["text"][0].islower()
                    )
                    # Negative gap (overlapping lines) only allowed for word continuations
                    if gap < 0 and not is_word_continuation:
                        break
                    if not x_offset_ok and not is_word_continuation:
                        if not cur_text.endswith('-'):
                            break
                    texts.append(nf["text"])
                    f["bbox"] = [
                        min(f["bbox"][0], nf["bbox"][0]),
                        f["bbox"][1],
                        max(f["bbox"][2], nf["bbox"][2]),
                        nf["bbox"][3],
                    ]
                    last_bbox = nf["bbox"]
                    j += 1
                if len(texts) > 1:
                    joined = texts[0]
                    for ti in range(1, len(texts)):
                        prev = joined.rstrip()
                        nxt = texts[ti]
                        if prev.endswith('-'):
                            joined = prev[:-1] + nxt
                        elif prev and prev[-1] not in ' \t.,;:!?)-"\'' and nxt and nxt[0].islower():
                            joined = prev + nxt  # word continuation — no space
                        else:
                            joined = joined + " " + nxt
                    f["text"] = joined
                    f["originalText"] = f["text"]
                merged.append(f)
                i = j
            else:
                merged.append(f)
                i += 1

        # Merge multi-line bullet points
        final = []
        i = 0
        while i < len(merged):
            f = dict(merged[i])
            is_bullet = f.get("hasBullet", False)
            if is_bullet and f.get("bbox"):
                texts = [f["text"]]
                last_bbox = f["bbox"]
                j = i + 1
                while j < len(merged):
                    nf = merged[j]
                    if (not nf.get("isHeader") and not nf.get("isBold") and
                        not nf.get("hasBullet") and
                        nf.get("section", {}).get("key") == f.get("section", {}).get("key") and
                        nf.get("bbox") and nf.get("page") == f.get("page")):
                        gap = nf["bbox"][1] - last_bbox[3]
                        if nf.get("isInserted") or f.get("isInserted"):
                            break
                        if gap > 18 or gap < -5:
                            break
                        if nf["bbox"][0] < f["bbox"][0] + 5:
                            break
                        texts.append(nf["text"])
                        f["bbox"][3] = nf["bbox"][3]
                        last_bbox = nf["bbox"]
                        j += 1
                    else:
                        break
                if len(texts) > 1:
                    joined = texts[0]
                    for ti in range(1, len(texts)):
                        if joined.rstrip().endswith('-'):
                            joined = joined.rstrip()[:-1] + texts[ti]
                        else:
                            joined = joined + " " + texts[ti]
                    f["text"] = joined
                    f["originalText"] = f["text"]
                final.append(f)
                i = j
            else:
                final.append(f)
                i += 1
        
        for idx, f in enumerate(final):
            f["id"] = f"field-{idx}"
            f["paraIndex"] = idx
        
        return final
    
    return fields


def _inject_extra_column_field(fields, ecg_spans, ecg_text, page, page_num,
                                current_section, parent_font_size, field_id):
    """
    Build and append a field entry for one extra column group produced by
    _split_spans_by_columns().  Handles section-header detection so that
    right-column headers like "SKILLS" get correctly classified and also
    update current_section in-place for subsequent fields.
    """
    ecg_fs = max((s.get("size", 0) for s in ecg_spans), default=parent_font_size)
    ecg_bold_chars = 0
    ecg_total = 0
    for span in ecg_spans:
        t = span["text"].strip()
        if t:
            n = len(t)
            ecg_total += n
            if bool(span.get("flags", 0) & (1 << 4)) or _is_bold_font(span.get("font", ""), span.get("flags", 0)):
                ecg_bold_chars += n
    ecg_is_bold = ecg_total > 0 and ecg_bold_chars > ecg_total * 0.5
    ecg_bbox = [
        min(s["bbox"][0] for s in ecg_spans),
        min(s["bbox"][1] for s in ecg_spans),
        max(s["bbox"][2] for s in ecg_spans),
        max(s["bbox"][3] for s in ecg_spans),
    ]

    ecg_section = _detect_section_pdf(ecg_text, is_large=ecg_fs > 12, is_bold=ecg_is_bold)
    if ecg_section:
        # Update current_section in-place so subsequent fields get the right section
        current_section.clear()
        current_section.update(ecg_section)
        fields.append({
            "id": f"field-{field_id}",
            "text": ecg_text,
            "originalText": ecg_text,
            "section": dict(ecg_section),
            "isHeader": True,
            "paraIndex": field_id,
            "source": f"pdf-page-{page_num}",
            "runIndices": None,
            "format": f"section-header ({ecg_fs:.0f}pt)",
            "isBold": ecg_is_bold,
            "hasHyperlink": False,
            "page": page_num,
            "bbox": ecg_bbox,
        })
    else:
        fields.append({
            "id": f"field-{field_id}",
            "text": ecg_text,
            "originalText": ecg_text,
            "section": dict(current_section),
            "isHeader": False,
            "type": _classify_field_pdf(ecg_text, current_section["key"]),
            "paraIndex": field_id,
            "source": f"pdf-page-{page_num}",
            "runIndices": None,
            "format": f"{ecg_fs:.0f}pt",
            "isBold": ecg_is_bold,
            "hasHyperlink": False,
            "page": page_num,
            "bbox": ecg_bbox,
            "hasBullet": False,
            "startsBold": False,
            "isInserted": False,
        })


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 4:
        print("Usage: python pdf_editor.py <pdf> <old_text> <new_text>")
        sys.exit(1)
    ok = replace_text_in_pdf(sys.argv[1], sys.argv[2], sys.argv[3])
    print(f"Replaced: {ok}")