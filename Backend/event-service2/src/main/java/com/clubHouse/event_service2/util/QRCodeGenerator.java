package com.clubHouse.event_service2.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

public class QRCodeGenerator {
    
    private static final String ALGORITHM = "HmacSHA256";
    
    /**
     * Generate a random secret key for an event
     */
    public static String generateSecretKey() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
    
    /**
     * Generate time-based QR token
     */
    public static String generateQRToken(Long eventId, String secretKey, int intervalSeconds) {
        try {
            long timestamp = System.currentTimeMillis() / 1000;
            long timeSlot = timestamp / intervalSeconds;
            
            String data = eventId + ":" + timeSlot;
            
            Mac mac = Mac.getInstance(ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(), ALGORITHM);
            mac.init(keySpec);
            
            byte[] hash = mac.doFinal(data.getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
            
        } catch (Exception e) {
            throw new RuntimeException("Error generating QR token", e);
        }
    }
    
    /**
     * Validate QR token (checks current and previous time slot)
     */
    public static boolean validateQRToken(Long eventId, String secretKey, 
                                         String providedToken, int intervalSeconds) {
        long timestamp = System.currentTimeMillis() / 1000;
        long currentTimeSlot = timestamp / intervalSeconds;
        
        // Check current time slot
        String currentToken = generateQRTokenForTimeSlot(eventId, secretKey, currentTimeSlot, intervalSeconds);
        if (currentToken.equals(providedToken)) {
            return true;
        }
        
        // Check previous time slot (grace period)
        String previousToken = generateQRTokenForTimeSlot(eventId, secretKey, currentTimeSlot - 1, intervalSeconds);
        return previousToken.equals(providedToken);
    }
    
    private static String generateQRTokenForTimeSlot(Long eventId, String secretKey, 
                                                     long timeSlot, int intervalSeconds) {
        try {
            String data = eventId + ":" + timeSlot;
            
            Mac mac = Mac.getInstance(ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(), ALGORITHM);
            mac.init(keySpec);
            
            byte[] hash = mac.doFinal(data.getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
            
        } catch (Exception e) {
            throw new RuntimeException("Error generating QR token", e);
        }
    }
}