from sqlmodel import create_engine
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore


store = "sqlite:///escania.db"
engine = create_engine(store, connect_args={"check_same_thread": False})


def jobs_store():
    return {"default": SQLAlchemyJobStore(engine=engine)}
