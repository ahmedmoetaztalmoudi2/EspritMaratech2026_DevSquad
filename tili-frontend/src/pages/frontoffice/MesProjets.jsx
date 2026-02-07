// Mes Projets Page (FrontOffice)
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Input, Select, Tag, Space, Empty, Progress, Avatar, Button, Modal, Form, message, Alert } from 'antd';
import {
    SearchOutlined, ProjectOutlined, CalendarOutlined, TeamOutlined, PlusOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import { fetchProjets, createProjectRequest } from '../../redux/projetSlice';
import { STATUT_PROJET, STATUT_PROJET_LABELS, STATUT_PROJET_COLORS } from '../../utils/constants';
import { formatDate, getInitials, getAvatarColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const MesProjets = () => {
    const [searchText, setSearchText] = useState('');
    const [statutFilter, setStatutFilter] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const { projets, isLoading } = useSelector((state) => state.projets);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchProjets());
    }, [dispatch]);

    const handleRequestProject = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleSubmitRequest = async (values) => {
        try {
            await dispatch(createProjectRequest({
                ...values,
                demandeur: user
            })).unwrap();
            message.success('Votre demande de projet a été envoyée avec succès');
            handleCloseModal();
        } catch (error) {
            message.error('Erreur lors de l\'envoi de la demande');
        }
    };

    const filteredProjets = projets.filter(projet => {
        const matchesSearch = searchText
            ? projet.nom?.toLowerCase().includes(searchText.toLowerCase())
            : true;
        const matchesStatut = statutFilter ? projet.statut === statutFilter : true;
        return matchesSearch && matchesStatut;
    });

    const getProgressColor = (percent) => {
        if (percent >= 80) return '#10b981';
        if (percent >= 50) return '#3b82f6';
        if (percent >= 25) return '#f59e0b';
        return '#ef4444';
    };

    if (isLoading && projets.length === 0) {
        return <LoadingSpinner tip="Chargement des projets..." />;
    }

    return (
        <div>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} style={{ marginBottom: 4 }}>Mes Projets</Title>
                    <Text type="secondary">{projets.filter(p => p.statut === 'ACTIF').length} projets actifs</Text>
                </Col>
                <Col>
                    {user?.role === 'CONSULTANT' && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleRequestProject}
                            style={{ borderRadius: 8, background: '#c9a227', borderColor: '#c9a227' }}
                        >
                            Demande Projet
                        </Button>
                    )}
                </Col>
            </Row>

            {/* Filters */}
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col flex="auto">
                        <Search
                            placeholder="Rechercher un projet..."
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
            </Card>

            {/* Project Cards */}
            {filteredProjets.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {filteredProjets.map(projet => (
                        <Col xs={24} md={12} lg={8} key={projet.id}>
                            <Card
                                bordered={false}
                                hoverable
                                style={{ borderRadius: 12, height: '100%' }}
                            >
                                <div style={{ marginBottom: 16 }}>
                                    <Row justify="space-between" align="top">
                                        <Col>
                                            <Tag color={STATUT_PROJET_COLORS[projet.statut]}>
                                                {STATUT_PROJET_LABELS[projet.statut]}
                                            </Tag>
                                        </Col>
                                        <Col>
                                            <Progress
                                                type="circle"
                                                percent={projet.pourcentageAvancement}
                                                size={48}
                                                strokeColor={getProgressColor(projet.pourcentageAvancement)}
                                            />
                                        </Col>
                                    </Row>
                                </div>

                                <Title level={5} style={{ marginBottom: 8 }}>
                                    <ProjectOutlined style={{ marginRight: 8, color: '#7c3aed' }} />
                                    {projet.nom}
                                </Title>

                                <Paragraph
                                    type="secondary"
                                    ellipsis={{ rows: 2 }}
                                    style={{ marginBottom: 16, minHeight: 44 }}
                                >
                                    {projet.description || 'Aucune description'}
                                </Paragraph>

                                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            <CalendarOutlined style={{ marginRight: 4 }} />
                                            {formatDate(projet.dateDebut)} → {formatDate(projet.dateFinPrevue)}
                                        </Text>
                                    </div>

                                    {projet.responsable && (
                                        <Space>
                                            <Avatar
                                                size="small"
                                                style={{ background: getAvatarColor(projet.responsable.nom) }}
                                            >
                                                {getInitials(projet.responsable.nom, projet.responsable.prenom)}
                                            </Avatar>
                                            <Text style={{ fontSize: 12 }}>
                                                {projet.responsable.prenom} {projet.responsable.nom}
                                            </Text>
                                        </Space>
                                    )}

                                    {projet.budget && (
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Budget: {projet.budget.toLocaleString()} TND
                                        </Text>
                                    )}
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Card bordered={false} style={{ borderRadius: 12 }}>
                    <Empty description="Aucun projet trouvé" />
                </Card>
            )}

            {/* Request Project Modal */}
            <Modal
                title="Demande de création de projet"
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitRequest}
                    style={{ marginTop: 16 }}
                >
                    <Alert
                        message="Votre demande sera envoyée à l'administration pour validation."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <Form.Item
                        name="titre"
                        label="Titre du projet"
                        rules={[{ required: true, message: 'Veuillez saisir un titre' }]}
                    >
                        <Input placeholder="Ex: Formation Inclusion Numérique" />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Type de projet"
                        rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
                    >
                        <Select placeholder="Sélectionner un type">
                            <Select.Option value="FORMATION">Formation</Select.Option>
                            <Select.Option value="ETUDE">Étude</Select.Option>
                            <Select.Option value="EVENEMENT">Événement</Select.Option>
                            <Select.Option value="AUTRE">Autre</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description et objectifs"
                        rules={[{ required: true, message: 'Veuillez décrire le projet' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Décrivez les objectifs et le contexte du projet..." />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCloseModal}>Annuler</Button>
                            <Button type="primary" htmlType="submit" style={{ background: '#c9a227', borderColor: '#c9a227' }}>
                                Envoyer la demande
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MesProjets;
