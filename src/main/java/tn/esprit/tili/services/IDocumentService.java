package tn.esprit.tili.services;

import tn.esprit.tili.entities.Document;
import tn.esprit.tili.entities.TypeDocument;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface IDocumentService {

    // CRUD
    Document uploadDocument(Document document, MultipartFile file, int uploaderId);

    Document createDocument(Document document, int uploaderId);

    Document getDocumentById(int id);

    List<Document> getAllDocuments();

    Document updateDocument(int id, Document documentDetails);

    void deleteDocument(int id);

    // Filtres
    List<Document> getDocumentsByType(TypeDocument type);

    List<Document> getDocumentsByProjet(int projetId);

    List<Document> getDocumentsByUploader(int uploaderId);

    List<Document> getDocumentsPublics();

    // Recherche
    List<Document> searchDocuments(String keyword);
}