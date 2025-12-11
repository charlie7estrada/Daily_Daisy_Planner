from flask import Blueprint, request, jsonify
from .. import db
from ..models import Users
from ..auth import create_token, token_required


bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    # Create user
    data = request.get_json()
    
    user = Users(
        username=data['username'],
        email=data['email'],
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created'}), 201



@bp.route('/login', methods=['POST'])
def login():
    # Login
    data = request.get_json()
    
    user = db.session.execute(db.select(Users).filter_by(email=data['email'])).scalar_one_or_none()
    
    # Check if user exists and password is correct
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    token = create_token(user.id)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'location': user.location
        }
    }), 200

@bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify({
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'location': current_user.location
        }
    }), 200

@bp.route('/profile', methods=['PATCH'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    
    # Update location if provided
    if 'location' in data:
        current_user.location = data['location']
        db.session.commit()
    
    return jsonify({
        'message': 'Profile updated',
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'location': current_user.location
        }
    }), 200