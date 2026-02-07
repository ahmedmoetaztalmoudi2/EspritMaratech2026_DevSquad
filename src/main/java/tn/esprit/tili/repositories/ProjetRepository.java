package tn.esprit.tili.repositories;

import tn.esprit.tili.entities.Projet;
import tn.esprit.tili.entities.StatutProjet;
import tn.esprit.tili.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjetRepository extends JpaRepository<Projet, Integer> {

    // Trouver par nom
    List<Projet> findByNomContainingIgnoreCase(String nom);

    // Trouver par statut
    List<Projet> findByStatut(StatutProjet statut);

    // CORRECTION: Renommer la méthode en findByResponsable
    List<Projet> findByResponsable(User responsable);

    // Trouver par membre
    @Query("SELECT p FROM Projet p JOIN p.membres m WHERE m.idUser = :userId")
    List<Projet> findByMembreId(@Param("userId") int userId);

    // Projets actifs (sauf certains statuts)
    @Query("SELECT p FROM Projet p WHERE p.statut NOT IN ('CLOTURE', 'ANNULE')")
    List<Projet> findProjetsActifs();

    // Recherche avancée
    @Query("SELECT p FROM Projet p WHERE " +
            "LOWER(p.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.objectifs) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Projet> searchByKeyword(@Param("keyword") String keyword);

    // Projets en retard (date fin prévue dépassée mais pas terminés)
    @Query("SELECT p FROM Projet p WHERE p.dateFinPrevue < CURRENT_DATE " +
            "AND p.statut NOT IN ('CLOTURE', 'ANNULE')")
    List<Projet> findProjetsEnRetard();

    // Projets à venir (date début future)
    @Query("SELECT p FROM Projet p WHERE p.dateDebut > CURRENT_DATE")
    List<Projet> findProjetsAVenir();
}