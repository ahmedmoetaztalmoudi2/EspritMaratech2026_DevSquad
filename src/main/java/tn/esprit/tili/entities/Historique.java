package tn.esprit.tili.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "historique")
public class Historique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Enumerated(EnumType.STRING)
    private TypeAction typeAction; // CREATION, MODIFICATION, SUPPRESSION

    private String entiteType; // PROJET, REUNION, DOCUMENT, USER

    private int entiteId;

    private String description;

    @Builder.Default
    private LocalDateTime dateHeure = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User utilisateur; // Who performed the action

    private String ipAdresse; // Optional: for tracking origin
}
