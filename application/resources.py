from flask_restful import Api, Resource, reqparse 
from .models import *
from flask_security import auth_required, roles_required, roles_accepted, current_user
from flask import request
import datetime 
from .utils import roles_list
from flask import Flask, request, jsonify
api = Api()
from .tasks import quiz_update
#QUIZ RESOURCE : FOR CREATION,UPDATION,GETTING,QUIZZES
class QuizResource(Resource): #creating a route using flask restful api ,rather than  directly from flask
    # @auth_required('token')
    # @roles_required('admin')
    def get(self, quiz_id=None):  #either admin or general user ,if we had written @roles_required then only that particular will be allowed
        chapter_id = request.args.get('chapter_id')
        if quiz_id:
            quiz = Quiz.query.get(quiz_id)
            print(f"Received quiz_id: {request.args.get('quiz_id')}")

            if quiz:
                return {
                    'id': quiz.id,
                    'title': quiz.title,
                    'chapter_id': quiz.chapter_id,
                    'date': quiz.date.strftime('%Y-%m-%d'),
                    'duration': quiz.duration
                }, 200
            return {'message': 'Quiz not found'}, 404

        elif chapter_id:
            quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()

            if quizzes:
                return [{'id': q.id, 'title': q.title, 'chapter_id': q.chapter_id, 'date': q.date.strftime('%Y-%m-%d'), 'duration': q.duration} for q in quizzes], 200
            else:
                return {'message': 'No quizzes found for this chapter'}, 404

        else:
            quizzes = Quiz.query.all()
            return [{'id': q.id, 'title': q.title, 'chapter_id': q.chapter_id, 'date': q.date.strftime('%Y-%m-%d'), 'duration': q.duration} for q in quizzes], 200
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        data = request.get_json()

        # Validate chapter existence
        chapter = Chapter.query.get(data.get('chapter_id'))
        if not chapter:
            return {'message': 'Chapter not found'}, 404

        try:
            new_quiz = Quiz(
                title=data['title'],
                chapter_id=data['chapter_id'],
                date=datetime.datetime.now(),
                duration=data['duration']
            )
            db.session.add(new_quiz)
            db.session.commit()
            quiz_update_result=quiz_update.delay(new_quiz.id)  # Asynchronous task to update quiz statistics
            
            return {'message': 'Quiz created successfully', 'quiz_id': new_quiz.id}, 201
        except Exception as e:
            print(f"Error: {e}")
            return {'message': str(e)}, 400
    @auth_required('token')
    @roles_required('admin')
    def put(self, quiz_id):
        data = request.get_json()
        quiz = Quiz.query.get(quiz_id)

        if not quiz:
            return {'message': 'Quiz not found'}, 404

        try:
            quiz.title = data.get('title', quiz.title)
            quiz.chapter_id = data.get('chapter_id', quiz.chapter_id)
            quiz.duration = data.get('duration', quiz.duration)

            db.session.commit()
            return {'message': 'Quiz updated successfully'}, 200
        except Exception as e:
            return {'message': str(e)}, 400
    
    @auth_required('token')
    @roles_required('admin')
    def delete(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)

        if not quiz:
            return {'message': 'Quiz not found'}, 404

        db.session.delete(quiz)
        db.session.commit()
        return {'message': 'Quiz deleted successfully'}, 200
api.add_resource(QuizResource, '/api/getquiz','/api/createquiz','/api/updatequiz/<int:quiz_id>','/api/deletequiz/<int:quiz_id>') #adding the route name here

