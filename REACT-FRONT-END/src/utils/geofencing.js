import * as turf from '@turf/turf';

/**
 * Barangay San Vicente boundary coordinates
 * Polygon coordinates in [longitude, latitude] format
 */
export const BARANGAY_BOUNDARY = [
  [120.7470, 14.9390],
  [120.7500, 14.9375],
  [120.7535, 14.9378],
  [120.7565, 14.9388],
  [120.7595, 14.9402],
  [120.7620, 14.9422],
  [120.7632, 14.9448],
  [120.7628, 14.9478],
  [120.7618, 14.9508],
  [120.7602, 14.9535],
  [120.7580, 14.9552],
  [120.7555, 14.9560],
  [120.7528, 14.9558],
  [120.7500, 14.9550],
  [120.7476, 14.9535],
  [120.7458, 14.9515],
  [120.7448, 14.9488],
  [120.7445, 14.9458],
  [120.7450, 14.9428],
  [120.7458, 14.9408],
  [120.7470, 14.9390], // Close the polygon
];

/**
 * Barangay center point
 */
export const BARANGAY_CENTER = [120.7548, 14.9467];

/**
 * Barangay bounds for map constraints
 */
export const BARANGAY_BOUNDS = {
  sw: [120.747, 14.938],
  ne: [120.763, 14.956],
};

/**
 * Check if a point is inside the barangay boundary
 * 
 * @param {Array} point - [longitude, latitude]
 * @returns {boolean} - True if point is inside boundary
 */
export function isPointInBoundary(point) {
  try {
    const turfPoint = turf.point(point);
    const turfPolygon = turf.polygon([BARANGAY_BOUNDARY]);
    return turf.booleanPointInPolygon(turfPoint, turfPolygon);
  } catch (error) {
    console.error('Error checking point in boundary:', error);
    return false;
  }
}

/**
 * Calculate distance from a point to the barangay boundary
 * 
 * @param {Array} point - [longitude, latitude]
 * @returns {number} - Distance in meters (negative if inside, positive if outside)
 */
export function distanceToBoundary(point) {
  try {
    const turfPoint = turf.point(point);
    const turfPolygon = turf.polygon([BARANGAY_BOUNDARY]);
    
    // If point is inside, return negative distance to nearest edge
    if (turf.booleanPointInPolygon(turfPoint, turfPolygon)) {
      const line = turf.polygonToLine(turfPolygon);
      const distance = turf.pointToLineDistance(turfPoint, line, { units: 'meters' });
      return -distance;
    }
    
    // If point is outside, return positive distance to nearest edge
    const line = turf.polygonToLine(turfPolygon);
    return turf.pointToLineDistance(turfPoint, line, { units: 'meters' });
  } catch (error) {
    console.error('Error calculating distance to boundary:', error);
    return 0;
  }
}

/**
 * Get the nearest point on the boundary from a given point
 * 
 * @param {Array} point - [longitude, latitude]
 * @returns {Array} - [longitude, latitude] of nearest boundary point
 */
export function getNearestBoundaryPoint(point) {
  try {
    const turfPoint = turf.point(point);
    const turfPolygon = turf.polygon([BARANGAY_BOUNDARY]);
    const line = turf.polygonToLine(turfPolygon);
    const nearest = turf.nearestPointOnLine(line, turfPoint);
    return nearest.geometry.coordinates;
  } catch (error) {
    console.error('Error finding nearest boundary point:', error);
    return BARANGAY_CENTER;
  }
}

/**
 * Check if a ticket location is valid (inside barangay)
 * 
 * @param {Object} ticket - Ticket object with latitude and longitude
 * @returns {boolean} - True if ticket location is valid
 */
export function isValidTicketLocation(ticket) {
  if (!ticket.latitude || !ticket.longitude) {
    return false;
  }
  
  const point = [Number(ticket.longitude), Number(ticket.latitude)];
  return isPointInBoundary(point);
}

/**
 * Filter tickets by boundary
 * 
 * @param {Array} tickets - Array of ticket objects
 * @param {boolean} insideOnly - If true, return only tickets inside boundary
 * @returns {Array} - Filtered tickets
 */
export function filterTicketsByBoundary(tickets, insideOnly = true) {
  return tickets.filter(ticket => {
    const isValid = isValidTicketLocation(ticket);
    return insideOnly ? isValid : !isValid;
  });
}

/**
 * Get boundary statistics for tickets
 * 
 * @param {Array} tickets - Array of ticket objects
 * @returns {Object} - { inside: number, outside: number, invalid: number }
 */
export function getBoundaryStats(tickets) {
  const stats = {
    inside: 0,
    outside: 0,
    invalid: 0,
  };
  
  tickets.forEach(ticket => {
    if (!ticket.latitude || !ticket.longitude) {
      stats.invalid++;
      return;
    }
    
    const point = [Number(ticket.longitude), Number(ticket.latitude)];
    if (isPointInBoundary(point)) {
      stats.inside++;
    } else {
      stats.outside++;
    }
  });
  
  return stats;
}

/**
 * Calculate the area of the barangay in square kilometers
 * 
 * @returns {number} - Area in square kilometers
 */
export function getBarangayArea() {
  try {
    const turfPolygon = turf.polygon([BARANGAY_BOUNDARY]);
    const area = turf.area(turfPolygon);
    return area / 1000000; // Convert to square kilometers
  } catch (error) {
    console.error('Error calculating barangay area:', error);
    return 0;
  }
}

/**
 * Get the center point of the barangay (calculated from boundary)
 * 
 * @returns {Array} - [longitude, latitude]
 */
export function getBarangayCenter() {
  try {
    const turfPolygon = turf.polygon([BARANGAY_BOUNDARY]);
    const center = turf.center(turfPolygon);
    return center.geometry.coordinates;
  } catch (error) {
    console.error('Error calculating barangay center:', error);
    return BARANGAY_CENTER;
  }
}

/**
 * Validate if coordinates are within reasonable bounds for the Philippines
 * 
 * @param {number} longitude - Longitude value
 * @param {number} latitude - Latitude value
 * @returns {boolean} - True if coordinates are valid
 */
export function isValidPhilippinesCoordinates(longitude, latitude) {
  // Philippines bounds: roughly 116°E to 127°E, 4°N to 21°N
  return (
    longitude >= 116 &&
    longitude <= 127 &&
    latitude >= 4 &&
    latitude <= 21
  );
}

/**
 * Snap a point to the nearest valid location inside the boundary
 * Useful for correcting slightly out-of-bounds coordinates
 * 
 * @param {Array} point - [longitude, latitude]
 * @param {number} maxDistance - Maximum distance in meters to snap (default: 100m)
 * @returns {Array} - [longitude, latitude] of snapped point, or original if too far
 */
export function snapToBoundary(point, maxDistance = 100) {
  try {
    const distance = distanceToBoundary(point);
    
    // If already inside, return original point
    if (distance < 0) {
      return point;
    }
    
    // If too far outside, return original point (don't snap)
    if (distance > maxDistance) {
      return point;
    }
    
    // Snap to nearest boundary point
    return getNearestBoundaryPoint(point);
  } catch (error) {
    console.error('Error snapping to boundary:', error);
    return point;
  }
}
