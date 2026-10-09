package com.peakfit.dto.response;
import lombok.*;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private Integer age;
    private Double height;
    private Double currentWeight;
    private Double targetWeight;
    private String goal;
    private String fitnessLevel;
}
