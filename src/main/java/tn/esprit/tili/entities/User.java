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
@Table(name = "users")
@EqualsAndHashCode(of = "idUser")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idUser;

    private String nom;
    private String prenom;
    private String email;

    @Column(name = "mot_de_passe")
    private String motDePasse;

    private String tel;

    private String sexe;

    @Column(name = "date_naissance")
    private java.time.LocalDate dateNaissance;

    @Column(name = "date_inscription")
    private LocalDateTime dateInscription = LocalDateTime.now();

    private Boolean actif = true;

    @Enumerated(EnumType.STRING)
    private TypeRole role = TypeRole.MEMBRE_ACTIF; // Par défaut

    // ✅ SEULEMENT 2 champs pour la promotion
    @Column(name = "demande_promotion")
    private Boolean demandePromotion = false;

    @Column(name = "nom_projet_demande", length = 200)
    private String nomProjetDemande;

    // ========== SEULEMENT 4 MÉTHODES ESSENTIELLES ==========

    public String getNomComplet() {
        return prenom + " " + nom;
    }

    public void demanderPromotion(String nomProjet) {
        if (this.role == TypeRole.MEMBRE_ACTIF && !this.demandePromotion) {
            this.demandePromotion = true;
            this.nomProjetDemande = nomProjet;
        }
    }

    public void promouvoirChefDeProjet() {
        if (this.demandePromotion && this.role == TypeRole.MEMBRE_ACTIF) {
            this.role = TypeRole.CHEF_DE_PROJET;
            this.demandePromotion = false;
        }
    }

    @PrePersist
    protected void onCreate() {
        dateInscription = LocalDateTime.now();
    }
}