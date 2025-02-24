import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from '../Signup';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRoleState } from '../../../PatientContext';
import { auth } from '../../../firebase';
import React from 'react';

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
      createUserWithEmailAndPassword: jest.fn(),
    })),
    createUserWithEmailAndPassword: jest.fn(),
    GoogleAuthProvider: jest.fn(),
    signInWithPopup: jest.fn(),
}));

jest.mock('../../../PatientContext', () => ({
    useRoleState: jest.fn(),
}));

describe('Signup Component', () => {
    const setAlert = jest.fn();
    const handleClose = jest.fn();
  
    beforeEach(() => {
      useRoleState.mockReturnValue({ setAlert });
      setAlert.mockClear();
      handleClose.mockClear();
    });
  
    test('calls Firebase createUserWithEmailAndPassword on successful signup', async () => {
      createUserWithEmailAndPassword.mockResolvedValue({
        user: { email: 'test@example.com' },
      });
  
      render(<Signup handleClose={handleClose} />);
  
      fireEvent.change(screen.getByLabelText(/enter email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/enter password/i), {
        target: { value: 'password1' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password1' },
      });
  
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
  
      await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          auth,
          'test@example.com',
          'password1'
        );
        expect(setAlert).toHaveBeenCalledWith({
          open: true,
          message: 'Sign up successful! Welcome test@example.com',
          type: 'success',
        });
        expect(handleClose).toHaveBeenCalled();
      });
    });
  
    test('shows error on Firebase signup failure', async () => {
      createUserWithEmailAndPassword.mockRejectedValue(
        new Error('Sign up failed')
      );
  
      render(<Signup handleClose={handleClose} />);
  
      fireEvent.change(screen.getByLabelText(/enter email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/enter password/i), {
        target: { value: 'password1' },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password1' },
      });
  
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
  
      await waitFor(() => {
        expect(setAlert).toHaveBeenCalledWith({
          open: true,
          message: 'Sign up failed',
          type: 'error',
        });
        expect(handleClose).not.toHaveBeenCalled();
      });
    });
});
