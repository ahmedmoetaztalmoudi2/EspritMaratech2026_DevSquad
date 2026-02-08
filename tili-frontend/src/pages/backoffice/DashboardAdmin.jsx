// Admin Dashboard Page
import React, { useEffect } from 'react';
import { Row, Col, Card, Typography, Table, Tag, Space, Empty, Spin, Grid } from 'antd';
import {
    TeamOutlined,
    FileTextOutlined,
    ProjectOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDashboardStats } from '../../redux/dashboardSlice';
import {
    TYPE_DOCUMENT_LABELS, TYPE_DOCUMENT_COLORS,
    STATUT_PROJET_LABELS, STATUT_PROJET_COLORS,
    TYPE_ACTION_LABELS, TYPE_ACTION_COLORS
} from '../../utils/constants';
import { formatRelativeTime, getInitials, getAvatarColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner'; // Keep using your existing loading spinner

const { Title, Text } = Typography;

const DashboardAdmin = () => {
    const dispatch = useDispatch();
    const { stats, isLoading } = useSelector((state) => state.dashboard);
    const { isDarkMode } = useSelector((state) => state.ui);

    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    // Stats cards data
    const statsCards = [
        {
            title: 'Utilisateurs',
            value: stats?.totalUsers || 0,
            icon: <TeamOutlined />,
            color: isDarkMode ? '#60a5fa' : '#1e40af',
            bgColor: isDarkMode ? 'rgba(96, 165, 250, 0.15)' : '#dbeafe',
        },
        {
            title: 'Documents',
            value: stats?.totalDocuments || 0,
            icon: <FileTextOutlined />,
            color: isDarkMode ? '#34d399' : '#059669',
            bgColor: isDarkMode ? 'rgba(52, 211, 153, 0.15)' : '#d1fae5',
        },
        {
            title: 'Projets Actifs',
            value: stats?.projetsActifs || 0,
            icon: <ProjectOutlined />,
            color: isDarkMode ? '#a78bfa' : '#7c3aed',
            bgColor: isDarkMode ? 'rgba(167, 139, 250, 0.15)' : '#ede9fe',
        },
        {
            title: 'Réunions à Venir',
            value: stats?.reunionsAVenir || 0,
            icon: <CalendarOutlined />,
            color: isDarkMode ? '#fb923c' : '#ea580c',
            bgColor: isDarkMode ? 'rgba(251, 146, 60, 0.15)' : '#ffedd5',
        },
    ];

    // Pie chart data for documents by type
    const documentsByType = stats?.documentsByType?.map(item => ({
        name: TYPE_DOCUMENT_LABELS[item.type] || item.type,
        value: item.count,
        color: TYPE_DOCUMENT_COLORS[item.type] || '#ccc',
    })) || [];

    // Bar chart data for projects by status
    const projetsByStatut = stats?.projetsByStatut?.map(item => ({
        name: STATUT_PROJET_LABELS[item.statut] || item.statut,
        count: item.count,
        fill: STATUT_PROJET_COLORS[item.statut] || '#ccc',
    })) || [];

    // Recent activities columns (If backend supports it later)
    const activityColumns = [
        {
            title: 'Action',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={TYPE_ACTION_COLORS[type] || 'default'}>
                    {TYPE_ACTION_LABELS[type] || type}
                </Tag>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Utilisateur',
            dataIndex: 'utilisateur',
            key: 'utilisateur',
            render: (user) => (
                <Space>
                    <div
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: getAvatarColor(user?.nom || ''),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 10
                        }}
                    >
                        {getInitials(user?.nom, user?.prenom)}
                    </div>
                    <Text>{user?.prenom} {user?.nom}</Text>
                </Space>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'dateHeure',
            key: 'dateHeure',
            render: (date) => (
                <Space>
                    <ClockCircleOutlined style={{ color: '#94a3b8' }} />
                    <Text type="secondary">{formatRelativeTime(date)}</Text>
                </Space>
            ),
        },
    ];

    if (isLoading) {
        return <LoadingSpinner tip="Chargement des statistiques..." />;
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={isMobile ? 4 : 3} style={{ marginBottom: 4 }}>Tableau de Bord</Title>
                <Text type="secondary">Vue d'ensemble de l'activité TILI</Text>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {statsCards.map((stat, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 12,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>{stat.title}</Text>
                                    <Title level={2} style={{ margin: '8px 0 0', color: stat.color }}>
                                        {stat.value}
                                    </Title>
                                </div>
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 12,
                                        background: stat.bgColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 22,
                                        color: stat.color,
                                    }}
                                >
                                    {stat.icon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Charts Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {/* Documents by Type */}
                <Col xs={24} md={12}>
                    <Card
                        title="Documents par Type"
                        bordered={false}
                        style={{ borderRadius: 12, height: '100%' }}
                    >
                        {documentsByType.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={documentsByType}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        labelLine={false}
                                    >
                                        {documentsByType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Empty description="Aucune donnée" />
                        )}
                    </Card>
                </Col>

                {/* Projects by Status */}
                <Col xs={24} md={12}>
                    <Card
                        title="Projets par Statut"
                        bordered={false}
                        style={{ borderRadius: 12, height: '100%' }}
                    >
                        {projetsByStatut.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={projetsByStatut} layout="vertical">
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                                        {projetsByStatut.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Empty description="Aucune donnée" />
                        )}
                    </Card>
                </Col>
            </Row>

        </div>
    );
};

export default DashboardAdmin;
