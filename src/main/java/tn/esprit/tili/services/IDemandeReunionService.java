package tn.esprit.tili.services;

import tn.esprit.tili.entities.DemandeReunion;
import tn.esprit.tili.entities.StatutDemandeReunion;
import java.util.List;

public interface IDemandeReunionService {

    // CRUD
    DemandeReunion createDemande(DemandeReunion demande, int demandeurId, int destinataireId);

    DemandeReunion getDemandeById(int id);

    List<DemandeReunion> getAllDemandes();

    void deleteDemande(int id);

    // Par demandeur (consultant)
    List<DemandeReunion> getDemandesByDemandeur(int demandeurId);

    // Par destinataire (chef de projet)
    List<DemandeReunion> getDemandesByDestinataire(int destinataireId);

    List<DemandeReunion> getDemandesEnAttenteByDestinataire(int destinataireId);

    long countDemandesEnAttente(int destinataireId);

    // Actions
    DemandeReunion accepterDemande(int demandeId, int chefProjetId);

    DemandeReunion refuserDemande(int demandeId, int chefProjetId, String motifRefus);
}
