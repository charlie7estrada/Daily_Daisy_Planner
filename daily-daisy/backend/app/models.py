from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Date, String, Table, Column, ForeignKey, DateTime, Float, Integer
from werkzeug.security import generate_password_hash, check_password_hash

class Base(DeclarativeBase):
    pass

class Users(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(360), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(360), nullable=False)
    location: Mapped[str] = mapped_column(String(120), nullable = True)
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=datetime.utcnow)

    planners: Mapped[list["Planner"]] = relationship(back_populates="user")

    def set_password(self, password): 
        #Hash password before storing
        self.password = generate_password_hash(password)
    def check_password(self, password): 
        #Verify password
        return check_password_hash(self.password, password)
    

class Planner(Base):
    __tablename__ = 'planner'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    view_type: Mapped[str] = mapped_column(String(120))
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["Users"] = relationship(back_populates="planners")
    tasks: Mapped[list["Task"]] = relationship(back_populates="planner")

class Task(Base):
    __tablename__ = 'task'

    id: Mapped[int] = mapped_column(primary_key=True)
    planner_id: Mapped[int] = mapped_column(ForeignKey('planner.id'), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default='pending')
    created_at: Mapped[DateTime] = mapped_column(DateTime, default=datetime.utcnow)

    planner: Mapped["Planner"] = relationship(back_populates="tasks")

    