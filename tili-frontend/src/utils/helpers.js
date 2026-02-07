// Helper utility functions for TILI

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Date formatting
export const formatDate = (date) => {
    if (!date) return '-';
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return format(parsed, 'dd/MM/yyyy', { locale: fr });
};

export const formatDateTime = (date) => {
    if (!date) return '-';
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return format(parsed, "dd/MM/yyyy 'à' HH:mm", { locale: fr });
};

export const formatRelativeTime = (date) => {
    if (!date) return '-';
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(parsed, { addSuffix: true, locale: fr });
};

// File size formatting
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

// Get file extension
export const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
};

// Get file icon based on extension
export const getFileIcon = (filename) => {
    const ext = getFileExtension(filename);
    const iconMap = {
        pdf: 'FilePdfOutlined',
        doc: 'FileWordOutlined',
        docx: 'FileWordOutlined',
        xls: 'FileExcelOutlined',
        xlsx: 'FileExcelOutlined',
        ppt: 'FilePptOutlined',
        pptx: 'FilePptOutlined',
        jpg: 'FileImageOutlined',
        jpeg: 'FileImageOutlined',
        png: 'FileImageOutlined',
        gif: 'FileImageOutlined',
        zip: 'FileZipOutlined',
        rar: 'FileZipOutlined',
    };
    return iconMap[ext] || 'FileOutlined';
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

// Get initials from name
export const getInitials = (nom, prenom) => {
    const first = prenom ? prenom.charAt(0).toUpperCase() : '';
    const last = nom ? nom.charAt(0).toUpperCase() : '';
    return `${first}${last}`;
};

// Generate avatar color from name
export const getAvatarColor = (name) => {
    if (!name) return '#1e40af';
    const colors = [
        '#1e40af', '#7c3aed', '#db2777', '#dc2626',
        '#ea580c', '#ca8a04', '#16a34a', '#0891b2',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

// Check if user has required role
export const hasRole = (user, allowedRoles) => {
    if (!user || !user.role) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
};

// Check if user can access backoffice
export const canAccessBackoffice = (user) => {
    return hasRole(user, ['RESPONSABLE', 'CHEF_PROJET']);
};

// Percentage display
export const formatPercentage = (value) => {
    return `${Math.round(value || 0)}%`;
};

// Sort array by date (newest first)
export const sortByDateDesc = (array, dateField = 'dateCreation') => {
    return [...array].sort((a, b) => {
        const dateA = new Date(a[dateField]);
        const dateB = new Date(b[dateField]);
        return dateB - dateA;
    });
};
