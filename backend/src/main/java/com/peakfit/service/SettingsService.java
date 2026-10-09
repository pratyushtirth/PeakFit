package com.peakfit.service;

import com.peakfit.dto.request.UpdateSettingsRequest;
import com.peakfit.dto.response.SettingsResponse;
import com.peakfit.entity.User;
import com.peakfit.entity.UserSettings;
import com.peakfit.repository.UserRepository;
import com.peakfit.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final UserSettingsRepository settingsRepository;
    private final UserRepository userRepository;

    // GET: returns existing settings, or creates defaults if first time
    public SettingsResponse getSettings(Long userId) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));
        return toResponse(settings);
    }

    // PUT: updates settings, creates if not yet existing
    public SettingsResponse updateSettings(Long userId, UpdateSettingsRequest req) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));

        // Only update fields that are present in the request
        settings.setDarkMode(req.isDarkMode());
        settings.setEmailNotifications(req.isEmailNotifications());
        settings.setPushNotifications(req.isPushNotifications());
        settings.setWorkoutReminders(req.isWorkoutReminders());
        settings.setProgressUpdates(req.isProgressUpdates());
        settings.setTwoFactorAuth(req.isTwoFactorAuth());
        if (req.getLanguage() != null) settings.setLanguage(req.getLanguage());
        if (req.getUnits() != null) settings.setUnits(req.getUnits());

        settingsRepository.save(settings);
        return toResponse(settings);
    }

    // Creates a default UserSettings row for a new user
    private UserSettings createDefaultSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserSettings defaults = UserSettings.builder()
                .user(user)
                .darkMode(true)
                .emailNotifications(true)
                .pushNotifications(false)
                .workoutReminders(true)
                .progressUpdates(true)
                .twoFactorAuth(false)
                .language("en")
                .units("metric")
                .build();
        return settingsRepository.save(defaults);
    }

    private SettingsResponse toResponse(UserSettings s) {
        return SettingsResponse.builder()
                .darkMode(s.isDarkMode())
                .emailNotifications(s.isEmailNotifications())
                .pushNotifications(s.isPushNotifications())
                .workoutReminders(s.isWorkoutReminders())
                .progressUpdates(s.isProgressUpdates())
                .twoFactorAuth(s.isTwoFactorAuth())
                .language(s.getLanguage())
                .units(s.getUnits())
                .build();
    }
}
