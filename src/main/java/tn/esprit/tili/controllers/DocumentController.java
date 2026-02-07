package tn.esprit.tili.controllers;

import tn.esprit.tili.entities.Document;
import tn.esprit.tili.entities.TypeDocument;
import tn.esprit.tili.services.IDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")

public class DocumentController {

    @Autowired
    private IDocumentService documentService;

    @Autowired
    private tn.esprit.tili.repositories.ProjetRepository projetRepository;

    @PostMapping
    public ResponseEntity<?> createDocument(
            @RequestBody Document document,
            @RequestParam int uploaderId) {
        try {
            Document created = documentService.createDocument(document, uploaderId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("titre") String titre,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("type") TypeDocument type,
            @RequestParam(value = "isPublic", defaultValue = "false") boolean isPublic,
            @RequestParam(value = "projetId", required = false) Integer projetId,
            @RequestParam("uploaderId") int uploaderId) {
        try {
            Document document = Document.builder()
                    .titre(titre)
                    .description(description)
                    .type(type)
                    .isPublic(isPublic)
                    .build();

            if (projetId != null) {
                tn.esprit.tili.entities.Projet projet = projetRepository.findById(projetId)
                        .orElseThrow(() -> new RuntimeException("Projet non trouve"));
                document.setProjet(projet);
            }

            Document created = documentService.uploadDocument(document, file, uploaderId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Document>> getAllDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDocument(@PathVariable int id) {
        try {
            return ResponseEntity.ok(documentService.getDocumentById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDocument(@PathVariable int id, @RequestBody Document document,
            @RequestParam int userId) {
        try {
            return ResponseEntity.ok(documentService.updateDocument(id, document, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable int id, @RequestParam int userId) {
        try {
            documentService.deleteDocument(id, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Document>> getDocumentsByType(@PathVariable TypeDocument type) {
        return ResponseEntity.ok(documentService.getDocumentsByType(type));
    }

    @GetMapping("/projet/{projetId}")
    public ResponseEntity<List<Document>> getDocumentsByProjet(@PathVariable int projetId) {
        return ResponseEntity.ok(documentService.getDocumentsByProjet(projetId));
    }

    @GetMapping("/uploader/{uploaderId}")
    public ResponseEntity<List<Document>> getDocumentsByUploader(@PathVariable int uploaderId) {
        return ResponseEntity.ok(documentService.getDocumentsByUploader(uploaderId));
    }

    @GetMapping("/public")
    public ResponseEntity<List<Document>> getDocumentsPublics() {
        return ResponseEntity.ok(documentService.getDocumentsPublics());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Document>> searchDocuments(@RequestParam String keyword) {
        return ResponseEntity.ok(documentService.searchDocuments(keyword));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable int id) {
        try {
            Document document = documentService.getDocumentById(id);
            Path filePath = Paths.get(document.getCheminFichier());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Determine content type
                String contentType = "application/octet-stream";

                // Extract filename from path
                String filename = filePath.getFileName().toString();

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + document.getTitre() + getFileExtension(filename) + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private String getFileExtension(String filename) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf("."));
        }
        return "";
    }
}
