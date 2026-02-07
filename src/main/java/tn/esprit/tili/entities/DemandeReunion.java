package tn.esprit.tili.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "demandes_reunion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandeReunion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "date_souhaitee")
    private LocalDateTime dateSouhaitee;

    @Column(name = "duree_estimee")
    private Integer dureeEstimee; // en minutes

    @Column(length = 300)
    private String lieu;

    @Column(name = "ordre_du_jour", columnDefinition = "TEXT")
    private String ordreDuJour;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutDemandeReunion statut = StatutDemandeReunion.EN_ATTENTE;

    @Column(name = "motif_refus", columnDefinition = "TEXT")
    private String motifRefus;

    // Demandeur (Consultant)
    @ManyToOne
    @JoinColumn(name = "demandeur_id", nullable = false)
    private User demandeur;

    // Destinataire (Chef de Projet)
    @ManyToOne
    @JoinColumn(name = "destinataire_id", nullable = false)
    private User destinataire;

    // Projet associé (optionnel)
    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    // Réunion créée après acceptation
    @OneToOne
    @JoinColumn(name = "reunion_id")
    private Reunion reunion;

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

    @Override
    public String toString() {
        return "DemandeReunion{" +
                "id=" + id +
                ", titre='" + titre + '\'' +
                ", statut=" + statut +
                '}';
    }
}
