import User from '../models/User.js';

export async function generateMembershipId() {
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  // Get the last created user for this year
  const lastUser = await User.findOne({ createdAt: { $gte: start, $lt: end } })
                             .sort({ createdAt: -1 });

  let number = 1; // default if no users yet this year
  if (lastUser && lastUser.membershipId) {
    // extract last number from membershipId: SOCRP-2025-00002
    const parts = lastUser.membershipId.split('-');
    number = parseInt(parts[2]) + 1;
  }

  const padded = number.toString().padStart(5, '0');
  return `SOCRP-${year}-${padded}`;
}
