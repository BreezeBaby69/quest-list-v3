import json

def test_register(test_client):
    response = test_client.post('/api/register',
                                data=json.dumps(dict(
                                    username='testuser',
                                    email='test@test.com',
                                    password='testpassword'
                                )),
                                content_type='application/json')
    assert response.status_code == 200
    assert b'New user created!' in response.data

def test_login(test_client):
    # First, register a user
    test_client.post('/api/register',
                     data=json.dumps(dict(
                         username='testuser',
                         email='test@test.com',
                         password='testpassword'
                     )),
                     content_type='application/json')
    # Then, log in
    response = test_client.post('/api/login',
                                data=json.dumps(dict(
                                    username='testuser',
                                    password='testpassword'
                                )),
                                content_type='application/json')
    assert response.status_code == 200
    assert b'token' in response.data
