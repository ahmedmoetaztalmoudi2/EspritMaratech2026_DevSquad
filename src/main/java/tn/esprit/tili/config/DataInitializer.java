package tn.esprit.tili.config;

import tn.esprit.tili.entities.TypeRole;
import tn.esprit.tili.entities.User;
import tn.esprit.tili.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository) {
        return args -> {
            String adminEmail = "arwabenamar2004@gmail.com";
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = new User();
                admin.setNom("Ben Amar");
                admin.setPrenom("Arwa");
                admin.setEmail(adminEmail);
                admin.setMotDePasse("arwa2004");
                admin.setRole(TypeRole.RESPONSABLE); // Admin role
                admin.setActif(true);
                admin.setDateInscription(LocalDateTime.now());
                admin.setTel("00000000");

                userRepository.save(admin);
                System.out.println("Admin user initialized: " + adminEmail);
            } else {
                System.out.println("Admin user already exists: " + adminEmail);
            }
        };
    }
}
