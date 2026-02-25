/**
 * Register Page Tests
 * Tests form rendering, validation, and submit flow
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('../../services/api', () => ({
  authAPI: {
    register: jest.fn()
  }
}));

jest.mock('../../store/authStore', () => ({
  __esModule: true,
  default: () => ({
    login: mockLogin,
    isAuthenticated: false
  })
}));

import Register from '../../pages/Register';
import { authAPI } from '../../services/api';

const renderRegister = () => {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
};

describe('Register Page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should render registration form fields', () => {
    renderRegister();

    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    // Should have at least two password fields (password + confirm)
    const passwordFields = screen.getAllByPlaceholderText(/password/i);
    expect(passwordFields.length).toBeGreaterThanOrEqual(2);
  });

  it('should validate password match', async () => {
    renderRegister();

    const nameInput = screen.getByPlaceholderText(/name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordFields = screen.getAllByPlaceholderText(/password/i);

    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordFields[0], 'Password123');
    await userEvent.type(passwordFields[1], 'DifferentPass');

    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find(b => b.type === 'submit') || buttons[buttons.length - 1];
    fireEvent.click(submitBtn);

    await waitFor(() => {
      const errorEl = screen.queryByText(/match|mismatch/i);
      expect(errorEl || !authAPI.register.mock.calls.length).toBeTruthy();
    });
  });

  it('should call authAPI.register on valid submit', async () => {
    authAPI.register.mockResolvedValue({
      data: {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        user: { _id: 'u1', name: 'Test User', role: 'student' }
      }
    });

    renderRegister();

    const nameInput = screen.getByPlaceholderText(/name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordFields = screen.getAllByPlaceholderText(/password/i);

    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordFields[0], 'Password123');
    await userEvent.type(passwordFields[1], 'Password123');

    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find(b => b.type === 'submit') || buttons[buttons.length - 1];
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authAPI.register).toHaveBeenCalled();
    });
  });
});
