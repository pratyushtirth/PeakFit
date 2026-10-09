package com.peakfit.dto.response;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class WorkoutSessionResponse {
    private Long id;
    private String type;
    private Integer durationMinutes;
    private Integer calories;
    private String notes;
    private LocalDate sessionDate;
    private List<ExerciseResponse> exercises;
    private LocalDateTime createdAt;

    @Data @AllArgsConstructor @NoArgsConstructor @Builder
    public static class ExerciseResponse {
        private Long id;
        private String name;
        private Integer sets;
        private String reps;
        private String weight;
        private Integer orderIndex;
    }
}
