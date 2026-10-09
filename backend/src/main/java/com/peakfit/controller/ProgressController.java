package com.peakfit.controller;

import com.peakfit.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/weekly")
    public List<Integer> getWeeklyProgress(
            Authentication auth,
            @RequestParam(required = false) String type
    ) {
        Long userId = (Long) auth.getPrincipal();
        return progressService.getWeeklyProgress(userId, type);
    }
}
