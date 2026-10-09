package com.peakfit.repository;

import com.peakfit.entity.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    // Get today's session
    Optional<WorkoutSession> findByUser_IdAndSessionDate(Long userId, LocalDate sessionDate);

    // Weekly / specific range
    List<WorkoutSession> findByUser_IdAndSessionDateBetween(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    // History (ordered newest first)
    List<WorkoutSession> findByUser_IdOrderBySessionDateDesc(Long userId);

    // Delete all sessions for a user (used by "Delete All Data" in settings)
    void deleteByUser_Id(Long userId);
}
