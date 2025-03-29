class Config():
    DEBUG=False
    SQLALCHEMY_TRACK_MODIFICATIONS=True

class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI="sqlite:///quizmaster.sqlite3"
    DEBUG=True 
    # config for security
    SECRET_KEY = "this-is-a-secret-key" # helps us to encrypt user credentials in the  session
    SECURITY_PASSWORD_HASH = "bcrypt" # mechanism we will be using for encrypting password
    SECURITY_PASSWORD_SALT = "this-is-a-password-salt" # very much similar to secret_key,helps in hashing in password
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    