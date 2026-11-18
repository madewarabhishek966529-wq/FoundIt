/**
 * Campus Zone Adjacency Graph
 * Used by the matching engine to calculate location similarity
 */
export const CAMPUS_ZONES = [
  'Main Gate',
  'Library',
  'Canteen',
  'Admin Block',
  'CS Dept',
  'Mech Dept',
  'Ground',
  'Hostel A',
  'Hostel B',
  'Parking',
  'Auditorium'
];

export const ZONE_ADJACENCY = {
  'Main Gate': ['Admin Block', 'Parking'],
  'Admin Block': ['Main Gate', 'Library', 'Auditorium', 'Parking'],
  'Library': ['Admin Block', 'CS Dept', 'Mech Dept', 'Canteen'],
  'Canteen': ['Library', 'CS Dept', 'Ground', 'Hostel A', 'Hostel B'],
  'CS Dept': ['Library', 'Canteen', 'Mech Dept'],
  'Mech Dept': ['Library', 'CS Dept', 'Ground'],
  'Ground': ['Mech Dept', 'Canteen', 'Hostel A', 'Hostel B'],
  'Hostel A': ['Hostel B', 'Canteen', 'Ground'],
  'Hostel B': ['Hostel A', 'Canteen', 'Ground'],
  'Parking': ['Main Gate', 'Admin Block', 'Auditorium'],
  'Auditorium': ['Admin Block', 'Parking', 'Library']
};

/**
 * Calculates location score between two campus zones
 * Returns:
 * - 1.0 if identical zone
 * - 0.6 if adjacent zones
 * - 0.2 otherwise
 */
export const calculateLocationScore = (zone1, zone2) => {
  if (!zone1 || !zone2) return 0.2;
  if (zone1.trim().toLowerCase() === zone2.trim().toLowerCase()) {
    return 1.0;
  }

  const adjacent = ZONE_ADJACENCY[zone1] || [];
  if (adjacent.some((z) => z.toLowerCase() === zone2.trim().toLowerCase())) {
    return 0.6;
  }

  return 0.2;
};
