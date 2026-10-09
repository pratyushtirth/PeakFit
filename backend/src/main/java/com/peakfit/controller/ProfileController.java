package com.peakfit.controller;

import com.peakfit.dto.request.UpdateProfileRequest;
import com.peakfit.entity.User;
import com.peakfit.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getProfile(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        User user = userService.getUser(userId);

        // FIX 1: use "fullName" not "name" — matches UpdateProfileRequest + frontend
        // FIX 2: return proper numeric types, not Strings
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", user.getId());
        response.put("fullName", user.getFullName() != null ? user.getFullName() : "");
        response.put("email", user.getEmail() != null ? user.getEmail() : "");
        response.put("age", user.getAge() != null ? user.getAge() : 0);
        response.put("height", user.getHeight() != null ? user.getHeight() : 0.0);
        response.put("weight", user.getWeight() != null ? user.getWeight() : 0.0);
        response.put("targetWeight", user.getTargetWeight() != null ? user.getTargetWeight() : 0.0);
        response.put("goal", user.getGoal() != null ? user.getGoal() : "");
        response.put("fitnessLevel", user.getFitnessLevel() != null ? user.getFitnessLevel() : "");
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestBody UpdateProfileRequest req,
            Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        try {
            userService.updateProfile(userId, req);
            // Return updated user so frontend can reflect changes immediately
            User updated = userService.getUser(userId);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id", updated.getId());
            response.put("fullName", updated.getFullName() != null ? updated.getFullName() : "");
            response.put("email", updated.getEmail() != null ? updated.getEmail() : "");
            response.put("age", updated.getAge() != null ? updated.getAge() : 0);
            response.put("height", updated.getHeight() != null ? updated.getHeight() : 0.0);
            response.put("weight", updated.getWeight() != null ? updated.getWeight() : 0.0);
            response.put("targetWeight", updated.getTargetWeight() != null ? updated.getTargetWeight() : 0.0);
            response.put("goal", updated.getGoal() != null ? updated.getGoal() : "");
            response.put("fitnessLevel", updated.getFitnessLevel() != null ? updated.getFitnessLevel() : "");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
