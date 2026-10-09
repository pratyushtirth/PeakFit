package com.peakfit.dto.response;
import lombok.*;
import java.time.LocalDateTime;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class WorkoutPlanResponse {
    private Long id;
    private String title;
    private String description;
    private String frequency;
    private Integer dailyMinutes;
    private Integer complexityLevel;
    private String trainingPreference;
    private String goal;
    private String planJson;
    private LocalDateTime createdAt;
}
