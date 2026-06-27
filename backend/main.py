from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from pydantic import BaseModel

# --- NOWE IMPORTY DO LOGOWANIA ---
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from datetime import datetime, timedelta

# --- KONFIGURACJA LOGOWANIA ---
SECRET_KEY = "tajne_haslo_projektu"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except:
        raise HTTPException(status_code=401, detail="Nieprawidłowy token")
# ------------------------------

SQLALCHEMY_DATABASE_URL = "sqlite:///./taskboard.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBTask(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    status = Column(String, default="To Do")

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)


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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- NOWY ENDPOINT LOGOWANIA ---
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Szybkie logowanie na zaliczenie (jeden uzytkownik admin)
    if form_data.username == "admin" and form_data.password == "haslo123":
        token = jwt.encode({"sub": form_data.username, "exp": datetime.utcnow() + timedelta(minutes=60)}, SECRET_KEY, algorithm=ALGORITHM)
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=400, detail="Błędne dane")
# -------------------------------

@app.get("/")
def read_root():
    return {"message": "API TaskBoard działa z bazą SQLite!"}

# --- ZABEZPIECZONE ENDPOINTY ZADAŃ ---
# Dodano: user: str = Depends(get_current_user)

@app.get("/tasks", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    return db.query(DBTask).all()

@app.post("/tasks", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    db_task = DBTask(title=task.title, description=task.description, status=task.status)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskCreate, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    db_task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Zadanie nie znalezione")
    
    db_task.title = task.title
    db_task.description = task.description
    db_task.status = task.status
    
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    db_task = db.query(DBTask).filter(DBTask.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Zadanie nie znalezione")
    
    db.delete(db_task)
    db.commit()
    return {"message": "Zadanie usunięte pomyślnie"}