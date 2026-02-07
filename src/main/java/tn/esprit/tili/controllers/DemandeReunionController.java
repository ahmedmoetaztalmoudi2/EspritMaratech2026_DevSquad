package tn.esprit.tili.controllers;

import tn.esprit.tili.entities.DemandeReunion;
import tn.esprit.tili.entities.Reunion;
import tn.esprit.tili.services.IDemandeReunionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/demandes-reunion")
public class DemandeReunionController {

    @Autowired
    private IDemandeReunionService demandeReunionService;

    @PostMapping
    public ResponseEntity<?> createDemande(
            @RequestBody DemandeReunion demande,
            @RequestParam int demandeurId,
            @RequestParam int destinataireId) {
        try {
            DemandeReunion created = demandeReunionService.createDemande(demande, demandeurId, destinataireId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<DemandeReunion>> getAllDemandes() {
        return ResponseEntity.ok(demandeReunionService.getAllDemandes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDemande(@PathVariable int id) {
        try {
            return ResponseEntity.ok(demandeReunionService.getDemandeById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDemande(@PathVariable int id) {
        try {
            demandeReunionService.deleteDemande(id);
            return ResponseEntity.ok(Map.of("message", "Demande supprimee"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Demandes par demandeur (consultant)
    @GetMapping("/demandeur/{demandeurId}")
    public ResponseEntity<List<DemandeReunion>> getDemandesByDemandeur(@PathVariable int demandeurId) {
        return ResponseEntity.ok(demandeReunionService.getDemandesByDemandeur(demandeurId));
    }

    // Demandes par destinataire (chef de projet)
    @GetMapping("/destinataire/{destinataireId}")
    public ResponseEntity<List<DemandeReunion>> getDemandesByDestinataire(@PathVariable int destinataireId) {
        return ResponseEntity.ok(demandeReunionService.getDemandesByDestinataire(destinataireId));
    }

    // Demandes en attente par destinataire
    @GetMapping("/destinataire/{destinataireId}/en-attente")
    public ResponseEntity<List<DemandeReunion>> getDemandesEnAttente(@PathVariable int destinataireId) {
        return ResponseEntity.ok(demandeReunionService.getDemandesEnAttenteByDestinataire(destinataireId));
    }

    // Compter les demandes en attente
    @GetMapping("/destinataire/{destinataireId}/count")
    public ResponseEntity<Map<String, Long>> countDemandesEnAttente(@PathVariable int destinataireId) {
        long count = demandeReunionService.countDemandesEnAttente(destinataireId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // Accepter une demande
    @PatchMapping("/{id}/accepter")
    public ResponseEntity<?> accepterDemande(
            @PathVariable int id,
            @RequestParam int chefProjetId) {
        try {
            DemandeReunion demande = demandeReunionService.accepterDemande(id, chefProjetId);
            return ResponseEntity.ok(Map.of(
                    "message", "Demande acceptee",
                    "demande", demande));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Refuser une demande
    @PatchMapping("/{id}/refuser")
    public ResponseEntity<?> refuserDemande(
            @PathVariable int id,
            @RequestParam int chefProjetId,
            @RequestBody Map<String, String> body) {
        try {
            String motifRefus = body.get("motifRefus");
            DemandeReunion demande = demandeReunionService.refuserDemande(id, chefProjetId, motifRefus);
            return ResponseEntity.ok(Map.of(
                    "message", "Demande refusee",
                    "demande", demande));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/create-reunion")
    public ResponseEntity<?> createReunionForDemande(
            @PathVariable int id,
            @RequestBody Reunion reunion) {
        try {
            Reunion created = demandeReunionService.createReunionForDemande(id, reunion);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
