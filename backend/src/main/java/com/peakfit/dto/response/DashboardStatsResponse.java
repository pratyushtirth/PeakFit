package com.peakfit.dto.response;
import lombok.*;
import java.util.List;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class DashboardStatsResponse {
    private String userName;
    private Double currentWeight;
    private Double targetWeight;
    private Integer caloriesToday;
    private Integer streakDays;
    private Double weightProgressPercent;
    private List<WeeklyPoint> weeklyStrength;
    private List<WeeklyPoint> weeklyCardio;
    private List<TodayExercise> todayExercises;
    private String todayWorkoutType;

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class WeeklyPoint {
        private String day;
        private int value;
    }

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class TodayExercise {
        private String name;
        private int sets;
        private String reps;
        private boolean completed;
        private boolean active;
    }
}
