package tn.esprit.tili.controllers;

import tn.esprit.tili.entities.User;
import tn.esprit.tili.entities.TypeRole;
import tn.esprit.tili.repositories.UserRepository;
import tn.esprit.tili.services.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")

public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IUserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email et mot de passe requis"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Email ou mot de passe incorrect"));
        }

        User user = userOpt.get();

        // Verifier que l'utilisateur est actif
        if (Boolean.FALSE.equals(user.getActif())) {
            return ResponseEntity.status(403).body(Map.of("error", "your account was blocked"));
        }

        // Authentification via Spring Security
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Email ou mot de passe incorrect"));
        }

        // Generer un token simple (en production, utiliser JWT)
        String token = UUID.randomUUID().toString();

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getIdUser(),
                        "idUser", user.getIdUser(),
                        "nom", user.getNom(),
                        "prenom", user.getPrenom(),
                        "email", user.getEmail(),
                        "telephone", user.getTel() != null ? user.getTel() : "",
                        "role", user.getRole().name(),
                        "actif", user.getActif(),
                        "dateInscription",
                        user.getDateInscription() != null ? user.getDateInscription().toString() : ""),
                "message", "Connexion reussie"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        System.out.println("Register request received for: " + user.getEmail());
        try {
            // Par defaut, nouveau utilisateur = CONSULTANT
            if (user.getRole() == null) {
                user.setRole(TypeRole.CONSULTANT);
            }

            User created = userService.createUser(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Inscription reussie",
                    "user", Map.of(
                            "id", created.getIdUser(),
                            "nom", created.getNom(),
                            "prenom", created.getPrenom(),
                            "email", created.getEmail(),
                            "role", created.getRole().name())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Le logout est geré côté client (suppression du token)
        return ResponseEntity.ok(Map.of("message", "Deconnexion reussie"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        // En production, decoder le JWT et recuperer l'utilisateur
        // Pour le dev, retourner un message
        return ResponseEntity.ok(Map.of("message", "Endpoint pour recuperer l'utilisateur actuel"));
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> data) {
        try {
            User user = userService.loginOrRegisterGoogle(data);

            if (Boolean.FALSE.equals(user.getActif())) {
                return ResponseEntity.status(403).body(Map.of("error", "Votre compte est bloqué"));
            }

            String token = UUID.randomUUID().toString();

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", Map.of(
                            "id", user.getIdUser(),
                            "idUser", user.getIdUser(),
                            "nom", user.getNom(),
                            "prenom", user.getPrenom(),
                            "email", user.getEmail(),
                            "telephone", user.getTel() != null ? user.getTel() : "",
                            "role", user.getRole().name(),
                            "photoProfil", user.getPhotoProfil() != null ? user.getPhotoProfil() : "",
                            "actif", user.getActif(),
                            "dateInscription",
                            user.getDateInscription() != null ? user.getDateInscription().toString() : ""),
                    "message", "Connexion Google réussie"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth() {
        return ResponseEntity.ok(Map.of("message", "API Auth fonctionne"));
    }
}
