import React, { useEffect, useState } from 'react';
import {
    Card, List, Typography, Tag, Button, Space, Empty,
    Tabs, Badge, Tooltip, Popconfirm, message, Modal, Grid
} from 'antd';
import {
    CheckCircleOutlined, DeleteOutlined, InfoCircleOutlined,
    BellOutlined, FilterOutlined, EyeOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../../redux/notificationSlice';
import { formatDateTime, formatRelativeTime } from '../../utils/helpers';
import { TYPE_NOTIFICATION_COLORS } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const { Title, Text } = Typography;

const NotificationsPage = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { notifications, unreadCount, isLoading } = useSelector((state) => state.notifications);
    const [activeTab, setActiveTab] = useState('all');

    const userId = user?.id || user?.idUser;
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => {
        if (userId) {
            dispatch(fetchNotifications(userId));
        }
    }, [dispatch, userId]);

    const handleMarkAsRead = (id) => {
        dispatch(markAsRead(id))
            .unwrap()
            .then(() => message.success('Notification marquée comme lue'))
            .catch((err) => message.error('Erreur lors du marquage comme lu: ' + err));
    };

    const handleMarkAllAsRead = () => {
        if (userId) {
            dispatch(markAllAsRead(userId))
                .unwrap()
                .then(() => message.success('Toutes les notifications sont marquées comme lues'))
                .catch((err) => message.error('Erreur lors du marquage global: ' + err));
        }
    };

    const handleDelete = (id) => {
        dispatch(deleteNotification(id))
            .unwrap()
            .then(() => message.success('Notification supprimée'))
            .catch((err) => message.error('Erreur lors de la suppression: ' + err));
    };

    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleViewDetails = (notification) => {
        setSelectedNotification(notification);
        setIsModalVisible(true);
        if (!notification.lu) {
            handleMarkAsRead(notification.id);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'unread') return !n.lu;
        if (activeTab === 'read') return n.lu;
        return true;
    });

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'URGENT':
            case 'ALERTE':
            case 'ERREUR':
                return <InfoCircleOutlined style={{ color: '#ef4444' }} />;
            case 'REUNION':
            case 'RAPPEL':
                return <BellOutlined style={{ color: '#f59e0b' }} />;
            case 'PROJET':
                return <CheckCircleOutlined style={{ color: '#10b981' }} />;
            case 'DOCUMENT':
                return <EyeOutlined style={{ color: '#3b82f6' }} />;
            case 'SUCCES':
                return <CheckCircleOutlined style={{ color: '#16a34a' }} />;
            default: return <InfoCircleOutlined style={{ color: '#3b82f6' }} />;
        }
    };

    if (isLoading && notifications.length === 0) {
        return <LoadingSpinner tip="Chargement de vos notifications..." />;
    }

    return (
        <div style={{ padding: isMobile ? '0' : '0 20px' }}>
            <div style={{
                marginBottom: 24,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: 16
            }}>
                <div>
                    <Title level={isMobile ? 4 : 3} style={{ marginBottom: 4 }}>Centre de Notifications</Title>
                    <Text type="secondary">Gérez vos alertes et informations système</Text>
                </div>
                {unreadCount > 0 && (
                    <Button
                        icon={<CheckCircleOutlined />}
                        onClick={handleMarkAllAsRead}
                        style={{ width: isMobile ? '100%' : 'auto' }}
                    >
                        Tout marquer comme lu
                    </Button>
                )}
            </div>

            <Card bordered={false} style={{ borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'all',
                            label: (
                                <span>
                                    Toutes <Badge count={notifications.length} offset={[10, -2]} style={{ backgroundColor: '#94a3b8' }} />
                                </span>
                            )
                        },
                        {
                            key: 'unread',
                            label: (
                                <span>
                                    Non lues <Badge count={unreadCount} offset={[10, -2]} />
                                </span>
                            )
                        },
                        {
                            key: 'read',
                            label: 'Lues'
                        },
                    ]}
                />

                <List
                    itemLayout="horizontal"
                    dataSource={filteredNotifications}
                    locale={{ emptyText: <Empty description="Aucune notification trouvée" /> }}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                                padding: '20px',
                                background: item.lu ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                                borderBottom: '1px solid #f0f0f0',
                                borderRadius: 8,
                                margin: '8px 0',
                                transition: 'all 0.3s'
                            }}
                            actions={[
                                <Tooltip title="Voir détails">
                                    <Button
                                        type="text"
                                        icon={<EyeOutlined />}
                                        onClick={() => handleViewDetails(item)}
                                        style={{ color: '#3b82f6' }}
                                    />
                                </Tooltip>,
                                <Popconfirm
                                    title="Supprimer cette notification ?"
                                    onConfirm={() => handleDelete(item.id)}
                                    okText="Oui"
                                    cancelText="Non"
                                >
                                    <Tooltip title="Supprimer">
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                        />
                                    </Tooltip>
                                </Popconfirm>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: item.lu ? '#f3f4f6' : '#eff6ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 20
                                    }}>
                                        {getNotificationIcon(item.type)}
                                    </div>
                                }
                                title={
                                    <Space>
                                        <Text strong={!item.lu} style={{ fontSize: 16 }}>{item.titre}</Text>
                                        <Tag color={TYPE_NOTIFICATION_COLORS[item.type]}>
                                            {item.type}
                                        </Tag>
                                        {!item.lu && <Badge status="processing" />}
                                    </Space>
                                }
                                description={
                                    <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                        <Text style={{ fontSize: 14, color: item.lu ? '#6b7280' : '#374151' }}>
                                            {item.message}
                                        </Text>
                                        <Tooltip title={formatDateTime(item.dateEnvoi)}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {formatRelativeTime(item.dateEnvoi)}
                                            </Text>
                                        </Tooltip>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        {selectedNotification && getNotificationIcon(selectedNotification.type)}
                        <span>{selectedNotification?.titre}</span>
                    </Space>
                }
                open={isModalVisible}
                onOk={() => setIsModalVisible(false)}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setIsModalVisible(false)}>
                        Fermer
                    </Button>
                ]}
            >
                {selectedNotification && (
                    <div style={{ padding: '10px 0' }}>
                        <div style={{ marginBottom: 16 }}>
                            <Tag color={TYPE_NOTIFICATION_COLORS[selectedNotification.type]}>
                                {selectedNotification.type}
                            </Tag>
                            <Text type="secondary" style={{ marginLeft: 8 }}>
                                {formatDateTime(selectedNotification.dateEnvoi)}
                            </Text>
                        </div>
                        <Typography.Paragraph style={{ fontSize: 16 }}>
                            {selectedNotification.message}
                        </Typography.Paragraph>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default NotificationsPage;
