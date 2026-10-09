package com.peakfit.dto.request;
import lombok.Data;

@Data
public class UpdateSettingsRequest {
    private boolean darkMode;
    private boolean emailNotifications;
    private boolean pushNotifications;
    private boolean workoutReminders;
    private boolean progressUpdates;
    private boolean twoFactorAuth;
    private String language;
    private String units;
}
