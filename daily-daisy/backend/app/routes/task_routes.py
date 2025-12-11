from flask import Blueprint, request, jsonify
from .. import db
from ..models import Task, Planner
from ..auth import token_required

bp = Blueprint('tasks', __name__, url_prefix='/api')

@bp.route('/planners/<int:planner_id>/tasks', methods=['GET'])
@token_required
def get_tasks(current_user, planner_id):
    # Get all tasks for a specific planner
    planner = db.session.execute(
        db.select(Planner).filter_by(id=planner_id, user_id=current_user.id)
    ).scalar_one_or_none()
    
    if not planner:
        return jsonify({'message': 'Planner not found'}), 404
    
    tasks = db.session.execute(
        db.select(Task).filter_by(planner_id=planner_id)
    ).scalars().all()
    
    return jsonify([{
        'id': t.id,
        'planner_id': t.planner_id,
        'title': t.title,
        'status': t.status,
        'created_at': t.created_at.isoformat() if t.created_at else None
    } for t in tasks]), 200

@bp.route('/planners/<int:planner_id>/tasks', methods=['POST'])
@token_required
def create_task(current_user, planner_id):
    # Create a new task for a specific planner
    # Verify planner belongs to current user
    planner = db.session.execute(
        db.select(Planner).filter_by(id=planner_id, user_id=current_user.id)
    ).scalar_one_or_none()
    
    if not planner:
        return jsonify({'message': 'Planner not found'}), 404
    
    data = request.get_json()
    
    # Create task
    task = Task(
        planner_id=planner_id,
        title=data['title'],
        status=data.get('status', 'pending')  # Default to 'pending'
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify({
        'id': task.id,
        'planner_id': task.planner_id,
        'title': task.title,
        'status': task.status,
        'created_at': task.created_at.isoformat() if task.created_at else None
    }), 201

@bp.route('/tasks/<int:task_id>/status', methods=['PATCH'])
@token_required
def update_task_status(current_user, task_id):
    # Update task status (pending -> completed)
    task = db.session.execute(
        db.select(Task).filter_by(id=task_id)
    ).scalar_one_or_none()
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    # Verify task's planner belongs to current user
    planner = db.session.execute(
        db.select(Planner).filter_by(id=task.planner_id, user_id=current_user.id)
    ).scalar_one_or_none()
    
    if not planner:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    task.status = data.get('status', task.status)
    
    db.session.commit()
    
    return jsonify({
        'id': task.id,
        'planner_id': task.planner_id,
        'title': task.title,
        'status': task.status,
        'created_at': task.created_at.isoformat() if task.created_at else None
    }), 200


@bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@token_required
def delete_task(current_user, task_id):
    # Delete a task
    task = db.session.execute(
        db.select(Task).filter_by(id=task_id)
    ).scalar_one_or_none()
    
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    # Verify task's planner belongs to current user
    planner = db.session.execute(
        db.select(Planner).filter_by(id=task.planner_id, user_id=current_user.id)
    ).scalar_one_or_none()
    
    if not planner:
        return jsonify({'message': 'Unauthorized'}), 403
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'message': 'Task deleted successfully'}), 200