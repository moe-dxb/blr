
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: {
            displayName: 'Test User',
            email: 'test@example.com',
        },
        role: 'Employee'
    })
}));
