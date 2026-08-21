from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/articles", tags=["Articles"])


@router.get("/", response_model=List[schemas.ArticleOut])
def get_articles(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Article).filter(models.Article.is_published == True)
    if category:
        query = query.filter(models.Article.category == category)
    if search:
        query = query.filter(models.Article.title.ilike(f"%{search}%"))
    return query.order_by(models.Article.created_at.desc()).all()


@router.get("/{article_id}", response_model=schemas.ArticleOut)
def get_article(article_id: int, db: Session = Depends(get_db)):
    article = db.query(models.Article).filter(
        models.Article.id == article_id,
        models.Article.is_published == True
    ).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.post("/", response_model=schemas.ArticleOut, status_code=201)
def create_article(
    data: schemas.ArticleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    article = models.Article(
        title=data.title,
        content=data.content,
        category=data.category,
        image_url=data.image_url,
        author_id=current_user.id
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


@router.delete("/{article_id}", status_code=204)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    article = db.query(models.Article).filter(models.Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    db.delete(article)
    db.commit()
