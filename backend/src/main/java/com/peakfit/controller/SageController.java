package com.peakfit.controller;

import com.peakfit.dto.request.GenerateWorkoutRequest;
import com.peakfit.dto.request.SageChatRequest;
import com.peakfit.repository.UserRepository;
import com.peakfit.service.OpenRouterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sage")
@RequiredArgsConstructor
public class SageController {

    private final OpenRouterService openRouterService;
    private final UserRepository userRepository;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody SageChatRequest req, Authentication auth) {
        try {
            String history = req.getConversationHistory() != null ? req.getConversationHistory() : "";
            String reply = openRouterService.chatWithSage(req.getMessage(), history);
            return ResponseEntity.ok(Map.of("reply", reply));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Sage is unavailable: " + e.getMessage()));
        }
    }

    @PostMapping("/adjust-plan")
    public ResponseEntity<?> adjustPlan(@RequestBody SageChatRequest req, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        try {
            var user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            GenerateWorkoutRequest planReq = new GenerateWorkoutRequest();
            planReq.setInjuredMuscles(req.getInjuredMuscles());
            planReq.setInjurySeverity(req.getInjurySeverity());
            planReq.setPrimaryGoal(user.getGoal());
            planReq.setFitnessLevel(user.getFitnessLevel());
            planReq.setWeight(user.getWeight() != null ? String.valueOf(user.getWeight()) : "75");
            planReq.setHeight(user.getHeight() != null ? String.valueOf(user.getHeight()) : "175");
            planReq.setAge(user.getAge() != null ? String.valueOf(user.getAge()) : "25");

            String planJson = openRouterService.generateInjuryAdjustedPlan(planReq);
            return ResponseEntity.ok(Map.of("plan", planJson));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Could not generate adjusted plan: " + e.getMessage()));
        }
    }
}
