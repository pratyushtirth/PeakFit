package com.peakfit.service;

import com.peakfit.dto.request.UpdateProfileRequest; // ✅ FIXED IMPORT
import com.peakfit.entity.User;
import com.peakfit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(Long userId, UpdateProfileRequest req) { // ✅ FIXED TYPE
        User user = getUser(userId);

        if (req.getFullName() != null && !req.getFullName().isBlank()) user.setFullName(req.getFullName());
        if (req.getAge() != null) user.setAge(req.getAge());
        if (req.getHeight() != null) user.setHeight(req.getHeight());
        if (req.getWeight() != null) user.setWeight(req.getWeight());
        if (req.getTargetWeight() != null) user.setTargetWeight(req.getTargetWeight());
        if (req.getGoal() != null) user.setGoal(req.getGoal());
        if (req.getFitnessLevel() != null) user.setFitnessLevel(req.getFitnessLevel());

        return userRepository.save(user);
    }
}