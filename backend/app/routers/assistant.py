from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

from ..services.ai_assistant import (
    answer_space_question,
    explain_current_view,
    generate_astronomical_surprise,
    handle_comparison
)
from ..services.research_service import (
    get_all_papers,
    get_paper_by_id,
    search_research_papers,
    get_research_galaxy_graph,
    ASTRONOMICAL_DATASETS
)

router = APIRouter(prefix="/assistant", tags=["SPACEVERSE AI"])

class QueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None
    explanation_level: Optional[str] = "enthusiast"
    mode: Optional[str] = "ask"

class ExplainViewRequest(BaseModel):
    context: Optional[Dict[str, Any]] = None
    explanation_level: Optional[str] = "enthusiast"

@router.post("/ask")
def ask_spaceverse(request: QueryRequest):
    """
    Main SPACEVERSE AI interaction endpoint:
    ASK -> RETRIEVE -> VERIFY -> EXPLAIN -> VISUALIZE -> EXPLORE
    Returns structured explanation, evidence level, sources, and safe 3D action.
    """
    return answer_space_question(
        query=request.query,
        context=request.context,
        explanation_level=request.explanation_level or "enthusiast",
        mode=request.mode or "ask"
    )

@router.post("/explain-view")
def explain_view(request: ExplainViewRequest):
    """
    Context-aware explanation of what the user is currently looking at in the 3D viewport.
    """
    return explain_current_view(
        context=request.context,
        level=request.explanation_level or "enthusiast"
    )

@router.get("/surprise-me")
def surprise_me(level: str = Query("enthusiast", description="Explanation level")):
    """
    Returns an astonishing verified astronomical phenomenon with an immediate 3D action.
    """
    return generate_astronomical_surprise(level=level)

@router.get("/research/galaxy")
def get_research_galaxy():
    """
    Returns graph network data (papers, celestial targets, topics, datasets, and citation links)
    for rendering the 2D/3D interactive Research Galaxy.
    """
    return get_research_galaxy_graph()

@router.get("/research/papers")
def list_papers(target: Optional[str] = None, q: Optional[str] = None):
    """List or search peer-reviewed research papers and preprints."""
    if q or target:
        return search_research_papers(query=q or "", target=target)
    return get_all_papers()

@router.get("/research/paper/{paper_id}")
def get_paper(paper_id: str):
    """Retrieve detailed 8-point breakdown and multi-level explanations for a specific paper."""
    paper = get_paper_by_id(paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail=f"Paper with ID '{paper_id}' not found.")
    return paper

@router.get("/research/datasets")
def list_datasets():
    """List authoritative astronomical datasets tracked by SPACEVERSE."""
    return ASTRONOMICAL_DATASETS
