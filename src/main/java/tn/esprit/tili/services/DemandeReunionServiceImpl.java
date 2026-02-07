package tn.esprit.tili.services;

import tn.esprit.tili.entities.*;
import tn.esprit.tili.repositories.DemandeReunionRepository;
import tn.esprit.tili.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class DemandeReunionServiceImpl implements IDemandeReunionService {

    @Autowired
    private DemandeReunionRepository demandeReunionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IReunionService reunionService;

    @Autowired
    private INotificationService notificationService;

    @Override
    public DemandeReunion createDemande(DemandeReunion demande, int demandeurId, int destinataireId) {
        User demandeur = userRepository.findById(demandeurId)
                .orElseThrow(() -> new RuntimeException("Demandeur non trouve"));

        User destinataire = userRepository.findById(destinataireId)
                .orElseThrow(() -> new RuntimeException("Destinataire non trouve"));

        // Vérifier que le destinataire est bien un chef de projet ou responsable
        if (destinataire.getRole() != TypeRole.CHEF_PROJET &&
                destinataire.getRole() != TypeRole.CHEF_DE_PROJET &&
                destinataire.getRole() != TypeRole.RESPONSABLE) {
            throw new RuntimeException("Le destinataire doit etre un chef de projet ou responsable");
        }

        demande.setDemandeur(demandeur);
        demande.setDestinataire(destinataire);
        demande.setStatut(StatutDemandeReunion.EN_ATTENTE);

        DemandeReunion savedDemande = demandeReunionRepository.save(demande);

        // Notification au chef de projet
        notificationService.createNotification(
                destinataire,
                "Nouvelle demande de reunion",
                demandeur.getNomComplet() + " vous a envoye une demande de reunion: " + demande.getTitre(),
                "REUNION");

        return savedDemande;
    }

    @Override
    public DemandeReunion getDemandeById(int id) {
        return demandeReunionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvee"));
    }

    @Override
    public List<DemandeReunion> getAllDemandes() {
        return demandeReunionRepository.findAll();
    }

    @Override
    public void deleteDemande(int id) {
        demandeReunionRepository.deleteById(id);
    }

    @Override
    public List<DemandeReunion> getDemandesByDemandeur(int demandeurId) {
        return demandeReunionRepository.findByDemandeurIdUserOrderByCreatedAtDesc(demandeurId);
    }

    @Override
    public List<DemandeReunion> getDemandesByDestinataire(int destinataireId) {
        return demandeReunionRepository.findByDestinataireIdUserOrderByCreatedAtDesc(destinataireId);
    }

    @Override
    public List<DemandeReunion> getDemandesEnAttenteByDestinataire(int destinataireId) {
        return demandeReunionRepository.findByDestinataireIdUserAndStatutOrderByCreatedAtDesc(
                destinataireId, StatutDemandeReunion.EN_ATTENTE);
    }

    @Override
    public long countDemandesEnAttente(int destinataireId) {
        return demandeReunionRepository.countByDestinataireIdUserAndStatut(
                destinataireId, StatutDemandeReunion.EN_ATTENTE);
    }

    @Override
    public DemandeReunion accepterDemande(int demandeId, int chefProjetId) {
        DemandeReunion demande = getDemandeById(demandeId);

        // Vérifier que c'est bien le destinataire qui accepte
        if (demande.getDestinataire().getIdUser() != chefProjetId) {
            throw new RuntimeException("Seul le destinataire peut accepter cette demande");
        }

        // Vérifier que la demande est en attente
        if (demande.getStatut() != StatutDemandeReunion.EN_ATTENTE) {
            throw new RuntimeException("Cette demande a deja ete traitee");
        }

        demande.setStatut(StatutDemandeReunion.ACCEPTEE);
        DemandeReunion savedDemande = demandeReunionRepository.save(demande);

        // Notification au demandeur
        notificationService.createNotification(
                demande.getDemandeur(),
                "Demande de reunion acceptee",
                "Votre demande de reunion '" + demande.getTitre() + "' a ete acceptee par " +
                        demande.getDestinataire().getNomComplet() + ". La reunion sera bientot creee.",
                "REUNION");

        return savedDemande;
    }

    @Override
    public DemandeReunion refuserDemande(int demandeId, int chefProjetId, String motifRefus) {
        DemandeReunion demande = getDemandeById(demandeId);

        // Vérifier que c'est bien le destinataire qui refuse
        if (demande.getDestinataire().getIdUser() != chefProjetId) {
            throw new RuntimeException("Seul le destinataire peut refuser cette demande");
        }

        // Vérifier que la demande est en attente
        if (demande.getStatut() != StatutDemandeReunion.EN_ATTENTE) {
            throw new RuntimeException("Cette demande a deja ete traitee");
        }

        demande.setStatut(StatutDemandeReunion.REFUSEE);
        demande.setMotifRefus(motifRefus);
        DemandeReunion savedDemande = demandeReunionRepository.save(demande);

        // Notification au demandeur avec le motif de refus
        String message = "Votre demande de reunion '" + demande.getTitre() + "' a ete refusee par " +
                demande.getDestinataire().getNomComplet() + ".";
        if (motifRefus != null && !motifRefus.isEmpty()) {
            message += " Motif: " + motifRefus;
        }

        notificationService.createNotification(
                demande.getDemandeur(),
                "Demande de reunion refusee",
                message,
                "REUNION");

        return savedDemande;
    }

    @Override
    public Reunion createReunionForDemande(int demandeId, Reunion reunion) {
        DemandeReunion demande = getDemandeById(demandeId);

        // Créer la réunion via le service dédié using the destinataire as organizer
        Reunion createdReunion = reunionService.createReunion(reunion, demande.getDestinataire().getIdUser());

        // Lier la réunion à la demande
        demande.setReunion(createdReunion);
        demande.setStatut(StatutDemandeReunion.ACCEPTEE); // Force le statut acceptée
        demandeReunionRepository.save(demande);

        return createdReunion;
    }
}
