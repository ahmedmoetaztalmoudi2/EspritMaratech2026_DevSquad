package tn.esprit.tili.repositories;

import tn.esprit.tili.entities.Reunion;
import tn.esprit.tili.entities.StatutReunion;
import tn.esprit.tili.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReunionRepository extends JpaRepository<Reunion, Integer> {

    // Trouver par statut
    List<Reunion> findByStatut(StatutReunion statut);

    // Trouver par organisateur
    List<Reunion> findByOrganisateur(User organisateur);

    // Trouver par projet
    List<Reunion> findByProjetId(int projetId);

    // Trouver par participant
    @Query("SELECT r FROM Reunion r JOIN r.participants p WHERE p.idUser = :userId")
    List<Reunion> findByParticipantId(@Param("userId") int userId);

    // Reunions a venir
    @Query("SELECT r FROM Reunion r WHERE r.dateDebut > :now AND r.statut = 'PLANIFIEE' ORDER BY r.dateDebut ASC")
    List<Reunion> findReunionsAVenir(@Param("now") LocalDateTime now);

    // Reunions du jour
    @Query("SELECT r FROM Reunion r WHERE DATE(r.dateDebut) = CURRENT_DATE")
    List<Reunion> findReunionsDuJour();

    // Recherche par titre
    List<Reunion> findByTitreContainingIgnoreCase(String titre);

    // Compter par statut
    long countByStatut(StatutReunion statut);
}
