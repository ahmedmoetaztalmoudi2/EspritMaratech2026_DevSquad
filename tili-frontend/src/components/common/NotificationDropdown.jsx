// Notification Dropdown Component
import React, { useEffect, useState } from 'react';
import { Badge, Button, Popover, List, Typography, Empty, Space, Avatar, Tooltip } from 'antd';
import { BellOutlined, CheckCircleOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    fetchUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../../redux/notificationSlice';
import { formatRelativeTime } from '../../utils/helpers';
import { TYPE_NOTIFICATION_COLORS } from '../../utils/constants';

const { Text, Title } = Typography;

const NotificationDropdown = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { notifications, unreadCount, isLoading } = useSelector((state) => state.notifications);
    const [open, setOpen] = useState(false);
    const [prevUnreadCount, setPrevUnreadCount] = useState(0);

    // Use user ID (handle both id and idUser due to backend variants)
    const userId = user?.id || user?.idUser;

    useEffect(() => {
        if (userId) {
            // Fetch unread notifications initially and every minute
            dispatch(fetchUnreadNotifications(userId));

            const interval = setInterval(() => {
                dispatch(fetchUnreadNotifications(userId));
            }, 60000);

            return () => clearInterval(interval);
        }
    }, [dispatch, userId]);

    // Handle real-time toast for new notifications
    useEffect(() => {
        if (unreadCount > prevUnreadCount && notifications.length > 0) {
            const latest = notifications[0];
            if (!latest.lu) {
                toast.info(`🔔 ${latest.titre}: ${latest.message.substring(0, 50)}...`, {
                    position: "top-right",
                    autoClose: 5000,
                    onClick: () => {
                        const baseUrl = user?.role === 'RESPONSABLE' || user?.role === 'CHEF_PROJET' ? '/admin' : '';
                        navigate(`${baseUrl}/notifications`);
                    }
                });
            }
        }
        setPrevUnreadCount(unreadCount);
    }, [unreadCount, notifications, prevUnreadCount, navigate, user?.role]);

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
        if (newOpen && userId) {
            // Refresh on open
            dispatch(fetchUnreadNotifications(userId));
        }
    };

    const handleMarkAsRead = (id) => {
        dispatch(markAsRead(id));
    };

    const handleMarkAllAsRead = () => {
        if (userId) {
            dispatch(markAllAsRead(userId));
        }
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        dispatch(deleteNotification(id));
    };

    const getNotificationColor = (type) => {
        return TYPE_NOTIFICATION_COLORS[type] || '#64748b';
    };

    const content = (
        <div style={{ width: 350, maxHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Title level={5} style={{ margin: 0, fontSize: 16 }}>Notifications</Title>
                {unreadCount > 0 && (
                    <Tooltip title="Tout marquer comme lu">
                        <Button
                            type="text"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={handleMarkAllAsRead}
                            style={{ color: '#3b82f6' }}
                        >
                            Tout lire
                        </Button>
                    </Tooltip>
                )}
            </div>

            <div style={{ overflowY: 'auto', flex: 1, maxHeight: 300 }}>
                {notifications.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={notifications}
                        renderItem={(item) => (
                            <List.Item
                                style={{
                                    padding: '12px 16px',
                                    background: item.lu ? '#fff' : '#f0f9ff',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                                actions={[
                                    <Tooltip title="Supprimer">
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => handleDelete(item.id, e)}
                                            style={{ color: '#94a3b8' }}
                                        />
                                    </Tooltip>
                                ]}
                                onClick={() => !item.lu && handleMarkAsRead(item.id)}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <div
                                            style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: getNotificationColor(item.type),
                                                marginTop: 8
                                            }}
                                        />
                                    }
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text strong={!item.lu} style={{ fontSize: 13, color: item.lu ? '#64748b' : '#1e293b' }}>
                                                {item.titre}
                                            </Text>
                                        </div>
                                    }
                                    description={
                                        <div style={{ marginTop: 2 }}>
                                            <Text type="secondary" style={{ fontSize: 12, display: 'block', lineHeight: 1.3 }}>
                                                {item.message}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 10, marginTop: 4, display: 'block' }}>
                                                {formatRelativeTime(item.dateEnvoi)}
                                            </Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <div style={{ padding: '32px 0', textAlign: 'center' }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Aucune notification"
                        />
                    </div>
                )}
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', padding: '8px', textAlign: 'center' }}>
                <Button
                    type="link"
                    size="small"
                    onClick={() => {
                        setOpen(false);
                        const baseUrl = user?.role === 'RESPONSABLE' || user?.role === 'CHEF_PROJET' ? '/admin' : '';
                        navigate(`${baseUrl}/notifications`);
                    }}
                >
                    Voir toutes les notifications
                </Button>
            </div>
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            open={open}
            onOpenChange={handleOpenChange}
            placement="bottomRight"
            overlayInnerStyle={{ padding: 0 }}
        >
            <Badge count={unreadCount} size="small" offset={[-5, 5]}>
                <Button
                    type="text"
                    icon={<BellOutlined style={{ fontSize: 20 }} />}
                    style={{ color: '#64748b' }}
                />
            </Badge>
        </Popover>
    );
};

export default NotificationDropdown;
