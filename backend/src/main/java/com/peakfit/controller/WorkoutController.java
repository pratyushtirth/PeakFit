package com.peakfit.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.peakfit.dto.request.GenerateWorkoutRequest;
import com.peakfit.entity.WorkoutSession;
import com.peakfit.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workout")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;
    private final ObjectMapper objectMapper;

    @PostMapping("/generate")
    public ResponseEntity<?> generateWorkout(@RequestBody GenerateWorkoutRequest req, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        try {
            String planJson = workoutService.generatePlan(userId, req);
            JsonNode plan = parseAndRepairJson(planJson);

            if (plan == null) {
                return ResponseEntity.internalServerError()
                        .body(Map.of("error", "The AI returned malformed JSON. Please click Generate again."));
            }

            // Validate: every day must have at least 1 exercise
            JsonNode days = plan.get("days");
            if (days == null || !days.isArray() || days.size() == 0) {
                return ResponseEntity.internalServerError()
                        .body(Map.of("error", "Generated plan has no days. Please click Generate again."));
            }
            for (int di = 0; di < days.size(); di++) {
                JsonNode dayExercises = days.get(di).get("exercises");
                if (dayExercises == null || !dayExercises.isArray() || dayExercises.size() == 0) {
                    return ResponseEntity.internalServerError()
                            .body(Map.of("error",
                                "Day " + (di + 1) + " has 0 exercises. Please click Generate again."));
                }
            }

            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to generate workout plan. Please try again."));
        }
    }

    /**
     * Multi-strategy JSON parser with repair attempts.
     * Handles: markdown fences, leading text, truncated JSON, literal \n in strings.
     */
    private JsonNode parseAndRepairJson(String raw) {
        if (raw == null || raw.isBlank()) return null;

        // Strategy 1: strip markdown fences and try directly
        String s = raw.trim();
        if (s.startsWith("```")) {
            s = s.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
        }
        try { return objectMapper.readTree(s); } catch (Exception ignored) {}

        // Strategy 2: extract the JSON object from the response (model may prepend text)
        int start = s.indexOf('{');
        int end   = s.lastIndexOf('}');
        if (start >= 0 && end > start) {
            try { return objectMapper.readTree(s.substring(start, end + 1)); } catch (Exception ignored) {}
        }

        // Strategy 3: replace literal \n sequences inside the string that break JSON
        String repaired = s.replace("\\n", " ").replace("\n", " ");
        if (repaired.contains("{")) {
            int rs = repaired.indexOf('{');
            int re = repaired.lastIndexOf('}');
            if (rs >= 0 && re > rs) {
                try { return objectMapper.readTree(repaired.substring(rs, re + 1)); } catch (Exception ignored) {}
            }
        }

        return null; // all strategies exhausted
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        List<WorkoutSession> sessions = workoutService.getHistory(userId);
        List<Map<String, Object>> result = sessions.stream().map(s -> {
            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("id", s.getId());
            map.put("type", s.getType() != null ? s.getType() : "");
            map.put("date", s.getSessionDate() != null ? s.getSessionDate().toString() : "");
            map.put("durationMinutes", s.getDurationMinutes() != null ? s.getDurationMinutes() : 0);
            map.put("calories", s.getCalories() != null ? s.getCalories() : 0);
            map.put("notes", s.getNotes() != null ? s.getNotes() : "");
            map.put("exercises", s.getExercises() != null ? s.getExercises().stream().map(e -> {
                Map<String, Object> ex = new java.util.LinkedHashMap<>();
                ex.put("name", e.getName());
                ex.put("sets", e.getSets());
                ex.put("reps", e.getReps());
                ex.put("weight", e.getWeight());
                return ex;
            }).collect(Collectors.toList()) : List.of());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
