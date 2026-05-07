"""
AI Resume Comparison Routes v3.0 — Real JD-Based
=================================================
- JD Management: Add, list, delete JDs per role
- Compare: Uses real JD common skills from SQLite
- Analyze: View common skills across stored JDs

Usage in backend.py:
    from ai_routes import ai_router
    app.include_router(ai_router, prefix="/ai", tags=["AI Analysis"])
"""

import os
import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from ai_analyzer import (
    add_job_description, get_jds_for_role, delete_job_description,
    get_all_roles, analyze_common_skills, get_jd_count,
    compare_resume_to_role, generate_comparison_pdf,
    get_comparison_history, CACHE_DIR
)

ai_router = APIRouter()

REPORT_DIR = Path("uploads/reports")
REPORT_DIR.mkdir(parents=True, exist_ok=True)


# ═══════════════════════════════════════════
#  REQUEST MODELS
# ═══════════════════════════════════════════
class AddJDRequest(BaseModel):
    role: str
    level: str = "fresher"
    jd_text: str
    company: str = ""
    source: str = ""

class CompareRequest(BaseModel):
    session_id: str
    role: str
    level: str = "fresher"
    force_refresh: bool = False

class AnalyzeRequest(BaseModel):
    role: str
    level: str = "fresher"
    min_frequency_pct: float = 70.0


# ═══════════════════════════════════════════
#  HEALTH
# ═══════════════════════════════════════════
@ai_router.get("/health")
async def ai_health():
    openai_key = bool(os.getenv("OPENAI_API_KEY"))
    try:
        jd_count = get_jd_count()
        db_ok = True
    except Exception:
        jd_count = 0
        db_ok = False

    return {
        "status": "ok",
        "openai_configured": openai_key,
        "database_connected": db_ok,
        "total_jds_stored": jd_count,
    }


# ═══════════════════════════════════════════
#  JD MANAGEMENT
# ═══════════════════════════════════════════
@ai_router.post("/jd/add")
async def add_jd(data: AddJDRequest):
    """Add a job description. GPT extracts skills automatically."""
    if not data.role.strip():
        raise HTTPException(400, "Role cannot be empty")
    if not data.jd_text.strip() or len(data.jd_text.strip()) < 50:
        raise HTTPException(400, "JD text too short (min 50 characters)")

    try:
        result = add_job_description(
            role=data.role, level=data.level, jd_text=data.jd_text,
            company=data.company, source=data.source
        )
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(500, f"Failed to add JD: {str(e)}")


@ai_router.get("/jd/list")
async def list_jds(role: str, level: str = "fresher"):
    """List all JDs for a specific role + level."""
    if not role.strip():
        raise HTTPException(400, "Role is required")
    try:
        jds = get_jds_for_role(role, level)
        return {
            "role": role, "level": level, "count": len(jds),
            "jds": [{
                "id": jd["_id"],
                "company": jd.get("company", ""),
                "source": jd.get("source", ""),
                "skill_count": jd.get("skill_count", 0),
                "skills": [s["skill"] for s in jd.get("extracted_skills", [])],
                "jd_preview": jd.get("jd_text", "")[:200] + "...",
                "created_at": jd.get("created_at", ""),
            } for jd in jds]
        }
    except Exception as e:
        raise HTTPException(500, f"Failed to list JDs: {str(e)}")


@ai_router.delete("/jd/{jd_id}")
async def remove_jd(jd_id: str):
    """Delete a JD by its ID."""
    try:
        deleted = delete_job_description(jd_id)
        if not deleted:
            raise HTTPException(404, "JD not found")
        return {"success": True, "deleted_id": jd_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to delete JD: {str(e)}")


@ai_router.get("/jd/roles")
async def list_roles():
    """List all roles that have JDs stored."""
    try:
        roles = get_all_roles()
        return {"roles": roles}
    except Exception as e:
        raise HTTPException(500, f"Failed to list roles: {str(e)}")


# ═══════════════════════════════════════════
#  ANALYZE COMMON SKILLS
# ═══════════════════════════════════════════
@ai_router.post("/analyze")
async def analyze_role_skills(data: AnalyzeRequest):
    """Analyze common skills across stored JDs for a role."""
    if not data.role.strip():
        raise HTTPException(400, "Role is required")
    try:
        result = analyze_common_skills(data.role, data.level, data.min_frequency_pct)
        if "error" in result:
            raise HTTPException(404, result["error"])
        return {"success": True, **result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {str(e)}")


# ═══════════════════════════════════════════
#  COMPARISON
# ═══════════════════════════════════════════
@ai_router.post("/compare")
async def compare_resume(data: CompareRequest):
    """Compare resume against real JD common skills."""
    resume_path = Path("uploads") / data.session_id / "current.docx"
    if not resume_path.exists():
        raise HTTPException(404, "Resume not found. Upload a resume first.")
    if not data.role.strip():
        raise HTTPException(400, "Role cannot be empty")

    try:
        result = compare_resume_to_role(
            data.session_id, str(resume_path), data.role,
            level=data.level, force_refresh=data.force_refresh
        )
        if "error" in result:
            raise HTTPException(400, result["error"])

        def serialize(obj):
            if hasattr(obj, 'isoformat'): return obj.isoformat()
            return str(obj)
        return json.loads(json.dumps(result, default=serialize))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Comparison failed: {str(e)}")


@ai_router.post("/compare-report")
async def compare_and_report(data: CompareRequest):
    """Compare and generate PDF report."""
    resume_path = Path("uploads") / data.session_id / "current.docx"
    if not resume_path.exists():
        raise HTTPException(404, "Resume not found")

    try:
        result = compare_resume_to_role(
            data.session_id, str(resume_path), data.role,
            level=data.level, force_refresh=data.force_refresh
        )
        if "error" in result:
            raise HTTPException(400, result["error"])

        role_slug = data.role.strip().lower().replace(" ", "_")[:30]
        report_path = REPORT_DIR / f"report_{data.session_id}_{role_slug}.pdf"
        ok = generate_comparison_pdf(result, str(report_path))
        if not ok:
            raise HTTPException(500, "PDF generation failed")

        return FileResponse(str(report_path), media_type="application/pdf",
                           filename=f"resume_vs_{role_slug}_report.pdf")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Report failed: {str(e)}")


# ═══════════════════════════════════════════
#  HISTORY & CACHE
# ═══════════════════════════════════════════
@ai_router.get("/history/{session_id}")
async def comparison_history(session_id: str):
    history = get_comparison_history(session_id)
    return {"session_id": session_id, "comparisons": history}

@ai_router.delete("/clear-cache")
async def clear_cache():
    count = 0
    for f in CACHE_DIR.glob("*.json"):
        f.unlink(); count += 1
    return {"success": True, "deleted": count}