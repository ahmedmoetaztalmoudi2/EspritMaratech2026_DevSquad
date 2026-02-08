package tn.esprit.tili.services;

import tn.esprit.tili.entities.*;
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

    void notifyNewDocumentToProjectMembers(User uploader, String documentTitre, int projetId);

    void notifyNewReunion(User organisateur, String reunionTitre, Set<User> participants);

    void notifyUpcomingReunion(Reunion reunion, User participant);

    void notifyProjetUpdate(int projetId, String message);

    void notifyProjetAssignment(User membre, String projetNom);
}
