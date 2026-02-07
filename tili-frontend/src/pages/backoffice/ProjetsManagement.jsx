// Projets Management Page with Role-Based Permissions
import React, { useEffect, useState } from 'react';
import {
    Card, Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker,
    Typography, message, Row, Col, Tooltip, Progress, Slider, Statistic, Avatar, Popconfirm, Tabs, Empty,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
    ProjectOutlined, CalendarOutlined, FolderOpenOutlined,
    CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, CheckOutlined, CloseOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjets, createProjet, updateProjet, deleteProjet, updateProjetProgress, fetchProjectRequests, acceptProjectRequest, rejectProjectRequest } from '../../redux/projetSlice';
import { fetchUsers } from '../../redux/userSlice';
import {
    STATUT_PROJET_LABELS, STATUT_PROJET_COLORS,
    PROJECT_PERMISSIONS
} from '../../utils/constants';
import { formatDate, getInitials, getAvatarColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Search, TextArea } = Input;

const ProjetsManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [editingProjet, setEditingProjet] = useState(null);
    const [viewingProjet, setViewingProjet] = useState(null);
    const [progressProjet, setProgressProjet] = useState(null);
    const [newProgress, setNewProgress] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [statutFilter, setStatutFilter] = useState(null);
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('1');
    const { projets, requests, isLoading } = useSelector((state) => state.projets);
    const { users } = useSelector((state) => state.users);
    const { user } = useSelector((state) => state.auth);

    // Get user permissions
    const userPermissions = PROJECT_PERMISSIONS[user?.role] || {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
    };

    useEffect(() => {
        dispatch(fetchProjets());
        dispatch(fetchProjectRequests());
        dispatch(fetchUsers());
    }, [dispatch]);

    const handleAcceptRequest = async (request) => {
        try {
            await dispatch(acceptProjectRequest(request)).unwrap();
            message.success('Projet créé et demande acceptée');
        } catch (error) {
            message.error('Erreur lors de l\'acceptation de la demande');
        }
    };

    const handleRejectRequest = async (id) => {
        try {
            await dispatch(rejectProjectRequest(id)).unwrap();
            message.success('Demande refusée');
        } catch (error) {
            message.error('Erreur lors du refus de la demande');
        }
    };

    // ... (Existing handle functions: handleOpenModal, handleCloseModal, handleViewProjet, etc.)
    const handleOpenModal = (projet = null) => {
        if (!projet && !userPermissions.canCreate) {
            message.warning('Vous n\'avez pas la permission de créer des projets');
            return;
        }
        if (projet && !userPermissions.canEdit) {
            message.warning('Vous n\'avez pas la permission de modifier des projets');
            return;
        }

        setEditingProjet(projet);
        if (projet) {
            form.setFieldsValue({
                ...projet,
                dateDebut: dayjs(projet.dateDebut),
                dateFinPrevue: dayjs(projet.dateFinPrevue),
                dateFinReelle: projet.dateFinReelle ? dayjs(projet.dateFinReelle) : null,
            });
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProjet(null);
        form.resetFields();
    };

    const handleViewProjet = (projet) => {
        setViewingProjet(projet);
        setIsViewModalOpen(true);
    };

    const handleOpenProgressModal = (projet) => {
        setProgressProjet(projet);
        setNewProgress(projet.pourcentageAvancement);
        setIsProgressModalOpen(true);
    };

    const handleUpdateProgress = async () => {
        try {
            await dispatch(updateProjetProgress({ id: progressProjet.id, pourcentage: newProgress })).unwrap();
            message.success('Avancement mis à jour');
            setIsProgressModalOpen(false);
        } catch (error) {
            message.error('Erreur lors de la mise à jour');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const data = {
                ...values,
                chefProjetId: user?.id || user?.idUser, // Add current user as chef/creator
                dateDebut: values.dateDebut.format('YYYY-MM-DD'),
                dateFinPrevue: values.dateFinPrevue.format('YYYY-MM-DD'),
                dateFinReelle: values.dateFinReelle?.format('YYYY-MM-DD') || null,
            };

            if (editingProjet) {
                await dispatch(updateProjet({ id: editingProjet.id, data })).unwrap();
                message.success('Projet modifié avec succès');
            } else {
                await dispatch(createProjet(data)).unwrap();
                message.success('Projet créé avec succès');
            }
            handleCloseModal();
        } catch (error) {
            message.error('Une erreur est survenue');
        }
    };

    const handleDelete = async (id) => {
        if (!userPermissions.canDelete) {
            message.warning('Vous n\'avez pas la permission de supprimer des projets');
            return;
        }
        try {
            await dispatch(deleteProjet(id)).unwrap();
            message.success('Projet supprimé');
        } catch (error) {
            message.error('Erreur lors de la suppression');
        }
    };

    const filteredProjets = projets.filter(projet => {
        const matchesSearch = searchText
            ? projet.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
            projet.description?.toLowerCase().includes(searchText.toLowerCase())
            : true;
        const matchesStatut = statutFilter ? projet.statut === statutFilter : true;
        return matchesSearch && matchesStatut;
    });

    const getProgressColor = (percent) => {
        if (percent >= 80) return '#10b981';
        if (percent >= 50) return '#3c7bb8';
        if (percent >= 25) return '#c9a227';
        return '#ef4444';
    };

    const columns = [
        {
            title: 'Projet',
            key: 'projet',
            render: (_, record) => (
                <Space>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: `${STATUT_PROJET_COLORS[record.statut]}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <ProjectOutlined style={{ fontSize: 18, color: STATUT_PROJET_COLORS[record.statut] }} />
                    </div>
                    <div>
                        <Text strong style={{ cursor: 'pointer' }} onClick={() => handleViewProjet(record)}>
                            {record.nom}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                            {record.description?.substring(0, 50)}...
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Responsable',
            key: 'responsable',
            render: (_, record) => record.responsable && (
                <Space>
                    <Avatar size="small" style={{ background: getAvatarColor(record.responsable.nom) }}>
                        {getInitials(record.responsable.nom, record.responsable.prenom)}
                    </Avatar>
                    <Text>{record.responsable.prenom} {record.responsable.nom}</Text>
                </Space>
            ),
        },
        {
            title: 'Dates',
            key: 'dates',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 12 }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {formatDate(record.dateDebut)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        → {formatDate(record.dateFinPrevue)}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Avancement',
            key: 'avancement',
            width: 180,
            render: (_, record) => (
                <div style={{ cursor: 'pointer' }} onClick={() => handleOpenProgressModal(record)}>
                    <Progress
                        percent={record.pourcentageAvancement}
                        size="small"
                        strokeColor={getProgressColor(record.pourcentageAvancement)}
                        format={(percent) => `${percent}%`}
                    />
                </div>
            ),
        },
        {
            title: 'Statut',
            dataIndex: 'statut',
            key: 'statut',
            render: (statut) => (
                <Tag color={STATUT_PROJET_COLORS[statut]}>{STATUT_PROJET_LABELS[statut]}</Tag>
            ),
        },
        {
            title: 'Budget',
            dataIndex: 'budget',
            key: 'budget',
            render: (budget) => budget ? `${budget.toLocaleString()} TND` : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 130,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Voir détails">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewProjet(record)} />
                    </Tooltip>
                    {userPermissions.canEdit && (
                        <Tooltip title="Modifier">
                            <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                        </Tooltip>
                    )}
                    {userPermissions.canDelete && (
                        <Popconfirm
                            title="Supprimer ce projet ?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Oui"
                            cancelText="Non"
                        >
                            <Tooltip title="Supprimer">
                                <Button type="text" danger icon={<DeleteOutlined />} />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const requestColumns = [
        {
            title: 'Demandeur',
            key: 'demandeur',
            render: (_, record) => (
                <Space>
                    <Avatar size="small" style={{ background: getAvatarColor(record.demandeur?.nom) }}>
                        {getInitials(record.demandeur?.nom, record.demandeur?.prenom)}
                    </Avatar>
                    <Text>{record.demandeur?.prenom} {record.demandeur?.nom}</Text>
                </Space>
            )
        },
        {
            title: 'Titre du Projet',
            dataIndex: 'titre',
            key: 'titre',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color="blue">{type}</Tag>
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text) => <Text type="secondary" ellipsis={{ tooltip: text }} style={{ maxWidth: 300 }}>{text}</Text>
        },
        {
            title: 'Date Demande',
            dataIndex: 'dateDemande',
            key: 'dateDemande',
            render: (date) => formatDate(date)
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Popconfirm
                        title="Accepter ce projet ?"
                        description="Cela créera le projet et passera l'utilisateur en Chef de Projet."
                        onConfirm={() => handleAcceptRequest(record)}
                        okText="Accepter"
                        cancelText="Annuler"
                        okButtonProps={{ style: { background: '#10b981' } }}
                    >
                        <Button type="primary" size="small" style={{ background: '#10b981', borderColor: '#10b981' }} icon={<CheckOutlined />}>
                            Accepter
                        </Button>
                    </Popconfirm>
                    <Popconfirm
                        title="Refuser cette demande ?"
                        onConfirm={() => handleRejectRequest(record.id)}
                        okText="Refuser"
                        cancelText="Annuler"
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="default" danger size="small" icon={<CloseOutlined />}>
                            Refuser
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // Stats
    const stats = {
        total: projets.length,
        actifs: projets.filter(p => p.statut === 'ACTIF').length,
        clotures: projets.filter(p => p.statut === 'CLOTURE').length,
        requests: requests.filter(r => r.statut === 'EN_ATTENTE').length
    };

    if (isLoading && projets.length === 0) {
        return <LoadingSpinner tip="Chargement des projets..." />;
    }

    const items = [
        {
            key: '1',
            label: 'Tous les Projets',
            children: (
                <Table
                    columns={columns}
                    dataSource={filteredProjets}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `${total} projet(s)`,
                    }}
                />
            ),
        },
        // Only show "Demandes en attente" tab for RESPONSABLE role
        ...(user?.role === 'RESPONSABLE' ? [{
            key: '2',
            label: (
                <Space>
                    Demandes en attente
                    {stats.requests > 0 && <Tag color="red" style={{ borderRadius: '50%' }}>{stats.requests}</Tag>}
                </Space>
            ),
            children: (
                <Table
                    columns={requestColumns}
                    dataSource={requests}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: <Empty description="Aucune demande en attente" /> }}
                />
            ),
        }] : []),
    ];

    return (
        <div>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} style={{ marginBottom: 4 }}>Gestion des Projets</Title>
                    <Text type="secondary">{stats.actifs} actifs sur {stats.total} projets</Text>
                </Col>
                <Col>
                    {userPermissions.canCreate && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpenModal()}
                            style={{ borderRadius: 8 }}
                        >
                            Nouveau Projet
                        </Button>
                    )}
                </Col>
            </Row>

            {/* Stats Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={6}>
                    <Card bordered={false} style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Total Projets"
                            value={stats.total}
                            prefix={<FolderOpenOutlined style={{ color: '#1e4a8d' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={6}>
                    <Card bordered={false} style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Projets Actifs"
                            value={stats.actifs}
                            prefix={<ClockCircleOutlined style={{ color: '#10b981' }} />}
                            valueStyle={{ color: '#10b981' }}
                        />
                    </Card>
                </Col>
                <Col xs={6}>
                    <Card bordered={false} style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Clôturés"
                            value={stats.clotures}
                            prefix={<CheckCircleOutlined style={{ color: '#8c8c8c' }} />}
                            valueStyle={{ color: '#8c8c8c' }}
                        />
                    </Card>
                </Col>
                {user?.role === 'RESPONSABLE' && (
                    <Col xs={6}>
                        <Card bordered={false} style={{ borderRadius: 12 }}>
                            <Statistic
                                title="Demandes"
                                value={stats.requests}
                                prefix={<ClockCircleOutlined style={{ color: '#c9a227' }} />}
                                valueStyle={{ color: '#c9a227' }}
                            />
                        </Card>
                    </Col>
                )}
            </Row>

            {/* Tabs & Filters & Table */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Tabs defaultActiveKey="1" items={items} onChange={setActiveTab} />

                {activeTab === '1' && (
                    <Row gutter={16} style={{ marginTop: 16 }}>
                        <Col flex="auto">
                            <Search
                                placeholder="Rechercher par nom ou description..."
                                allowClear
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 300 }}
                                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                            />
                        </Col>
                        <Col>
                            <Select
                                placeholder="Statut"
                                allowClear
                                style={{ width: 150 }}
                                onChange={(value) => setStatutFilter(value)}
                            >
                                {Object.entries(STATUT_PROJET_LABELS).map(([key, label]) => (
                                    <Select.Option key={key} value={key}>
                                        <Tag color={STATUT_PROJET_COLORS[key]}>{label}</Tag>
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                )}
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editingProjet ? 'Modifier le projet' : 'Nouveau projet'}
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                destroyOnClose
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="nom"
                        label="Nom du projet"
                        rules={[{ required: true, message: 'Nom requis' }]}
                    >
                        <Input placeholder="Nom du projet" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea rows={3} placeholder="Description du projet..." />
                    </Form.Item>

                    <Form.Item
                        name="objectifs"
                        label="Objectifs"
                    >
                        <TextArea rows={3} placeholder="Objectifs du projet..." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="dateDebut"
                                label="Date de début"
                                rules={[{ required: true, message: 'Date requise' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="dateFinPrevue"
                                label="Date de fin prévue"
                                rules={[{ required: true, message: 'Date requise' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="dateFinReelle"
                                label="Date de fin réelle"
                            >
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="budget"
                                label="Budget (TND)"
                            >
                                <Input type="number" placeholder="0" suffix="TND" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="statut"
                                label="Statut"
                                rules={[{ required: true, message: 'Statut requis' }]}
                            >
                                <Select placeholder="Sélectionner un statut">
                                    {Object.entries(STATUT_PROJET_LABELS).map(([key, label]) => (
                                        <Select.Option key={key} value={key}>{label}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCloseModal}>Annuler</Button>
                            <Button type="primary" htmlType="submit">
                                {editingProjet ? 'Modifier' : 'Créer'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Progress Modal */}
            <Modal
                title="Mettre à jour l'avancement"
                open={isProgressModalOpen}
                onCancel={() => setIsProgressModalOpen(false)}
                onOk={handleUpdateProgress}
                okText="Enregistrer"
                cancelText="Annuler"
            >
                {progressProjet && (
                    <div style={{ padding: '20px 0' }}>
                        <Text strong>{progressProjet.nom}</Text>
                        <div style={{ marginTop: 24 }}>
                            <Slider
                                value={newProgress}
                                onChange={setNewProgress}
                                marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
                            />
                            <div style={{ textAlign: 'center', marginTop: 16 }}>
                                <Text style={{ fontSize: 24, fontWeight: 600, color: getProgressColor(newProgress) }}>
                                    {newProgress}%
                                </Text>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* View Modal */}
            <Modal
                title={viewingProjet?.nom}
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={null}
                width={650}
            >
                {viewingProjet && (
                    <div style={{ marginTop: 16 }}>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text type="secondary">Statut</Text>
                                <div>
                                    <Tag color={STATUT_PROJET_COLORS[viewingProjet.statut]}>
                                        {STATUT_PROJET_LABELS[viewingProjet.statut]}
                                    </Tag>
                                </div>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Avancement</Text>
                                <Progress
                                    percent={viewingProjet.pourcentageAvancement}
                                    strokeColor={getProgressColor(viewingProjet.pourcentageAvancement)}
                                />
                            </Col>
                            <Col span={24}>
                                <Text type="secondary">Description</Text>
                                <Paragraph>{viewingProjet.description || '-'}</Paragraph>
                            </Col>
                            <Col span={24}>
                                <Text type="secondary">Objectifs</Text>
                                <Paragraph style={{ whiteSpace: 'pre-line' }}>{viewingProjet.objectifs || '-'}</Paragraph>
                            </Col>
                            <Col span={8}>
                                <Text type="secondary">Début</Text>
                                <Paragraph>{formatDate(viewingProjet.dateDebut)}</Paragraph>
                            </Col>
                            <Col span={8}>
                                <Text type="secondary">Fin prévue</Text>
                                <Paragraph>{formatDate(viewingProjet.dateFinPrevue)}</Paragraph>
                            </Col>
                            <Col span={8}>
                                <Text type="secondary">Budget</Text>
                                <Paragraph>{viewingProjet.budget ? `${viewingProjet.budget.toLocaleString()} TND` : '-'}</Paragraph>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProjetsManagement;
