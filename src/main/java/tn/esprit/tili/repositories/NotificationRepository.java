package tn.esprit.tili.repositories;

import tn.esprit.tili.entities.Notification;
import tn.esprit.tili.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    // Notifications par destinataire
    List<Notification> findByDestinataire(User destinataire);

    // Notifications par destinataire ordonnees par date
    List<Notification> findByDestinataireOrderByDateEnvoiDesc(User destinataire);

    // Notifications non lues par destinataire
    List<Notification> findByDestinataireAndLuFalse(User destinataire);

    // Compter notifications non lues
    long countByDestinataireAndLuFalse(User destinataire);

    // Notifications par destinataire id
    List<Notification> findByDestinataireIdUserOrderByDateEnvoiDesc(int destinataireId);

    // Compter non lues par id
    long countByDestinataireIdUserAndLuFalse(int destinataireId);
}
