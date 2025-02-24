import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientPage from '../PatientPage';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useRoleState } from '../../PatientContext';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    onAuthStateChanged: jest.fn((callback) => {
      callback({ uid: 'test-user-id', email: 'test@example.com' }); 
      return jest.fn(); 
    }),
  })),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => ({
    ref: jest.fn(),
  })),
  ref: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn(),
}));

jest.mock('../../PatientContext', () => ({
  useRoleState: jest.fn(() => ({
    patientlist: [
      { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      { firstName: 'Jane', lastName: 'C', email: 'jane@example.com' },
    ],
    setAlert: jest.fn(),
  })),
}));

describe('PatientPage', () => {
  beforeEach(() => {
    // Mock the onValue to simulate data fetch
    useParams.mockReturnValue({ id: 'test-id' });

    onValue.mockImplementation((ref, callback) => {
      callback({
        val: () => ({
          'user1': { userType: 'PATIENT', firstName: 'John', lastName: 'Doe', userID: 'user1' },
          // Add more mock data as needed
        }),
      });
    });
  });

  test('renders patient list when no patient is selected', async () => {
    render(<PatientPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Search Patients/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Patients List')).toBeInTheDocument();
  });


  test('fetches and displays patients', async () => {
    render(<PatientPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Search Patients/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Search Patients/i), { target: { value: 'John' } });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
  });

  test('handles patient click and shows exercises', async () => {
    render(<PatientPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Search Patients/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Search Patients/i), { target: { value: 'John' } });
    fireEvent.click(screen.getByText('John Doe'));

  });
});