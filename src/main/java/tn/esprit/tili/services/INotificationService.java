package tn.esprit.tili.services;

import tn.esprit.tili.entities.Notification;
import tn.esprit.tili.entities.User;
import java.util.List;
import java.util.Set;

public interface INotificationService {

    // CRUD
    Notification createNotification(User destinataire, String titre, String message, String type);

    Notification getNotificationById(int id);

    List<Notification> getAllNotifications();

    // Par utilisateur
    List<Notification> getNotificationsByUser(int userId);

    List<Notification> getUnreadNotifications(int userId);

    long getUnreadCount(int userId);

    // Actions
    Notification markAsRead(int id);

    void markAllAsRead(int userId);

    void deleteNotification(int id);

    // Notifications systeme
    void notifyNewDocument(User uploader, String documentTitre);

    void notifyNewReunion(User organisateur, String reunionTitre, Set<User> participants);

    void notifyProjetUpdate(int projetId, String message);
}
