package com.peakfit.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "user_settings")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @OnDelete(action = OnDeleteAction.CASCADE) // DB-level: deleting user deletes their settings
    private User user;

    @Builder.Default private boolean darkMode = true;
    @Builder.Default private boolean emailNotifications = true;
    @Builder.Default private boolean pushNotifications = false;
    @Builder.Default private boolean workoutReminders = true;
    @Builder.Default private boolean progressUpdates = true;
    @Builder.Default private boolean twoFactorAuth = false;
    @Builder.Default private String language = "en";
    @Builder.Default private String units = "metric";
}
