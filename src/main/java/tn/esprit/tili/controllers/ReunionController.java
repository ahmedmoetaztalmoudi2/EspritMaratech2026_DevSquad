package tn.esprit.tili.controllers;

import tn.esprit.tili.entities.Reunion;
import tn.esprit.tili.entities.StatutReunion;
import tn.esprit.tili.services.IReunionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reunions")

public class ReunionController {

    @Autowired
    private IReunionService reunionService;

    @PostMapping
    public ResponseEntity<?> createReunion(
            @RequestBody Reunion reunion,
            @RequestParam int organisateurId) {
        try {
            Reunion created = reunionService.createReunion(reunion, organisateurId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Reunion>> getAllReunions() {
        return ResponseEntity.ok(reunionService.getAllReunions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReunion(@PathVariable int id) {
        try {
            return ResponseEntity.ok(reunionService.getReunionById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReunion(@PathVariable int id, @RequestBody Reunion reunion,
            @RequestParam int userId) {
        try {
            return ResponseEntity.ok(reunionService.updateReunion(id, reunion, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReunion(@PathVariable int id, @RequestParam int userId) {
        try {
            reunionService.deleteReunion(id, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Reunion>> getReunionsByStatut(@PathVariable StatutReunion statut) {
        return ResponseEntity.ok(reunionService.getReunionsByStatut(statut));
    }

    @GetMapping("/organisateur/{organisateurId}")
    public ResponseEntity<?> getReunionsByOrganisateur(@PathVariable int organisateurId) {
        try {
            return ResponseEntity.ok(reunionService.getReunionsByOrganisateur(organisateurId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/projet/{projetId}")
    public ResponseEntity<List<Reunion>> getReunionsByProjet(@PathVariable int projetId) {
        return ResponseEntity.ok(reunionService.getReunionsByProjet(projetId));
    }

    @GetMapping("/participant/{userId}")
    public ResponseEntity<List<Reunion>> getReunionsByParticipant(@PathVariable int userId) {
        return ResponseEntity.ok(reunionService.getReunionsByParticipant(userId));
    }

    @GetMapping("/a-venir")
    public ResponseEntity<List<Reunion>> getReunionsAVenir() {
        return ResponseEntity.ok(reunionService.getReunionsAVenir());
    }

    @GetMapping("/aujourd-hui")
    public ResponseEntity<List<Reunion>> getReunionsDuJour() {
        return ResponseEntity.ok(reunionService.getReunionsDuJour());
    }

    @PostMapping("/{reunionId}/participants/{userId}")
    public ResponseEntity<?> addParticipant(@PathVariable int reunionId, @PathVariable int userId) {
        try {
            return ResponseEntity.ok(reunionService.addParticipant(reunionId, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{reunionId}/participants/{userId}")
    public ResponseEntity<?> removeParticipant(@PathVariable int reunionId, @PathVariable int userId) {
        try {
            return ResponseEntity.ok(reunionService.removeParticipant(reunionId, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<?> updateStatut(@PathVariable int id, @RequestParam StatutReunion statut) {
        try {
            return ResponseEntity.ok(reunionService.updateStatut(id, statut));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/compte-rendu")
    public ResponseEntity<?> addCompteRendu(@PathVariable int id, @RequestBody Map<String, String> body) {
        try {
            String compteRendu = body.get("compteRendu");
            return ResponseEntity.ok(reunionService.addCompteRendu(id, compteRendu));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Reunion>> searchReunions(@RequestParam String keyword) {
        return ResponseEntity.ok(reunionService.searchReunions(keyword));
    }
}
