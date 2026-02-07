package tn.esprit.tili.controllers;

import tn.esprit.tili.entities.User;
import tn.esprit.tili.entities.TypeRole;
import tn.esprit.tili.repositories.UserRepository;
import tn.esprit.tili.services.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")

public class UserController {

    @Autowired
    private IUserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User created = userService.createUser(user);
            return ResponseEntity.ok(Map.of(
                    "message", "Utilisateur cree",
                    "id", created.getIdUser(),
                    "role", created.getRole()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable int id) {
        try {
            return ResponseEntity.ok(userService.getUserById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable int id, @RequestBody User userDetails) {
        try {
            User updated = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        try {
            userService.deleteUser(id); // Hard delete
            return ResponseEntity.ok(Map.of("message", "Utilisateur supprime"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{userId}/demander-promotion")
    public ResponseEntity<?> demanderPromotion(
            @PathVariable int userId,
            @RequestBody Map<String, String> request) {
        try {
            String nomProjet = request.get("nomProjet");
            userService.demanderPromotion(userId, nomProjet);
            return ResponseEntity.ok(Map.of(
                    "message", "Demande envoyee",
                    "projet", nomProjet));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/demandes-promotion")
    public ResponseEntity<List<User>> getDemandesPromotion() {
        return ResponseEntity.ok(userRepository.findByDemandePromotionTrue());
    }

    @PutMapping("/{userId}/approuver/{responsableId}")
    public ResponseEntity<?> approuverPromotion(
            @PathVariable int userId,
            @PathVariable int responsableId) {
        try {
            userService.approuverPromotion(userId, responsableId);
            return ResponseEntity.ok(Map.of(
                    "message", "Promotion approuvee",
                    "nouveauRole", "CHEF_DE_PROJET"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable int id) {
        try {
            User user = userService.getUserById(id);
            boolean newStatus;
            if (Boolean.TRUE.equals(user.getActif())) {
                userService.desactiverUser(id);
                newStatus = false;
            } else {
                userService.activerUser(id);
                newStatus = true;
            }
            return ResponseEntity.ok(Map.of(
                    "message", "Statut modifie",
                    "actif", newStatus));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/desactiver")
    public ResponseEntity<?> desactiverUser(@PathVariable int id) {
        try {
            userService.desactiverUser(id);
            return ResponseEntity.ok(Map.of("message", "Utilisateur desactive"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/activer")
    public ResponseEntity<?> activerUser(@PathVariable int id) {
        try {
            userService.activerUser(id);
            return ResponseEntity.ok(Map.of("message", "Utilisateur active"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable TypeRole role) {
        return ResponseEntity.ok(userRepository.findByRole(role));
    }

    @GetMapping("/actifs")
    public ResponseEntity<List<User>> getActiveUsers() {
        return ResponseEntity.ok(userRepository.findByActifTrue());
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        return ResponseEntity.ok(Map.of("message", "API Users fonctionne"));
    }
}
