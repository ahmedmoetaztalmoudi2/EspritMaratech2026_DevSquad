package tn.esprit.tili.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.tili.entities.Historique;
import tn.esprit.tili.entities.TypeRole;
import tn.esprit.tili.entities.User;
import tn.esprit.tili.repositories.UserRepository;
import tn.esprit.tili.services.IHistoriqueService;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/historique")
public class HistoriqueController {

    @Autowired
    private IHistoriqueService historiqueService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Historique>> getHistorique(@RequestParam("userId") int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == TypeRole.RESPONSABLE) {
            return ResponseEntity.ok(historiqueService.getAllHistorique());
        } else if (user.getRole() == TypeRole.CHEF_DE_PROJET || user.getRole() == TypeRole.CHEF_PROJET) {
            return ResponseEntity.ok(historiqueService.getHistoriqueForChefProjet(user.getIdUser()));
        }

        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Historique>> getAllHistorique() {
        return ResponseEntity.ok(historiqueService.getAllHistorique());
    }
}
