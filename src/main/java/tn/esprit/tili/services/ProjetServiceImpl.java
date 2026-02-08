package tn.esprit.tili.services;

import tn.esprit.tili.entities.Projet;
import tn.esprit.tili.entities.StatutProjet;
import tn.esprit.tili.entities.TypeAction;
import tn.esprit.tili.entities.TypeRole;
import tn.esprit.tili.entities.User;
import tn.esprit.tili.repositories.ProjetRepository;
import tn.esprit.tili.repositories.UserRepository;
import tn.esprit.tili.entities.TypeNotification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
public class ProjetServiceImpl implements IProjetService {

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private IHistoriqueService historiqueService;

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
        // Notify the creator (Responsable)
        notificationService.createNotification(
                responsable,
                "Projet créé",
                "Vous avez créé le projet: " + projet.getNom(),
                "INFO");

        // If the creator is a Consultant, notify the ADMIN (Responsable TILI)
        if (responsable.getRole() == TypeRole.CONSULTANT) {
            // Find admin(s) - assuming there's at least one user with role RESPONSABLE
            List<User> admins = userRepository.findByRole(TypeRole.RESPONSABLE);
            for (User admin : admins) {
                notificationService.createNotification(
                        admin,
                        "Nouvelle demande de projet",
                        "Le consultant " + responsable.getPrenom() + " " + responsable.getNom() +
                                " a fait une demande pour le projet: " + projet.getNom(),
                        "PROJET");
            }
        }

        System.out.println("✅ Projet créé ID: " + saved.getId());

        // Log to historique
        historiqueService.logAction(responsable, TypeAction.CREATION, "PROJET", saved.getId(),
                "Création du projet: " + projet.getNom());

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
    public Projet updateProjet(int id, Projet projetDetails, int userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return projetRepository.findById(id).map(projet -> {
            // Vérification des droits: Seul le responsable du projet ou le Responsable TILI
            // peut modifier
            if (currentUser.getRole() != TypeRole.RESPONSABLE &&
                    projet.getResponsable().getIdUser() != userId) {
                throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce projet");
            }

            projet.setNom(projetDetails.getNom());
            projet.setDescription(projetDetails.getDescription());
            projet.setObjectifs(projetDetails.getObjectifs());
            projet.setBudget(projetDetails.getBudget());
            projet.setDateDebut(projetDetails.getDateDebut());
            projet.setDateFinPrevue(projetDetails.getDateFinPrevue());
            projet.setDateFinReelle(projetDetails.getDateFinReelle());
            projet.setPourcentageAvancement(projetDetails.getPourcentageAvancement());

            // Mettre à jour le responsable si fourni (Seul le RESPONSABLE TILI peut changer
            // le responsable d'un projet)
            if (projetDetails.getResponsable() != null && projetDetails.getResponsable().getIdUser() != 0) {
                if (currentUser.getRole() == TypeRole.RESPONSABLE) {
                    User newResponsable = userRepository.findById(projetDetails.getResponsable().getIdUser())
                            .orElseThrow(() -> new RuntimeException("Responsable non trouvé"));
                    projet.setResponsable(newResponsable);
                }
            }

            Projet saved = projetRepository.save(projet);

            // Log to historique
            historiqueService.logAction(currentUser, TypeAction.MODIFICATION, "PROJET", saved.getId(),
                    "Modification du projet: " + saved.getNom());

            return saved;
        }).orElseThrow(() -> new RuntimeException("Projet non trouvé"));
    }

    @Override
    @Transactional
    public void deleteProjet(int id, int userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Projet projet = getProjetById(id);

        // Vérification des droits
        if (currentUser.getRole() != TypeRole.RESPONSABLE &&
                projet.getResponsable().getIdUser() != userId) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer ce projet");
        }

        // Soft delete: changer le statut
        projet.setStatut(StatutProjet.ANNULE);
        projetRepository.save(projet);

        // Log to historique
        historiqueService.logAction(currentUser, TypeAction.SUPPRESSION, "PROJET", projet.getId(),
                "Suppression du projet: " + projet.getNom());

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
        notificationService.notifyProjetAssignment(user, projet.getNom());
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

        Projet saved = projetRepository.save(projet);

        // Notification aux membres
        notificationService.notifyProjetUpdate(
                projetId,
                "Le statut du projet '" + projet.getNom() + "' a été mis à jour: " + statut.name());

