import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health(client):
    response = client.get('/health')
    assert response.status_code == 200
    assert response.get_json()['status'] == 'OK'

def test_predict_missing_key(client):
    # Sending payload with missing 'age'
    data = {
        'sex': 1,
        'cp': 3,
        'trestbps': 145,
        'chol': 233,
        'fbs': 1,
        'restecg': 0,
        'thalach': 150,
        'exang': 0,
        'oldpeak': 2.3,
        'slope': 0,
        'ca': 0,
        'thal': 1
    }
    response = client.post('/predictions/', json=data)
    assert response.status_code == 400
    assert 'Missing key' in response.get_json()['error']

def test_predict_success(client):
    data = {
        'age': 63,
        'sex': 1,
        'cp': 3,
        'trestbps': 145,
        'chol': 233,
        'fbs': 1,
        'restecg': 0,
        'thalach': 150,
        'exang': 0,
        'oldpeak': 2.3,
        'slope': 0,
        'ca': 0,
        'thal': 1
    }
    response = client.post('/predictions/', json=data)
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'prediction' in json_data
    assert 'probability' in json_data
    assert 'message' in json_data
    assert json_data['prediction'] in [0, 1]
    assert isinstance(json_data['probability'], float)
    assert isinstance(json_data['message'], str)
    