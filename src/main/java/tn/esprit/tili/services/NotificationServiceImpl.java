package tn.esprit.tili.services;

import tn.esprit.tili.entities.*;
import tn.esprit.tili.repositories.NotificationRepository;
import tn.esprit.tili.repositories.UserRepository;
import tn.esprit.tili.repositories.ProjetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class NotificationServiceImpl implements INotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjetRepository projetRepository;

    @Override
    public Notification createNotification(User destinataire, String titre, String message, String type) {
        TypeNotification typeNotification;
        try {
            typeNotification = TypeNotification.valueOf(type.toUpperCase());
        } catch (Exception e) {
            typeNotification = TypeNotification.INFO;
        }

        Notification notification = Notification.builder()
                .titre(titre)
                .message(message)
                .type(typeNotification)
                .destinataire(destinataire)
                .dateEnvoi(LocalDateTime.now())
                .lu(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Override
    public Notification getNotificationById(int id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification non trouvee"));
    }

    @Override
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    @Override
    public List<Notification> getNotificationsByUser(int userId) {
        return notificationRepository.findByDestinataireIdUserOrderByDateEnvoiDesc(userId);
    }

    @Override
    public List<Notification> getUnreadNotifications(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));
        return notificationRepository.findByDestinataireAndLuFalse(user);
    }

    @Override
    public long getUnreadCount(int userId) {
        return notificationRepository.countByDestinataireIdUserAndLuFalse(userId);
    }

    @Override
    public Notification markAsRead(int id) {
        Notification notification = getNotificationById(id);
        notification.setLu(true);
        return notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(int userId) {
        List<Notification> unread = getUnreadNotifications(userId);
        for (Notification n : unread) {
            n.setLu(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Override
    public void deleteNotification(int id) {
        notificationRepository.deleteById(id);
    }

    @Override
    public void notifyNewDocument(User uploader, String documentTitre) {
        // Notifier tous les utilisateurs actifs (sauf l'uploader)
        List<User> users = userRepository.findByActifTrue();
        for (User user : users) {
            if (user.getIdUser() != uploader.getIdUser()) {
                createNotification(
                        user,
                        "Nouveau document ajoute",
                        "Le document '" + documentTitre + "' a ete ajoute par " + uploader.getNomComplet(),
                        "DOCUMENT");
            }
        }
    }

    @Override
    public void notifyNewReunion(User organisateur, String reunionTitre, Set<User> participants) {
        for (User participant : participants) {
            if (participant.getIdUser() != organisateur.getIdUser()) {
                createNotification(
                        participant,
                        "Nouvelle reunion",
                        "Vous etes invite a la reunion '" + reunionTitre + "' organisee par "
                                + organisateur.getNomComplet(),
                        "REUNION");
            }
        }
    }

    @Override
    public void notifyProjetUpdate(int projetId, String message) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet non trouve"));

        // Notifier tous les membres du projet
        for (User membre : projet.getMembres()) {
            createNotification(
                    membre,
                    "Mise a jour projet",
                    message,
                    "PROJET");
        }
    }
}
