package tn.esprit.tili.services;

import tn.esprit.tili.entities.*;
import tn.esprit.tili.repositories.DocumentRepository;
import tn.esprit.tili.repositories.UserRepository;
import tn.esprit.tili.repositories.ProjetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DocumentServiceImpl implements IDocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private IHistoriqueService historiqueService;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public Document uploadDocument(Document document, MultipartFile file, int uploaderId) {
        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));

        try {
            // Creer le repertoire si necessaire
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generer un nom unique
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String filename = UUID.randomUUID().toString() + extension;

            // Sauvegarder le fichier
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Configurer le document
            document.setCheminFichier(filePath.toString());
            document.setTaille(file.getSize());
            document.setUploader(uploader);
            document.setDateUpload(LocalDateTime.now());

            Document savedDoc = documentRepository.save(document);

            // Notification
            if (savedDoc.getProjet() != null) {
                notificationService.notifyNewDocumentToProjectMembers(uploader, savedDoc.getTitre(),
                        savedDoc.getProjet().getId());
            } else {
                notificationService.notifyNewDocument(uploader, savedDoc.getTitre());
            }

            // Log to historique
            historiqueService.logAction(uploader, TypeAction.TELEVERSEMENT, "DOCUMENT", savedDoc.getId(),
                    "Upload du document: " + savedDoc.getTitre());

            return savedDoc;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'upload: " + e.getMessage());
        }
    }

    @Override
    public Document createDocument(Document document, int uploaderId) {
        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));

        document.setUploader(uploader);
        document.setDateUpload(LocalDateTime.now());

        Document saved = documentRepository.save(document);

        // Log to historique
        historiqueService.logAction(uploader, TypeAction.CREATION, "DOCUMENT", saved.getId(),
                "Création du document: " + saved.getTitre());

        return saved;
    }

    @Override
    public Document getDocumentById(int id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document non trouve"));
    }

    @Override
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @Override
    public Document updateDocument(int id, Document documentDetails, int userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return documentRepository.findById(id).map(document -> {
            // Vérification des droits
            if (currentUser.getRole() != TypeRole.RESPONSABLE &&
                    document.getUploader().getIdUser() != userId) {
                throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce document");
            }

            document.setTitre(documentDetails.getTitre());
            document.setDescription(documentDetails.getDescription());
            document.setType(documentDetails.getType());
            document.setIsPublic(documentDetails.getIsPublic());
            document.setDateModification(LocalDateTime.now());

            if (documentDetails.getProjet() != null && documentDetails.getProjet().getId() != 0) {
                Projet projet = projetRepository.findById(documentDetails.getProjet().getId())
                        .orElseThrow(() -> new RuntimeException("Projet non trouve"));
                document.setProjet(projet);
            }

            Document saved = documentRepository.save(document);

            // Log to historique
            historiqueService.logAction(currentUser, TypeAction.MODIFICATION, "DOCUMENT", saved.getId(),
                    "Modification du document: " + saved.getTitre());

            return saved;
        }).orElseThrow(() -> new RuntimeException("Document non trouve"));
    }

    @Override
    public void deleteDocument(int id, int userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Document document = getDocumentById(id);

        // Vérification des droits
        if (currentUser.getRole() != TypeRole.RESPONSABLE &&
                document.getUploader().getIdUser() != userId) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer ce document");
        }

        // Supprimer le fichier physique
        try {
            if (document.getCheminFichier() != null) {
                Path filePath = Paths.get(document.getCheminFichier());
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            System.err.println("Erreur suppression fichier: " + e.getMessage());
        }

        // Log to historique
        historiqueService.logAction(currentUser, TypeAction.SUPPRESSION, "DOCUMENT", document.getId(),
                "Suppression du document: " + document.getTitre());

        documentRepository.deleteById(id);
    }

    @Override
    public List<Document> getDocumentsByType(TypeDocument type) {
        return documentRepository.findByType(type);
    }

    @Override
    public List<Document> getDocumentsByProjet(int projetId) {
        return documentRepository.findByProjetId(projetId);
    }

    @Override
    public List<Document> getDocumentsByUploader(int uploaderId) {
        return documentRepository.findByUploaderIdUser(uploaderId);
    }

    @Override
    public List<Document> getDocumentsPublics() {
        return documentRepository.findByIsPublicTrue();
    }

    @Override
    public List<Document> searchDocuments(String keyword) {
        return documentRepository.searchByKeyword(keyword);
    }
}
