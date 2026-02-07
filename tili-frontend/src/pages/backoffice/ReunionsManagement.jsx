// Reunions Management Page with Role-Based Permissions and Calendar View
import React, { useEffect, useState } from 'react';
import {
    Card, Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker,
    Typography, message, Row, Col, Tooltip, Popconfirm, Avatar, Tabs,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
    CalendarOutlined, EyeOutlined, FileTextOutlined, TeamOutlined,
    EnvironmentOutlined, LeftOutlined, RightOutlined, UnorderedListOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReunions, createReunion, updateReunion, deleteReunion } from '../../redux/reunionSlice';
import { fetchUsers } from '../../redux/userSlice';
import {
    STATUT_REUNION_LABELS, STATUT_REUNION_COLORS,
    MEETING_PERMISSIONS
} from '../../utils/constants';
import { formatDateTime, formatDate, getInitials, getAvatarColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const { Title, Text, Paragraph } = Typography;
const { Search, TextArea } = Input;
const { RangePicker } = DatePicker;

const ReunionsManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingReunion, setEditingReunion] = useState(null);
    const [viewingReunion, setViewingReunion] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [statutFilter, setStatutFilter] = useState(null);
    const [activeTab, setActiveTab] = useState('1');
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const { reunions, isLoading } = useSelector((state) => state.reunions);
    const { users } = useSelector((state) => state.users);
    const { user } = useSelector((state) => state.auth);

    // Get user permissions
    const userPermissions = MEETING_PERMISSIONS[user?.role] || {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAddCompteRendu: false,
    };

    useEffect(() => {
        dispatch(fetchReunions());
        dispatch(fetchUsers());
    }, [dispatch]);

    // Calendar navigation
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
        return filteredReunions.filter(reunion => {
            const reunionDate = dayjs(reunion.dateDebut);
            return reunionDate.isSame(date, 'day');
        });
    };

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

    const handleOpenModal = (reunion = null) => {
        // Check permissions
        if (!reunion && !userPermissions.canCreate) {
            message.warning('Vous n\'avez pas la permission de créer des réunions');
            return;
        }
        if (reunion && !userPermissions.canEdit) {
            message.warning('Vous n\'avez pas la permission de modifier des réunions');
            return;
        }

        setEditingReunion(reunion);
        if (reunion) {
            form.setFieldsValue({
                ...reunion,
                dateRange: [dayjs(reunion.dateDebut), dayjs(reunion.dateFin)],
                participantIds: reunion.participants?.map(p => p.id) || [],
            });
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingReunion(null);
        form.resetFields();
    };

    const handleViewReunion = (reunion) => {
        setViewingReunion(reunion);
        setIsViewModalOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            const [dateDebut, dateFin] = values.dateRange;
            const data = {
                ...values,
                organisateurId: user?.id || user?.idUser,
                dateDebut: dateDebut.toISOString(),
                dateFin: dateFin.toISOString(),
                participants: users.filter(u => values.participantIds?.includes(u.id)),
                organisateur: user,
            };

            if (editingReunion) {
                await dispatch(updateReunion({ id: editingReunion.id, data })).unwrap();
                message.success('Réunion modifiée avec succès');
            } else {
                await dispatch(createReunion(data)).unwrap();
                message.success('Réunion créée avec succès');
            }
            handleCloseModal();
        } catch (error) {
            message.error('Une erreur est survenue');
        }
    };

    const handleDelete = async (id) => {
        if (!userPermissions.canDelete) {
            message.warning('Vous n\'avez pas la permission de supprimer des réunions');
            return;
        }
        try {
            await dispatch(deleteReunion(id)).unwrap();
            message.success('Réunion supprimée');
        } catch (error) {
            message.error('Erreur lors de la suppression');
        }
    };

    const filteredReunions = reunions.filter(reunion => {
        const matchesSearch = searchText
            ? reunion.titre?.toLowerCase().includes(searchText.toLowerCase())
            : true;
        const matchesStatut = statutFilter ? reunion.statut === statutFilter : true;
        return matchesSearch && matchesStatut;
    });

    const columns = [
        {
            title: 'Réunion',
            key: 'reunion',
            render: (_, record) => (
                <Space>
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            background: '#1e4a8d10',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ fontSize: 16, fontWeight: 700, color: '#1e4a8d', lineHeight: 1 }}>
                            {new Date(record.dateDebut).getDate()}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#1e4a8d', textTransform: 'uppercase' }}>
                            {new Date(record.dateDebut).toLocaleString('fr', { month: 'short' })}
                        </Text>
                    </div>
                    <div>
                        <Text strong style={{ cursor: 'pointer' }} onClick={() => handleViewReunion(record)}>
                            {record.titre}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDateTime(record.dateDebut)}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Lieu',
            dataIndex: 'lieu',
            key: 'lieu',
            render: (lieu) => (
                <Space>
                    <EnvironmentOutlined style={{ color: '#64748b' }} />
                    <Text>{lieu}</Text>
                </Space>
            ),
        },
        {
            title: 'Participants',
            key: 'participants',
            render: (_, record) => (
                <Avatar.Group maxCount={3} size="small">
                    {record.participants?.map((p, idx) => (
                        <Tooltip title={`${p.prenom} ${p.nom}`} key={idx}>
                            <Avatar style={{ background: getAvatarColor(p.nom) }}>
                                {getInitials(p.nom, p.prenom)}
                            </Avatar>
                        </Tooltip>
                    ))}
                </Avatar.Group>
            ),
        },
        {
            title: 'Statut',
            dataIndex: 'statut',
            key: 'statut',
            render: (statut) => (
                <Tag color={STATUT_REUNION_COLORS[statut]}>{STATUT_REUNION_LABELS[statut]}</Tag>
            ),
        },
        {
            title: 'CR',
            key: 'compteRendu',
            width: 60,
            render: (_, record) => record.compteRendu ? (
                <Tooltip title="Compte rendu disponible">
                    <FileTextOutlined style={{ color: '#10b981' }} />
                </Tooltip>
            ) : (
                <Text type="secondary">-</Text>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Voir détails">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewReunion(record)} />
                    </Tooltip>
                    {userPermissions.canEdit && (
                        <Tooltip title="Modifier">
                            <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                        </Tooltip>
                    )}
                    {userPermissions.canDelete && (
                        <Popconfirm
                            title="Supprimer cette réunion ?"
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

    const calendarDays = getCalendarDays();
    const weekDays = ['Sam', 'Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];

    // Calendar View Component
    const CalendarView = () => (
        <div>
            {/* Calendar Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
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
                    <Button onClick={goToToday}>Aujourd'hui</Button>
                </Col>
            </Row>

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
                                            onClick={() => handleViewReunion(reunion)}
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
        </div>
    );

    // List View Component
    const ListView = () => (
        <Card bordered={false} style={{ borderRadius: 12 }}>
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col flex="auto">
                    <Search
                        placeholder="Rechercher une réunion..."
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
                        {Object.entries(STATUT_REUNION_LABELS).map(([key, label]) => (
                            <Select.Option key={key} value={key}>
                                <Tag color={STATUT_REUNION_COLORS[key]}>{label}</Tag>
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={filteredReunions}
                rowKey="id"
                loading={isLoading}
                pagination={{
                    pageSize: 10,
                    showTotal: (total) => `${total} réunion(s)`,
                }}
            />
        </Card>
    );

    const tabItems = [
        {
            key: '1',
            label: (
                <Space>
                    <UnorderedListOutlined />
                    Liste
                </Space>
            ),
            children: <ListView />,
        },
        {
            key: '2',
            label: (
                <Space>
                    <CalendarOutlined />
                    Calendrier
                </Space>
            ),
            children: <CalendarView />,
        },
    ];

    if (isLoading && reunions.length === 0) {
        return <LoadingSpinner tip="Chargement des réunions..." />;
    }

    return (
        <div>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} style={{ marginBottom: 4 }}>Gestion des Réunions</Title>
                    <Text type="secondary">{reunions.length} réunion(s)</Text>
                </Col>
                <Col>
                    {userPermissions.canCreate && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpenModal()}
                            style={{ borderRadius: 8 }}
                        >
                            Nouvelle Réunion
                        </Button>
                    )}
                </Col>
            </Row>

            {/* Tabs for List/Calendar view */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                style={{ marginBottom: 0 }}
            />

            {/* Create/Edit Modal */}
            <Modal
                title={editingReunion ? 'Modifier la réunion' : 'Nouvelle réunion'}
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
                        name="titre"
                        label="Titre de la réunion"
                        rules={[{ required: true, message: 'Titre requis' }]}
                    >
                        <Input placeholder="Titre de la réunion" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                name="dateRange"
                                label="Date et heure"
                                rules={[{ required: true, message: 'Date requise' }]}
                            >
                                <RangePicker
                                    showTime
                                    format="DD/MM/YYYY HH:mm"
                                    style={{ width: '100%' }}
                                    placeholder={['Début', 'Fin']}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="lieu"
                                label="Lieu"
                                rules={[{ required: true, message: 'Lieu requis' }]}
                            >
                                <Input placeholder="Salle / En ligne" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="participantIds"
                        label="Participants"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Sélectionner les participants"
                            optionFilterProp="label"
                            options={users.map(u => ({
                                value: u.id,
                                label: `${u.prenom} ${u.nom}`,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="ordreDuJour"
                        label="Ordre du jour"
                    >
                        <TextArea rows={3} placeholder="Points à aborder..." />
                    </Form.Item>

                    <Form.Item
                        name="statut"
                        label="Statut"
                        initialValue="PLANIFIEE"
                    >
                        <Select>
                            {Object.entries(STATUT_REUNION_LABELS).map(([key, label]) => (
                                <Select.Option key={key} value={key}>{label}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {(editingReunion && userPermissions.canAddCompteRendu) && (
                        <Form.Item
                            name="compteRendu"
                            label="Compte Rendu"
                        >
                            <TextArea rows={4} placeholder="Compte rendu de la réunion..." />
                        </Form.Item>
                    )}

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCloseModal}>Annuler</Button>
                            <Button type="primary" htmlType="submit">
                                {editingReunion ? 'Modifier' : 'Créer'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Modal */}
            <Modal
                title={null}
                open={isViewModalOpen}
                onCancel={() => setIsViewModalOpen(false)}
                footer={null}
                width={600}
                bodyStyle={{ padding: 0 }}
            >
                {viewingReunion && (
                    <div>
                        {/* Header */}
                        <div
                            style={{
                                background: `linear-gradient(135deg, ${STATUT_REUNION_COLORS[viewingReunion.statut]} 0%, ${STATUT_REUNION_COLORS[viewingReunion.statut]}cc 100%)`,
                                padding: 24,
                                color: '#fff',
                                borderRadius: '8px 8px 0 0',
                            }}
                        >
                            <Tag color="rgba(255,255,255,0.2)" style={{ color: '#fff', marginBottom: 8 }}>
                                {STATUT_REUNION_LABELS[viewingReunion.statut]}
                            </Tag>
                            <Title level={4} style={{ color: '#fff', margin: 0 }}>
                                {viewingReunion.titre}
                            </Title>
                        </div>

                        {/* Content */}
                        <div style={{ padding: 24 }}>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Date</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        <CalendarOutlined style={{ color: '#1e4a8d' }} />
                                        <Text strong>{formatDate(viewingReunion.dateDebut)}</Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Horaire</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        <ClockCircleOutlined style={{ color: '#c9a227' }} />
                                        <Text strong>
                                            {dayjs(viewingReunion.dateDebut).format('HH:mm')} - {dayjs(viewingReunion.dateFin).format('HH:mm')}
                                        </Text>
                                    </div>
                                </Col>
                                <Col span={24}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>Lieu</Text>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        <EnvironmentOutlined style={{ color: '#10b981' }} />
                                        <Text strong>{viewingReunion.lieu}</Text>
                                    </div>
                                </Col>
                            </Row>

                            {/* Ordre du jour */}
                            {viewingReunion.ordreDuJour && (
                                <div style={{ marginTop: 16 }}>
                                    <Title level={5} style={{ marginBottom: 12 }}>Ordre du jour</Title>
                                    <Paragraph style={{ whiteSpace: 'pre-line', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                        {viewingReunion.ordreDuJour}
                                    </Paragraph>
                                </div>
                            )}

                            {/* Participants */}
                            {viewingReunion.participants?.length > 0 && (
                                <div style={{ marginTop: 16 }}>
                                    <Title level={5} style={{ marginBottom: 12 }}>
                                        <TeamOutlined style={{ marginRight: 8 }} />
                                        Participants ({viewingReunion.participants.length})
                                    </Title>
                                    <Space wrap size={8}>
                                        {viewingReunion.participants.map((p, idx) => (
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
                                                <Avatar size={24} style={{ background: getAvatarColor(p.nom) }}>
                                                    {getInitials(p.nom, p.prenom)}
                                                </Avatar>
                                                <Text style={{ fontSize: 13 }}>{p.prenom} {p.nom}</Text>
                                            </div>
                                        ))}
                                    </Space>
                                </div>
                            )}

                            {/* Compte Rendu */}
                            {viewingReunion.compteRendu && (
                                <div style={{ marginTop: 16 }}>
                                    <Title level={5}>
                                        <FileTextOutlined style={{ marginRight: 8 }} />
                                        Compte Rendu
                                    </Title>
                                    <Card size="small" style={{ background: '#e6f7ed', borderRadius: 8, border: 'none' }}>
                                        <Paragraph style={{ whiteSpace: 'pre-line', margin: 0 }}>
                                            {viewingReunion.compteRendu}
                                        </Paragraph>
                                    </Card>
                                </div>
                            )}

                            {/* Action buttons for editing */}
                            {userPermissions.canEdit && (
                                <div style={{ marginTop: 24, textAlign: 'right' }}>
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            setIsViewModalOpen(false);
                                            handleOpenModal(viewingReunion);
                                        }}
                                    >
                                        Modifier
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ReunionsManagement;
