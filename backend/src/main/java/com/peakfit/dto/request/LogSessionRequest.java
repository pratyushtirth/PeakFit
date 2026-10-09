package com.peakfit.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class LogSessionRequest {

    private String type;
    private Integer durationMinutes;
    private Integer calories;
    private String notes;
    private LocalDate sessionDate;
    private List<ExerciseEntry> exercises;

    @Data
    public static class ExerciseEntry {
        private String name;
        private Integer sets;
        private String reps;   // String because user may input "10-12"
        private String weight; // String for flexibility ("80kg", "bodyweight")
    }
}