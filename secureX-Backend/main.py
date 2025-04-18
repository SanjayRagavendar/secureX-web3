from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from models import db

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'aHGJJnAU26XyIix4qY7jxRfOAdTVm0ExK0IedAbTxakfeVa'

db.init_app(app)



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)