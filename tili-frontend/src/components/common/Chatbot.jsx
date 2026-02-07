import React, { useState, useRef, useEffect } from 'react';
import {
    Button, Card, Input, Avatar, List, Typography, Space,
    Divider, Tag, Tooltip, FloatButton
} from 'antd';
import {
    MessageOutlined, SendOutlined, CloseOutlined,
    RobotOutlined, UserOutlined, QuestionCircleOutlined,
    SearchOutlined, TeamOutlined, FolderOpenOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const { Text, Title } = Typography;
const { Search } = Input;

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Bonjour ! Je suis votre assistant TILI. Comment puis-je vous aider aujourd'hui ?",
            sender: 'bot',
            type: 'text',
            timestamp: new Date(),
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // Hide on login page


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        // User message
        const userMsg = {
            id: messages.length + 1,
            text: inputValue,
            sender: 'user',
            type: 'text',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Bot response simulation (Simple rule-based)
        setTimeout(() => {
            const botResponse = getBotResponse(inputValue);
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                text: botResponse.text,
                sender: 'bot',
                type: botResponse.type || 'text',
                actions: botResponse.actions,
                timestamp: new Date(),
            }]);
        }, 600);
    };

    const handleQuickAction = (action) => {
        const userMsg = {
            id: messages.length + 1,
            text: action.label,
            sender: 'user',
            type: 'text',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);

        setTimeout(() => {
            if (action.link) {
                navigate(action.link);
                setMessages(prev => [...prev, {
                    id: prev.length + 1,
                    text: `Je vous redirige vers ${action.label}...`,
                    sender: 'bot',
                    type: 'text',
                    timestamp: new Date(),
                }]);
            } else if (action.response) {
                setMessages(prev => [...prev, {
                    id: prev.length + 1,
                    text: action.response,
                    sender: 'bot',
                    type: 'text',
                    timestamp: new Date(),
                }]);
            }
        }, 500);
    };

    const getBotResponse = (input) => {
        const lowerInput = input.toLowerCase();
        const isAdminContext = location.pathname.startsWith('/admin');
        const role = user?.role;

        // Common greetings
        if (lowerInput.includes('bonjour') || lowerInput.includes('salut')) {
            return { text: `Bonjour ${user?.prenom} ! Je suis votre assistant. Comment puis-je vous aider ?` };
        }

        // --- Context Aware Logic ---

        // ADMIN CONTEXT (BackOffice)
        if (isAdminContext) {
            if (lowerInput.includes('projet')) {
                return {
                    text: "Navigation vers la gestion des projets.",
                    actions: [{ label: "Gestion des Projets", link: "/admin/projets" }]
                };
            }
            if (lowerInput.includes('réunion') || lowerInput.includes('meeting')) {
                return {
                    text: "Navigation vers la gestion des réunions.",
                    actions: [{ label: "Gestion des Réunions", link: "/admin/reunions" }]
                };
            }
            if (lowerInput.includes('document')) {
                return {
                    text: "Navigation vers la gestion des documents.",
                    actions: [{ label: "Gestion des Documents", link: "/admin/documents" }]
                };
            }
            if (lowerInput.includes('utilisateur') || lowerInput.includes('user')) {
                // Only for users who can actually manage users (Responsable/Chef maybe?)
                // Assuming access control is handled by route protection, but let's be safe.
                return {
                    text: "Navigation vers la gestion des utilisateurs.",
                    actions: [{ label: "Gestion des Utilisateurs", link: "/admin/users" }]
                };
            }
            if (lowerInput.includes('demande')) {
                return {
                    text: "Navigation vers les demandes de réunion.",
                    actions: [{ label: "Demandes de Réunion", link: "/admin/demandes-reunion" }]
                };
            }
        }

        // FRONT CONTEXT (Personal Space)
        else {
            if (lowerInput.includes('projet')) {
                return {
                    text: "Voici vos projets assignés.",
                    actions: [{ label: "Mes Projets", link: "/mes-projets" }]
                };
            }
            if (lowerInput.includes('réunion') || lowerInput.includes('meeting')) {
                return {
                    text: "Voici votre agenda et vos réunions.",
                    actions: [{ label: "Mes Réunions", link: "/mes-reunions" }]
                };
            }
            if (lowerInput.includes('document')) {
                return {
                    text: "Voici vos documents personnels.",
                    actions: [
                        { label: "Mes Documents", link: "/mes-documents" }
                    ]
                };
            }
            if (lowerInput.includes('profil') || lowerInput.includes('compte')) {
                return {
                    text: "Vous pouvez modifier vos informations personnelles ici.",
                    actions: [
                        { label: "Mon Profil", link: "/profil" }
                    ]
                };
            }
        }

        // Common / Fallback
        if (lowerInput.includes('problème') || lowerInput.includes('support') || lowerInput.includes('aide')) {
            return {
                text: "Si vous rencontrez un problème technique, veuillez contacter le support IT à support@tili.tn.",
                actions: []
            };
        }

        return {
            text: "Je ne suis pas sûr de comprendre. Voici quelques suggestions basées sur votre espace actuel.",
            actions: getQuickActions(isAdminContext).map(a => ({ label: a.label, link: a.link }))
        };
    };

    const getQuickActions = (isAdminContext) => {
        if (isAdminContext) {
            return [
                { label: "Dashboard Admin", icon: <TeamOutlined />, link: "/admin/dashboard" },
                { label: "Projets", icon: <FolderOpenOutlined />, link: "/admin/projets" },
                { label: "Réunions", icon: <CalendarOutlined />, link: "/admin/reunions" },
            ];
        } else {
            return [
                { label: "Mes Réunions", icon: <CalendarOutlined />, link: "/mes-reunions" },
                { label: "Mes Projets", icon: <FolderOpenOutlined />, link: "/mes-projets" },
                { label: "Mes Documents", icon: <FolderOpenOutlined />, link: "/mes-documents" },
            ];
        }
    };

    const quickActions = getQuickActions(location.pathname.startsWith('/admin'));

    if (location.pathname === '/login') return null;

    return (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            {/* Chat Window */}
            {isOpen && (
                <Card
                    style={{
                        width: 350,
                        height: 500,
                        marginBottom: 16,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 16,
                        overflow: 'hidden'
                    }}
                    bodyStyle={{
                        padding: 0,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '16px',
                        background: '#1890ff',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Space>
                            <Avatar icon={<RobotOutlined />} style={{ backgroundColor: 'white', color: '#1890ff' }} />
                            <div>
                                <Text strong style={{ color: 'white', display: 'block' }}>Assistant TILI</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>En ligne</Text>
                            </div>
                        </Space>
                        <Button
                            type="text"
                            icon={<CloseOutlined style={{ color: 'white' }} />}
                            onClick={() => setIsOpen(false)}
                        />
                    </div>

                    {/* Messages Area */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        background: '#f5f7fa'
                    }}>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: 12
                                }}
                            >
                                {msg.sender === 'bot' && (
                                    <Avatar size="small" icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff', marginRight: 8, marginTop: 4 }} />
                                )}

                                <div style={{ maxWidth: '80%' }}>
                                    <div style={{
                                        padding: '10px 14px',
                                        background: msg.sender === 'user' ? '#1890ff' : 'white',
                                        color: msg.sender === 'user' ? 'white' : 'rgba(0,0,0,0.85)',
                                        borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}>
                                        <Text style={{ color: 'inherit' }}>{msg.text}</Text>
                                    </div>

                                    {/* Action Buttons */}
                                    {msg.actions && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                            {msg.actions.map((action, idx) => (
                                                <Button
                                                    key={idx}
                                                    size="small"
                                                    type="primary"
                                                    ghost
                                                    onClick={() => handleQuickAction(action)}
                                                    style={{ fontSize: 11, borderRadius: 12 }}
                                                >
                                                    {action.label}
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    <Text type="secondary" style={{ fontSize: 10, marginTop: 4, display: 'block', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </div>

                                {msg.sender === 'user' && (
                                    <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#87d068', marginLeft: 8, marginTop: 4 }} />
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions (only show if no recent interaction or at start) */}
                    {messages.length < 3 && (
                        <div style={{ padding: '0 12px 8px 12px', background: '#f5f7fa' }}>
                            <Text type="secondary" style={{ fontSize: 11, marginLeft: 4 }}>Suggestions :</Text>
                            <div style={{ display: 'flex', gap: 8, marginTop: 4, overflowX: 'auto', paddingBottom: 4 }}>
                                {quickActions.map((action, idx) => (
                                    <Tag
                                        key={idx}
                                        color="blue"
                                        style={{ cursor: 'pointer', borderRadius: 12, padding: '2px 10px' }}
                                        onClick={() => handleQuickAction(action)}
                                    >
                                        {action.icon} <span style={{ marginLeft: 4 }}>{action.label}</span>
                                    </Tag>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div style={{
                        padding: '12px',
                        background: 'white',
                        borderTop: '1px solid #e8e8e8'
                    }}>
                        <Input
                            placeholder="Posez une question..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onPressEnter={handleSend}
                            suffix={
                                <Button
                                    type="text"
                                    icon={<SendOutlined style={{ color: '#1890ff' }} />}
                                    onClick={handleSend}
                                    disabled={!inputValue.trim()}
                                    size="small"
                                />
                            }
                            style={{ borderRadius: 20 }}
                        />
                    </div>
                </Card>
            )}

            {/* Toggle Button */}
            <FloatButton
                icon={<MessageOutlined />}
                type="primary"
                style={{ right: 24, bottom: 24 }}
                onClick={() => setIsOpen(!isOpen)}
                badge={{ count: isOpen ? 0 : 1, color: 'red' }}
                tooltip="Assistant TILI"
            />
        </div>
    );
};

export default Chatbot;
