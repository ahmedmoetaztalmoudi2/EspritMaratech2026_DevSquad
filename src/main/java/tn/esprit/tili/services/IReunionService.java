package tn.esprit.tili.services;

import tn.esprit.tili.entities.Reunion;
import tn.esprit.tili.entities.StatutReunion;
import java.util.List;

public interface IReunionService {

    // CRUD
    Reunion createReunion(Reunion reunion, int organisateurId);

    Reunion getReunionById(int id);

    List<Reunion> getAllReunions();

    Reunion updateReunion(int id, Reunion reunionDetails, int userId);

    void deleteReunion(int id, int userId);

    // Filtres
    List<Reunion> getReunionsByStatut(StatutReunion statut);

    List<Reunion> getReunionsByOrganisateur(int organisateurId);

    List<Reunion> getReunionsByProjet(int projetId);

    List<Reunion> getReunionsByParticipant(int userId);

    List<Reunion> getReunionsAVenir();

    List<Reunion> getReunionsDuJour();

    // Gestion participants
    Reunion addParticipant(int reunionId, int userId);

    Reunion removeParticipant(int reunionId, int userId);

    // Gestion statut
    Reunion updateStatut(int reunionId, StatutReunion statut);

    Reunion addCompteRendu(int reunionId, String compteRendu);

    // Recherche
    List<Reunion> searchReunions(String keyword);
}
