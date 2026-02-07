package tn.esprit.tili.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "reunions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reunion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Column(length = 300)
    private String lieu;

    @Column(name = "lien_meet", length = 300)
    private String lienMeet;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutReunion statut = StatutReunion.PLANIFIEE;

    @Column(name = "ordre_du_jour", columnDefinition = "TEXT")
    private String ordreDuJour;

    @Column(name = "compte_rendu", columnDefinition = "TEXT")
    private String compteRendu;

    // Relations
    @ManyToOne
    @JoinColumn(name = "organisateur_id", nullable = false)
    private User organisateur;

    @ManyToMany
    @JoinTable(name = "reunion_participants", joinColumns = @JoinColumn(name = "reunion_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default
    private Set<User> participants = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Méthodes utilitaires
    public void addParticipant(User user) {
        this.participants.add(user);
    }

    public void removeParticipant(User user) {
        this.participants.remove(user);
    }

    @Override
    public String toString() {
        return "Reunion{" +
                "id=" + id +
                ", titre='" + titre + '\'' +
                ", statut=" + statut +
                ", dateDebut=" + dateDebut +
                '}';
    }
}
