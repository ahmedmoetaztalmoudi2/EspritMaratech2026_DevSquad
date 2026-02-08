package tn.esprit.tili.services;

import tn.esprit.tili.entities.Reunion;
import tn.esprit.tili.repositories.ReunionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReunionReminderService {

    @Autowired
    private ReunionRepository reunionRepository;

    @Autowired
    private INotificationService notificationService;

    // Check every minute
    @Scheduled(fixedRate = 60000)
    public void checkOnlineReunionsWithoutLink() {
        LocalDateTime now = LocalDateTime.now();
        // Check meetings starting between 10 and 11 minutes from now
        LocalDateTime start = now.plusMinutes(9).plusSeconds(30);
        LocalDateTime end = now.plusMinutes(10).plusSeconds(30);

        // We search for "en ligne" in lieu (case insensitive handled by db usually, or
        // we pass lower case param)
        // Note: The repository query uses LOWER(r.lieu) LIKE %:lieu%
        // But JPQL syntax with % inside query string might be tricky depending on
        // hibernate version.
        // It's safer to use LIKE :lieuPattern and pass "%en ligne%"

        // Actually, let's trust the repository definition we just added.
        // Although the repository defined: LIKE %:lieu% which is NOT standard JPQL.
        // Standard is LIKE :lieu and parameter contains %.
        // Let me Fix the repository query first to be safe.

        List<Reunion> reunions = reunionRepository.findReunionsSansLienMeet(start, end, "en ligne");

        for (Reunion r : reunions) {
            notificationService.createNotification(
                    r.getOrganisateur(),
                    "Rappel : Lien de réunion manquant",
                    "Votre réunion '" + r.getTitre() + "' commence dans 10 minutes (" + r.getLieu()
                            + "). Merci d'ajouter le lien de la réunion.",
                    "REUNION");
        }
    }

    // Check for meetings starting in 15 minutes
    @Scheduled(fixedRate = 60000)
    public void notifyUpcomingMeetings() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.plusMinutes(14).plusSeconds(30);
        LocalDateTime end = now.plusMinutes(15).plusSeconds(30);

        List<Reunion> upcoming = reunionRepository.findReunionsAVenir(now); // We reuse the logic or filter manually
        // Actually, let's filter the list for those starting in the window
        for (Reunion r : upcoming) {
            if (r.getDateDebut().isAfter(start) && r.getDateDebut().isBefore(end)) {
                // Notify participants
                for (tn.esprit.tili.entities.User participant : r.getParticipants()) {
                    notificationService.notifyUpcomingReunion(r, participant);
                }
                // Also notify organizer if not already in participants
                if (!r.getParticipants().contains(r.getOrganisateur())) {
                    notificationService.notifyUpcomingReunion(r, r.getOrganisateur());
                }
            }
        }
    }
}
