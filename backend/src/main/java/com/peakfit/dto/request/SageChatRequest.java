package com.peakfit.dto.request;

import lombok.Data;

@Data
public class SageChatRequest {
    private String message;
    private String conversationHistory; // JSON string of prior messages
    private String injuredMuscles;      // e.g. "lower back, left knee"
    private String injurySeverity;      // "mild", "moderate", "severe"
    private boolean requestAdjustedPlan;
}
