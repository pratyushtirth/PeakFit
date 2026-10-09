package com.peakfit.service;

import com.peakfit.dto.request.GenerateWorkoutRequest;
import com.peakfit.entity.*;
import com.peakfit.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final OpenRouterService openRouterService;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final UserRepository userRepository;

    @Transactional
    public String generatePlan(Long userId, GenerateWorkoutRequest req) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getWeight() == null) req.setWeight(user.getWeight() != null ? String.valueOf(user.getWeight()) : "75");
        if (req.getTargetWeight() == null) req.setTargetWeight(user.getTargetWeight() != null ? String.valueOf(user.getTargetWeight()) : "70");
        if (req.getHeight() == null) req.setHeight(user.getHeight() != null ? String.valueOf(user.getHeight()) : "175");
        if (req.getAge() == null) req.setAge(user.getAge() != null ? String.valueOf(user.getAge()) : "25");
        if (req.getPrimaryGoal() == null) req.setPrimaryGoal(user.getGoal() != null ? user.getGoal() : "muscle-gain");
        if (req.getFitnessLevel() == null) req.setFitnessLevel(user.getFitnessLevel() != null ? user.getFitnessLevel() : "beginner");

        String planJson = openRouterService.generateWorkoutPlan(req);

        WorkoutPlan plan = WorkoutPlan.builder()
                .user(user)
                .planJson(planJson)
                .trainingPreference(req.getTrainingPreference())
                .primaryGoal(req.getPrimaryGoal())
                .build();

        workoutPlanRepository.save(plan);
        return planJson;
    }

    // FIX 4: @Transactional so exercises (LAZY) can be streamed in WorkoutController
    @Transactional(readOnly = true)
    public List<WorkoutSession> getHistory(Long userId) {
        List<WorkoutSession> sessions =
                workoutSessionRepository.findByUser_IdOrderBySessionDateDesc(userId);
        // Initialize lazy exercises within transaction to prevent LazyInitializationException
        sessions.forEach(s -> {
            if (s.getExercises() != null) s.getExercises().size();
        });
        return sessions;
    }
}
