package tn.esprit.tili.config;

import tn.esprit.tili.entities.TypeRole;
import tn.esprit.tili.entities.User;
import tn.esprit.tili.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "arwabenamar2004@gmail.com";
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = new User();
                admin.setNom("Ben Amar");
                admin.setPrenom("Arwa");
                admin.setEmail(adminEmail);
                admin.setMotDePasse(passwordEncoder.encode("arwa2004"));
                admin.setRole(TypeRole.RESPONSABLE); // Admin role
                admin.setActif(true);
                admin.setDateInscription(LocalDateTime.now());
                admin.setTel("00000000");

                userRepository.save(admin);
                System.out.println("Admin user initialized: " + adminEmail);
            } else {
                // Check if password needs migration (if not hashed)
                User admin = userRepository.findByEmail(adminEmail).get();
                if (admin.getMotDePasse() != null && !admin.getMotDePasse().startsWith("$2a$")) {
                    admin.setMotDePasse(passwordEncoder.encode("arwa2004"));
                    userRepository.save(admin);
                    System.out.println("Admin password migrated to hash");
                }
                System.out.println("Admin user already exists: " + adminEmail);
            }
        };
    }
}
