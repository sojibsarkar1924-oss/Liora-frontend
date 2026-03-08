// ✅ tasksController.js এর সাথে সম্পূর্ণ মিল
// Bronze:   limit=4,  perTask=12  → daily=48
// Silver:   limit=6,  perTask=18  → daily=108
// Gold:     limit=8,  perTask=28  → daily=224
// Platinum: limit=10, perTask=46  → daily=460
// Diamond:  limit=12, perTask=80  → daily=960

export const PACKAGES = [
  {
    id: 'bronze',
    name: 'Bronze',
    price: 1350,
    dailyIncome: 48,
    taskCount: 4,
    perTask: 12,
    color: '#CD7F32',
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 2700,
    dailyIncome: 108,
    taskCount: 6,
    perTask: 18,
    color: '#C0C0C0',
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 5400,
    dailyIncome: 224,
    taskCount: 8,
    perTask: 28,
    color: '#FFD700',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 10800,
    dailyIncome: 460,
    taskCount: 10,
    perTask: 46,
    color: '#E5E4E2',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    price: 21600,
    dailyIncome: 960,
    taskCount: 12,
    perTask: 80,
    color: '#B9F2FF',
  },
];