// Helper function to find overlapping time slots
// This function has been removed to avoid duplicate declaration

// Helper function to calculate face preference match
function calculateFacePreferenceMatch(selectedFaces1 = [], selectedFaces2 = []) {
  if (!Array.isArray(selectedFaces1) || !Array.isArray(selectedFaces2)) return 0;
  if (selectedFaces1.length === 0 || selectedFaces2.length === 0) return 0;
  
  const commonFaces = selectedFaces1.filter(face => selectedFaces2.includes(face));
  return commonFaces.length / Math.max(selectedFaces1.length, selectedFaces2.length);
}

// Helper function to calculate activity preference match
function calculateActivityMatch(activities1 = [], activities2 = []) {
  if (!Array.isArray(activities1) || !Array.isArray(activities2)) return 0;
  if (activities1.length === 0 || activities2.length === 0) return 0;
  
  const commonActivities = activities1.filter(activity => activities2.includes(activity));
  return commonActivities.length / Math.max(activities1.length, activities2.length);
}

/**
 * Find overlapping time slots between two users' availability
 * @param {Object} user1Availability - First user's availability object
 * @param {Object} user2Availability - Second user's availability object
 * @returns {Array} Array of overlapping time slots with day and slot information
 */
export function findOverlappingTimeSlots(user1Availability, user2Availability) {
  if (!user1Availability || !user2Availability) {
    return [];
  }

  const overlappingSlots = [];
  
  // Days of the week (support both lowercase and uppercase)
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const daysUpperCase = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Time slots (support both lowercase and uppercase)
  const timeSlots = ['morning', 'afternoon', 'evening'];
  const timeSlotsUpperCase = ['Morning', 'Afternoon', 'Evening'];
  
  // Check each day and time slot for overlap
  days.forEach((day, index) => {
    // Try both lowercase and uppercase versions
    const user1Slots = user1Availability[day] || user1Availability[daysUpperCase[index]] || [];
    const user2Slots = user2Availability[day] || user2Availability[daysUpperCase[index]] || [];
    
    timeSlots.forEach((slot, slotIndex) => {
      // Try both lowercase and uppercase versions
      const slotUpperCase = timeSlotsUpperCase[slotIndex];
      if ((user1Slots.includes(slot) || user1Slots.includes(slotUpperCase)) && 
          (user2Slots.includes(slot) || user2Slots.includes(slotUpperCase))) {
        overlappingSlots.push({ day, slot });
      }
    });
  });
  
  return overlappingSlots;
}

// Main matching function
export function findMatches(user, allUsers) {
  if (!user || !Array.isArray(allUsers)) return [];
  
  const matches = allUsers
    .filter(otherUser => otherUser.id !== user.id)
    .map(otherUser => {
      // Find overlapping time slots
      const overlappingSlots = findOverlappingTimeSlots(
        user.availability || {},
        otherUser.availability || {}
      );

      // Calculate preference matches
      const faceMatch = calculateFacePreferenceMatch(
        user.selectedFaces,
        otherUser.selectedFaces
      );

      const activityMatch = calculateActivityMatch(
        user.activities,
        otherUser.activities
      );

      // Calculate overall match score
      const matchScore = (
        (faceMatch * 0.4) + // 40% weight on face preference
        (activityMatch * 0.3) + // 30% weight on activity preference
        (Math.min(overlappingSlots.length / 5, 1) * 0.3) // 30% weight on availability overlap, normalized
      );

      return {
        user: otherUser,
        matchScore,
        overlappingSlots,
        faceMatch,
        activityMatch
      };
    })
    .filter(match => match.matchScore > 0.5) // Only keep matches with >50% compatibility
    .sort((a, b) => b.matchScore - a.matchScore); // Sort by match score

  return matches;
}

// Function to select the best match
export function selectBestMatch(matches) {
  if (!Array.isArray(matches) || matches.length === 0) return null;

  // Get the highest scoring match
  const bestMatch = matches[0];

  // Select a random overlapping time slot
  const selectedSlot = bestMatch.overlappingSlots[
    Math.floor(Math.random() * bestMatch.overlappingSlots.length)
  ];

  return {
    match: bestMatch.user,
    timeSlot: selectedSlot,
    matchScore: bestMatch.matchScore
  };
} 