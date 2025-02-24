import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthModal from '../AuthModal';
import { useNavigate } from 'react-router-dom';
import { useRoleState } from '../../../PatientContext';
import React from 'react';
import { signInWithEmailAndPassword, signInWithPopup  } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    signInWithEmailAndPassword: jest.fn(),
  })),
  signInWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),  
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../../../PatientContext', () => ({
  useRoleState: jest.fn(),
}));

describe('AuthModal', () => {
  let navigate;
  let setAlert;

  beforeEach(() => {
    navigate = jest.fn();
    setAlert = jest.fn();
    useNavigate.mockReturnValue(navigate);
    useRoleState.mockReturnValue({ setAlert });
  });

  it('should render AuthModal component', () => {
    render(<AuthModal />);
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });

  it('should show error message for invalid sign-in', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/wrong-password', message: 'Wrong password.' });

    render(<AuthModal />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText(/Sign In/i));

    expect(await screen.findByText('Incorrect password. Please try again.')).toBeInTheDocument();
  });

  it('should show error message for empty fields', async () => {
    render(<AuthModal />);
    fireEvent.click(screen.getByText(/Sign In/i));

    expect(await screen.findByText('Please fill in all fields')).toBeInTheDocument();
  });

  it('should navigate to homepage on successful sign-in', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { email: 'pttestuser@esurgi.net' } });

    render(<AuthModal />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'pttestuser@esurgi.net' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Test_password' } });
    fireEvent.click(screen.getByText(/Sign In/i));

    // Check if navigation occurred
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/homepage'));
  });
});

describe('AuthModal Component - Google Sign-In', () => {
  const setAlert = jest.fn();
  const navigate = jest.fn();

  beforeEach(() => {
    useRoleState.mockReturnValue({ setAlert });
    useNavigate.mockReturnValue(navigate);
    setAlert.mockClear();
    navigate.mockClear();
  });

  test('calls signInWithPopup with GoogleAuthProvider and shows success message', async () => {
    const mockUser = { email: 'testuser@example.com' };
    signInWithPopup.mockResolvedValueOnce({ user: mockUser });

    render(<AuthModal />);

    fireEvent.click(screen.getByRole('button', { name: /google sign-in/i }));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledWith(expect.any(Object), expect.any(GoogleAuthProvider));
      expect(setAlert).toHaveBeenCalledWith({
        open: true,
        message: `Sign up successful! Welcome ${mockUser.email}`,
        type: 'success',
      });
      expect(navigate).toHaveBeenCalledWith('/homepage');
    });
  });

  test('shows error message when Google Sign-In fails', async () => {
    const mockError = new Error('Google Sign-In failed');
    signInWithPopup.mockRejectedValueOnce(mockError);

    render(<AuthModal />);

    fireEvent.click(screen.getByRole('button', { name: /google sign-in/i }));

    await waitFor(() => {
      expect(setAlert).toHaveBeenCalledWith({
        open: true,
        message: mockError.message,
        type: 'error',
      });
      expect(navigate).not.toHaveBeenCalled();
    });
  });
});
