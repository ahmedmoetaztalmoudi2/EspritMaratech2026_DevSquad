package tn.esprit.tili.services;

import tn.esprit.tili.entities.Projet;
import tn.esprit.tili.entities.StatutProjet;
import tn.esprit.tili.entities.User;
import java.util.List;

public interface IProjetService {
    Projet createProjet(Projet projet, int chefProjetId);
    Projet updateProjet(int id, Projet projet);
    Projet getProjetById(int id);
    List<Projet> getAllProjets();
    void deleteProjet(int id);
    List<Projet> getProjetsByChefProjet(int chefProjetId);
    List<Projet> getProjetsByStatut(StatutProjet statut);
    List<Projet> getProjetsByMembre(int userId);
    Projet addMembre(int projetId, int userId);
    Projet removeMembre(int projetId, int userId);
    Projet updateStatut(int projetId, StatutProjet statut);
    Projet updateAvancement(int projetId, int pourcentage);
    List<Projet> searchProjets(String keyword);
    List<Projet> getProjetsEnRetard();
    List<Projet> getProjetsAVenir();
}