package tn.esprit.tili.controllers;

import tn.esprit.tili.entities.*;
import tn.esprit.tili.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")

public class DashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private ReunionRepository reunionRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Totaux
        stats.put("totalUsers", userRepository.count());
        stats.put("totalDocuments", documentRepository.count());
        stats.put("totalProjets", projetRepository.count());
        stats.put("totalReunions", reunionRepository.count());

        // Projets actifs (pas clotures ni annules)
        long projetsActifs = projetRepository.findProjetsActifs().size();
        stats.put("projetsActifs", projetsActifs);

        // Reunions a venir
        long reunionsAVenir = reunionRepository.countByStatut(StatutReunion.PLANIFIEE);
        stats.put("reunionsAVenir", reunionsAVenir);

        // Documents par type
        List<Map<String, Object>> documentsByType = new ArrayList<>();
        for (TypeDocument type : TypeDocument.values()) {
            long count = documentRepository.findByType(type).size();
            if (count > 0) {
                documentsByType.add(Map.of("type", type.name(), "count", count));
            }
        }
        stats.put("documentsByType", documentsByType);

        // Projets par statut
        List<Map<String, Object>> projetsByStatut = new ArrayList<>();
        for (StatutProjet statut : StatutProjet.values()) {
            long count = projetRepository.findByStatut(statut).size();
            if (count > 0) {
                projetsByStatut.add(Map.of("statut", statut.name(), "count", count));
            }
        }
        stats.put("projetsByStatut", projetsByStatut);

        // Utilisateurs par role
        List<Map<String, Object>> usersByRole = new ArrayList<>();
        for (TypeRole role : TypeRole.values()) {
            long count = userRepository.findByRole(role).size();
            if (count > 0) {
                usersByRole.add(Map.of("role", role.name(), "count", count));
            }
        }
        stats.put("usersByRole", usersByRole);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/projets-recents")
    public ResponseEntity<List<Projet>> getProjetsRecents() {
        List<Projet> projets = projetRepository.findAll();
        // Trier par date de creation decroissante et limiter a 5
        projets.sort((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()));
        if (projets.size() > 5) {
            projets = projets.subList(0, 5);
        }
        return ResponseEntity.ok(projets);
    }

    @GetMapping("/reunions-a-venir")
    public ResponseEntity<List<Reunion>> getReunionsAVenir() {
        List<Reunion> reunions = reunionRepository.findByStatut(StatutReunion.PLANIFIEE);
        // Trier par date de debut croissante et limiter a 5
        reunions.sort((r1, r2) -> r1.getDateDebut().compareTo(r2.getDateDebut()));
        if (reunions.size() > 5) {
            reunions = reunions.subList(0, 5);
        }
        return ResponseEntity.ok(reunions);
    }

    @GetMapping("/documents-recents")
    public ResponseEntity<List<Document>> getDocumentsRecents() {
        List<Document> documents = documentRepository.findAll();
        // Trier par date d'upload decroissante et limiter a 5
        documents.sort((d1, d2) -> d2.getDateUpload().compareTo(d1.getDateUpload()));
        if (documents.size() > 5) {
            documents = documents.subList(0, 5);
        }
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/projets-en-retard")
    public ResponseEntity<List<Projet>> getProjetsEnRetard() {
        return ResponseEntity.ok(projetRepository.findProjetsEnRetard());
    }
}
