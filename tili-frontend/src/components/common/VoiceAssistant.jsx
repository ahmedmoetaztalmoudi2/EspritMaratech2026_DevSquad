import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FloatButton, message, Tooltip, Modal } from 'antd';
import { AudioOutlined, ExclamationCircleOutlined, ReadOutlined, FormOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { toggleDarkMode } from '../../redux/uiSlice';

const VoiceAssistant = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [isListening, setIsListening] = useState(false);
    const [isLogoutPending, setIsLogoutPending] = useState(false);
    const [isDictating, setIsDictating] = useState(false);
    const [isReadingContent, setIsReadingContent] = useState(false);
    const { isVoiceActive, isDarkMode } = useSelector((state) => state.ui);

    const recognitionRef = useRef(null);
    const modalRef = useRef(null);
    const messageShownRef = useRef(false);
    const activeFieldRef = useRef(null);

    const navigateRef = useRef(navigate);
    const isBackOfficeRef = useRef(location.pathname.startsWith('/admin'));
    const isLogoutPendingRef = useRef(isLogoutPending);
    const isDictatingRef = useRef(isDictating);
    const isReadingContentRef = useRef(isReadingContent);

    useEffect(() => {
        navigateRef.current = navigate;
        isBackOfficeRef.current = location.pathname.startsWith('/admin');
        isLogoutPendingRef.current = isLogoutPending;
        isDictatingRef.current = isDictating;
        isReadingContentRef.current = isReadingContent;
    }, [navigate, location.pathname, isLogoutPending, isDictating, isReadingContent]);

    const stopRecognitionCleanly = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.onend = null;
                recognitionRef.current.stop();
                recognitionRef.current = null;
            } catch (e) { }
        }
        setIsListening(false);
    };

    const startRecognition = useCallback(() => {
        if (!isVoiceActive || isReadingContentRef.current) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        if (!recognitionRef.current) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'fr-FR';
            recognition.continuous = true;
            recognition.interimResults = false;

            recognition.onstart = () => {
                setIsListening(true);
                if (!messageShownRef.current) {
                    message.info({ content: 'Assistant vocal prêt.', key: 'voice-msg', duration: 4 });
                    messageShownRef.current = true;
                }
            };

            recognition.onresult = (event) => {
                const lastResult = event.results[event.results.length - 1];
                if (lastResult.isFinal) {
                    processCommand(lastResult[0].transcript);
                }
            };

            recognition.onend = () => {
                if (isVoiceActive && !isReadingContentRef.current) {
                    setTimeout(() => {
                        if (isVoiceActive && !isReadingContentRef.current) {
                            try {
                                if (recognitionRef.current) recognitionRef.current.start();
                                else startRecognition();
                            } catch (e) { }
                        }
                    }, 200);
                } else {
                    setIsListening(false);
                }
            };

            recognitionRef.current = recognition;
        }

        try {
            recognitionRef.current.start();
        } catch (e) { }
    }, [isVoiceActive]);

    const speak = useCallback((text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            stopRecognitionCleanly();
            setIsReadingContent(true);

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';

            utterance.onend = () => {
                setIsReadingContent(false);
                if (isVoiceActive) {
                    setTimeout(() => startRecognition(), 300);
                }
            };

            utterance.onerror = () => {
                setIsReadingContent(false);
                if (isVoiceActive) startRecognition();
            };

            window.speechSynthesis.speak(utterance);
        }
    }, [isVoiceActive, startRecognition]);

    const readPage = useCallback(() => {
        const container = document.getElementById('main-content') || document.body;
        let textToRead = "Lecture du contenu principal. ";
        const processedElements = new Set();

        // 1. Page Title and Main Buttons (Header Priority)
        const mainTitle = container.querySelector('h1, h2, h3, .ant-typography-h1, .ant-typography-h2, .ant-typography-h3');
        if (mainTitle) {
            textToRead += `Page : ${mainTitle.innerText}. `;
            processedElements.add(mainTitle);
        }

        const mainButtons = container.querySelectorAll('.ant-btn-primary, button[style*="borderRadius: 8"]');
        mainButtons.forEach(btn => {
            if (btn.innerText && btn.innerText.length > 2) {
                textToRead += `Action disponible : ${btn.innerText}. `;
                processedElements.add(btn);
            }
        });

        // 2. Special case for Calendar View
        const calendarTitle = container.querySelector('h4, .ant-typography-h4');
        const isCalendarActive = container.querySelector('.ant-tabs-tab-active')?.innerText?.includes('Calendrier');

        if (isCalendarActive) {
            const monthName = calendarTitle?.innerText || "ce mois";
            textToRead += `Vue Calendrier active pour ${monthName}. `;

            const events = Array.from(container.querySelectorAll('div[style*="border-left"]'))
                .filter(el => el.querySelector('span.ant-typography-strong'));

            const now = new Date();
            let futureEventsCount = 0;
            let eventText = "";

            events.forEach((ev) => {
                const title = ev.querySelector('span.ant-typography-strong')?.innerText || "";
                const timeStr = ev.querySelector('.ant-tag')?.innerText || "";
                const dayCell = ev.closest('div[style*="min-height: 120"]');
                const dayNumber = dayCell?.querySelector('div[style*="font-size: 14"]')?.innerText;

                if (dayNumber) {
                    const todayDay = now.getDate();
                    const dayInt = parseInt(dayNumber);
                    if (dayInt >= todayDay) {
                        futureEventsCount++;
                        eventText += `Le ${dayInt} ${monthName} : ${title}${timeStr ? ' à ' + timeStr : ''}. `;
                    }
                }
            });

            if (futureEventsCount === 0) {
                textToRead += `Aucune réunion à venir prévue.`;
            } else {
                textToRead += `Vous avez ${futureEventsCount} réunions à venir : ${eventText}`;
            }

            message.success({ content: "Lecture du calendrier en cours...", key: 'read-msg' });
            speak(textToRead);
            return;
        }

        // 3. Statistic Elements (Cards & Banner Stats)
        const statCards = container.querySelectorAll('.ant-card');
        const statsArray = [];

        // Catch Banner stats (like in Welcome banner)
        const bannerStats = container.querySelectorAll('div[style*="textAlign: center"]');
        bannerStats.forEach(stat => {
            const countEl = stat.querySelector('h1, h2, h3, h4, .ant-typography');
            const labelEl = stat.querySelector('span, .ant-typography-secondary');
            if (countEl && labelEl && countEl.innerText.length < 5) {
                statsArray.push(`${countEl.innerText.trim()} ${labelEl.innerText.trim()}`);
                processedElements.add(countEl);
                processedElements.add(labelEl);
            }
        });

        statCards.forEach((card) => {
            const countEl = card.querySelector('h1, h2, h3, h4, .ant-typography-h1, .ant-typography-h2, .ant-typography-h3, .ant-typography-h4, b, strong');
            const labelEl = card.querySelector('.ant-typography-secondary, .ant-card-meta-title, .ant-card-meta-description');

            if (countEl && labelEl && !processedElements.has(countEl)) {
                const count = countEl.innerText.trim();
                const label = labelEl.innerText.trim();
                if (count.length < 10) {
                    statsArray.push(`${count} ${label}`);
                    processedElements.add(countEl);
                    processedElements.add(labelEl);
                }
            }
        });

        if (statsArray.length > 0) {
            textToRead += `${statsArray.join(', ')}. `;
        }

        // 4. Other Titles (Excluding those already read)
        const titles = container.querySelectorAll('h1, h2, h3, h4, .ant-card-head-title');
        titles.forEach(t => {
            if (!processedElements.has(t) && !t.closest('.ant-card-body')) {
                // For Ant Design card titles which might have icons/extra tags
                const titleText = t.innerText.replace(/Voir tout/g, '').trim();
                if (titleText && titleText.length > 2) {
                    textToRead += `Section : ${titleText}. `;
                    processedElements.add(t);
                }
            }
        });

        // 5. Tables
        const tables = container.querySelectorAll('.ant-table');
        tables.forEach((table, index) => {
            textToRead += `Tableau ${index + 1}. `;
            const headers = Array.from(table.querySelectorAll('.ant-table-thead th'))
                .map(th => th.innerText.trim())
                .filter(txt => txt && !txt.includes('Action'));

            const rows = table.querySelectorAll('.ant-table-tbody .ant-table-row');
            textToRead += `Contient ${rows.length} éléments. `;

            rows.forEach((row, rowIndex) => {
                textToRead += `Élément ${rowIndex + 1} : `;
                const cells = row.querySelectorAll('.ant-table-cell');
                cells.forEach((cell, cellIndex) => {
                    const header = headers[cellIndex];
                    const value = cell.innerText.trim();
                    if (value && header && header !== "Actions") {
                        textToRead += `${header} : ${value}. `;
                    } else if (value && !header) {
                        textToRead += `${value}. `;
                    }
                });
            });
        });

        // 6. Buttons and Links (Filter processed)
        const others = container.querySelectorAll('button:not(.ant-table-cell button), a:not(.ant-table-cell a), label');
        if (others.length > 0) {
            textToRead += "Interactions disponibles : ";
            others.forEach(el => {
                if (!processedElements.has(el)) {
                    const content = el.innerText || el.getAttribute('aria-label') || el.getAttribute('title');
                    if (content && content.length < 50) {
                        const role = el.tagName.toLowerCase() === 'button' ? 'Bouton' : el.tagName.toLowerCase() === 'a' ? 'Lien' : 'Champ';
                        textToRead += `${role} ${content}. `;
                    }
                }
            });
        }

        message.success({ content: "Lecture structurée en cours...", key: 'read-msg' });
        speak(textToRead);
    }, [speak]);

    const handleLogout = useCallback(() => {
        dispatch(logout());
        message.success({ content: 'Déconnexion réussie', key: 'logout-success' });
        navigateRef.current('/login');
        if (modalRef.current) modalRef.current.destroy();
        setIsLogoutPending(false);
    }, [dispatch]);

    const showLogoutConfirm = useCallback(() => {
        setIsLogoutPending(true);
        modalRef.current = Modal.confirm({
            title: 'Confirmer la déconnexion',
            icon: <ExclamationCircleOutlined />,
            content: 'Dites "Oui" pour confirmer ou "Annuler" pour rester.',
            okText: 'Oui',
            cancelText: 'Annuler',
            onOk: () => handleLogout(),
            onCancel: () => {
                setIsLogoutPending(false);
                message.info({ content: 'Déconnexion annulée', key: 'logout-msg' });
            },
        });
    }, [handleLogout]);

    const findAndInteract = useCallback((search, type = 'click') => {
        const searchText = search.toLowerCase().trim();
        const elements = document.querySelectorAll('button, a, input, textarea, select, .ant-select, .ant-switch, .ant-checkbox-input, [role="button"], .ant-tabs-tab');
        let found = false;

        const actionMapping = {
            'téléchargement': ['télécharger', 'download', 'export'],
            'lecture': ['voir', 'détails', 'lire'],
            'détails': ['voir', 'détails'],
            'supprimer': ['supprimer', 'delete'],
            'modifier': ['modifier', 'edit'],
            'sombre': ['sombre', 'dark'],
            'clair': ['clair', 'light'],
            'calendrier': ['calendrier', 'calendar'],
            'réunion': ['réunion', 'reunion', 'nouvelle réunion'],
            'nouveau': ['nouveau', 'nouvelle', 'ajouter', 'plus']
        };

        const searchTargets = actionMapping[searchText] || [searchText];

        for (const el of elements) {
            let associatedLabel = "";
            if (el.id) {
                const label = document.querySelector(`label[for="${el.id}"]`);
                if (label) associatedLabel = label.innerText.toLowerCase();
            }

            const content = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || el.placeholder || associatedLabel || '').toLowerCase();
            const sanitizedSearch = searchText.replace(/['"\\.\s]/g, '-');
            let hasIconMatch = false;
            try {
                if (sanitizedSearch && !sanitizedSearch.startsWith('-')) {
                    hasIconMatch = el.querySelector(`.anticon-${sanitizedSearch}`);
                }
            } catch (e) { }

            if ((content && searchTargets.some(target => content.includes(target))) || hasIconMatch) {
                if (type === 'focus') {
                    el.focus();
                    activeFieldRef.current = el;
                    setIsDictating(true);
                    message.success({ content: `Champ sélectionné.`, key: 'dictate-msg' });
                    speak(`Champ sélectionné. Je vous écoute.`);
                } else {
                    el.click();
                    message.success({ content: `Action : ${content || searchText}`, key: 'action-msg' });
                }
                found = true;
                break;
            }
        }
        return found;
    }, [speak]);

    const processCommand = useCallback((command) => {
        if (isReadingContentRef.current) return;

        const cmd = command.toLowerCase().trim().replace(/[.,!?]$/, "");
        console.log('Voice Command:', cmd);

        if (isDictatingRef.current && activeFieldRef.current) {
            if (cmd.includes('terminé') || cmd.includes('fin de dictée') || cmd.includes('valider')) {
                setIsDictating(false);
                message.success({ content: 'Dictée terminée', key: 'dictate-end' });
                speak('Dictée terminée.');
                return;
            }
            const currentVal = activeFieldRef.current.value || "";
            activeFieldRef.current.value = currentVal + (currentVal ? " " : "") + command;
            const event = new Event('input', { bubbles: true });
            activeFieldRef.current.dispatchEvent(event);
            return;
        }

        if (isLogoutPendingRef.current) {
            if (cmd.includes('oui') || cmd.includes('confirmer') || cmd.includes('valider')) {
                handleLogout();
                return;
            } else if (cmd.includes('non') || cmd.includes('annuler')) {
                if (modalRef.current) modalRef.current.destroy();
                setIsLogoutPending(false);
                message.info({ content: 'Déconnexion annulée', key: 'logout-msg' });
                return;
            }
        }

        if (cmd.includes('mode sombre') || cmd.includes('dark mode')) {
            if ((cmd.includes('activer') && !isDarkMode) || (cmd.includes('désactiver') && isDarkMode) || cmd.includes('sombre')) {
                dispatch(toggleDarkMode());
                return;
            }
        }

        if (cmd.includes('lire la page') || cmd.includes('lecture de page')) {
            readPage();
            return;
        }

        if (cmd.includes('sélectionne') || cmd.includes('choisir')) {
            const target = cmd.split(/sélectionne|choisir/)[1];
            if (target && findAndInteract(target, 'focus')) return;
        }

        if (cmd.includes('déconnexion') || cmd.includes('logout')) {
            showLogoutConfirm();
            return;
        }

        const navRoutes = {
            'utilisateurs': '/admin/users',
            'utilisateur': '/admin/users',
            'tableau de bord': isBackOfficeRef.current ? '/admin/dashboard' : '/dashboard',
            'dashboard': isBackOfficeRef.current ? '/admin/dashboard' : '/dashboard',
            'projet': isBackOfficeRef.current ? '/admin/projets' : '/mes-projets',
            'document': isBackOfficeRef.current ? '/admin/documents' : '/mes-documents',
            'réunion': isBackOfficeRef.current ? '/admin/reunions' : '/mes-reunions',
            'demande': isBackOfficeRef.current ? '/admin/demandes-reunion' : '/mes-reunions',
            'historique': isBackOfficeRef.current ? '/admin/historique' : '/dashboard',
            'profil': isBackOfficeRef.current ? '/admin/profil' : '/profil',
            'administration': '/admin',
            'connexion': '/login'
        };

        for (const [key, route] of Object.entries(navRoutes)) {
            if (cmd.includes(key)) {
                message.success({ content: `Navigation : ${key}`, key: 'nav-msg' });
                navigateRef.current(route);
                return;
            }
        }

        const actionKeywords = ['calendrier', 'liste', 'clique sur', 'ouvrir', 'valider', 'annuler', 'créer', 'nouveau', 'ajouter', 'enregistrer', 'supprimer', 'refuser', 'accepter', 'rechercher', 'télécharger', 'détails', 'voir', 'modifier'];
        for (const keyword of actionKeywords) {
            if (cmd.includes(keyword)) {
                const target = cmd.includes('clique sur') ? cmd.split('clique sur')[1] : keyword;
                if (findAndInteract(target)) return;
            }
        }

        if (findAndInteract(cmd)) return;
    }, [handleLogout, showLogoutConfirm, findAndInteract, readPage, dispatch, isDarkMode, speak]);

    useEffect(() => {
        if (!isVoiceActive) {
            stopRecognitionCleanly();
            window.speechSynthesis.cancel();
            setIsReadingContent(false);
            messageShownRef.current = false;
            return;
        }

        startRecognition();

        return () => {
            if (!isVoiceActive) stopRecognitionCleanly();
        };
    }, [isVoiceActive, startRecognition]);

    if (!isVoiceActive) return null;

    return (
        <Tooltip title={isReadingContent ? "Assistant en train de lire..." : (isListening ? (isDictating ? "Dictée en cours..." : "Assistant actif") : "Prêt")}>
            <FloatButton
                icon={isReadingContent ? <ReadOutlined style={{ color: '#1890ff' }} /> : (isDictating ? <FormOutlined /> : (isListening ? <AudioOutlined style={{ color: '#10b981' }} /> : <AudioOutlined />))}
                style={{ right: 90, bottom: 80 }}
                type={isListening || isReadingContent ? "primary" : "default"}
                className={isListening && !isReadingContent ? "voice-pulse" : ""}
                onClick={() => {
                    if (isReadingContent) {
                        window.speechSynthesis.cancel();
                        setIsReadingContent(false);
                        startRecognition();
                    } else {
                        message.info({ content: "Dites 'Lire la page' pour commencer", key: 'guide' });
                    }
                }}
            />
        </Tooltip>
    );
};

export default VoiceAssistant;
