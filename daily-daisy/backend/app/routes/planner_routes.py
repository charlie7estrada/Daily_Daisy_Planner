from flask import Blueprint, request, jsonify
from .. import db
from ..models import Planner
from ..auth import token_required

bp = Blueprint('planners', __name__, url_prefix='/api/planners')

@bp.route('', methods=['GET'])
@token_required
def get_planners(current_user):
    # Get all planners for the logged-in user
    planners = db.session.execute(
        db.select(Planner).filter_by(user_id=current_user.id)
    ).scalars().all()
    
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'view_type': p.view_type,
        'created_at': p.created_at.isoformat() if p.created_at else None
    } for p in planners]), 200

@bp.route('', methods=['POST'])
@token_required
def create_planner(current_user):
    # Create a new planner for the logged-in user
    data = request.get_json()
    
    planner = Planner(
        user_id=current_user.id,
        name=data['name'],
        view_type=data.get('view_type', 'daily')  # Default to 'daily' if not provided
    )
    db.session.add(planner)
    db.session.commit()
    
    return jsonify({
        'id': planner.id,
        'name': planner.name,
        'view_type': planner.view_type,
        'created_at': planner.created_at.isoformat() if planner.created_at else None
    }), 201