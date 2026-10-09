package com.peakfit.service;

import com.peakfit.dto.response.DashboardStatsResponse;
import com.peakfit.dto.response.DashboardStatsResponse.*;
import com.peakfit.entity.*;
import com.peakfit.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final WorkoutSessionRepository sessionRepository;

    // Fixed: accepts Long userId (matches JWT principal type), not String email
    public DashboardStatsResponse getStats(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = today.with(DayOfWeek.SUNDAY);

        Optional<WorkoutSession> todaySessionOpt =
                sessionRepository.findByUser_IdAndSessionDate(user.getId(), today);

        WorkoutSession todaySession = todaySessionOpt.orElse(null);

        int caloriesToday = (todaySession != null && todaySession.getCalories() != null)
                ? todaySession.getCalories() : 0;

        String todayType = (todaySession == null) ? "Rest Day" : todaySession.getType();

        List<TodayExercise> todayExercises = new ArrayList<>();
        if (todaySession != null && todaySession.getExercises() != null) {
            List<SessionExercise> exs = todaySession.getExercises();
            for (int i = 0; i < exs.size(); i++) {
                SessionExercise ex = exs.get(i);
                todayExercises.add(new TodayExercise(
                        ex.getName(),
                        ex.getSets() != null ? ex.getSets() : 3,
                        ex.getReps() != null ? ex.getReps() : "10",
                        i < exs.size() - 1,
                        i == exs.size() - 1 && exs.size() > 1
                ));
            }
        }

        int streak = calculateStreak(user.getId(), today);

        List<WeeklyPoint> weeklyStrength = buildWeeklyData(user.getId(), weekStart, weekEnd, "strength");
        List<WeeklyPoint> weeklyCardio = buildWeeklyData(user.getId(), weekStart, weekEnd, "cardio");

        Double current = user.getWeight() != null ? user.getWeight() : 0;
        Double target = user.getTargetWeight() != null ? user.getTargetWeight() : current;
        double progressPercent = (current > 0 && target > 0 && !current.equals(target))
                ? Math.min(100, Math.abs((current - target) / current * 100)) : 0;

        return DashboardStatsResponse.builder()
                .userName(user.getFullName() != null ? user.getFullName().split(" ")[0] : "Athlete")
                .currentWeight(current)
                .targetWeight(target)
                .caloriesToday(caloriesToday)
                .streakDays(streak)
                .weightProgressPercent(progressPercent)
                .weeklyStrength(weeklyStrength)
                .weeklyCardio(weeklyCardio)
                .todayExercises(todayExercises)
                .todayWorkoutType(todayType)
                .build();
    }

    private int calculateStreak(Long userId, LocalDate today) {
        int streak = 0;
        LocalDate check = today;
        for (int i = 0; i < 365; i++) {
            Optional<WorkoutSession> session =
                    sessionRepository.findByUser_IdAndSessionDate(userId, check);
            if (session.isEmpty()) break;
            streak++;
            check = check.minusDays(1);
        }
        return streak;
    }

    private List<WeeklyPoint> buildWeeklyData(Long userId, LocalDate start, LocalDate end, String type) {
        String[] days = {"Mon","Tue","Wed","Thu","Fri","Sat","Sun"};
        List<WeeklyPoint> points = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate date = start.plusDays(i);
            Optional<WorkoutSession> sessionOpt =
                    sessionRepository.findByUser_IdAndSessionDate(userId, date);
            int value = sessionOpt.map(s ->
                    s.getDurationMinutes() != null ? s.getDurationMinutes() : 0
            ).orElse(0);
            points.add(new WeeklyPoint(days[i], Math.min(100, value)));
        }
        return points;
    }
}