# QUESTIONS RESPONSIBLE FOR CREATION ,GETTING,UPDATION,DELETION 
class QuestionResource(Resource):
    def get(self, quiz_id=None, question_id=None):
        if question_id:
            question = Question.query.get(question_id)
            if not question:
                return {'message': 'Question not found'}, 404

            options = Option.query.filter_by(question_id=question.id).all()
            option_data = [{"option_id": opt.id, "text": opt.text} for opt in options]
            print(option_data)

            return {
                'id': question.id,
                'text': question.text,
                'quiz_id': question.quiz_id,
                'correct_option': question.correct_option,        
                'options': option_data  # Provide both ID and text directly
            }, 200

        elif quiz_id:
            print(f"Received quiz_id: {request.args.get('quiz_id')}")
            questions = Question.query.filter_by(quiz_id=quiz_id).all()
            if questions:
                return [
                    {
                        'id': q.id,
                        'text': q.text,
                        'quiz_id': q.quiz_id,
                        'correct_option': q.correct_option,
                        'options': [{"option_id": opt.id, "text": opt.text} for opt in Option.query.filter_by(question_id=q.id).all()]
                    } 
                    for q in questions
                ], 200
            return {'message': 'No questions found for this quiz'}, 404

        return {'message': 'Missing quiz_id or question_id'}, 400


  

    def post(self, quiz_id):
        data = request.get_json()

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404

        text = data.get('text')
        options = data.get('options', ["rand"])
        correct_option = data.get('correct_option')

        if not text or len(options) < 2 or len(options) > 4:
            return {'message': 'Invalid question data. A question must have text and 2 to 4 options.'}, 400

        if not isinstance(correct_option, int) or correct_option < 0 or correct_option > len(options):
            return {'message': 'Invalid correct_option index.'}, 400

        # Create the question
        new_question = Question(
            text=text,
            quiz_id=quiz_id,
            correct_option=correct_option
        )
        db.session.add(new_question)
        db.session.flush()

        # Create options
        for i, option_text in enumerate(options):
            option = Option(text=option_text, question_id=new_question.id)
            db.session.add(option)

        db.session.commit()
        return {'message': 'Question created successfully', 'question_id': new_question.id}, 201
    
    def put(self, question_id):
        data = request.get_json()
        print("Received Data:", data)

        

        # Validate question existence
        question = Question.query.get(question_id)
        if not question:
            return {'message': 'Question not found'}, 404

        # Validate input data
        if not isinstance(data, list) or not data:
            return {'message': 'Invalid input. Expecting a non-empty list of options.'}, 400

        try:
            for item in data:
                option_id = item.get('option_id')
                option_text = item.get('text', '').strip()

                if not option_id or not option_text:
                    return {'message': 'Each option must have an option_id and non-empty text'}, 400

                # # Find the option
                option = Option.query.filter_by(id=option_id, question_id=question_id).first()
                if not option:
                    print(f"Option not found for question_id {question_id} with option_id {option_id}")
                    return {'message': f'Option with id {option_id} not found or does not belong to this question'}, 404

                # Update the option text
                option.text = option_text

            db.session.commit()
            return {'message': 'Options updated successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500
            print("Received Data:", data)
    
    def delete(self, question_id):
        print(f"Received DELETE request for question ID: {question_id}")
        question = Question.query.get(question_id)
        if not question:
            print("Question not found")
            return {'message': 'Question not found'}, 404

        print("Deleting question and associated options")
        Option.query.filter_by(question_id=question_id).delete()
        db.session.delete(question)
        db.session.commit()
        print("Question deleted successfully")
        return {'message': 'Question deleted successfully'}, 200



api.add_resource(QuestionResource, '/api/quiz/<int:quiz_id>/question', '/api/questions/<int:question_id>')
    #SEARCH BAR FOR ADMIN .
    # Search Users
    
class UserSearchResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        query = request.args.get('q', '')
        if not query:
            return {'error': 'Query parameter is required'}, 400
        results = User.query.filter((User.username.ilike(f"%{query}%")) | (User.email.ilike(f"%{query}%"))).all()
        if not results:
            return {'message': 'No users found'}, 404
        return jsonify([result.serialize() for result in results])

# Search Subjects


class SubjectSearchResource(Resource):
    @auth_required('token')
    @roles_required('admin')

    def get(self):
        query = request.args.get('q', '')
        if not query:
            return {'error': 'Query parameter is required'}, 400
        results = Subject.query.filter(Subject.name.ilike(f"%{query}%")).all()
        if not results:
            return {'message': 'No subject found'}, 404
        return jsonify([result.serialize() for result in results])

# Search Quizzes


class QuizSearchResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        query = request.args.get('q', '')
        if not query:
            return {'error': 'Query parameter is required'}, 400
        results = Quiz.query.filter(Quiz.title.ilike(f"%{query}%")).all()
        if not results:
            return {'message': 'No quiz found'}, 404
        return jsonify([result.serialize() for result in results])

# Search Chapters


class ChapterSearchResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        query = request.args.get('q', '')
        if not query:
            return {'error': 'Query parameter is required'}, 400
        results = Chapter.query.filter(Chapter.name.ilike(f"%{query}%")).all()
        if not results:
            return {'message': 'No chapter found'}, 404
        return jsonify([result.serialize() for result in results])

# Search Options


class OptionSearchResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        query = request.args.get('q', '')
        if not query:
            return {'error': 'Query parameter is required'}, 400
        results = Option.query.filter(Option.text.ilike(f"%{query}%")).all()
        if not results:
            return {'message': 'No option found'}, 404
        return jsonify([result.serialize() for result in results])

api.add_resource(UserSearchResource, '/search/users')
api.add_resource(SubjectSearchResource, '/search/subjects')
api.add_resource(QuizSearchResource, '/search/quizzes')
api.add_resource(ChapterSearchResource, '/search/chapters')
api.add_resource(OptionSearchResource, '/search/options')


# User Dashboard Resource

class UserDashboardResource(Resource):
    # @auth_required('token')
    # @roles_required('admin')
    def get(self, user_id):
    # Validate user existence
        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        
        # Fetch quiz attempts
        attempts = QuizAttempt.query.filter_by(user_id=user_id).order_by(QuizAttempt.date_attempted.desc()).all()

        if not attempts:
            return {'message': 'No quiz attempts found for this user.'}, 200
        
        # Define a standard max score
        STANDARD_MAX_SCORE = 10
        
        # Prepare summary data
        summary = []
        for attempt in attempts:
            quiz = Quiz.query.get(attempt.quiz_id)
            percentage = (attempt.score / STANDARD_MAX_SCORE * 100)

            summary.append({
                'quiz_title': quiz.title if quiz else 'Quiz Not Found',
                'score': attempt.score,
                'max_score': STANDARD_MAX_SCORE,
                'percentage': f'{percentage:.2f}%',
                'date_attempted': attempt.date_attempted.strftime('%Y-%m-%d %H:%M:%S')
            })

        return {'user': user.username, 'total_attempts': len(attempts), 'attempts': summary}, 200



# Attempt Quiz Resource


class AttemptQuizResource(Resource):
    # @auth_required('token')
    # @roles_required('admin')    
    def post(self, user_id, quiz_id):
        user = User.query.get(user_id)
        quiz = Quiz.query.get(quiz_id)
        
        if not user or not quiz:
            return {'error': 'User or Quiz not found'}, 404
        
        # Validate score input
        score = request.json.get('score')
        if score is None  or score < 0:
            return {'error': 'Invalid score provided'}, 400
        
        # Record quiz attempt
        attempt = QuizAttempt(user_id=user_id, quiz_id=quiz_id, score=score)
        db.session.add(attempt)
        db.session.commit()
        
        return {'message': 'Quiz attempt recorded successfully'}, 201

# Add Resources
api.add_resource(UserDashboardResource, '/user/<int:user_id>/dashboard')
api.add_resource(AttemptQuizResource, '/user/<int:user_id>/attempt_quiz/<int:quiz_id>')
