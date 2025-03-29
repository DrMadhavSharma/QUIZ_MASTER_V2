from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime



class UsersRoles(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False) #used to create the token
    active = db.Column(db.Boolean, default=True)
    roles = db.relationship('Role', secondary="users_roles", backref=db.backref('users', lazy='dynamic')) #pseudo column used to
    # get the roles associated with the user using the role relationship
    quizzes_attempted = db.relationship('QuizAttempt', backref='user', lazy=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    def serialize(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'active': self.active,
            'created_at': self.created_at
        }
    # def is_admin(self):  
    #     return any(role.name == 'admin' for role in self.roles)                                   
        #Purpose of is_admin()
# It helps determine if a user is an admin without querying the database every time.
# It can be used in templates, views, or API endpoints to restrict access to admin-only actions.
        

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.String)
# Many-to-Many relationship between Users and Roles
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }


class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    chapters = db.relationship('Chapter', backref='subject', lazy=True, cascade='all, delete-orphan')

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name
        }

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id', ondelete='CASCADE'), nullable=False)
    quizzes = db.relationship('Quiz', backref='chapter', lazy=True, cascade='all, delete-orphan',passive_deletes=True)

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'subject_id': self.subject_id
        }

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id', ondelete='CASCADE'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    duration = db.Column(db.String, nullable=False)  # Format: HH:MM
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade='all, delete-orphan',passive_deletes=True)

    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'chapter_id': self.chapter_id,
            'date': str(self.date),
            'duration': self.duration
        }

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String, nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete='CASCADE'), nullable=False)
    correct_option = db.Column(db.Integer, nullable=False)  # Index of the correct option
    options = db.relationship('Option', backref='question', lazy=True, cascade='all, delete-orphan',passive_deletes=True)

    def serialize(self):
        return {
            'id': self.id,
            'text': self.text,
            'quiz_id': self.quiz_id,
            'correct_option': self.correct_option
        }

class Option(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String, nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id', ondelete='CASCADE'), nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'text': self.text,
            'question_id': self.question_id
        }


class QuizAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    date_attempted = db.Column(db.DateTime, default=datetime.now)
    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'quiz_id': self.quiz_id,
            'score': self.score,
            'date_attempted': str(self.date_attempted)
        }

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.String, nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow)
    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'sent_at': str(self.sent_at)
        }
# Scheduled and Async Job related models
class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    report_type = db.Column(db.String, nullable=False)  # Monthly, Daily
    content = db.Column(db.Text, nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'report_type': self.report_type,
            'content': self.content,
            'generated_at': str(self.generated_at)
        }
class ExportTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    admin_triggered = db.Column(db.Boolean, default=False)  # Admin vs User Triggered
    status = db.Column(db.String, default='Pending')  # Pending, Completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'admin_triggered': self.admin_triggered,
            'status': self.status,
            'created_at': str(self.created_at)
        }
#extras ,payment portal
class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String, default='Pending')  # Pending, Success, Failed
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': self.amount,
            'payment_status': self.payment_status,
            'payment_date': self.payment_date.strftime('%Y-%m-%d %H:%M:%S')
        }