package com.peakfit.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileResponse {

    private String fullName;
    private Integer age;
    private Double height;
    private Double weight;
    private Double targetWeight;
    private String goal;
    private String fitnessLevel;
}