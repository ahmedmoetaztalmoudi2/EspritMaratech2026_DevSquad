package tn.esprit.tili.repositories;

import tn.esprit.tili.entities.DemandeReunion;
import tn.esprit.tili.entities.StatutDemandeReunion;
import tn.esprit.tili.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DemandeReunionRepository extends JpaRepository<DemandeReunion, Integer> {

    // Demandes par demandeur (consultant)
    List<DemandeReunion> findByDemandeurOrderByCreatedAtDesc(User demandeur);

    List<DemandeReunion> findByDemandeurIdUserOrderByCreatedAtDesc(int demandeurId);

    // Demandes par destinataire (chef de projet)
    List<DemandeReunion> findByDestinataireOrderByCreatedAtDesc(User destinataire);

    List<DemandeReunion> findByDestinataireIdUserOrderByCreatedAtDesc(int destinataireId);

    // Demandes en attente par destinataire
    List<DemandeReunion> findByDestinataireIdUserAndStatutOrderByCreatedAtDesc(int destinataireId,
            StatutDemandeReunion statut);

    // Demandes par statut
    List<DemandeReunion> findByStatut(StatutDemandeReunion statut);

    // Demandes par projet
    List<DemandeReunion> findByProjetId(int projetId);

    // Compter les demandes en attente pour un destinataire
    long countByDestinataireIdUserAndStatut(int destinataireId, StatutDemandeReunion statut);
}
