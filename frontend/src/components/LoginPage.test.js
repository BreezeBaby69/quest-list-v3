import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from './LoginPage';
import axios from 'axios';

jest.mock('axios');
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('LoginPage', () => {
  test('renders login form and logs in a user', async () => {
    axios.post.mockResolvedValue({ data: { token: 'fake-token' } });

    render(
      <AuthProvider>
        <Router>
          <LoginPage />
        </Router>
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/login', {
        username: 'testuser',
        password: 'password'
      });
    });
  });
});
