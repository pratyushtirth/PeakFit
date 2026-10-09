package com.peakfit.controller;

import com.peakfit.dto.request.LogSessionRequest;
import com.peakfit.entity.WorkoutSession;
import com.peakfit.service.WorkoutSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class WorkoutSessionController {

    private final WorkoutSessionService service;

    @PostMapping
    public ResponseEntity<WorkoutSession> createSession(
            @RequestBody LogSessionRequest request,
            Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(service.createSession(userId, request));
    }

    @GetMapping("/today")
    public ResponseEntity<WorkoutSession> getToday(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(service.getOrCreateTodaySession(userId));
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<WorkoutSession>> getWeekly(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(service.getWeeklySessions(userId));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<WorkoutSession> complete(@PathVariable Long id) {
        return ResponseEntity.ok(service.markCompleted(id));
    }

    // DELETE /api/sessions/all — wipes all workout data for the authenticated user
    @DeleteMapping("/all")
    public ResponseEntity<?> deleteAll(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        service.deleteAllUserSessions(userId);
        return ResponseEntity.ok(Map.of("message", "All workout data deleted successfully"));
    }
}
