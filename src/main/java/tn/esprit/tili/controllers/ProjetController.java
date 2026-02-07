package tn.esprit.tili.controllers;

import tn.esprit.tili.entities.Projet;
import tn.esprit.tili.entities.StatutProjet;
import tn.esprit.tili.services.IProjetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projets")

public class ProjetController {

    @Autowired
    private IProjetService projetService;

    @PostMapping
    public ResponseEntity<?> createProjet(
            @RequestBody Projet projet,
            @RequestParam int chefProjetId) {
        try {
            Projet created = projetService.createProjet(projet, chefProjetId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Projet>> getAllProjets() {
        return ResponseEntity.ok(projetService.getAllProjets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProjet(@PathVariable int id) {
        try {
            return ResponseEntity.ok(projetService.getProjetById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProjet(@PathVariable int id, @RequestBody Projet projet, @RequestParam int userId) {
        try {
            return ResponseEntity.ok(projetService.updateProjet(id, projet, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProjet(@PathVariable int id, @RequestParam int userId) {
        try {
            projetService.deleteProjet(id, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/chef/{chefProjetId}")
    public ResponseEntity<?> getProjetsByChefProjet(@PathVariable int chefProjetId) {
        try {
            return ResponseEntity.ok(projetService.getProjetsByChefProjet(chefProjetId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Projet>> getProjetsByStatut(@PathVariable StatutProjet statut) {
        return ResponseEntity.ok(projetService.getProjetsByStatut(statut));
    }

    @GetMapping("/membre/{userId}")
    public ResponseEntity<?> getProjetsByMembre(@PathVariable int userId) {
        try {
            return ResponseEntity.ok(projetService.getProjetsByMembre(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{projetId}/membres/{userId}")
    public ResponseEntity<?> addMembre(@PathVariable int projetId, @PathVariable int userId) {
        try {
            return ResponseEntity.ok(projetService.addMembre(projetId, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{projetId}/membres/{userId}")
    public ResponseEntity<?> removeMembre(@PathVariable int projetId, @PathVariable int userId) {
        try {
            return ResponseEntity.ok(projetService.removeMembre(projetId, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable int id, @RequestParam StatutProjet statut) {
        try {
            return ResponseEntity.ok(projetService.updateStatut(id, statut));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/avancement")
    public ResponseEntity<?> updateAvancement(@PathVariable int id, @RequestParam int pourcentage) {
        try {
            return ResponseEntity.ok(projetService.updateAvancement(id, pourcentage));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Projet>> searchProjets(@RequestParam String keyword) {
        return ResponseEntity.ok(projetService.searchProjets(keyword));
    }

    @GetMapping("/en-retard")
    public ResponseEntity<List<Projet>> getProjetsEnRetard() {
        return ResponseEntity.ok(projetService.getProjetsEnRetard());
    }

    @GetMapping("/a-venir")
    public ResponseEntity<List<Projet>> getProjetsAVenir() {
        return ResponseEntity.ok(projetService.getProjetsAVenir());
    }
}
