// This module exports a set of in‑memory data objects used throughout
// ShawedGym.  Because the frontend runs without a backend, these lists
// serve as placeholders for members, plans, payments, expenses and other
// records.  In a real application these would be fetched from an API.

export const plans = [
  { id: 1, name: 'Basic', price: 20, duration: 1 },
  { id: 2, name: 'Standard', price: 50, duration: 3 },
  { id: 3, name: 'Premium', price: 90, duration: 6 },
];

export const members = [
  {
    id: 1,
    name: 'Ahmed Ali',
    planId: 2,
    joinDate: '2025-07-01',
    expiryDate: '2025-10-01',
    status: 'active',
    phone: '+252612345678',
    email: 'ahmed@example.com',
    photo: '',
  },
  {
    id: 2,
    name: 'Hodan Mohamed',
    planId: 1,
    joinDate: '2025-08-15',
    expiryDate: '2025-09-15',
    status: 'expiring',
    phone: '+252612349999',
    email: 'hodan@example.com',
    photo: '',
  },
  {
    id: 3,
    name: 'Mahad Farah',
    planId: 3,
    joinDate: '2025-01-20',
    expiryDate: '2025-07-20',
    status: 'expired',
    phone: '+252612348888',
    email: 'mahad@example.com',
    photo: '',
  },
];

export const assets = [
  { id: 1, name: 'Treadmill', category: 'Cardio', purchaseDate: '2024-05-01', condition: 'Good', value: 800 },
  { id: 2, name: 'Dumbbells Set', category: 'Strength', purchaseDate: '2023-11-10', condition: 'Excellent', value: 500 },
  { id: 3, name: 'Exercise Bike', category: 'Cardio', purchaseDate: '2024-02-15', condition: 'Fair', value: 350 },
];

export const classes = [
  { id: 1, title: 'Morning Yoga', trainerId: 1, schedule: 'Mondays 7:00 AM', capacity: 15 },
  { id: 2, title: 'HIIT', trainerId: 2, schedule: 'Wednesdays 5:00 PM', capacity: 10 },
  { id: 3, title: 'Zumba', trainerId: 3, schedule: 'Fridays 6:00 PM', capacity: 20 },
];

export const trainers = [
  { id: 1, name: 'Khadija Abdi', specialty: 'Yoga', phone: '+252612341111', email: 'khadija@example.com' },
  { id: 2, name: 'Mustafa Yusuf', specialty: 'HIIT', phone: '+252612342222', email: 'mustafa@example.com' },
  { id: 3, name: 'Fartun Ahmed', specialty: 'Dance', phone: '+252612343333', email: 'fartun@example.com' },
];

export const attendance = [
  { id: 1, memberId: 1, classId: 1, date: '2025-09-10', status: 'present' },
  { id: 2, memberId: 2, classId: 3, date: '2025-09-10', status: 'absent' },
  { id: 3, memberId: 3, classId: 2, date: '2025-09-08', status: 'present' },
];

export const payments = [
  { id: 1, memberId: 1, planId: 2, date: '2025-07-01', amount: 50, receipt: 'R-001' },
  { id: 2, memberId: 2, planId: 1, date: '2025-08-15', amount: 20, receipt: 'R-002' },
  { id: 3, memberId: 3, planId: 3, date: '2025-01-20', amount: 90, receipt: 'R-003' },
];

export const expenses = [
  { id: 1, category: 'Maintenance', description: 'Treadmill repair', date: '2025-06-12', amount: 120 },
  { id: 2, category: 'Utilities', description: 'Electricity Bill', date: '2025-08-05', amount: 300 },
  { id: 3, category: 'Supplies', description: 'Cleaning supplies', date: '2025-09-01', amount: 50 },
];

// Utility functions to derive metrics for the dashboard and reports.  In a
// real application these would be computed server‑side or via API.
export function countMembers() {
  return members.length;
}

export function totalRevenue() {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

export function totalExpenses() {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function activeMembers() {
  return members.filter((m) => m.status === 'active').length;
}