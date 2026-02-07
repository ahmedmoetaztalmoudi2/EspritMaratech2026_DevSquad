// Mes Réunions Page - Custom Grid Calendar
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Input, Tag, Modal, Avatar, Tooltip, Descriptions, Divider, Button, Space, Form, DatePicker, Select, message, List, Empty } from 'antd';
import {
    CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined,
    TeamOutlined, FileTextOutlined, LeftOutlined, RightOutlined,
    CheckCircleOutlined, CloseCircleOutlined, SearchOutlined,
    PlusOutlined, SendOutlined, HistoryOutlined,
    EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReunions, updateReunion, deleteReunion } from '../../redux/reunionSlice';
import { fetchUsers } from '../../redux/userSlice';
import { createDemande, fetchDemandesByDemandeur } from '../../redux/demandeReunionSlice';
import { STATUT_REUNION_LABELS, STATUT_REUNION_COLORS } from '../../utils/constants';
import { formatDate, formatDateTime, getInitials, getAvatarColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Popconfirm } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const MesReunions = () => {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [selectedReunion, setSelectedReunion] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isDemandeModalOpen, setIsDemandeModalOpen] = useState(false);
    const [isMesDemandesOpen, setIsMesDemandesOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingReunion, setEditingReunion] = useState(null);
    const [editForm] = Form.useForm();
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const { reunions, isLoading } = useSelector((state) => state.reunions);
    const { user } = useSelector((state) => state.auth);
    const { users } = useSelector((state) => state.users);
    const { mesDemandes, isLoading: isLoadingDemandes } = useSelector((state) => state.demandesReunion);

    useEffect(() => {
        dispatch(fetchReunions());
        dispatch(fetchUsers());
        const userId = user?.idUser || user?.id; // Handle both idUser and id
        if (userId) {
            dispatch(fetchDemandesByDemandeur(userId));
        }
    }, [dispatch, user]);

    // Navigation
    const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
    const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
    const goToToday = () => setCurrentDate(dayjs());

    // Get calendar days for the month
    const getCalendarDays = () => {
        const startOfMonth = currentDate.startOf('month');
        const endOfMonth = currentDate.endOf('month');
        const startOfCalendar = startOfMonth.startOf('week');
        const endOfCalendar = endOfMonth.endOf('week');

        const days = [];
        let day = startOfCalendar;

        while (day.isBefore(endOfCalendar) || day.isSame(endOfCalendar, 'day')) {
            days.push(day);
            day = day.add(1, 'day');
        }

        return days;
    };

    // Get reunions for a specific date
    const getReunionsForDate = (date) => {
        return reunions.filter(reunion => {
            const reunionDate = dayjs(reunion.dateDebut);
            return reunionDate.isSame(date, 'day');
        }).filter(reunion => {
            if (!searchText) return true;
            return reunion.titre?.toLowerCase().includes(searchText.toLowerCase());
        });
    };

    // Handle reunion click
    const handleReunionClick = (reunion, e) => {
        e.stopPropagation();
        setSelectedReunion(reunion);
        setIsModalOpen(true);
    };

    const calendarDays = getCalendarDays();
    const weekDays = ['Sam', 'Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];

    // Get status background color
    const getEventBgColor = (statut) => {
        switch (statut) {
            case 'PLANIFIEE': return '#e8f4fd';
            case 'TERMINEE': return '#e6f7ed';
            case 'ANNULEE': return '#fef2f2';
            case 'EN_COURS': return '#fef9e6';
            default: return '#f5f5f5';
        }
    };

    const getEventTextColor = (statut) => {
        switch (statut) {
            case 'PLANIFIEE': return '#1e4a8d';
            case 'TERMINEE': return '#10b981';
            case 'ANNULEE': return '#ef4444';
            case 'EN_COURS': return '#c9a227';
            default: return '#64748b';
        }
    };

    const handleEditReunion = (reunion) => {
        setEditingReunion(reunion);
        editForm.setFieldsValue({
            ...reunion,
            dateRange: [dayjs(reunion.dateDebut), dayjs(reunion.dateFin)],
            participantIds: reunion.participants?.map(p => p.idUser || p.id) || [],
        });
        setIsModalOpen(false);
        setIsEditModalOpen(true);
    };

    const handleDeleteReunion = async (id) => {
        try {
            await dispatch(deleteReunion({ id, userId: user?.idUser || user?.id })).unwrap();
            message.success('Réunion supprimée avec succès');
            setIsModalOpen(false);
        } catch (error) {
            message.error('Erreur lors de la suppression');
        }
    };

    const handleUpdateSubmit = async (values) => {
        try {
            const [dateDebut, dateFin] = values.dateRange;
            const data = {
                ...values,
                organisateurId: user?.idUser || user?.id,
                dateDebut: dateDebut.format('YYYY-MM-DDTHH:mm:ss'),
                dateFin: dateFin.format('YYYY-MM-DDTHH:mm:ss'),
                participants: users.filter(u => values.participantIds?.includes(u.idUser || u.id)),
            };

            await dispatch(updateReunion({ id: editingReunion.id, data, userId: user?.idUser || user?.id })).unwrap();
            message.success('Réunion modifiée avec succès');
            setIsEditModalOpen(false);
            setEditingReunion(null);
        } catch (error) {
            message.error('Erreur lors de la modification');
        }
    };

    if (isLoading && reunions.length === 0) {
        return <LoadingSpinner tip="Chargement des réunions..." />;
    }

    return (
        <div>
            {/* Header */}
            <Card
                bordered={false}
                style={{ borderRadius: 12, marginBottom: 16 }}
                bodyStyle={{ padding: '16px 24px' }}
            >
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space size={16}>
                            <Button
                                type="text"
                                icon={<LeftOutlined />}
                                onClick={prevMonth}
                                style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CalendarOutlined style={{ fontSize: 18, color: '#1e4a8d' }} />
                                <Title level={4} style={{ margin: 0, minWidth: 160, textAlign: 'center' }}>
                                    {currentDate.format('MMMM, YYYY')}
                                </Title>
                            </div>
                            <Button
                                type="text"
                                icon={<RightOutlined />}
                                onClick={nextMonth}
                                style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}
                            />
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Search
                                placeholder="Rechercher..."
                                allowClear
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ width: 200 }}
                                prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                            />
                            <Button onClick={goToToday}>Aujourd'hui</Button>
                            <Button
                                icon={<HistoryOutlined />}
                                onClick={() => setIsMesDemandesOpen(true)}
                            >
                                Mes Demandes {mesDemandes.length > 0 && `(${mesDemandes.length})`}
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setIsDemandeModalOpen(true)}
                                style={{ background: '#1e4a8d' }}
                            >
                                Demande Réunion
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Calendar Grid */}
            <Card
                bordered={false}
                style={{ borderRadius: 12 }}
                bodyStyle={{ padding: 0 }}
            >
                {/* Week Days Header */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        borderBottom: '1px solid #e2e8f0',
                    }}
                >
                    {weekDays.map((day, index) => (
                        <div
                            key={day}
                            style={{
                                padding: '12px 16px',
                                textAlign: 'center',
                                fontWeight: 600,
                                color: index === 0 || index === 1 ? '#64748b' : '#1e293b',
                                background: '#f8fafc',
                            }}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                    }}
                >
                    {calendarDays.map((day, index) => {
                        const isCurrentMonth = day.isSame(currentDate, 'month');
                        const isToday = day.isSame(dayjs(), 'day');
                        const dayReunions = getReunionsForDate(day);

                        return (
                            <div
                                key={index}
                                style={{
                                    minHeight: 120,
                                    padding: 8,
                                    borderRight: (index + 1) % 7 !== 0 ? '1px solid #f1f5f9' : 'none',
                                    borderBottom: '1px solid #f1f5f9',
                                    background: isToday ? '#f0f7ff' : 'transparent',
                                    opacity: isCurrentMonth ? 1 : 0.4,
                                }}
                            >
                                {/* Day Number */}
                                <div
                                    style={{
                                        fontSize: 14,
                                        fontWeight: isToday ? 700 : 500,
                                        color: isToday ? '#1e4a8d' : '#64748b',
                                        marginBottom: 4,
                                    }}
                                >
                                    {day.date()}
                                </div>

                                {/* Events */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {dayReunions.slice(0, 2).map((reunion) => (
                                        <div
                                            key={reunion.id}
                                            onClick={(e) => handleReunionClick(reunion, e)}
                                            style={{
                                                background: getEventBgColor(reunion.statut),
                                                borderRadius: 8,
                                                padding: '8px 10px',
                                                cursor: 'pointer',
                                                borderLeft: `3px solid ${STATUT_REUNION_COLORS[reunion.statut]}`,
                                                transition: 'transform 0.15s',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            {/* Event Title */}
                                            <Text
                                                strong
                                                style={{
                                                    fontSize: 12,
                                                    color: getEventTextColor(reunion.statut),
                                                    display: 'block',
                                                    marginBottom: 2,
                                                }}
                                                ellipsis
                                            >
                                                {reunion.titre}
                                            </Text>

                                            {/* Event Description */}
                                            <Text
                                                type="secondary"
                                                style={{ fontSize: 11, display: 'block', marginBottom: 6 }}
                                                ellipsis
                                            >
                                                {reunion.ordreDuJour?.substring(0, 25) || reunion.lieu}...
                                            </Text>

                                            {/* Bottom Row: Time and Participants */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                {/* Time Badge */}
                                                <Tag
                                                    style={{
                                                        fontSize: 10,
                                                        margin: 0,
                                                        padding: '2px 6px',
                                                        background: STATUT_REUNION_COLORS[reunion.statut],
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 4,
                                                    }}
                                                >
                                                    {dayjs(reunion.dateDebut).format('HH:mm')}
                                                </Tag>

                                                {/* Participants */}
                                                {reunion.participants?.length > 0 && (
                                                    <Avatar.Group
                                                        maxCount={2}
                                                        size={20}
                                                        maxStyle={{
                                                            background: '#1e4a8d',
                                                            fontSize: 10,
                                                            width: 20,
                                                            height: 20,
                                                            lineHeight: '20px',
                                                        }}
                                                    >
                                                        {reunion.participants.map((p, idx) => (
                                                            <Tooltip title={`${p.prenom} ${p.nom}`} key={idx}>
                                                                <Avatar
                                                                    size={20}
                                                                    src={p.photoProfil}
                                                                    style={{
                                                                        background: getAvatarColor(p.nom),
                                                                        fontSize: 9,
                                                                    }}
                                                                >
                                                                    {getInitials(p.nom, p.prenom)}
                                                                </Avatar>
                                                            </Tooltip>
                                                        ))}
                                                    </Avatar.Group>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {dayReunions.length > 2 && (
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: 11, textAlign: 'center', cursor: 'pointer' }}
                                            onClick={() => {
                                                // Could open a modal with all events for this day
                                            }}
                                        >
                                            +{dayReunions.length - 2} autres
                                        </Text>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Meeting Detail Modal */}
            <Modal
                title={null}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={600}
                bodyStyle={{ padding: 0 }}
            >
                {selectedReunion && (
                    <div>
                        {/* Header */}
                        <div
                            style={{
                                background: `linear-gradient(135deg, ${STATUT_REUNION_COLORS[selectedReunion.statut]} 0%, ${STATUT_REUNION_COLORS[selectedReunion.statut]}cc 100%)`,
                                padding: 24,
                                color: '#fff',
                                borderRadius: '8px 8px 0 0',
                            }}
                        >
                            <Tag color="rgba(255,255,255,0.2)" style={{ color: '#fff', marginBottom: 8 }}>
                                {STATUT_REUNION_LABELS[selectedReunion.statut]}
                            </Tag>
                            <Title level={4} style={{ color: '#fff', margin: 0 }}>
                                {selectedReunion.titre}
                            </Title>
                        </div>

                        {/* Content */}
                        <div style={{ padding: 24 }}>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Date</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        <CalendarOutlined style={{ color: '#1e4a8d' }} />
                                        <Text strong>{formatDate(selectedReunion.dateDebut)}</Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Horaire</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        <ClockCircleOutlined style={{ color: '#c9a227' }} />
                                        <Text strong>
                                            {dayjs(selectedReunion.dateDebut).format('HH:mm')} - {dayjs(selectedReunion.dateFin).format('HH:mm')}
                                        </Text>
                                    </div>
                                </Col>
                                <Col span={24}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Lieu</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        <EnvironmentOutlined style={{ color: '#10b981' }} />
                                        <Text strong>{selectedReunion.lieu}</Text>
                                    </div>
                                    {selectedReunion.lienMeet && (
                                        <div style={{ marginTop: 8 }}>
                                            <Button type="primary" href={selectedReunion.lienMeet} target="_blank" icon={<EnvironmentOutlined />}>
                                                Rejoindre la réunion
                                            </Button>
                                        </div>
                                    )}
                                </Col>
                            </Row>

                            <Divider />

                            {/* Ordre du jour */}
                            {selectedReunion.ordreDuJour && (
                                <>
                                    <Title level={5} style={{ marginBottom: 12 }}>Ordre du jour</Title>
                                    <Paragraph style={{ whiteSpace: 'pre-line', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                        {selectedReunion.ordreDuJour}
                                    </Paragraph>
                                </>
                            )}

                            {/* Participants */}
                            {selectedReunion.participants?.length > 0 && (
                                <>
                                    <Title level={5} style={{ marginTop: 16, marginBottom: 12 }}>
                                        <TeamOutlined style={{ marginRight: 8 }} />
                                        Participants ({selectedReunion.participants.length})
                                    </Title>
                                    <Space wrap size={8}>
                                        {selectedReunion.participants.map((p, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    background: '#f8fafc',
                                                    padding: '6px 12px',
                                                    borderRadius: 20
                                                }}
                                            >
                                                <Avatar
                                                    size={24}
                                                    src={p.photoProfil}
                                                    style={{ background: getAvatarColor(p.nom) }}
                                                >
                                                    {getInitials(p.nom, p.prenom)}
                                                </Avatar>
                                                <Text style={{ fontSize: 13 }}>{p.prenom} {p.nom}</Text>
                                            </div>
                                        ))}
                                    </Space>
                                </>
                            )}

                            {/* Compte Rendu */}
                            {selectedReunion.compteRendu && (
                                <>
                                    <Divider />
                                    <Title level={5}>
                                        <FileTextOutlined style={{ marginRight: 8 }} />
                                        Compte Rendu
                                    </Title>
                                    <Card size="small" style={{ background: '#e6f7ed', borderRadius: 8, border: 'none' }}>
                                        <Paragraph style={{ whiteSpace: 'pre-line', margin: 0 }}>
                                            {selectedReunion.compteRendu}
                                        </Paragraph>
                                    </Card>
                                </>
                            )}

                            {/* Actions for owner */}
                            {(user.role === 'RESPONSABLE' || selectedReunion.organisateur?.idUser === (user?.id || user?.idUser)) && (
                                <div style={{ marginTop: 24, textAlign: 'right' }}>
                                    <Space>
                                        <Button
                                            icon={<EditOutlined />}
                                            onClick={() => handleEditReunion(selectedReunion)}
                                        >
                                            Modifier
                                        </Button>
                                        <Popconfirm
                                            title="Supprimer cette réunion ?"
                                            onConfirm={() => handleDeleteReunion(selectedReunion.id)}
                                            okText="Oui"
                                            cancelText="Non"
                                        >
                                            <Button
                                                danger
                                                icon={<DeleteOutlined />}
                                            >
                                                Supprimer
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Reunion Modal */}
            <Modal
                title="Modifier la réunion"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdateSubmit}
                >
                    <Form.Item name="titre" label="Titre" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="dateRange" label="Date et Heure" rules={[{ required: true }]}>
                        <DatePicker.RangePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="lieu" label="Lieu" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="participantIds" label="Participants">
                        <Select mode="multiple" options={users.map(u => ({ value: u.idUser || u.id, label: `${u.prenom} ${u.nom}` }))} />
                    </Form.Item>
                    <Form.Item name="ordreDuJour" label="Ordre du jour">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button onClick={() => setIsEditModalOpen(false)}>Annuler</Button>
                            <Button type="primary" htmlType="submit">Enregistrer</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Demande Réunion */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SendOutlined style={{ color: '#1e4a8d' }} />
                        <span>Demander une Réunion</span>
                    </div>
                }
                open={isDemandeModalOpen}
                onCancel={() => {
                    setIsDemandeModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
                width={500}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={async (values) => {
                        try {
                            const demande = {
                                titre: values.titre,
                                description: values.description,
                                dateSouhaitee: values.dateSouhaitee?.format('YYYY-MM-DDTHH:mm:ss'),
                                dureeEstimee: values.dureeEstimee,
                                lieu: values.lieu,
                                ordreDuJour: values.ordreDuJour,
                            };
                            await dispatch(createDemande({
                                demande,
                                demandeurId: user?.idUser || user?.id,
                                destinataireId: values.destinataireId
                            })).unwrap();
                            message.success('Demande de réunion envoyée avec succès !');
                            setIsDemandeModalOpen(false);
                            form.resetFields();
                            dispatch(fetchDemandesByDemandeur(user?.idUser || user?.id));
                        } catch (error) {
                            message.error(error || 'Erreur lors de l\'envoi de la demande');
                        }
                    }}
                >
                    <Form.Item
                        name="titre"
                        label="Titre de la réunion"
                        rules={[{ required: true, message: 'Veuillez saisir un titre' }]}
                    >
                        <Input placeholder="Ex: Réunion de suivi projet X" />
                    </Form.Item>

                    <Form.Item
                        name="destinataireId"
                        label="Chef de projet destinataire"
                        rules={[{ required: true, message: 'Veuillez sélectionner un chef de projet' }]}
                    >
                        <Select
                            placeholder="Sélectionnez un chef de projet"
                            showSearch
                            optionFilterProp="children"
                        >
                            {users
                                .filter(u => u.role === 'CHEF_PROJET' || u.role === 'RESPONSABLE')
                                .map(u => (
                                    <Select.Option key={u.idUser || u.id} value={u.idUser || u.id}>
                                        {u.prenom} {u.nom} ({u.role})
                                    </Select.Option>
                                ))
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dateSouhaitee"
                        label="Date souhaitée"
                        rules={[{ required: true, message: 'Veuillez sélectionner une date' }]}
                    >
                        <DatePicker
                            showTime
                            format="DD/MM/YYYY HH:mm"
                            style={{ width: '100%' }}
                            placeholder="Sélectionnez une date et heure"
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="dureeEstimee" label="Durée estimée (min)">
                                <Select placeholder="Durée">
                                    <Select.Option value={30}>30 min</Select.Option>
                                    <Select.Option value={60}>1 heure</Select.Option>
                                    <Select.Option value={90}>1h30</Select.Option>
                                    <Select.Option value={120}>2 heures</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="lieu" label="Lieu suggéré">
                                <Input placeholder="Salle A, Teams, etc." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Description">
                        <TextArea rows={2} placeholder="Décrivez brièvement l'objet de la réunion" />
                    </Form.Item>

                    <Form.Item name="ordreDuJour" label="Ordre du jour proposé">
                        <TextArea rows={3} placeholder="1. Point 1&#10;2. Point 2&#10;3. Questions diverses" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsDemandeModalOpen(false)}>Annuler</Button>
                            <Button type="primary" htmlType="submit" icon={<SendOutlined />} style={{ background: '#1e4a8d' }}>
                                Envoyer la demande
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Mes Demandes */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <HistoryOutlined style={{ color: '#1e4a8d' }} />
                        <span>Mes Demandes de Réunion</span>
                    </div>
                }
                open={isMesDemandesOpen}
                onCancel={() => setIsMesDemandesOpen(false)}
                footer={null}
                width={600}
            >
                {mesDemandes.length === 0 ? (
                    <Empty description="Aucune demande envoyée" />
                ) : (
                    <List
                        dataSource={mesDemandes}
                        renderItem={(demande) => {
                            const getStatusTag = (statut) => {
                                switch (statut) {
                                    case 'EN_ATTENTE':
                                        return <Tag color="orange">En attente</Tag>;
                                    case 'ACCEPTEE':
                                        return <Tag color="green" icon={<CheckCircleOutlined />}>Acceptée</Tag>;
                                    case 'REFUSEE':
                                        return <Tag color="red" icon={<CloseCircleOutlined />}>Refusée</Tag>;
                                    default:
                                        return <Tag>{statut}</Tag>;
                                }
                            };

                            return (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar style={{ background: demande.statut === 'ACCEPTEE' ? '#10b981' : demande.statut === 'REFUSEE' ? '#ef4444' : '#f59e0b' }}>
                                                {demande.statut === 'ACCEPTEE' ? <CheckCircleOutlined /> : demande.statut === 'REFUSEE' ? <CloseCircleOutlined /> : <ClockCircleOutlined />}
                                            </Avatar>
                                        }
                                        title={
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text strong>{demande.titre}</Text>
                                                {getStatusTag(demande.statut)}
                                            </div>
                                        }
                                        description={
                                            <div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Envoyée à: {demande.destinataire?.prenom} {demande.destinataire?.nom}
                                                </Text>
                                                <br />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Date souhaitée: {demande.dateSouhaitee ? formatDateTime(demande.dateSouhaitee) : '-'}
                                                </Text>
                                                {demande.statut === 'REFUSEE' && demande.motifRefus && (
                                                    <div style={{ marginTop: 8, padding: 8, background: '#fef2f2', borderRadius: 6 }}>
                                                        <Text type="danger" style={{ fontSize: 12 }}>
                                                            <strong>Motif du refus:</strong> {demande.motifRefus}
                                                        </Text>
                                                    </div>
                                                )}
                                            </div>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default MesReunions;

