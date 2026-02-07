// Historique Page - Activity Logs
import React, { useState, useEffect } from 'react';
import {
    Card, Table, Tag, Typography, Row, Col, Select, DatePicker, Space, Avatar, Input, Spin,
} from 'antd';
import {
    HistoryOutlined, FileTextOutlined, ProjectOutlined, CalendarOutlined,
    UserOutlined, SearchOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { TYPE_ACTION_LABELS, TYPE_ACTION_COLORS } from '../../utils/constants';
import { formatDateTime, getInitials, getAvatarColor } from '../../utils/helpers';
import api from '../../api/axiosConfig';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

const HistoriquePage = () => {
    const { user } = useSelector((state) => state.auth);
    const [typeFilter, setTypeFilter] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHistorique = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const response = await api.get(`/historique?userId=${user.id || user.idUser}`);
                setActions(response.data);
            } catch (error) {
                console.error('Error fetching historique:', error);
                setActions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHistorique();
    }, [user]);

    const getEntityIcon = (type) => {
        switch (type) {
            case 'DOCUMENT':
                return <FileTextOutlined style={{ color: '#3b82f6' }} />;
            case 'PROJET':
                return <ProjectOutlined style={{ color: '#7c3aed' }} />;
            case 'REUNION':
                return <CalendarOutlined style={{ color: '#ea580c' }} />;
            case 'USER':
                return <UserOutlined style={{ color: '#10b981' }} />;
            default:
                return <HistoryOutlined style={{ color: '#64748b' }} />;
        }
    };

    const filteredActions = actions.filter(action => {
        const matchesSearch = searchText
            ? action.description?.toLowerCase().includes(searchText.toLowerCase())
            : true;
        const matchesType = typeFilter ? action.typeAction === typeFilter : true;
        return matchesSearch && matchesType;
    });

    const columns = [
        {
            title: 'Type',
            dataIndex: 'typeAction',
            key: 'typeAction',
            width: 130,
            render: (type) => (
                <Tag color={TYPE_ACTION_COLORS[type]}>{TYPE_ACTION_LABELS[type] || type}</Tag>
            ),
        },
        {
            title: 'Description',
            key: 'description',
            render: (_, record) => (
                <Space>
                    {getEntityIcon(record.entiteType)}
                    <Text>{record.description}</Text>
                </Space>
            ),
        },
        {
            title: 'Utilisateur',
            key: 'utilisateur',
            width: 200,
            render: (_, record) => record.utilisateur && (
                <Space>
                    <Avatar
                        size="small"
                        src={record.utilisateur.photoProfil}
                        style={{ background: getAvatarColor(record.utilisateur.nom) }}
                    >
                        {getInitials(record.utilisateur.nom, record.utilisateur.prenom)}
                    </Avatar>
                    <Text>{record.utilisateur.prenom} {record.utilisateur.nom}</Text>
                </Space>
            ),
        },
        {
            title: 'Date & Heure',
            dataIndex: 'dateHeure',
            key: 'dateHeure',
            width: 180,
            render: (date) => formatDateTime(date),
            sorter: (a, b) => new Date(a.dateHeure) - new Date(b.dateHeure),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Entité',
            key: 'entite',
            width: 130,
            render: (_, record) => (
                <Tag>{record.entiteType} #{record.entiteId}</Tag>
            ),
        },
    ];

    // Stats
    const stats = {
        total: actions.length,
        creations: actions.filter(a => a.typeAction === 'CREATION').length,
        modifications: actions.filter(a => a.typeAction === 'MODIFICATION').length,
        suppressions: actions.filter(a => a.typeAction === 'SUPPRESSION').length,
    };

    return (
        <div>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        <HistoryOutlined style={{ marginRight: 12 }} />
                        Historique des Actions
                    </Title>
                    <Text type="secondary">
                        {user?.role === 'RESPONSABLE'
                            ? "Traçabilité de toutes les opérations"
                            : "Traçabilité des opérations de vos projets, réunions et documents"}
                    </Text>
                </Col>
            </Row>

            {/* Stats */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={6}>
                    <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center' }}>
                        <Text type="secondary">Total</Text>
                        <Title level={3} style={{ margin: '8px 0 0', color: '#1e40af' }}>
                            {stats.total}
                        </Title>
                    </Card>
                </Col>
                <Col xs={6}>
                    <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center' }}>
                        <Text type="secondary">Créations</Text>
                        <Title level={3} style={{ margin: '8px 0 0', color: '#10b981' }}>
                            {stats.creations}
                        </Title>
                    </Card>
                </Col>
                <Col xs={6}>
                    <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center' }}>
                        <Text type="secondary">Modifications</Text>
                        <Title level={3} style={{ margin: '8px 0 0', color: '#3b82f6' }}>
                            {stats.modifications}
                        </Title>
                    </Card>
                </Col>
                <Col xs={6}>
                    <Card bordered={false} style={{ borderRadius: 12, textAlign: 'center' }}>
                        <Text type="secondary">Suppressions</Text>
                        <Title level={3} style={{ margin: '8px 0 0', color: '#ef4444' }}>
                            {stats.suppressions}
                        </Title>
                    </Card>
                </Col>
            </Row>

            {/* Table */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col flex="auto">
                        <Search
                            placeholder="Rechercher dans les descriptions..."
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 300 }}
                            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        />
                    </Col>
                    <Col>
                        <Select
                            placeholder="Type d'action"
                            allowClear
                            style={{ width: 150 }}
                            onChange={(value) => setTypeFilter(value)}
                        >
                            {Object.entries(TYPE_ACTION_LABELS).map(([key, label]) => (
                                <Select.Option key={key} value={key}>
                                    <Tag color={TYPE_ACTION_COLORS[key]}>{label}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col>
                        <RangePicker
                            placeholder={['Début', 'Fin']}
                            format="DD/MM/YYYY"
                        />
                    </Col>
                </Row>

                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={filteredActions}
                        rowKey="id"
                        pagination={{
                            pageSize: 15,
                            showSizeChanger: true,
                            showTotal: (total) => `${total} action(s)`,
                        }}
                        locale={{ emptyText: 'Aucun historique disponible' }}
                    />
                </Spin>
            </Card>
        </div>
    );
};

export default HistoriquePage;
