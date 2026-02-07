package tn.esprit.tili.services;

import tn.esprit.tili.entities.User;
import java.util.List;

public interface IUserService {
    // ✅ SEULEMENT 7 méthodes
    User createUser(User user);

    User updateUser(int id, User userDetails);

    List<User> getAllUsers();

    User getUserById(int id);

    void demanderPromotion(int userId, String nomProjet);

    void approuverPromotion(int userId, int responsableId);

    void desactiverUser(int id);

    void activerUser(int id);

    void deleteUser(int id);

    void changePassword(int id, String oldPassword, String newPassword);
}