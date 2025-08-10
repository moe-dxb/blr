
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BookingRequests } from './BookingRequests';
import { useFirestoreSubscription } from '@/hooks/useFirestoreSubscription';
import { updateDoc } from 'firebase/firestore';

// Mock the custom hook
vi.mock('@/hooks/useFirestoreSubscription');

// Mock the firestore update function
vi.mock('firebase/firestore', async () => {
    const actual = await vi.importActual('firebase/firestore');
    return {
        ...actual,
        updateDoc: vi.fn(),
        doc: vi.fn(),
    };
});

const mockRequests = [
    { id: '1', requesterName: 'Alice', requesterEmail: 'alice@example.com', vehicleId: 'v1', date: { toDate: () => new Date('2024-08-01') }, timeSlot: '09:00-11:00', status: 'pending' },
    { id: '2', requesterName: 'Bob', requesterEmail: 'bob@example.com', vehicleId: 'v2', date: { toDate: () => new Date('2024-08-02') }, timeSlot: '14:00-16:00', status: 'pending' },
];

describe('BookingRequests', () => {
    it('shows a loading state initially', () => {
        (useFirestoreSubscription as jest.Mock).mockReturnValue({ data: null, loading: true, error: null });
        render(<BookingRequests />);
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('shows an empty state when there are no requests', () => {
        (useFirestoreSubscription as jest.Mock).mockReturnValue({ data: [], loading: false, error: null });
        render(<BookingRequests />);
        expect(screen.getByText('There are no pending requests.')).toBeInTheDocument();
    });

    it('renders the list of pending requests', () => {
        (useFirestoreSubscription as jest.Mock).mockReturnValue({ data: mockRequests, loading: false, error: null });
        render(<BookingRequests />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('calls the approve handler when the approve button is clicked', async () => {
        (useFirestoreSubscription as jest.Mock).mockReturnValue({ data: mockRequests, loading: false, error: null });
        render(<BookingRequests />);
        
        const approveButton = screen.getAllByRole('button', { name: /Approve/i })[0];
        fireEvent.click(approveButton);

        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalled();
        });
    });
    
    it('calls the reject handler when the reject button is clicked', async () => {
        (useFirestoreSubscription as jest.Mock).mockReturnValue({ data: mockRequests, loading: false, error: null });
        render(<BookingRequests />);
        
        const rejectButton = screen.getAllByRole('button', { name: /Reject/i })[0];
        fireEvent.click(rejectButton);

        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalled();
        });
    });
});
