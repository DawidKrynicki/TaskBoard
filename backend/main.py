from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from pydantic import BaseModel

# 1. Konfiguracja bazy danych SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./taskboard.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Model bazy danych (Tabela zadań)
class DBTask(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    status = Column(String, default="To Do")

# Utworzenie pliku bazy danych (jeśli nie istnieje)
Base.metadata.create_all(bind=engine)

app = FastAPI()

# 3. Modele walidacji danych (Pydantic) - do komunikacji z API
class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "To Do"

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    status: str

    class Config:
        from_attributes = True

# Zależność: łączenie z bazą przy każdym zapytaniu
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 4. Endpointy (Operacje CRUD wymagane w projekcie)

@app.get("/")
def read_root():
    return {"message": "API TaskBoard działa z bazą SQLite!"}

# Odczyt wszystkich zadań
@app.get("/tasks", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(DBTask).all()

# Tworzenie nowego zadania
@app.post("/tasks", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = DBTask(title=task.title, description=task.description, status=task.status)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task