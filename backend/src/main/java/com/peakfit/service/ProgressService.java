package com.peakfit.service;

import com.peakfit.entity.WorkoutSession;
import com.peakfit.repository.WorkoutSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final WorkoutSessionRepository sessionRepository;

    // FIX: map UI filter names to actual saved session types
    // "strength" filter matches: strength, gym, home (weight-based training)
    // "cardio"   filter matches: cardio, outdoor, running
    private static final Set<String> STRENGTH_TYPES =
            Set.of("strength", "gym", "home", "muscle-gain", "weight-loss");
    private static final Set<String> CARDIO_TYPES =
            Set.of("cardio", "outdoor", "running", "endurance");

    public List<Integer> getWeeklyProgress(Long userId, String type) {

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd   = today.with(DayOfWeek.SUNDAY);

        List<WorkoutSession> sessions =
                sessionRepository.findByUser_IdAndSessionDateBetween(userId, weekStart, weekEnd);

        List<Integer> weeklyData = new ArrayList<>();

        for (int i = 0; i < 7; i++) {
            LocalDate currentDay = weekStart.plusDays(i);

            int total = sessions.stream()
                    .filter(s -> currentDay.equals(s.getSessionDate()))
                    .filter(s -> matchesType(s.getType(), type))
                    .mapToInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 0)
                    .sum();

            // Normalize: cap at 100 for the bar chart height
            weeklyData.add(Math.min(total, 100));
        }

        return weeklyData;
    }

    private boolean matchesType(String sessionType, String filterType) {
        // No filter → include everything
        if (filterType == null || filterType.isBlank()) return true;

        String t = sessionType != null ? sessionType.toLowerCase() : "";
        String f = filterType.toLowerCase();

        if (f.equals("strength")) return STRENGTH_TYPES.contains(t) || t.isEmpty();
        if (f.equals("cardio"))   return CARDIO_TYPES.contains(t);

        // Exact match fallback
        return f.equalsIgnoreCase(t);
    }
}
