package com.peakfit.controller;

import com.peakfit.dto.request.LoginRequest;
import com.peakfit.dto.request.RegisterRequest;
import com.peakfit.repository.UserRepository;
import com.peakfit.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req, HttpServletResponse response) {
        try {
            String token = authService.register(req);
            setTokenCookie(response, token);
            return ResponseEntity.ok(Map.of("message", "Registered successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpServletResponse response) {
        try {
            String token = authService.login(req);
            setTokenCookie(response, token);

            return ResponseEntity.ok(Map.of(
                    "message", "Logged in successfully",
                    "token", token
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("peakfit_token", "");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        Long userId = (Long) authentication.getPrincipal();
        return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(Map.<String, Object>of(
                        "id", user.getId(),
                        "fullName", user.getFullName(),
                        "email", user.getEmail(),
                        "goal", user.getGoal() != null ? user.getGoal() : "",
                        "weight", user.getWeight() != null ? user.getWeight() : 0.0,
                        "targetWeight", user.getTargetWeight() != null ? user.getTargetWeight() : 0.0,
                        "height", user.getHeight() != null ? user.getHeight() : 0.0,
                        "age", user.getAge() != null ? user.getAge() : 0,
                        "fitnessLevel", user.getFitnessLevel() != null ? user.getFitnessLevel() : ""
                )))
                .orElse(ResponseEntity.status(404).build());
    }

    // ✅ FINAL FIX (SameSite handled explicitly)
    private void setTokenCookie(HttpServletResponse response, String token) {
        String cookie = "peakfit_token=" + token +
                "; Path=/" +
                "; HttpOnly" +
                "; Max-Age=" + (24 * 60 * 60) +
                "; SameSite=Lax";

        response.setHeader("Set-Cookie", cookie);
    }
}