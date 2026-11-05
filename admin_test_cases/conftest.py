"""
Shared Pytest Fixtures for Admin User Test Cases
"""

import pytest
from app.db.session import SessionLocal


@pytest.fixture(scope="function")
def db_session():
    """Provides a transactional database session for tests and closes it cleanly."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
