import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta, date
from functools import wraps
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# ... (rest of the file is the same)
# Association table for User and Achievement
user_achievements = db.Table('user_achievements',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('achievement_id', db.Integer, db.ForeignKey('achievement.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    xp = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    currency = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)
    last_task_completion_date = db.Column(db.Date, nullable=True)
    achievements = db.relationship('Achievement', secondary=user_achievements, lazy='subquery',
        backref=db.backref('users', lazy=True))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'xp': self.xp,
            'level': self.level,
            'currency': self.currency,
            'streak': self.streak
        }

    def __repr__(self):
        return f'<User {self.username}>'

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('tasks', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'user_id': self.user_id
        }

    def __repr__(self):
        return f'<Task {self.title}>'

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['id'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'])
    new_user = User(username=data['username'], email=data['email'], password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'New user created!'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Could not verify'}), 401
    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Could not verify'}), 401
    token = jwt.encode({'id': user.id, 'exp': datetime.utcnow() + timedelta(minutes=30)}, app.config['SECRET_KEY'])
    return jsonify({'token': token})

@app.route('/api/user', methods=['GET'])
@token_required
def get_user(current_user):
    return jsonify(current_user.to_dict())

@app.route('/api/tasks', methods=['GET'])
@token_required
def get_tasks(current_user):
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    return jsonify([task.to_dict() for task in tasks])

@app.route('/api/tasks', methods=['POST'])
@token_required
def create_task(current_user):
    data = request.get_json()
    new_task = Task(
        title=data['title'],
        description=data.get('description', ''),
        user_id=current_user.id
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201

@app.route('/api/tasks/<int:id>', methods=['PUT'])
@token_required
def update_task(current_user, id):
    task = Task.query.get(id)
    if not task or task.user_id != current_user.id:
        return jsonify({'message': 'Task not found'}), 404
    data = request.get_json()
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)

    if data.get('completed') and not task.completed:
        task.completed = True
        # Gamification logic
        current_user.xp += 10
        current_user.currency += 5
        # Level up
        if current_user.xp >= current_user.level * 100:
            current_user.level += 1
        # Streaks
        today = date.today()
        if current_user.last_task_completion_date:
            if (today - current_user.last_task_completion_date).days == 1:
                current_user.streak += 1
            elif (today - current_user.last_task_completion_date).days > 1:
                current_user.streak = 1
        else:
            current_user.streak = 1

        if not current_user.last_task_completion_date or current_user.last_task_completion_date < today:
            current_user.last_task_completion_date = today

        # Achievements
        check_achievements(current_user)

    db.session.commit()
    return jsonify(task.to_dict())

@app.route('/api/tasks/<int:id>', methods=['DELETE'])
@token_required
def delete_task(current_user, id):
    task = Task.query.get(id)
    if not task or task.user_id != current_user.id:
        return jsonify({'message': 'Task not found'}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'})

@app.route('/api/achievements', methods=['GET'])
@token_required
def get_achievements(current_user):
    all_achievements = Achievement.query.all()
    user_achievements = current_user.achievements
    return jsonify({
        'all_achievements': [ach.to_dict() for ach in all_achievements],
        'user_achievements': [ach.to_dict() for ach in user_achievements]
    })

def check_achievements(user):
    # Example achievement: complete 10 tasks
    if len(user.tasks) >= 10:
        achievement = Achievement.query.filter_by(name='Task Master').first()
        if achievement and achievement not in user.achievements:
            user.achievements.append(achievement)
    # Example achievement: 5-day streak
    if user.streak >= 5:
        achievement = Achievement.query.filter_by(name='Streak Master').first()
        if achievement and achievement not in user.achievements:
            user.achievements.append(achievement)

# You can create a script to populate the achievements table
@app.cli.command("seed-achievements")
def seed_achievements():
    achievements = [
        {'name': 'Task Master', 'description': 'Complete 10 tasks'},
        {'name': 'Streak Master', 'description': 'Maintain a 5-day streak'}
    ]
    for ach_data in achievements:
        if not Achievement.query.filter_by(name=ach_data['name']).first():
            achievement = Achievement(**ach_data)
            db.session.add(achievement)
    db.session.commit()
    print("Achievements seeded.")
