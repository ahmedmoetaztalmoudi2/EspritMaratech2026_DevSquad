package tn.esprit.tili.services;

import tn.esprit.tili.entities.User;
import tn.esprit.tili.entities.TypeRole;
import tn.esprit.tili.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements IUserService {

    @Autowired
    private UserRepository userRepository;

    // ✅ SEULEMENT 3 emails pour responsable
    private static final String[] EMAILS_RESPONSABLES = {
            "awadhiaziz2@gmail.com",
            "admin@tili.tn",
            "responsable@tili.tn"
    };

    @Override
    public User createUser(User user) {
        // Vérifier email unique
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // Déterminer rôle
        for (String emailResponsable : EMAILS_RESPONSABLES) {
            if (user.getEmail().equalsIgnoreCase(emailResponsable)) {
                user.setRole(TypeRole.RESPONSABLE);
                break;
            }
        }

        // Par défaut MEMBRE_ACTIF (déjà dans l'entité)
        user.setDateInscription(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Override
    public User updateUser(int id, User userDetails) {
        User user = getUserById(id);

        if (userDetails.getNom() != null)
            user.setNom(userDetails.getNom());
        if (userDetails.getPrenom() != null)
            user.setPrenom(userDetails.getPrenom());
        if (userDetails.getEmail() != null)
            user.setEmail(userDetails.getEmail());
        if (userDetails.getTel() != null)
            user.setTel(userDetails.getTel());
        if (userDetails.getRole() != null)
            user.setRole(userDetails.getRole());

        // Handle dateNaissance if provided (assuming User entity has getter/setter)
        if (userDetails.getDateNaissance() != null)
            user.setDateNaissance(userDetails.getDateNaissance());
        if (userDetails.getSexe() != null)
            user.setSexe(userDetails.getSexe());

        return userRepository.saveAndFlush(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(int id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    @Override
    public void demanderPromotion(int userId, String nomProjet) {
        User user = getUserById(userId);

        if (user.getRole() != TypeRole.MEMBRE_ACTIF || user.getDemandePromotion()) {
            throw new RuntimeException("Impossible de demander promotion");
        }

        if (nomProjet == null || nomProjet.trim().isEmpty()) {
            throw new RuntimeException("Nom du projet requis");
        }

        user.demanderPromotion(nomProjet);
        userRepository.save(user);
    }

    @Override
    public void approuverPromotion(int userId, int responsableId) {
        User responsable = getUserById(responsableId);
        User user = getUserById(userId);

        // Vérifier que l'approbateur est RESPONSABLE
        if (responsable.getRole() != TypeRole.RESPONSABLE) {
            throw new RuntimeException("Seul un RESPONSABLE peut approuver");
        }

        // Vérifier que l'utilisateur a une demande
        if (!user.getDemandePromotion()) {
            throw new RuntimeException("Pas de demande en cours");
        }

        user.promouvoirChefDeProjet();
        userRepository.save(user);
    }

    @Override
    public void desactiverUser(int id) {
        User user = getUserById(id);
        user.setActif(false);
        userRepository.saveAndFlush(user);
    }

    @Override
    public void activerUser(int id) {
        User user = getUserById(id);
        user.setActif(true);
        userRepository.saveAndFlush(user);
    }

    @Override
    public void deleteUser(int id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Utilisateur non trouvé");
        }
        userRepository.deleteById(id);
    }
}