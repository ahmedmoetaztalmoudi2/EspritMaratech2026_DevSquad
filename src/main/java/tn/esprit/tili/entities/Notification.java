package tn.esprit.tili.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TypeNotification type = TypeNotification.INFO;

    @Column(name = "date_envoi")
    @Builder.Default
    private LocalDateTime dateEnvoi = LocalDateTime.now();

    @Builder.Default
    private Boolean lu = false;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PrioriteNotification priorite = PrioriteNotification.NORMALE;

    // Destinataire
    @ManyToOne
    @JoinColumn(name = "destinataire_id", nullable = false)
    private User destinataire;

    // Optionnel: lien vers entité concernée
    @Column(name = "entite_type")
    private String entiteType; // DOCUMENT, PROJET, REUNION

    @Column(name = "entite_id")
    private Integer entiteId;

    @Override
    public String toString() {
        return "Notification{" +
                "id=" + id +
                ", titre='" + titre + '\'' +
                ", type=" + type +
                ", lu=" + lu +
                '}';
    }
}
