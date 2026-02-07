package tn.esprit.tili.services;

import tn.esprit.tili.entities.Historique;
import tn.esprit.tili.entities.TypeAction;
import tn.esprit.tili.entities.User;

import java.util.List;

public interface IHistoriqueService {

    // Log an action
    void logAction(User user, TypeAction typeAction, String entiteType, int entiteId, String description);

    // Get all history (for Responsable)
    List<Historique> getAllHistorique();

    // Get history for Chef de Projet (his projects, meetings, documents)
    List<Historique> getHistoriqueForChefProjet(int userId);
}
