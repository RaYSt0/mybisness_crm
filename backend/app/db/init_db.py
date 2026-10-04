from app.db.base import Base
from app.db.session import engine
from app import models  # noqa: F401  Register models before reading metadata.


def create_db_and_tables() -> None:
    Base.metadata.create_all(bind=engine)
