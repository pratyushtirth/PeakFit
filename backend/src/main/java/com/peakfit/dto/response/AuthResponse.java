package com.peakfit.dto.response;
import lombok.*;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class AuthResponse {
    private Long id;
    private String email;
    private String fullName;
    private String goal;
    private String message;
}
