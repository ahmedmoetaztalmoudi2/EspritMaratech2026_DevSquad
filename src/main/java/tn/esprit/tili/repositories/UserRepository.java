package tn.esprit.tili.repositories;

import tn.esprit.tili.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // ✅ SEULEMENT 5 méthodes
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(tn.esprit.tili.entities.TypeRole role);

    List<User> findByDemandePromotionTrue();

    List<User> findByActifTrue();

}