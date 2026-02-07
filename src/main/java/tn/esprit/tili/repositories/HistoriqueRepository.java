package tn.esprit.tili.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.tili.entities.Historique;
import java.util.List;

@Repository
public interface HistoriqueRepository extends JpaRepository<Historique, Integer> {
    List<Historique> findAllByOrderByDateHeureDesc();

    // Custom query to fetch history for Chef de Projet
    List<Historique> findByEntiteTypeAndEntiteIdIn(String entiteType, List<Integer> entiteIds);
}
