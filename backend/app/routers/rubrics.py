from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_session
from app.models.rubrics import EvaluationMetric, RubricSettingsUpdate, RubricsSettings

router = APIRouter(prefix="/rubrics", tags=["rubrics"])


@router.get("", response_model=List[RubricsSettings])
async def get_all_rubrics(session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(RubricsSettings))
    return result.all()


@router.get("/{metric}", response_model=RubricsSettings)
async def get_rubric(
    metric: EvaluationMetric, session: AsyncSession = Depends(get_session)
):
    rubric = await session.get(RubricsSettings, metric)
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")
    return rubric


@router.put("/{metric}", response_model=RubricsSettings)
async def update_rubric(
    metric: EvaluationMetric,
    rubric_update: RubricSettingsUpdate,
    session: AsyncSession = Depends(get_session),
):
    rubric = await session.get(RubricsSettings, metric)
    if not rubric:
        raise HTTPException(status_code=404, detail="Rubric not found")
    # Update fields
    rubric.rubric_prompt = rubric_update.rubric_prompt
    rubric.revision_date = datetime.now()
    session.add(rubric)
    await session.commit()
    await session.refresh(rubric)
    return rubric
