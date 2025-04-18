from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    password = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    authorised_device = db.Column(db.String(100), nullable=False)
    biometrics = db.Column(db.Boolean, default=False)  # True if biometrics are enabled
    location = db.Column(db.String(100), nullable=True)  # User's location (optional)
    last_login = db.Column(db.DateTime, nullable=True)  # Timestamp of the last login
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'authorised_device': self.authorised_device,
            'last_login': self.last_login,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }

class BankConnection(db.Model):
    __tablename__ = 'bank_connections'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bank_name = db.Column(db.String(100), nullable=False)
    account_number = db.Column(db.String(20), nullable=False)
    connection_status = db.Column(db.String(50), nullable=False)  # e.g., 'connected', 'disconnected'
    routing_number = db.Column(db.String(20), nullable=False)  # Bank routing number
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    user = db.relationship('User', backref=db.backref('bank_connections', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bank_name': self.bank_name,
            'account_number': self.account_number,
            'routing_number': self.routing_number,
            'connection_status': self.connection_status,
            'created_at': self.created_at
        }

class BankTransaction(db.Model):
    __tablename__ = 'bank_transactions'
    id = db.Column(db.Integer, primary_key=True)
    bank_connection_id = db.Column(db.Integer, db.ForeignKey('bank_connections.id'), nullable=False)
    transaction_date = db.Column(db.DateTime, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    transaction_type = db.Column(db.Enum('debit', 'credit'), nullable=False)  

    bank_connection = db.relationship('BankConnection', backref=db.backref('transactions', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'bank_connection_id': self.bank_connection_id,
            'transaction_date': self.transaction_date,
            'amount': self.amount,
            'description': self.description,
            'transaction_type': self.transaction_type
        }

class StellarAccount(db.Model):
    __tablename__ = 'stellar_accounts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    stellar_address = db.Column(db.String(100), unique=True, nullable=False)
    stellar_secret = db.Column(db.String(200), nullable=False)
    balance = db.Column(db.Float, nullable=False, default=0.0)

    user = db.relationship('User', backref=db.backref('stellar_accounts', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'stellar_address': self.stellar_address,
            'stellar_secret': self.stellar_secret,
            'balance': self.balance
        }

