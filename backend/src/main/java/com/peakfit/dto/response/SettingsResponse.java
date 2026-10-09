package com.peakfit.dto.response;
import lombok.*;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class SettingsResponse {
    private boolean darkMode;
    private boolean emailNotifications;
    private boolean pushNotifications;
    private boolean workoutReminders;
    private boolean progressUpdates;
    private boolean twoFactorAuth;
    private String language;
    private String units;
}
