package com.peakfit.dto.request;

import lombok.Data;

@Data
public class GenerateWorkoutRequest {
    private String weight;
    private String targetWeight;
    private String height;
    private String age;
    private String trainingPreference;
    private String primaryGoal;
    private String fitnessLevel;
    // BUG FIX: was missing — frontend sends this, was silently ignored by Spring
    private Integer daysPerWeek;
    // For Sage injury-adjusted plans
    private String injuredMuscles;
    private String injurySeverity;
}
