package tn.esprit.tili.repositories;

import tn.esprit.tili.entities.Document;
import tn.esprit.tili.entities.TypeDocument;
import tn.esprit.tili.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {

        // Trouver par titre (recherche insensible à la casse)
        List<Document> findByTitreContainingIgnoreCase(String titre);

        // Trouver par type
        List<Document> findByType(TypeDocument type);

        // Trouver par uploader
        List<Document> findByUploader(User uploader);

        // Trouver par uploader ID
        List<Document> findByUploaderIdUser(int uploaderId);

        // Trouver par projet
        @Query("SELECT d FROM Document d WHERE d.projet.id = :projetId")
        List<Document> findByProjetId(@Param("projetId") int projetId);

        // Trouver par réunion
        @Query("SELECT d FROM Document d WHERE d.reunion.id = :reunionId")
        List<Document> findByReunionId(@Param("reunionId") int reunionId);

        // Documents publics
        List<Document> findByIsPublicTrue();

        // Documents récents (10 derniers)
        @Query("SELECT d FROM Document d ORDER BY d.dateUpload DESC LIMIT 10")
        List<Document> findTop10ByOrderByDateUploadDesc();

        // Recherche par mot-clé dans titre ou description
        @Query("SELECT d FROM Document d WHERE " +
                        "LOWER(d.titre) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(d.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
        List<Document> searchByKeyword(@Param("keyword") String keyword);

        // Documents par taille (supérieure à)
        @Query("SELECT d FROM Document d WHERE d.taille > :tailleMin")
        List<Document> findByTailleGreaterThan(@Param("tailleMin") Long tailleMin);

        // Documents entre deux dates
        @Query("SELECT d FROM Document d WHERE d.dateUpload BETWEEN :startDate AND :endDate")
        List<Document> findByDateUploadBetween(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);
}