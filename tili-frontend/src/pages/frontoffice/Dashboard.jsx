// FrontOffice Dashboard Page
import React, { useEffect } from 'react';
import { Row, Col, Card, Typography, Space, Progress, Tag, Avatar, List, Button, Empty } from 'antd';
import {
    ProjectOutlined, CalendarOutlined, FileTextOutlined, BellOutlined,
    ArrowRightOutlined, ClockCircleOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjets } from '../../redux/projetSlice';
import { fetchReunions } from '../../redux/reunionSlice';
import { fetchDocuments } from '../../redux/documentSlice';
import { fetchNotifications } from '../../redux/notificationSlice';
import {
    STATUT_PROJET_LABELS, STATUT_PROJET_COLORS,
    STATUT_REUNION_LABELS, STATUT_REUNION_COLORS,
    TYPE_NOTIFICATION_COLORS,
} from '../../utils/constants';
import { formatDate, formatDateTime, formatRelativeTime, getInitials, getAvatarColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const { Title, Text, Paragraph } = Typography;

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { projets, isLoading: loadingProjets } = useSelector((state) => state.projets);
    const { reunions, isLoading: loadingReunions } = useSelector((state) => state.reunions);
    const { documents, isLoading: loadingDocs } = useSelector((state) => state.documents);
    const { notifications } = useSelector((state) => state.notifications);

    useEffect(() => {
        dispatch(fetchProjets());
        dispatch(fetchReunions());
        dispatch(fetchDocuments());
        dispatch(fetchNotifications());
    }, [dispatch]);

    const isLoading = loadingProjets || loadingReunions || loadingDocs;

    // Get active projects
    const activeProjets = projets.filter(p => p.statut === 'ACTIF').slice(0, 3);

    // Get upcoming reunions
    const upcomingReunions = reunions
        .filter(r => r.statut === 'PLANIFIEE')
        .sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut))
        .slice(0, 3);

    // Recent documents
    const recentDocs = [...documents]
        .sort((a, b) => new Date(b.dateUpload) - new Date(a.dateUpload))
        .slice(0, 4);

    // Unread notifications
    const unreadNotifications = notifications.filter(n => !n.lu).slice(0, 4);

    const getProgressColor = (percent) => {
        if (percent >= 80) return '#10b981';
        if (percent >= 50) return '#3b82f6';
        if (percent >= 25) return '#f59e0b';
        return '#ef4444';
    };

    if (isLoading) {
        return <LoadingSpinner tip="Chargement..." />;
    }

    return (
        <div>
            {/* Welcome Header */}
            <Card
                bordered={false}
                style={{
                    borderRadius: 16,
                    marginBottom: 24,
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                }}
            >
                <Row align="middle" justify="space-between">
                    <Col>
                        <Title level={3} style={{ color: '#fff', marginBottom: 4 }}>
                            Bienvenue, {user?.prenom} ! 👋
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                            Voici un aperçu de vos activités
                        </Text>
                    </Col>
                    <Col>
                        <Space>
                            <div style={{ textAlign: 'center', padding: '0 16px' }}>
                                <Title level={2} style={{ color: '#fff', margin: 0 }}>{activeProjets.length}</Title>
                                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Projets actifs</Text>
                            </div>
                            <div style={{ textAlign: 'center', padding: '0 16px', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                                <Title level={2} style={{ color: '#fff', margin: 0 }}>{upcomingReunions.length}</Title>
                                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>Réunions à venir</Text>
                            </div>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[24, 24]}>
                {/* Projets Actifs */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <ProjectOutlined style={{ color: '#7c3aed' }} />
                                <span>Mes Projets Actifs</span>
                            </Space>
                        }
                        extra={
                            <Button type="link" onClick={() => navigate('/mes-projets')}>
                                Voir tout <ArrowRightOutlined />
                            </Button>
                        }
                        bordered={false}
                        style={{ borderRadius: 12, height: '100%' }}
                    >
                        {activeProjets.length > 0 ? (
                            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                {activeProjets.map(projet => (
                                    <Card
                                        key={projet.id}
                                        size="small"
                                        style={{ borderRadius: 8, cursor: 'pointer' }}
                                        hoverable
                                    >
                                        <Row align="middle" justify="space-between">
                                            <Col flex="auto">
                                                <Text strong>{projet.nom}</Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Échéance: {formatDate(projet.dateFinPrevue)}
                                                </Text>
                                            </Col>
                                            <Col>
                                                <Progress
                                                    type="circle"
                                                    percent={projet.pourcentageAvancement}
                                                    size={50}
                                                    strokeColor={getProgressColor(projet.pourcentageAvancement)}
                                                />
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                            </Space>
                        ) : (
                            <Empty description="Aucun projet actif" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </Col>

                {/* Réunions à Venir */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <CalendarOutlined style={{ color: '#ea580c' }} />
                                <span>Prochaines Réunions</span>
                            </Space>
                        }
                        extra={
                            <Button type="link" onClick={() => navigate('/mes-reunions')}>
                                Voir tout <ArrowRightOutlined />
                            </Button>
                        }
                        bordered={false}
                        style={{ borderRadius: 12, height: '100%' }}
                    >
                        {upcomingReunions.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={upcomingReunions}
                                renderItem={reunion => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <div
                                                    style={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: 8,
                                                        background: '#ffedd5',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Text style={{ fontSize: 16, fontWeight: 700, color: '#ea580c', lineHeight: 1 }}>
                                                        {new Date(reunion.dateDebut).getDate()}
                                                    </Text>
                                                    <Text style={{ fontSize: 10, color: '#ea580c' }}>
                                                        {new Date(reunion.dateDebut).toLocaleString('fr', { month: 'short' })}
                                                    </Text>
                                                </div>
                                            }
                                            title={<Text strong>{reunion.titre}</Text>}
                                            description={
                                                <Space size={4}>
                                                    <ClockCircleOutlined style={{ fontSize: 12 }} />
                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                        {formatDateTime(reunion.dateDebut)} • {reunion.lieu}
                                                    </Text>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="Aucune réunion planifiée" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </Col>

                {/* Documents Récents */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <FileTextOutlined style={{ color: '#3b82f6' }} />
                                <span>Documents Récents</span>
                            </Space>
                        }
                        extra={
                            <Button type="link" onClick={() => navigate('/mes-documents')}>
                                Voir tout <ArrowRightOutlined />
                            </Button>
                        }
                        bordered={false}
                        style={{ borderRadius: 12 }}
                    >
                        {recentDocs.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={recentDocs}
                                renderItem={doc => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    style={{ background: '#dbeafe' }}
                                                    icon={<FileTextOutlined style={{ color: '#3b82f6' }} />}
                                                />
                                            }
                                            title={<Text strong>{doc.titre}</Text>}
                                            description={
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {formatRelativeTime(doc.dateUpload)}
                                                </Text>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="Aucun document" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </Col>

                {/* Notifications */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <BellOutlined style={{ color: '#f59e0b' }} />
                                <span>Notifications</span>
                                {unreadNotifications.length > 0 && (
                                    <Tag color="orange">{unreadNotifications.length} non lues</Tag>
                                )}
                            </Space>
                        }
                        bordered={false}
                        style={{ borderRadius: 12 }}
                    >
                        {unreadNotifications.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={unreadNotifications}
                                renderItem={notif => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <div
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        background: TYPE_NOTIFICATION_COLORS[notif.type],
                                                        marginTop: 8,
                                                    }}
                                                />
                                            }
                                            title={<Text strong>{notif.titre}</Text>}
                                            description={
                                                <>
                                                    <Text type="secondary" style={{ fontSize: 13 }}>{notif.message}</Text>
                                                    <br />
                                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                                        {formatRelativeTime(notif.dateEnvoi)}
                                                    </Text>
                                                </>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="Aucune notification" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
