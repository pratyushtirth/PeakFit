package com.peakfit.service;

import com.peakfit.dto.request.UpdateProfileRequest;
import com.peakfit.dto.response.ProfileResponse;
import com.peakfit.entity.User;
import com.peakfit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;

    // 🔥 GET PROFILE
    public ProfileResponse getProfile(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ProfileResponse.builder()
                .fullName(user.getFullName())
                .age(user.getAge())
                .height(user.getHeight())
                .weight(user.getWeight())
                .targetWeight(user.getTargetWeight())
                .goal(user.getGoal())
                .fitnessLevel(user.getFitnessLevel())
                .build();
    }

    // 🔥 UPDATE PROFILE
    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest req) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(req.getFullName());
        user.setAge(req.getAge());
        user.setHeight(req.getHeight());
        user.setWeight(req.getWeight());
        user.setTargetWeight(req.getTargetWeight());
        user.setGoal(req.getGoal());
        user.setFitnessLevel(req.getFitnessLevel());

        userRepository.save(user);

        return ProfileResponse.builder()
                .fullName(user.getFullName())
                .age(user.getAge())
                .height(user.getHeight())
                .weight(user.getWeight())
                .targetWeight(user.getTargetWeight())
                .goal(user.getGoal())
                .fitnessLevel(user.getFitnessLevel())
                .build();
    }
}