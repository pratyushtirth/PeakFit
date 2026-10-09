package com.peakfit.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {

    private String fullName;

    private Integer age;

    private Double height;

    // ✅ FIXED: match entity field name
    private Double weight;

    private Double targetWeight;

    private String goal;

    private String fitnessLevel;
}