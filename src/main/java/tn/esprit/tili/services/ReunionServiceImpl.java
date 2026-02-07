package tn.esprit.tili.services;

import tn.esprit.tili.entities.*;
import tn.esprit.tili.repositories.ReunionRepository;
import tn.esprit.tili.repositories.UserRepository;
import tn.esprit.tili.repositories.ProjetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Service
@Transactional
public class ReunionServiceImpl implements IReunionService {

    @Autowired
    private ReunionRepository reunionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private IHistoriqueService historiqueService;

    @Override
    public Reunion createReunion(Reunion reunion, int organisateurId) {
        User organisateur = userRepository.findById(organisateurId)
                .orElseThrow(() -> new RuntimeException("Organisateur non trouve"));

        reunion.setOrganisateur(organisateur);
        reunion.addParticipant(organisateur); // L'organisateur est automatiquement participant

        Reunion savedReunion = reunionRepository.save(reunion);

        // Notifier les participants (sauf l'organisateur, géré dans le service)
        // Note: participants est un Set, donc on peut le passer directement
        if (savedReunion.getParticipants() != null && !savedReunion.getParticipants().isEmpty()) {
            notificationService.notifyNewReunion(
                    organisateur,
                    savedReunion.getTitre(),
                    savedReunion.getParticipants());
        }

        // Log to historique
        historiqueService.logAction(organisateur, TypeAction.CREATION, "REUNION", savedReunion.getId(),
                "Création de la réunion: " + savedReunion.getTitre());

        return savedReunion;
    }

    @Override
    public Reunion getReunionById(int id) {
        return reunionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reunion non trouvee"));
    }

    @Override
    public List<Reunion> getAllReunions() {
        return reunionRepository.findAll();
    }

    @Override
    public Reunion updateReunion(int id, Reunion reunionDetails, int userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return reunionRepository.findById(id).map(reunion -> {
            // Vérification des droits: Organisateur ou Responsable
            if (currentUser.getRole() != TypeRole.RESPONSABLE &&
                    reunion.getOrganisateur().getIdUser() != userId) {
                throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette réunion");
            }

            reunion.setTitre(reunionDetails.getTitre());
            reunion.setDescription(reunionDetails.getDescription());
            reunion.setDateDebut(reunionDetails.getDateDebut());
            reunion.setDateFin(reunionDetails.getDateFin());
            reunion.setLieu(reunionDetails.getLieu());
            reunion.setLienMeet(reunionDetails.getLienMeet());
            reunion.setOrdreDuJour(reunionDetails.getOrdreDuJour());

            if (reunionDetails.getProjet() != null && reunionDetails.getProjet().getId() != 0) {
                Projet projet = projetRepository.findById(reunionDetails.getProjet().getId())
                        .orElseThrow(() -> new RuntimeException("Projet non trouve"));
                reunion.setProjet(projet);
            }

            Reunion saved = reunionRepository.save(reunion);

            // Log to historique
            historiqueService.logAction(currentUser, TypeAction.MODIFICATION, "REUNION", saved.getId(),
                    "Modification de la réunion: " + saved.getTitre());

            return saved;
        }).orElseThrow(() -> new RuntimeException("Reunion non trouvee"));
    }

    @Override
    public void deleteReunion(int id, int userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Reunion reunion = getReunionById(id);

        // Vérification des droits
        if (currentUser.getRole() != TypeRole.RESPONSABLE &&
                reunion.getOrganisateur().getIdUser() != userId) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer cette réunion");
        }

        reunion.setStatut(StatutReunion.ANNULEE);
        reunionRepository.save(reunion);

        // Log to historique
        historiqueService.logAction(currentUser, TypeAction.SUPPRESSION, "REUNION", reunion.getId(),
                "Suppression de la réunion: " + reunion.getTitre());
    }

    @Override
    public List<Reunion> getReunionsByStatut(StatutReunion statut) {
        return reunionRepository.findByStatut(statut);
    }

    @Override
    public List<Reunion> getReunionsByOrganisateur(int organisateurId) {
        User organisateur = userRepository.findById(organisateurId)
                .orElseThrow(() -> new RuntimeException("Organisateur non trouve"));
        return reunionRepository.findByOrganisateur(organisateur);
    }

    @Override
    public List<Reunion> getReunionsByProjet(int projetId) {
        return reunionRepository.findByProjetId(projetId);
    }

    @Override
    public List<Reunion> getReunionsByParticipant(int userId) {
        return reunionRepository.findByParticipantId(userId);
    }

    @Override
    public List<Reunion> getReunionsAVenir() {
        return reunionRepository.findReunionsAVenir(LocalDateTime.now());
    }

    @Override
    public List<Reunion> getReunionsDuJour() {
        return reunionRepository.findReunionsDuJour();
    }

    @Override
    public Reunion addParticipant(int reunionId, int userId) {
        Reunion reunion = getReunionById(reunionId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));

        reunion.addParticipant(user);
        Reunion savedReunion = reunionRepository.save(reunion);

        // Notifier le nouveau participant
        Set<User> newParticipants = new HashSet<>();
        newParticipants.add(user);
        notificationService.notifyNewReunion(
                reunion.getOrganisateur(),
                reunion.getTitre(),
                newParticipants);

        return savedReunion;
    }

    @Override
    public Reunion removeParticipant(int reunionId, int userId) {
        Reunion reunion = getReunionById(reunionId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));

        // Ne pas retirer l'organisateur
        if (reunion.getOrganisateur().getIdUser() == userId) {
            throw new RuntimeException("Impossible de retirer l'organisateur");
        }

        reunion.removeParticipant(user);
        return reunionRepository.save(reunion);
    }

    @Override
    public Reunion updateStatut(int reunionId, StatutReunion statut) {
        Reunion reunion = getReunionById(reunionId);
        reunion.setStatut(statut);
        return reunionRepository.save(reunion);
    }

    @Override
    public Reunion addCompteRendu(int reunionId, String compteRendu) {
        Reunion reunion = getReunionById(reunionId);
        reunion.setCompteRendu(compteRendu);
        reunion.setStatut(StatutReunion.TERMINEE);
        return reunionRepository.save(reunion);
    }

    @Override
    public List<Reunion> searchReunions(String keyword) {
        return reunionRepository.findByTitreContainingIgnoreCase(keyword);
    }
}
