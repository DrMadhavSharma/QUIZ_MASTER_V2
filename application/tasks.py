from celery import shared_task #it helps us to use the celery object defined in the other file
from .models import *
from .utils import format_report
from .mail import send_email
import datetime
import csv
import requests #plural
import json

@shared_task(ignore_results = False, name = "download_csv_report")
def csv_report():
    quizzes = Quiz.query.all() # admin
    csv_file_name = f"transaction_{datetime.datetime.now().strftime("%f")}.csv" #transaction_123456.csv
    with open(f'static/{csv_file_name}', 'w', newline = "") as csvfile:
    # csvfile = open(f'static/{csv_file_name}', 'w', newline = "")
        sr_no = 1
        Quiz_csv = csv.writer(csvfile, delimiter = ',')
        Quiz_csv.writerow(['Sr No.', 'title', 'chapter_id', 'date', 'Duration'])
        for q in quizzes:
            this_quiz = [sr_no, q.title, q.chapter_id, q.date, q.duration]
            Quiz_csv.writerow(this_quiz)
            sr_no += 1

    return csv_file_name

@shared_task(ignore_results=False, name="monthly_report")
def monthly_report():
    users = User.query.all()
    for user in users[1:]:
        user_data = {
            'username': user.username,
            'email': user.email,
        }
        user_quizzes = []
        total_score = 0

        for quiz_attempt in user.quizzes_attempted:
            this_quiz = {
                "id": quiz_attempt.id,
                "user_id": quiz_attempt.user_id,
                "quiz_id": quiz_attempt.quiz_id,
                "score": quiz_attempt.score,
                "date_attempted": quiz_attempt.date_attempted,
            }
            user_quizzes.append(this_quiz)
            total_score += quiz_attempt.score  # Calculate total score

        user_data['quizzes'] = user_quizzes
        user_data['total'] = total_score
        
        # Render email content
        message = format_report('templates/mail_details.html', user_data)
        send_email(user.email, subject="Monthly Transaction Report - Quiz Master", message=message)

    return "Monthly reports sent"



@shared_task(ignore_results=False, name="quiz_update")
def quiz_update(quiz_id):
    # Get all users from the database
    users = User.query.all()

    # Message Template
    text_template = (
        f"Hi {{username}}, we have crafted some new questions based on current trends in our new quiz! "
        f"Please check the app at http://127.0.0.1:5000"
    )

    # Iterate through users and send notifications
    for user in users[1:]:
        message = text_template.format(username=user.username)
        response = requests.post(
            "https://chat.googleapis.com/v1/spaces/AAAAGc1HvB0/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=tum8EkYGU3DBQ41TVS27E8DFsmL1mfSCAVyjtNisjrY",
            headers={"Content-Type": "application/json"} , json={"text" : message}
        )

        # Log the notification to the database
        if response.status_code == 200:
            notification = Notification(user_id=user.id, message=message)
            db.session.add(notification)
        else:
            print(f"Failed to send to {user.username}: {response.status_code}")

    # Commit notifications
    db.session.commit()

    return "Notifications sent to all users"


    
# https://chat.googleapis.com/v1/spaces/AAAAGc1HvB0/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=tum8EkYGU3DBQ41TVS27E8DFsmL1mfSCAVyjtNisjrY



    # |||||||||||||||||||||||||||||||||||||||||| ---> 10 mins 
    # |\\\\\\\\\\\\\\\\\\\|\\\\\\\\\\\\\\\\\\\\\ ---> with cache  
    # ignore_results = False,do not ignore the task in which it is mentioned