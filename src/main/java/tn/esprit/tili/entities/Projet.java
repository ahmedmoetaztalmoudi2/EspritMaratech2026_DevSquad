package tn.esprit.tili.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "projets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Projet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, length = 200)
    private String nom;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String objectifs;

    private Double budget;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_fin_prevue")
    private LocalDate dateFinPrevue;

    @Column(name = "date_fin_reelle")
    private LocalDate dateFinReelle;

    @Column(name = "pourcentage_avancement")
    @Builder.Default
    private Integer pourcentageAvancement = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutProjet statut = StatutProjet.EN_PREPARATION;

    // CORRECTION: Si la colonne s'appelle responsable_id dans la base
    @ManyToOne
    @JoinColumn(name = "responsable_id", nullable = false) // nullable = false est IMPORTANT
    private User responsable;

    @ManyToMany
    @JoinTable(
            name = "projet_membres",
            joinColumns = @JoinColumn(name = "projet_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    private Set<User> membres = new HashSet<>();

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Méthode pour compatibilité avec l'ancien nom
    public User getChefProjet() {
        return responsable;
    }

    public void setChefProjet(User chefProjet) {
        this.responsable = chefProjet;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Méthode utilitaire
    public void addMembre(User user) {
        this.membres.add(user);
    }

    public void removeMembre(User user) {
        this.membres.remove(user);
    }

    // Builder personnalisé
    public static class ProjetBuilder {
        private LocalDateTime createdAt = LocalDateTime.now();
        private LocalDateTime updatedAt = LocalDateTime.now();
        private Set<User> membres = new HashSet<>();
        private Integer pourcentageAvancement = 0;
        private StatutProjet statut = StatutProjet.EN_PREPARATION;
    }

    @Override
    public String toString() {
        return "Projet{" +
                "id=" + id +
                ", nom='" + nom + '\'' +
                ", statut=" + statut +
                ", pourcentageAvancement=" + pourcentageAvancement +
                '}';
    }
}