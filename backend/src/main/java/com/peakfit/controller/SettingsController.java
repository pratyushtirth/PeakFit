package com.peakfit.controller;

import com.peakfit.dto.request.UpdateSettingsRequest;
import com.peakfit.dto.response.SettingsResponse;
import com.peakfit.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    // GET /api/settings — load current user's settings
    @GetMapping
    public ResponseEntity<SettingsResponse> getSettings(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(settingsService.getSettings(userId));
    }

    // PUT /api/settings — save updated settings
    @PutMapping
    public ResponseEntity<SettingsResponse> updateSettings(
            @RequestBody UpdateSettingsRequest req,
            Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(settingsService.updateSettings(userId, req));
    }
}
