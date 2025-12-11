import os
from dotenv import load_dotenv

load_dotenv(dotenv_path='../../.env')

class DevelopmentConfig:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'sqlite:///planner.db')
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-dev-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default-jwt-key')
    DEBUG = True
    CACHE_TYPE = 'SimpleCache'
    
    

class TestingConfig:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///testing.db'
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-dev-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default-jwt-key')
    DEBUG = True
    CACHE_TYPE = 'SimpleCache'


class ProductionConfig:
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI')
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-dev-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default-jwt-key')
    CACHE_TYPE = "SimpleCache"