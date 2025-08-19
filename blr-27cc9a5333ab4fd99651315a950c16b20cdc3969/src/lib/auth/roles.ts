export type Role = 'Admin' | 'Manager' | 'Employee' | null;

export const isAdmin = (role: Role) => role === 'Admin';
export const isManager = (role: Role) => role === 'Manager';
export const isEmployee = (role: Role) => role === 'Employee';
export const isAdminOrManager = (role: Role) => role === 'Admin' || role === 'Manager';