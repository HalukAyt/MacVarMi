import { Match, User, Venue, Position, JoinRequest } from './types';

export const users: User[] = [
  { id: 1, name: 'Sen (Owner)', rating: 4.7, positions: ['DEF','MID'] },
  { id: 2, name: 'Ali', rating: 4.5, positions: ['GK'] },
  { id: 3, name: 'Ayşe', rating: 4.8, positions: ['DEF','MID'] },
];

export const venues: Venue[] = [
  { id: 1, name: 'Kozyatağı Halı Saha', address: 'Kadıköy' },
  { id: 2, name: 'Siyami Ersek Halı Saha', address: 'Acıbadem' },
];

const now = new Date();
const startPast = new Date(now.getTime() - 60 * 60 * 1000); // 1 saat önce
const start1 = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 saat sonra

export const matchesSeed: Match[] = [
  {
    id: 101,
    ownerId: 1,
    venueId: 1,
    startTime: start1.toISOString(),
    levelMin: 2,
    levelMax: 4,
    feePerPlayer: 150,
    status: 'OPEN',
    positionsNeeded: { GK: 1, DEF: 1 },
    roster: [
      { userId: 1, position: 'MID', joinedAt: new Date().toISOString() },
      { userId: 3, position: 'FWD', joinedAt: new Date().toISOString() },
    ],
  },
];

export const initialRequests: JoinRequest[] = [
  // örnek boş; runtime'da eklenecek

  ,
  {
    id: 102,
    ownerId: 1,
    venueId: 2,
    startTime: startPast.toISOString(),
    levelMin: 2,
    levelMax: 4,
    feePerPlayer: 120,
    status: 'OPEN',
    positionsNeeded: { DEF: 1 },
    roster: [
      { userId: 1, position: 'MID', joinedAt: new Date().toISOString() },
      { userId: 2, position: 'GK', joinedAt: new Date().toISOString() }
    ],
  }
];

export const CURRENT_USER_ID = 2; // şimdilik Ali olarak giriş yapalım (GK)
