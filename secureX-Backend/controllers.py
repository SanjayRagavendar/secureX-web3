from flask import request, jsonify, make_response
from models import *
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import requests

def create_account(data):
    try:
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        phone = data.get('phone')
        authorised_device = data.get('authorised_device')
        location = data.get('location')  
        
        if not email or not password or not name or not phone or not authorised_device or not location:
            return jsonify({'message': 'All fields are required'}), 400
        
        if User.query.filter_by(email=email, authorised_device=authorised_device).first():
            return jsonify({'message': 'User with this email or authorised device already exists'}), 400

        hashed_password = generate_password_hash(password, method='bcrypt')

        new_user = User(
            email=email,
            password=hashed_password,
            name=name,
            phone=phone,
            authorised_device=authorised_device,
            location=location
        )
        db.session.add(new_user)
        db.session.flush()  
        
        # Create a Stellar account for the user
        try:
            # Call Stellar API to create account
            stellar_api_url = "https://horizon-testnet.stellar.org/accounts"
            stellar_response = requests.post(stellar_api_url)
            
            if stellar_response.status_code == 200:
                stellar_data = stellar_response.json()
                stellar_address = stellar_data.get('account_id')
                seed = stellar_data.get('seed')
                
                # Create the Stellar account record in our database
                new_stellar_account = StellarAccount(
                    user_id=new_user.id,
                    stellar_address=stellar_address,
                    balance=0.0,
                    is_active=True
                )
                db.session.add(new_stellar_account)
                db.session.commit()
                
                return jsonify({
                    'message': 'User and Stellar account created successfully',
                    'stellar_address': stellar_address,
                    'seed': seed  # Note: In production, handle the seed securely
                }), 201
            else:
                # If Stellar account creation fails, rollback user creation
                db.session.rollback()
                return jsonify({'message': 'Failed to create Stellar account'}), 500
                
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Error creating Stellar account: {str(e)}'}), 500
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
    