        return saved;
    }

    @Override
    @Transactional
    public Projet updateAvancement(int projetId, int pourcentage) {
        if (pourcentage < 0 || pourcentage > 100) {
            throw new RuntimeException("Le pourcentage doit être entre 0 et 100");
        }

        Projet projet = getProjetById(projetId);
        int ancienPourcentage = projet.getPourcentageAvancement();
        projet.setPourcentageAvancement(pourcentage);

        // Si 100%, marquer comme terminé si ce n'est pas déjà fait
        if (pourcentage == 100 && projet.getStatut() != StatutProjet.CLOTURE) {
            projet.setStatut(StatutProjet.CLOTURE);
            projet.setDateFinReelle(java.time.LocalDate.now());
        }

        Projet saved = projetRepository.save(projet);

        // Notification aux membres si changement significatif (ex: tous les 10% ou vers
        // 100%)
        if (pourcentage == 100 || Math.abs(pourcentage - ancienPourcentage) >= 10) {
            notificationService.notifyProjetUpdate(
                    projetId,
                    "L'avancement du projet '" + projet.getNom() + "' est maintenant de " + pourcentage + "%");
        }

        return saved;
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
        return projetRepository.findByStatut(StatutProjet.PLANIFIE);
    }

    @Override
    @Transactional
    public Projet createProjectRequest(Map<String, Object> requestData) {
        String titre = (String) requestData.get("titre");
        String description = (String) requestData.get("description");

        @SuppressWarnings("unchecked")
        Map<String, Object> demandeurData = (Map<String, Object>) requestData.get("demandeur");
        int demandeurId = (int) demandeurData.get("idUser");

        User demandeur = userRepository.findById(demandeurId)
                .orElseThrow(() -> new RuntimeException("Demandeur non trouvé"));

        Projet projet = Projet.builder()
                .nom(titre)
                .description(description)
                .responsable(demandeur)
                .statut(StatutProjet.DEMANDE_EN_ATTENTE)
                .pourcentageAvancement(0)
                .build();

        Projet saved = projetRepository.save(projet);

        // Notifier les admins
        List<User> admins = userRepository.findByRole(TypeRole.RESPONSABLE);
        for (User admin : admins) {
            notificationService.createNotification(
                    admin,
                    "Nouvelle Demande de Projet",
                    "Le consultant " + demandeur.getNomComplet() + " a soumis une nouvelle demande de projet : "
                            + titre,
                    TypeNotification.PROJET.name());
        }

        return saved;
    }

    @Override
    public List<Projet> getAllProjectRequests() {
        return projetRepository.findByStatut(StatutProjet.DEMANDE_EN_ATTENTE);
    }

    @Override
    @Transactional
    public Projet acceptProjectRequest(int requestId) {
        Projet projet = projetRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (projet.getStatut() != StatutProjet.DEMANDE_EN_ATTENTE) {
            throw new RuntimeException("Cette demande a déjà été traitée");
        }

        // 1. Changer le statut du projet
        projet.setStatut(StatutProjet.ACTIF);

        // 2. Promouvoir le consultant en Chef de Projet si nécessaire
        User responsable = projet.getResponsable();
        if (responsable.getRole() == TypeRole.CONSULTANT) {
            responsable.setRole(TypeRole.CHEF_PROJET); // ou CHEF_DE_PROJET selon l'enum
            userRepository.save(responsable);
        }

        Projet saved = projetRepository.save(projet);

        // 3. Notifier l'utilisateur
        notificationService.createNotification(
                responsable,
                "Demande de Projet Acceptee",
                "Votre demande pour le projet '" + projet.getNom()
                        + "' a été acceptée. Vous avez été promu Chef de Projet.",
                TypeNotification.PROJET.name());

        return saved;
    }

    @Override
    @Transactional
    public void rejectProjectRequest(int requestId) {
        Projet projet = projetRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        User responsable = projet.getResponsable();
        String projetNom = projet.getNom();

        projetRepository.delete(projet);

        // Notifier l'utilisateur
        notificationService.createNotification(
                responsable,
                "Demande de Projet Refusee",
                "Désolé, votre demande pour le projet '" + projetNom + "' a été refusée.",
                TypeNotification.PROJET.name());
    }
}