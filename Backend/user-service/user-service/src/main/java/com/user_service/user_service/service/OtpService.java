package com.user_service.user_service.service;

import com.user_service.user_service.model.User;
import com.user_service.user_service.repository.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;

    public OtpService(UserRepository userRepository,
                      JavaMailSender mailSender,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    // Generate OTP, save on user and email it
    public void generateAndSendOtpForEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User with email not found"));
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        userRepository.save(user);
        sendOtpEmail(email, otp, OTP_EXPIRY_MINUTES);
    }

    // Generate OTP for a non-existing user (registration flow) - user passed in saved state
    public void generateAndSendOtpForUser(User user) {
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        userRepository.save(user);
        sendOtpEmail(user.getEmail(), otp, OTP_EXPIRY_MINUTES);
    }

    private String generateOtp() {
        int number = random.nextInt(900000) + 100000; // ensures 6 digits
        return String.valueOf(number);
    }

    private void sendOtpEmail(String toEmail, String otp, int validityMinutes) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(toEmail);
        msg.setSubject("Your verification OTP");
        msg.setText("Your OTP is: " + otp + "\nThis OTP is valid for " + validityMinutes + " minutes.");
        mailSender.send(msg);
    }

    // verify OTP (used for email verification)
    public boolean verifyOtpForEmail(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getOtp() == null) return false;
        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return false;
        }
        if (!user.getOtp().equals(otp)) return false;

        // success: mark verified and clear otp
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        return true;
    }

    // verify OTP and reset password (password passed raw)
    public boolean verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getOtp() == null) return false;
        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return false;
        }
        if (!user.getOtp().equals(otp)) return false;

        // success -> encode new password, clear otp
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        return true;
    }
}
