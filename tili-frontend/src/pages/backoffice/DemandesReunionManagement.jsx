// Demandes Réunion Management - For Chef de Projet
import React, { useEffect, useState } from 'react';
import {
    Card, Table, Button, Space, Tag, Modal, Typography, message, Row, Col,
    Tooltip, Avatar, Empty, Input, Badge, Form,
} from 'antd';
import {
    CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, CalendarOutlined,
    ClockCircleOutlined, UserOutlined, EnvironmentOutlined, FileTextOutlined,
    SearchOutlined, SendOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDemandesByDestinataire,
    fetchDemandesEnAttente,
    accepterDemande,
    refuserDemande
} from '../../redux/demandeReunionSlice';
import { formatDateTime, getInitials, getAvatarColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Search, TextArea } = Input;

const DemandesReunionManagement = () => {
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isRefuseModalOpen, setIsRefuseModalOpen] = useState(false);
    const [refuseForm] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const dispatch = useDispatch();
    const { demandesRecues, isLoading, pendingCount } = useSelector((state) => state.demandesReunion);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchDemandesByDestinataire(user.id));
        }
    }, [dispatch, user?.id]);

    const handleAccepter = async (demande) => {
        try {
            await dispatch(accepterDemande({
                demandeId: demande.id,
                chefProjetId: user.id
            })).unwrap();
            message.success('Demande acceptée ! Vous pouvez maintenant créer la réunion.');
            dispatch(fetchDemandesByDestinataire(user.id));
        } catch (error) {
            message.error(error || 'Erreur lors de l\'acceptation');
        }
    };

    const handleRefuserClick = (demande) => {
        setSelectedDemande(demande);
        setIsRefuseModalOpen(true);
    };

    const handleRefuserSubmit = async (values) => {
        try {
            await dispatch(refuserDemande({
                demandeId: selectedDemande.id,
                chefProjetId: user.id,
                motifRefus: values.motifRefus
            })).unwrap();
            message.success('Demande refusée. Le consultant a été notifié.');
            setIsRefuseModalOpen(false);
            refuseForm.resetFields();
            setSelectedDemande(null);
            dispatch(fetchDemandesByDestinataire(user.id));
        } catch (error) {
            message.error(error || 'Erreur lors du refus');
        }
    };

    const handleViewDemande = (demande) => {
        setSelectedDemande(demande);
        setIsViewModalOpen(true);
    };

    const getStatusTag = (statut) => {
        switch (statut) {
            case 'EN_ATTENTE':
                return <Tag color="orange" icon={<ClockCircleOutlined />}>En attente</Tag>;
            case 'ACCEPTEE':
                return <Tag color="green" icon={<CheckCircleOutlined />}>Acceptée</Tag>;
            case 'REFUSEE':
                return <Tag color="red" icon={<CloseCircleOutlined />}>Refusée</Tag>;
            default:
                return <Tag>{statut}</Tag>;
        }
    };

    const filteredDemandes = demandesRecues.filter(demande => {
        const matchesSearch = searchText
            ? demande.titre?.toLowerCase().includes(searchText.toLowerCase()) ||
            demande.demandeur?.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
            demande.demandeur?.prenom?.toLowerCase().includes(searchText.toLowerCase())
            : true;
        const matchesFilter = filterStatus === 'all' ? true : demande.statut === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const pendingDemandes = demandesRecues.filter(d => d.statut === 'EN_ATTENTE');

    const columns = [
        {
            title: 'Demandeur',
            key: 'demandeur',
            render: (_, record) => (
                <Space>
                    <Avatar style={{ background: getAvatarColor(record.demandeur?.nom) }}>
                        {getInitials(record.demandeur?.nom, record.demandeur?.prenom)}
                    </Avatar>
                    <div>
                        <Text strong>{record.demandeur?.prenom} {record.demandeur?.nom}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.demandeur?.email}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Demande',
            key: 'demande',
            render: (_, record) => (
                <div>
                    <Text strong style={{ cursor: 'pointer', color: '#1e4a8d' }} onClick={() => handleViewDemande(record)}>
                        {record.titre}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.description?.substring(0, 50)}...
                    </Text>
                </div>
            ),
        },
        {
            title: 'Date souhaitée',
            key: 'dateSouhaitee',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>{record.dateSouhaitee ? formatDateTime(record.dateSouhaitee) : '-'}</Text>
                    {record.dureeEstimee && (
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.dureeEstimee} min</Text>
                    )}
                </Space>
            ),
        },
        {
            title: 'Statut',
            dataIndex: 'statut',
            key: 'statut',
            render: (statut) => getStatusTag(statut),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Voir détails">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDemande(record)}
                        />
                    </Tooltip>
                    {record.statut === 'EN_ATTENTE' && (
                        <>
                            <Tooltip title="Accepter">
                                <Button
                                    type="text"
                                    style={{ color: '#10b981' }}
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => handleAccepter(record)}
                                />
                            </Tooltip>
                            <Tooltip title="Refuser">
                                <Button
                                    type="text"
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => handleRefuserClick(record)}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    if (isLoading && demandesRecues.length === 0) {
        return <LoadingSpinner tip="Chargement des demandes..." />;
    }

    return (
        <div>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        Demandes de Réunion
                        {pendingDemandes.length > 0 && (
                            <Badge
                                count={pendingDemandes.length}
                                style={{ marginLeft: 12, background: '#f59e0b' }}
                            />
                        )}
                    </Title>
                    <Text type="secondary">{demandesRecues.length} demande(s) reçue(s)</Text>
                </Col>
            </Row>

            {/* Stats Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card
                        bordered={false}
                        style={{ borderRadius: 12, background: '#fef9e6', cursor: 'pointer' }}
                        onClick={() => setFilterStatus('EN_ATTENTE')}
                    >
                        <Space>
                            <ClockCircleOutlined style={{ fontSize: 24, color: '#f59e0b' }} />
                            <div>
                                <Text type="secondary">En attente</Text>
                                <Title level={3} style={{ margin: 0, color: '#f59e0b' }}>
                                    {demandesRecues.filter(d => d.statut === 'EN_ATTENTE').length}
                                </Title>
                            </div>
                        </Space>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        bordered={false}
                        style={{ borderRadius: 12, background: '#e6f7ed', cursor: 'pointer' }}
                        onClick={() => setFilterStatus('ACCEPTEE')}
                    >
                        <Space>
                            <CheckCircleOutlined style={{ fontSize: 24, color: '#10b981' }} />
                            <div>
                                <Text type="secondary">Acceptées</Text>
                                <Title level={3} style={{ margin: 0, color: '#10b981' }}>
                                    {demandesRecues.filter(d => d.statut === 'ACCEPTEE').length}
                                </Title>
                            </div>
                        </Space>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        bordered={false}
                        style={{ borderRadius: 12, background: '#fef2f2', cursor: 'pointer' }}
                        onClick={() => setFilterStatus('REFUSEE')}
                    >
                        <Space>
                            <CloseCircleOutlined style={{ fontSize: 24, color: '#ef4444' }} />
                            <div>
                                <Text type="secondary">Refusées</Text>
                                <Title level={3} style={{ margin: 0, color: '#ef4444' }}>
                                    {demandesRecues.filter(d => d.statut === 'REFUSEE').length}
                                </Title>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* Table */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col flex="auto">
                        <Search
                            placeholder="Rechercher par nom ou titre..."
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 300 }}
                            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        />
                    </Col>
                    <Col>
                        <Button
                            type={filterStatus === 'all' ? 'primary' : 'default'}
                            onClick={() => setFilterStatus('all')}
                        >
                            Toutes
                        </Button>
                    </Col>
                </Row>

                {filteredDemandes.length === 0 ? (
                    <Empty description="Aucune demande de réunion" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredDemandes}
                        rowKey="id"
                        loading={isLoading}
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `${total} demande(s)`,
                        }}
                    />
                )}
            </Card>

            {/* View Modal */}
            <Modal
                title={null}
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={selectedDemande?.statut === 'EN_ATTENTE' ? (
                    <Space>
                        <Button danger icon={<CloseCircleOutlined />} onClick={() => {
                            setIsViewModalOpen(false);
                            handleRefuserClick(selectedDemande);
                        }}>
                            Refuser
                        </Button>
                        <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => {
                            handleAccepter(selectedDemande);
                            setIsViewModalOpen(false);
                        }} style={{ background: '#10b981' }}>
                            Accepter
                        </Button>
                    </Space>
                ) : null}
                width={600}
                bodyStyle={{ padding: 0 }}
            >
                {selectedDemande && (
                    <div>
                        {/* Header */}
                        <div
                            style={{
                                background: selectedDemande.statut === 'ACCEPTEE' ? '#10b981' :
                                    selectedDemande.statut === 'REFUSEE' ? '#ef4444' : '#f59e0b',
                                padding: 24,
                                color: '#fff',
                                borderRadius: '8px 8px 0 0',
                            }}
                        >
                            {getStatusTag(selectedDemande.statut)}
                            <Title level={4} style={{ color: '#fff', margin: '8px 0 0' }}>
                                {selectedDemande.titre}
                            </Title>
                        </div>

                        {/* Content */}
                        <div style={{ padding: 24 }}>
                            {/* Demandeur */}
                            <div style={{ marginBottom: 16 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>Demandeur</Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                    <Avatar style={{ background: getAvatarColor(selectedDemande.demandeur?.nom) }}>
                                        {getInitials(selectedDemande.demandeur?.nom, selectedDemande.demandeur?.prenom)}
                                    </Avatar>
                                    <div>
                                        <Text strong>{selectedDemande.demandeur?.prenom} {selectedDemande.demandeur?.nom}</Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: 12 }}>{selectedDemande.demandeur?.email}</Text>
                                    </div>
                                </div>
                            </div>

                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Date souhaitée</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        <CalendarOutlined style={{ color: '#1e4a8d' }} />
                                        <Text strong>
                                            {selectedDemande.dateSouhaitee ? formatDateTime(selectedDemande.dateSouhaitee) : '-'}
                                        </Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Durée estimée</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        <ClockCircleOutlined style={{ color: '#c9a227' }} />
                                        <Text strong>{selectedDemande.dureeEstimee || '-'} min</Text>
                                    </div>
                                </Col>
                                {selectedDemande.lieu && (
                                    <Col span={24}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Lieu suggéré</Text>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                            <EnvironmentOutlined style={{ color: '#10b981' }} />
                                            <Text strong>{selectedDemande.lieu}</Text>
                                        </div>
                                    </Col>
                                )}
                            </Row>

                            {selectedDemande.description && (
                                <div style={{ marginTop: 16 }}>
                                    <Title level={5} style={{ marginBottom: 8 }}>Description</Title>
                                    <Paragraph style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                        {selectedDemande.description}
                                    </Paragraph>
                                </div>
                            )}

                            {selectedDemande.ordreDuJour && (
                                <div style={{ marginTop: 16 }}>
                                    <Title level={5} style={{ marginBottom: 8 }}>
                                        <FileTextOutlined style={{ marginRight: 8 }} />
                                        Ordre du jour proposé
                                    </Title>
                                    <Paragraph style={{ whiteSpace: 'pre-line', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                        {selectedDemande.ordreDuJour}
                                    </Paragraph>
                                </div>
                            )}

                            {selectedDemande.statut === 'REFUSEE' && selectedDemande.motifRefus && (
                                <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', borderRadius: 8 }}>
                                    <Text type="danger" strong>Motif du refus:</Text>
                                    <Paragraph style={{ margin: '4px 0 0' }}>{selectedDemande.motifRefus}</Paragraph>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Refuse Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CloseCircleOutlined style={{ color: '#ef4444' }} />
                        <span>Refuser la demande</span>
                    </div>
                }
                open={isRefuseModalOpen}
                onCancel={() => {
                    setIsRefuseModalOpen(false);
                    refuseForm.resetFields();
                }}
                footer={null}
            >
                <Form form={refuseForm} layout="vertical" onFinish={handleRefuserSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <Text>Vous êtes sur le point de refuser la demande de réunion:</Text>
                        <div style={{ marginTop: 8, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                            <Text strong>{selectedDemande?.titre}</Text>
                            <br />
                            <Text type="secondary">de {selectedDemande?.demandeur?.prenom} {selectedDemande?.demandeur?.nom}</Text>
                        </div>
                    </div>

                    <Form.Item
                        name="motifRefus"
                        label="Motif du refus"
                        rules={[{ required: true, message: 'Veuillez indiquer le motif du refus' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Expliquez pourquoi vous refusez cette demande..."
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsRefuseModalOpen(false)}>Annuler</Button>
                            <Button type="primary" danger htmlType="submit" icon={<CloseCircleOutlined />}>
                                Confirmer le refus
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DemandesReunionManagement;
