package tn.esprit.tili.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.esprit.tili.entities.*;
import tn.esprit.tili.repositories.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HistoriqueServiceImpl implements IHistoriqueService {

    @Autowired
    private HistoriqueRepository historiqueRepository;

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private ReunionRepository reunionRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void logAction(User user, TypeAction typeAction, String entiteType, int entiteId, String description) {
        Historique historique = Historique.builder()
                .utilisateur(user)
                .typeAction(typeAction)
                .entiteType(entiteType)
                .entiteId(entiteId)
                .description(description)
                .dateHeure(LocalDateTime.now())
                .build();
        historiqueRepository.save(historique);
    }

    @Override
    public List<Historique> getAllHistorique() {
        return historiqueRepository.findAllByOrderByDateHeureDesc();
    }

    @Override
    public List<Historique> getHistoriqueForChefProjet(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Get IDs of managed entities
        List<Integer> projectIds = projetRepository.findByResponsable(user).stream()
                .map(Projet::getId)
                .collect(Collectors.toList());

        List<Integer> meetingIds = reunionRepository.findByOrganisateur(user).stream()
                .map(Reunion::getId)
                .collect(Collectors.toList());

        List<Integer> documentIds = documentRepository.findByUploaderIdUser(userId).stream() // Assuming this method
                                                                                             // exists and works with
                                                                                             // int
                .map(Document::getId)
                .collect(Collectors.toList());

        // 2. Query Historique for each type
        List<Historique> projectHistory = projectIds.isEmpty() ? new ArrayList<>()
                : historiqueRepository.findByEntiteTypeAndEntiteIdIn("PROJET", projectIds);

        List<Historique> meetingHistory = meetingIds.isEmpty() ? new ArrayList<>()
                : historiqueRepository.findByEntiteTypeAndEntiteIdIn("REUNION", meetingIds);

        List<Historique> documentHistory = documentIds.isEmpty() ? new ArrayList<>()
                : historiqueRepository.findByEntiteTypeAndEntiteIdIn("DOCUMENT", documentIds);

        // 3. Combine and sort
        List<Historique> fullHistory = new ArrayList<>();
        fullHistory.addAll(projectHistory);
        fullHistory.addAll(meetingHistory);
        fullHistory.addAll(documentHistory);

        fullHistory.sort(Comparator.comparing(Historique::getDateHeure).reversed());

        return fullHistory;
    }
}
