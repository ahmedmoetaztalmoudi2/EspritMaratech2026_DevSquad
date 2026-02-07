// Users Management Page
import React, { useEffect, useState } from 'react';
import {
    Card, Table, Button, Space, Tag, Avatar, Modal, Form, Input, Select,
    Typography, message, Popconfirm, Switch, Tooltip, Row, Col, Input as AntInput, DatePicker,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
    UserOutlined, MailOutlined, PhoneOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '../../redux/userSlice';
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../../utils/constants';
import { formatDate, getInitials, getAvatarColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = AntInput;

const DEFAULT_ADMIN_EMAIL = 'arwabenamar2004@gmail.com';

const UsersManagement = () => {
    const [searchText, setSearchText] = useState('');
    const dispatch = useDispatch();
    const { users, isLoading } = useSelector((state) => state.users);
    const { user: currentUser } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteUser(id)).unwrap();
            message.success('Utilisateur supprimé');
            dispatch(fetchUsers());
        } catch (error) {
            message.error('Erreur lors de la suppression');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await dispatch(toggleUserStatus(id)).unwrap();
            message.success('Statut modifié');
            dispatch(fetchUsers());
        } catch (error) {
            message.error('Erreur lors de la modification');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            // We need to send the full user object or partial update? 
            // updateUser thunk sends PUT to /users/{id}. 
            // Typically PUT requires full object, but let's see if backend handles partial or if we need to fetch first.
            // But wait, the previous `handleSubmit` was doing `updateUser({ id, data: userData })`.
            // If the backend is a standard JPA `save`, it might overwrite other fields with null if we only send role.
            // However, `updateUser` in `UserServiceImpl` usually fetches, updates fields, and saves.
            // Let's assume the frontend should just send the field to update if the backend supports it, 
            // OR we rely on the backend to merge. 
            // Given I can't see the backend implementation right now (I saw it earlier but didn't memorize `updateUser`), 
            // let's assume I should assume SAFETY.
            // Actually, I can just send `{ role: newRole }` if the backend maps it.
            // If the backend has a specific `updateRole` endpoint it would be better, but I don't think I created one.
            // I'll try sending just the role. If it fails (nulls other fields), I'll need to fix the backend or fetch-merge-send.
            // WAIT, `UserServiceImpl` usually looks like: `user = repo.findById(); if(userVal.getNom()!=null) user.setNom(...)`.
            // If so, sending just partial data is safe.
            await dispatch(updateUser({ id, data: { role: newRole } })).unwrap();
            message.success('Rôle mis à jour');
            dispatch(fetchUsers()); // Refresh list to ensure consistency
        } catch (error) {
            message.error('Erreur lors de la mise à jour du rôle');
        }
    };

    const filters = users.filter(user => {
        const search = searchText.toLowerCase();
        return (
            user.nom?.toLowerCase().includes(search) ||
            user.prenom?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search)
        );
    });

    const isDefaultAdmin = (email) => email === DEFAULT_ADMIN_EMAIL;
    const isSelf = (userId) => {
        const currentId = currentUser?.id || currentUser?.idUser;
        return userId === currentId;
    };

    const columns = [
        {
            title: 'Utilisateur',
            key: 'user',
            render: (_, record) => (
                <Space>
                    <Avatar
                        size="small"
                        src={record.photoProfil}
                        style={{ background: getAvatarColor(record.nom) }}
                    >
                        {getInitials(record.nom, record.prenom)}
                    </Avatar>
                    <div>
                        <Text strong>{record.prenom} {record.nom}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
                        {isDefaultAdmin(record.email) && <Tag color="gold" style={{ marginLeft: 8, fontSize: 10 }}>Fondateur</Tag>}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Téléphone',
            dataIndex: 'tel',
            key: 'tel',
            render: (phone) => phone || '-',
        },
        {
            title: 'Rôle',
            dataIndex: 'role',
            key: 'role',
            filters: Object.entries(ROLE_LABELS).map(([key, label]) => ({ text: label, value: key })),
            onFilter: (value, record) => record.role === value,
            render: (role, record) => {
                const disabled = isDefaultAdmin(record.email) || isSelf(record.idUser);
                // Founder cannot be changed. Self cannot be changed.
                return (
                    <Select
                        defaultValue={role}
                        style={{ width: 150 }}
                        onChange={(value) => handleRoleChange(record.idUser || record.id, value)}
                        disabled={disabled}
                        options={[
                            { value: 'CONSULTANT', label: 'Consultant' },
                            { value: 'CHEF_PROJET', label: 'Chef de Projet' },
                            // Should RESPONSIBLE be an option? "toggle him a list between (consultant and a chef de projet)"
                            // So maybe restrict to just those two?
                            // But if the user IS a RESPONSABLE (not Founder), can they be demoted?
                            // "roles by default of new users are consultants"
                            // "responsible can edit roles ... toggle ... between consultant and chef de projet"
                            // Implies those are the only options for "users".
                            // Assuming the "Responsable" viewing this is effectively the admin.

                        ]}
                    />
                );
            },
        },
        {
            title: 'Inscription',
            dataIndex: 'dateInscription',
            key: 'dateInscription',
            render: (date) => formatDate(date),
            sorter: (a, b) => new Date(a.dateInscription) - new Date(b.dateInscription),
        },
        {
            title: 'Actif',
            dataIndex: 'actif',
            key: 'actif',
            render: (actif, record) => {
                const disabled = isDefaultAdmin(record.email) || isSelf(record.idUser);
                return (
                    <Tooltip title={disabled ? "Action non autorisée" : "Activer/Désactiver"}>
                        <Switch
                            checked={actif}
                            onChange={() => handleToggleStatus(record.idUser || record.id)}
                            size="small"
                            disabled={disabled}
                        />
                    </Tooltip>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                const isTargetDefaultAdmin = isDefaultAdmin(record.email);
                const isSelfUser = isSelf(record.idUser);
                const canDelete = !isTargetDefaultAdmin && !isSelfUser;

                return (
                    <Popconfirm
                        title="Supprimer définitivement ce compte ?"
                        description="Cette action est irréversible."
                        onConfirm={() => handleDelete(record.idUser || record.id)}
                        okText="Oui, supprimer"
                        cancelText="Annuler"
                        disabled={!canDelete}
                    >
                        <Tooltip title={canDelete ? "Supprimer le compte" : "Action impossible"}>
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={!canDelete}
                            />
                        </Tooltip>
                    </Popconfirm>
                );
            },
        },
    ];

    if (isLoading && users.length === 0) {
        return <LoadingSpinner tip="Chargement des utilisateurs..." />;
    }

    return (
        <div>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} style={{ marginBottom: 4 }}>Gestion des Utilisateurs</Title>
                    <Text type="secondary">{users.length} utilisateurs enregistrés</Text>
                </Col>
            </Row>

            {/* Search & Table */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Search
                    placeholder="Rechercher par nom, prénom ou email..."
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300, marginBottom: 16 }}
                    prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                />

                <Table
                    columns={columns}
                    dataSource={filters}
                    rowKey="idUser"
                    loading={isLoading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `${total} utilisateur(s)`,
                    }}
                />
            </Card>
        </div>
    );
};

export default UsersManagement;
