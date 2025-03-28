from flask import Flask, jsonify
from flask_caching import Cache 
import sqlite3

app = Flask(__name__)

# Flask-Caching configuration with Redis
app.config['CACHE_TYPE'] = 'RedisCache' 
app.config['CACHE_DEFAULT_TIMEOUT'] = 300  # Cache timeout in seconds <-- this

cache = Cache(app) 

def get_db_connection():
    conn = sqlite3.connect('quizmaster.sqlite3')  # Update with your actual database
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/getquiz', methods=['GET'])
@cache.cached(timeout=300, key_prefix='QUIZRESOURCE') 
def get_transactions():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Quiz")  # Update with actual table name
    rows = cursor.fetchall()
    conn.close()
    
    quizzess = [dict(row) for row in rows]
    return jsonify(quizzes)

if __name__ == '__main__':
    app.run(debug=True)