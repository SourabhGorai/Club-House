package com.clubHouse.event_service2.util;

public class GeoUtils {
    
    private static final double EARTH_RADIUS_KM = 6371.0;
    
    /**
     * Calculate distance between two points using Haversine formula
     * Returns distance in meters
     */
    public static double calculateDistance(double lat1, double lon1, 
                                          double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        double distanceKm = EARTH_RADIUS_KM * c;
        return distanceKm * 1000; // Convert to meters
    }
    
    /**
     * Check if point is within radius
     */
    public static boolean isWithinRadius(double lat1, double lon1, 
                                        double lat2, double lon2, 
                                        int radiusMeters) {
        double distance = calculateDistance(lat1, lon1, lat2, lon2);
        return distance <= radiusMeters;
    }
}