def login_account(data):
    try:
        email = data.get('email')
        password = data.get('password')
        authorised_device = data.get('authorised_device')
        location = data.get('location')
        last_login = datetime.now()
                

        if not email or not password or not authorised_device or not location:
            return jsonify({'message': 'All fields are required'}), 400

        user = User.query.filter_by(email=email, authorised_device=authorised_device).first()

        if not user or not check_password_hash(user.password, password):
            return jsonify({'message': 'Invalid credentials'}), 401

        user.last_login = last_login
        if user.location != location:
            return jsonify({'message': 'Location mismatch'}), 403
            
        db.session.commit()

        access_token = create_access_token(identity={'email': user.email}, expires_delta=timedelta(days=1))

        return jsonify({'access_token': access_token}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    

def biometrics_login(data):
    try:
        user_id = data.get('user_id')
        device_id = data.get('device_id')
        
        if not user_id or not device_id:
            return jsonify({'message': 'All fields are required'}), 400
        
        user = User.query.filter_by(id=user_id, authorised_device=device_id).first()

        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        if user.biometrics:
            access_token = create_access_token(identity={'email': user.email}, expires_delta=timedelta(days=1))
            return jsonify({'access_token': access_token}), 200
        else:
            return jsonify({'message': 'Biometrics not enabled for this user'}), 403
    except Exception as e:
        return jsonify({'message': str(e)}), 500

def update_user(data):
    try:
        user_id = data.get('user_id')
        name = data.get('name')
        phone = data.get('phone')
        location = data.get('location')
        last_login = datetime.now()

        if not user_id or not name or not phone:
            return jsonify({'message': 'All fields are required'}), 400

        user = User.query.filter_by(id=user_id).first()

        if not user:
            return jsonify({'message': 'User not found'}), 404

        user.name = name
        user.phone = phone
        user.location = location
        db.session.commit()

        return jsonify({'message': 'User updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
    
def connect_bank_account(data):
    try:
        user_id = data.get('user_id')
        bank_name = data.get('bank_name')
        account_number = data.get('account_number')
        connection_status = data.get('connection_status')

        if not user_id or not bank_name or not account_number or not routing_number or not connection_status:
            return jsonify({'message': 'All fields are required'}), 400

        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404

        try:
            bank_api_url = "https://api.bankingpartner.com/connect"
            
            verification_data = {
                "account_number": account_number,
                "bank_name": bank_name,
                "user_name": user.name
            }
            response = requests.post(bank_api_url, json=verification_data)
            
            response_data = response.json()
            if response.status_code != 200 or not response_data.get('verified'):
                return jsonify({'message': 'Bank account verification failed'}), 400
            
            
            
            new_connection = BankConnection(
                user_id=user_id,
                bank_name=bank_name,
                account_number=account_number,
                routing_number=response_data.get('routing_number'),
                connection_status=connection_status
            )
            db.session.add(new_connection)
            db.session.commit()

            return jsonify({'message': 'Bank account connected successfully'}), 201

        except Exception as e:
            return jsonify({'message': f'Bank verification error: {str(e)}'}), 500

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
    

def disconnect_bank_account(data):
    try:
        user_id = data.get('user_id')
        bank_connection_id = data.get('bank_connection_id')

        if not user_id or not bank_connection_id:
            return jsonify({'message': 'All fields are required'}), 400

        # Verify user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Find the bank connection before deletion
        connection = BankConnection.query.filter_by(id=bank_connection_id, user_id=user_id).first()
        if not connection:
            return jsonify({'message': 'Bank connection not found'}), 404

        # Make API request to bank to intimate disconnection
        try:
            bank_api_url = "https://api.bankingpartner.com/disconnect"
            disconnection_data = {
                "account_number": connection.account_number,
                "routing_number": connection.routing_number,
                "bank_name": connection.bank_name,
                "user_id": user_id
            }
            response = requests.post(bank_api_url, json=disconnection_data)
            
            if response.status_code != 200:
                return jsonify({'message': 'Failed to notify bank about disconnection'}), 500
            
        except Exception as e:
            return jsonify({'message': f'Bank notification error: {str(e)}'}), 500

        connection = BankConnection.query.filter_by(id=bank_connection_id, user_id=user_id).first()

        if not connection:
            return jsonify({'message': 'Bank connection not found'}), 404

        db.session.delete(connection)
        db.session.commit()

        return jsonify({'message': 'Bank account disconnected successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
    
def deposit_funds(data):
    try:
        user_id = data.get('user_id')
        stellar_address = data.get('stellar_address')
        amount = data.get('amount')
        bank_connection_id = data.get('bank_connection_id')  

        if not user_id or not stellar_address or not amount or not bank_connection_id:
            return jsonify({'message': 'All fields are required'}), 400

        # Verify user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Verify bank connection exists
        bank_connection = BankConnection.query.filter_by(id=bank_connection_id, user_id=user_id).first()
        if not bank_connection:
            return jsonify({'message': 'Bank connection not found'}), 404

        # Verify Stellar account exists
        stellar_account = StellarAccount.query.filter_by(user_id=user_id, stellar_address=stellar_address).first()
        if not stellar_account:
            return jsonify({'message': 'Stellar account not found'}), 404

        # Make API request to bank to withdraw funds
        try:
            bank_api_url = "https://api.bankingpartner.com/withdraw"
            bank_data = {
                "account_number": bank_connection.account_number,
                "routing_number": bank_connection.routing_number,
                "amount": amount,
                "user_id": user_id
            }
            bank_response = requests.post(bank_api_url, json=bank_data)
            
            if bank_response.status_code != 200:
                return jsonify({'message': 'Failed to withdraw funds from bank account'}), 500
        except Exception as e:
            return jsonify({'message': f'Bank API error: {str(e)}'}), 500

        # Make API request to Stellar testnet to deposit funds
        try:
            stellar_testnet_api_url = "https://horizon-testnet.stellar.org/transactions"
            deposit_data = {
                "stellar_address": stellar_address,
                "amount": amount,
                "user_id": user_id,
                "network": "testnet"
            }
            stellar_response = requests.post(stellar_testnet_api_url, json=deposit_data)
            
            if stellar_response.status_code != 200:
                # Refund the bank withdrawal if Stellar deposit fails
                refund_url = "https://api.bankingpartner.com/refund"
                requests.post(refund_url, json=bank_data)
                return jsonify({'message': 'Failed to deposit funds to Stellar account'}), 500
            
            transaction_id = stellar_response.json().get('id')
            
        except Exception as e:
            # Refund the bank withdrawal if Stellar deposit fails
            refund_url = "https://api.bankingpartner.com/refund"
            requests.post(refund_url, json=bank_data)
            return jsonify({'message': f'Stellar testnet API error: {str(e)}'}), 500

        # Update Stellar account balance
        stellar_account.balance += amount
        
        # Record the transaction in our database
        new_transaction = Transaction(
            user_id=user_id,
            stellar_account_id=stellar_account.id,
            bank_connection_id=bank_connection_id,
            amount=amount,
            transaction_type="deposit",
            transaction_id=transaction_id,
            status="completed"
        )
        db.session.add(new_transaction)
        db.session.commit()

        return jsonify({
            'message': 'Funds deposited successfully', 
            'new_balance': stellar_account.balance,
            'transaction_id': transaction_id
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

def withdraw_funds(data):
    try:
        user_id = data.get('user_id')
        stellar_address = data.get('stellar_address')
        amount = data.get('amount')
        bank_connection_id = data.get('bank_connection_id')

        if not user_id or not stellar_address or not amount or not bank_connection_id:
            return jsonify({'message': 'All fields are required'}), 400

        # Verify user exists
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Verify bank connection exists
        bank_connection = BankConnection.query.filter_by(id=bank_connection_id, user_id=user_id).first()
        if not bank_connection:
            return jsonify({'message': 'Bank connection not found'}), 404

        # Verify Stellar account exists and has sufficient balance
        stellar_account = StellarAccount.query.filter_by(user_id=user_id, stellar_address=stellar_address).first()
        if not stellar_account:
            return jsonify({'message': 'Stellar account not found'}), 404
        
        if stellar_account.balance < amount:
            return jsonify({'message': 'Insufficient funds in Stellar account'}), 400

        # Make API request to Stellar testnet to withdraw funds
        try:
            stellar_testnet_api_url = "https://horizon-testnet.stellar.org/transactions"
            withdraw_data = {
                "stellar_address": stellar_address,
                "amount": amount,
                "user_id": user_id,
                "operation": "withdrawal",
                "network": "testnet"
            }
            stellar_response = requests.post(stellar_testnet_api_url, json=withdraw_data)
            
            if stellar_response.status_code != 200:
                return jsonify({'message': 'Failed to withdraw funds from Stellar account'}), 500
                
            transaction_id = stellar_response.json().get('id')
            
        except Exception as e:
            return jsonify({'message': f'Stellar testnet API error: {str(e)}'}), 500

        # Make API request to bank to deposit funds
        try:
            bank_api_url = "https://api.bankingpartner.com/deposit"
            bank_data = {
                "account_number": bank_connection.account_number,
                "routing_number": bank_connection.routing_number,
                "amount": amount,
                "user_id": user_id
            }
            bank_response = requests.post(bank_api_url, json=bank_data)
            
            if bank_response.status_code != 200:
                # Refund the Stellar withdrawal if bank deposit fails
                refund_url = "https://horizon-testnet.stellar.org/transactions"
                refund_data = {
                    "stellar_address": stellar_address,
                    "amount": amount,
                    "user_id": user_id,
                    "operation": "refund",
                    "network": "testnet"
                }
                requests.post(refund_url, json=refund_data)
                return jsonify({'message': 'Failed to deposit funds to bank account'}), 500
            
        except Exception as e:
            # Attempt to refund the Stellar withdrawal
            refund_url = "https://horizon-testnet.stellar.org/transactions"
            refund_data = {
                "stellar_address": stellar_address,
                "amount": amount,
                "user_id": user_id,
                "operation": "refund",
                "network": "testnet"
            }
            requests.post(refund_url, json=refund_data)
            return jsonify({'message': f'Bank API error: {str(e)}'}), 500

        # Update Stellar account balance
        stellar_account.balance -= amount
        
        # Record the transaction
        new_transaction = Transaction(
            user_id=user_id,
            stellar_account_id=stellar_account.id,
            bank_connection_id=bank_connection_id,
            amount=amount,
            transaction_type="withdrawal",
            transaction_id=transaction_id,
            status="completed"
        )
        db.session.add(new_transaction)
        db.session.commit()

        return jsonify({
            'message': 'Funds withdrawn successfully', 
            'new_balance': stellar_account.balance,
            'transaction_id': transaction_id
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500