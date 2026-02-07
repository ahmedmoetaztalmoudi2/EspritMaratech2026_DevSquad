// Role-based permissions constants
// TILI - Tunisia Inclusive Labor Institute

export const ROLES = {
    RESPONSABLE: 'RESPONSABLE',
    CHEF_PROJET: 'CHEF_PROJET',
    CONSULTANT: 'CONSULTANT',
};

export const ROLE_LABELS = {
    RESPONSABLE: 'Responsable',
    CHEF_PROJET: 'Chef de Projet',
    CONSULTANT: 'Consultant',
};

export const ROLE_COLORS = {
    RESPONSABLE: '#1e4a8d',
    CHEF_PROJET: '#3c7bb8',
    CONSULTANT: '#c9a227',
};

// Document Types
export const TYPE_DOCUMENT = {
    RAPPORT: 'RAPPORT',
    COMPTE_RENDU: 'COMPTE_RENDU',
    ADMINISTRATIF: 'ADMINISTRATIF',
    PROJET: 'PROJET',
    ETUDE: 'ETUDE',
    FORMATION: 'FORMATION',
};

export const TYPE_DOCUMENT_LABELS = {
    RAPPORT: 'Rapport',
    COMPTE_RENDU: 'Compte Rendu',
    ADMINISTRATIF: 'Administratif',
    PROJET: 'Document Projet',
    ETUDE: 'Étude',
    FORMATION: 'Formation',
};

export const TYPE_DOCUMENT_COLORS = {
    RAPPORT: '#1e4a8d',
    COMPTE_RENDU: '#10b981',
    ADMINISTRATIF: '#64748b',
    PROJET: '#7c3aed',
    ETUDE: '#3c7bb8',
    FORMATION: '#c9a227',
};

// Role-based document upload permissions
export const DOCUMENT_UPLOAD_PERMISSIONS = {
    RESPONSABLE: {
        canUpload: true,
        allowedTypes: Object.values(TYPE_DOCUMENT), // All types
        description: 'Tous types de documents',
    },
    CHEF_PROJET: {
        canUpload: true,
        allowedTypes: ['RAPPORT', 'COMPTE_RENDU', 'PROJET'],
        description: 'Rapports, comptes-rendus et documents projets',
    },
    CONSULTANT: {
        canUpload: true,
        allowedTypes: ['RAPPORT', 'ETUDE', 'FORMATION', 'COMPTE_RENDU'],
        description: 'Rapports, études, formations et comptes-rendus',
    },
};

// Project permissions - Chef Projet can only manage their own projects
export const PROJECT_PERMISSIONS = {
    RESPONSABLE: {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canAssign: true,
        ownOnly: false, // Can manage all projects
    },
    CHEF_PROJET: {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canAssign: true,
        ownOnly: true, // Can only manage projects they created
    },
    CONSULTANT: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        ownOnly: false,
    },
};

// Meeting permissions - Chef Projet can only manage their own meetings
export const MEETING_PERMISSIONS = {
    RESPONSABLE: {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canAddCompteRendu: true,
        ownOnly: false, // Can manage all meetings
    },
    CHEF_PROJET: {
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canAddCompteRendu: true,
        ownOnly: true, // Can only manage meetings they created
    },
    CONSULTANT: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAddCompteRendu: false,
        ownOnly: false,
    },
};

// User management permissions
export const USER_MANAGEMENT_PERMISSIONS = {
    RESPONSABLE: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canActivate: true,
    },
    CHEF_PROJET: {
        canView: false, // Cannot view users
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canActivate: false,
    },
    CONSULTANT: {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canActivate: false,
    },
};

// Meeting Status
export const STATUT_REUNION = {
    PLANIFIEE: 'PLANIFIEE',
    EN_COURS: 'EN_COURS',
    TERMINEE: 'TERMINEE',
    ANNULEE: 'ANNULEE',
};

export const STATUT_REUNION_LABELS = {
    PLANIFIEE: 'Planifiée',
    EN_COURS: 'En cours',
    TERMINEE: 'Terminée',
    ANNULEE: 'Annulée',
};

export const STATUT_REUNION_COLORS = {
    PLANIFIEE: '#3c7bb8',
    EN_COURS: '#c9a227',
    TERMINEE: '#10b981',
    ANNULEE: '#ef4444',
};

// Project Status
export const STATUT_PROJET = {
    PLANIFIE: 'PLANIFIE',
    ACTIF: 'ACTIF',
    EN_PAUSE: 'EN_PAUSE',
    CLOTURE: 'CLOTURE',
};

export const STATUT_PROJET_LABELS = {
    PLANIFIE: 'Planifié',
    ACTIF: 'Actif',
    EN_PAUSE: 'En pause',
    CLOTURE: 'Clôturé',
};

export const STATUT_PROJET_COLORS = {
    PLANIFIE: '#64748b',
    ACTIF: '#10b981',
    EN_PAUSE: '#c9a227',
    CLOTURE: '#1e4a8d',
};

// Notifications
export const TYPE_NOTIFICATION = {
    DOCUMENT: 'DOCUMENT',
    REUNION: 'REUNION',
    PROJET: 'PROJET',
    SYSTEME: 'SYSTEME',
};

export const TYPE_NOTIFICATION_LABELS = {
    DOCUMENT: 'Document',
    REUNION: 'Réunion',
    PROJET: 'Projet',
    SYSTEME: 'Système',
};

export const TYPE_NOTIFICATION_COLORS = {
    DOCUMENT: '#3c7bb8',
    REUNION: '#c9a227',
    PROJET: '#7c3aed',
    SYSTEME: '#64748b',
};

// Action Types for History
export const TYPE_ACTION = {
    CREATION: 'CREATION',
    MODIFICATION: 'MODIFICATION',
    SUPPRESSION: 'SUPPRESSION',
    CONSULTATION: 'CONSULTATION',
    TELECHARGEMENT: 'TELECHARGEMENT',
};

export const TYPE_ACTION_LABELS = {
    CREATION: 'Création',
    MODIFICATION: 'Modification',
    SUPPRESSION: 'Suppression',
    CONSULTATION: 'Consultation',
    TELECHARGEMENT: 'Téléchargement',
};

export const TYPE_ACTION_COLORS = {
    CREATION: '#10b981',
    MODIFICATION: '#3c7bb8',
    SUPPRESSION: '#ef4444',
    CONSULTATION: '#64748b',
    TELECHARGEMENT: '#c9a227',
};

// BackOffice Menu Items
export const BACKOFFICE_MENU_ITEMS = [
    { key: '/admin/dashboard', label: 'Tableau de bord', icon: 'DashboardOutlined' },
    { key: '/admin/users', label: 'Utilisateurs', icon: 'UserOutlined' },
    { key: '/admin/documents', label: 'Documents', icon: 'FileTextOutlined' },
    { key: '/admin/reunions', label: 'Réunions', icon: 'CalendarOutlined' },
    { key: '/admin/projets', label: 'Projets', icon: 'ProjectOutlined' },
    { key: '/admin/historique', label: 'Historique', icon: 'HistoryOutlined' },
];

// FrontOffice Menu Items
export const FRONTOFFICE_MENU_ITEMS = [
    { key: '/dashboard', label: 'Tableau de bord', icon: 'DashboardOutlined' },
    { key: '/mes-documents', label: 'Mes Documents', icon: 'FileTextOutlined' },
    { key: '/mes-projets', label: 'Mes Projets', icon: 'ProjectOutlined' },
    { key: '/mes-reunions', label: 'Mes Réunions', icon: 'CalendarOutlined' },
];
