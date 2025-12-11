from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from .config import DevelopmentConfig
from .models import Base


db = SQLAlchemy(model_class=Base)

def create_app():
    
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    CORS(app)
    db.init_app(app)
    with app.app_context():
        db.create_all()

    #register blueprints
    from .routes import user_routes, planner_routes, task_routes
    app.register_blueprint(user_routes.bp)
    app.register_blueprint(planner_routes.bp)
    app.register_blueprint(task_routes.bp)
    
    return app