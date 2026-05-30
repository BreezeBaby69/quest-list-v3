import pytest
import json
from backend.app import app, db

@pytest.fixture(scope='function')
def test_client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

    with app.test_client() as testing_client:
        with app.app_context():
            db.create_all()
            yield testing_client
            db.session.remove()
            db.drop_all()

@pytest.fixture(scope='function')
def token(test_client):
    # Register and login to get a token
    test_client.post('/api/register',
                     data=json.dumps(dict(
                         username='testuser',
                         email='test@test.com',
                         password='testpassword'
                     )),
                     content_type='application/json')
    response = test_client.post('/api/login',
                                data=json.dumps(dict(
                                    username='testuser',
                                    password='testpassword'
                                )),
                                content_type='application/json')
    return json.loads(response.data)['token']
