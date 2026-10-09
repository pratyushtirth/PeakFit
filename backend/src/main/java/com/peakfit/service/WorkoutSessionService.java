package com.peakfit.service;

import com.peakfit.entity.User;
import com.peakfit.entity.WorkoutSession;
import com.peakfit.entity.WorkoutStatus;
import com.peakfit.entity.SessionExercise;
import com.peakfit.dto.request.LogSessionRequest;
import com.peakfit.repository.UserRepository;
import com.peakfit.repository.WorkoutSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutSessionService {

    private final WorkoutSessionRepository sessionRepository;
    private final UserRepository userRepository;

    // FIX 2: @Transactional keeps session open so LAZY exercises can be accessed
    // during Jackson serialization by the controller
    @Transactional
    public WorkoutSession getOrCreateTodaySession(Long userId) {
        LocalDate today = LocalDate.now();
        WorkoutSession session = sessionRepository
                .findByUser_IdAndSessionDate(userId, today)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    WorkoutSession s = new WorkoutSession();
                    s.setUser(user);
                    s.setSessionDate(today);
                    s.setStatus(WorkoutStatus.PLANNED);
                    return sessionRepository.save(s);
                });
        // Eagerly initialize exercises within the transaction to prevent LazyInitializationException
        if (session.getExercises() != null) {
            session.getExercises().size(); // forces Hibernate to load the collection
        }
        return session;
    }

    // FIX 2: @Transactional for same reason — getWeeklySessions may serialize exercises
    @Transactional(readOnly = true)
    public List<WorkoutSession> getWeeklySessions(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(6);
        List<WorkoutSession> sessions =
                sessionRepository.findByUser_IdAndSessionDateBetween(userId, start, today);
        // Eagerly initialize exercises for each session
        sessions.forEach(s -> {
            if (s.getExercises() != null) s.getExercises().size();
        });
        return sessions;
    }

    @Transactional
    public WorkoutSession markCompleted(Long sessionId) {
        WorkoutSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setStatus(WorkoutStatus.COMPLETED);
        WorkoutSession saved = sessionRepository.save(session);
        if (saved.getExercises() != null) saved.getExercises().size();
        return saved;
    }

    @Transactional
    public WorkoutSession createSession(Long userId, LogSessionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        WorkoutSession session = new WorkoutSession();
        session.setUser(user);
        session.setType(request.getType());
        session.setDurationMinutes(request.getDurationMinutes());
        session.setCalories(request.getCalories());
        session.setNotes(request.getNotes());
        session.setSessionDate(request.getSessionDate() != null
                ? request.getSessionDate() : LocalDate.now());
        session.setStatus(WorkoutStatus.COMPLETED);

        if (request.getExercises() != null) {
            List<SessionExercise> exercises = request.getExercises().stream().map(e -> {
                SessionExercise ex = new SessionExercise();
                ex.setName(e.getName());
                ex.setSets(e.getSets());
                ex.setReps(e.getReps());
                ex.setWeight(e.getWeight());
                ex.setSession(session);
                return ex;
            }).toList();
            session.setExercises(exercises);
        }

        WorkoutSession saved = sessionRepository.save(session);
        if (saved.getExercises() != null) saved.getExercises().size();
        return saved;
    }

    @Transactional
    public void deleteAllUserSessions(Long userId) {
        sessionRepository.deleteByUser_Id(userId);
    }
}
