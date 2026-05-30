import json

def test_create_task(test_client, token):
    response = test_client.post('/api/tasks',
                                headers={'x-access-token': token},
                                data=json.dumps(dict(
                                    title='Test Task',
                                    description='This is a test task'
                                )),
                                content_type='application/json')
    assert response.status_code == 201
    assert b'Test Task' in response.data

def test_get_tasks(test_client, token):
    # Create a task first
    test_client.post('/api/tasks',
                     headers={'x-access-token': token},
                     data=json.dumps(dict(
                         title='Test Task',
                         description='This is a test task'
                     )),
                     content_type='application/json')
    # Then get the tasks
    response = test_client.get('/api/tasks', headers={'x-access-token': token})
    assert response.status_code == 200
    assert len(json.loads(response.data)) == 1
