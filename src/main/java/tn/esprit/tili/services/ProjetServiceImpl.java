package tn.esprit.tili.services;

import tn.esprit.tili.entities.Projet;
import tn.esprit.tili.entities.StatutProjet;
import tn.esprit.tili.entities.User;
import tn.esprit.tili.repositories.ProjetRepository;
import tn.esprit.tili.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ProjetServiceImpl implements IProjetService {

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private INotificationService notificationService;

    @Override
    @Transactional
    public Projet createProjet(Projet projet, int responsableId) {
        System.out.println("🚀 Création projet: " + projet.getNom());

        // CORRECTION: Vérifier que le responsable est fourni
        if (responsableId == 0) {
            throw new RuntimeException("L'ID du responsable est requis");
        }

        User responsable = userRepository.findById(responsableId)
                .orElseThrow(() -> new RuntimeException("Responsable non trouvé"));

        // CORRECTION: Définir le responsable
        projet.setResponsable(responsable);
        projet.addMembre(responsable); // Le responsable est automatiquement membre

        Projet saved = projetRepository.save(projet);

        // Notification
        // Notification
        notificationService.createNotification(
                responsable,
                "Projet créé",
                "Vous avez créé le projet: " + projet.getNom(),
                "INFO");
        System.out.println("✅ Projet créé ID: " + saved.getId());
        return saved;
    }

    @Override
    public Projet getProjetById(int id) {
        return projetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
    }

    @Override
    public List<Projet> getAllProjets() {
        return projetRepository.findAll();
    }

    @Override
    @Transactional
    public Projet updateProjet(int id, Projet projetDetails) {
        return projetRepository.findById(id).map(projet -> {
            projet.setNom(projetDetails.getNom());
            projet.setDescription(projetDetails.getDescription());
            projet.setObjectifs(projetDetails.getObjectifs());
            projet.setBudget(projetDetails.getBudget());
            projet.setDateDebut(projetDetails.getDateDebut());
            projet.setDateFinPrevue(projetDetails.getDateFinPrevue());
            projet.setDateFinReelle(projetDetails.getDateFinReelle());
            projet.setPourcentageAvancement(projetDetails.getPourcentageAvancement());

            // Mettre à jour le responsable si fourni
            if (projetDetails.getResponsable() != null && projetDetails.getResponsable().getIdUser() != 0) {
                User responsable = userRepository.findById(projetDetails.getResponsable().getIdUser())
                        .orElseThrow(() -> new RuntimeException("Responsable non trouvé"));
                projet.setResponsable(responsable);
            }

            return projetRepository.save(projet);
        }).orElseThrow(() -> new RuntimeException("Projet non trouvé"));
    }

    @Override
    @Transactional
    public void deleteProjet(int id) {
        Projet projet = getProjetById(id);

        // Soft delete: changer le statut
        projet.setStatut(StatutProjet.ANNULE);
        projetRepository.save(projet);

        System.out.println("✅ Projet annulé: " + projet.getNom());
    }

    @Override
    public List<Projet> getProjetsByChefProjet(int responsableId) {
        User responsable = userRepository.findById(responsableId)
                .orElseThrow(() -> new RuntimeException("Responsable non trouvé"));
        return projetRepository.findByResponsable(responsable);
    }

    @Override
    public List<Projet> getProjetsByStatut(StatutProjet statut) {
        return projetRepository.findByStatut(statut);
    }

    @Override
    public List<Projet> getProjetsByMembre(int userId) {
        return projetRepository.findByMembreId(userId);
    }

    @Override
    @Transactional
    public Projet addMembre(int projetId, int userId) {
        Projet projet = getProjetById(projetId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        projet.addMembre(user);
        Projet updated = projetRepository.save(projet);

        // Notification au membre
        // Notification au membre
        notificationService.createNotification(
                user,
                "Ajout à un projet",
                "Vous avez été ajouté au projet: " + projet.getNom(),
                "INFO");
        return updated;
    }

    @Override
    @Transactional
    public Projet removeMembre(int projetId, int userId) {
        Projet projet = getProjetById(projetId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Ne pas retirer le responsable
        if (projet.getResponsable().getIdUser() == userId) {
            throw new RuntimeException("Impossible de retirer le responsable du projet");
        }

        projet.removeMembre(user);
        return projetRepository.save(projet);
    }

    @Override
    @Transactional
    public Projet updateStatut(int projetId, StatutProjet statut) {
        Projet projet = getProjetById(projetId);
        projet.setStatut(statut);

        // Si on clôture le projet, mettre la date de fin réelle
        if (statut == StatutProjet.CLOTURE) {
            projet.setDateFinReelle(java.time.LocalDate.now());
        }

        return projetRepository.save(projet);
    }

    @Override
    @Transactional
    public Projet updateAvancement(int projetId, int pourcentage) {
        if (pourcentage < 0 || pourcentage > 100) {
            throw new RuntimeException("Le pourcentage doit être entre 0 et 100");
        }

        Projet projet = getProjetById(projetId);
        projet.setPourcentageAvancement(pourcentage);

        // Si 100%, marquer comme terminé si ce n'est pas déjà fait
        if (pourcentage == 100 && projet.getStatut() != StatutProjet.CLOTURE) {
            projet.setStatut(StatutProjet.CLOTURE);
            projet.setDateFinReelle(java.time.LocalDate.now());
        }

        return projetRepository.save(projet);
    }

    @Override
    public List<Projet> searchProjets(String keyword) {
        return projetRepository.searchByKeyword(keyword);
    }

    @Override
    public List<Projet> getProjetsEnRetard() {
        return projetRepository.findProjetsEnRetard();
    }

    @Override
    public List<Projet> getProjetsAVenir() {
        return projetRepository.findProjetsAVenir();
    }
}