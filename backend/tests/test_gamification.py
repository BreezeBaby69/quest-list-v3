import json
from backend.app import db, User, Task

def test_complete_task_awards_xp_and_currency(test_client, token):
    # Create a task
    response = test_client.post('/api/tasks',
                                headers={'x-access-token': token},
                                data=json.dumps(dict(
                                    title='Test Task',
                                    description='This is a test task'
                                )),
                                content_type='application/json')
    task_id = json.loads(response.data)['id']
    # Complete the task
    test_client.put(f'/api/tasks/{task_id}',
                    headers={'x-access-token': token},
                    data=json.dumps(dict(completed=True)),
                    content_type='application/json')
    # Check user's xp and currency
    response = test_client.get('/api/user', headers={'x-access-token': token})
    user_data = json.loads(response.data)
    assert user_data['xp'] == 10
    assert user_data['currency'] == 5
