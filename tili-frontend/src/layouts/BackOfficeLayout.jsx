// BackOffice Layout - Admin Panel with TILI Logo
import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Space, Button, Switch } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    FileTextOutlined,
    CalendarOutlined,
    ProjectOutlined,
    HistoryOutlined,
    BellOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    AudioOutlined,
    AudioMutedOutlined,
    BulbOutlined,
    BulbFilled,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { getInitials, getAvatarColor } from '../utils/helpers';
import NotificationDropdown from '../components/common/NotificationDropdown';
import { toggleDarkMode, toggleVoiceActive } from '../redux/uiSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const BackOfficeLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { isDarkMode, isVoiceActive } = useSelector((state) => state.ui);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: 'Tableau de bord',
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: 'Utilisateurs',
        },
        {
            key: '/admin/documents',
            icon: <FileTextOutlined />,
            label: 'Documents',
        },
        {
            key: '/admin/reunions',
            icon: <CalendarOutlined />,
            label: 'Réunions',
        },
        {
            key: '/admin/demandes-reunion',
            icon: <BellOutlined />,
            label: 'Demandes Réunion',
        },
        {
            key: '/admin/projets',
            icon: <ProjectOutlined />,
            label: 'Projets',
        },
        {
            key: '/admin/historique',
            icon: <HistoryOutlined />,
            label: 'Historique',
        },
        {
            key: '/admin/notifications',
            icon: <BellOutlined />,
            label: 'Notifications',
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Mon profil',
            onClick: () => navigate('/admin/profil'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Déconnexion',
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={260}
                role="navigation"
                aria-label="Menu latéral d'administration"
                style={{
                    background: 'linear-gradient(180deg, #1e4a8d 0%, #153a6e 100%)',
                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        height: collapsed ? 70 : 90,
                        margin: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        paddingLeft: collapsed ? 0 : 8,
                        gap: 10,
                    }}
                >
                    <img
                        src="/logo-tili.png"
                        alt="TILI"
                        style={{
                            height: collapsed ? 36 : 55,
                            filter: 'brightness(0) invert(1)',
                            transition: 'height 0.2s',
                        }}
                    />
                    {!collapsed && (
                        <div style={{ lineHeight: 1.15 }}>
                            <Text style={{ fontSize: 9, fontWeight: 700, color: '#fff', display: 'block', letterSpacing: 1 }}>
                                TUNISIA
                            </Text>
                            <Text style={{ fontSize: 9, fontWeight: 700, color: '#fff', display: 'block', letterSpacing: 1 }}>
                                INCLUSIVE
                            </Text>
                            <Text style={{ fontSize: 9, fontWeight: 700, color: '#fff', display: 'block', letterSpacing: 1 }}>
                                LABOR
                            </Text>
                            <Text style={{ fontSize: 9, fontWeight: 700, color: '#fff', display: 'block', letterSpacing: 1 }}>
                                INSTITUTE
                            </Text>
                        </div>
                    )}
                </div>

                {/* Menu */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems.filter(item => {
                        // Hide Users menu for CHEF_PROJET
                        if (user?.role === 'CHEF_PROJET' && item.key === '/admin/users') {
                            return false;
                        }
                        return true;
                    })}
                    onClick={({ key }) => navigate(key)}
                    style={{
                        background: 'transparent',
                        borderRight: 0,
                        marginTop: 8,
                    }}
                />

                {/* User Info at Bottom */}
                {!collapsed && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 24,
                            left: 16,
                            right: 16,
                            padding: '12px 16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 12,
                        }}
                    >
                        <Space>
                            <Avatar
                                src={user?.photoProfil}
                                style={{ background: '#c9a227' }}
                            >
                                {user && getInitials(user.nom, user.prenom)}
                            </Avatar>
                            <div>
                                <Text style={{ color: '#fff', fontSize: 13, display: 'block' }} strong>
                                    {user?.prenom} {user?.nom}
                                </Text>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                                    Administrateur
                                </Text>
                            </div>
                        </Space>
                    </div>
                )}
            </Sider>

            <Layout>
                <Header
                    role="banner"
                    style={{
                        padding: '0 24px',
                        background: isDarkMode ? '#1e293b' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
                        borderBottom: isDarkMode ? '1px solid #334155' : 'none',
                        position: 'sticky',
                        top: 0,
                        zIndex: 100,
                    }}
                >
                    <Space>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: 18 }}
                            aria-label={collapsed ? "Développer le menu" : "Réduire le menu"}
                        />
                        <Text strong style={{ fontSize: 18, color: '#1e4a8d' }}>
                            {menuItems.find(item => item.key === location.pathname)?.label || 'Administration'}
                        </Text>
                    </Space>
                    <Space size={16}>
                        <Space size={8}>
                            <Switch
                                checked={isVoiceActive}
                                onChange={() => dispatch(toggleVoiceActive())}
                                checkedChildren={<AudioOutlined />}
                                unCheckedChildren={<AudioMutedOutlined />}
                                title="Activer l'assistant vocal"
                                aria-label="Activer l'assistant vocal"
                            />
                            <Switch
                                checked={isDarkMode}
                                onChange={() => dispatch(toggleDarkMode())}
                                checkedChildren={<BulbFilled />}
                                unCheckedChildren={<BulbOutlined />}
                                title="Mode sombre"
                                aria-label="Passer au mode sombre"
                            />
                        </Space>
                        <NotificationDropdown />
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <Avatar
                                src={user?.photoProfil}
                                style={{ cursor: 'pointer', background: '#c9a227' }}
                            >
                                {user && getInitials(user.nom, user.prenom)}
                            </Avatar>
                        </Dropdown>
                    </Space>
                </Header>

                <Content
                    id="main-content"
                    role="main"
                    style={{
                        margin: 24,
                        padding: 24,
                        background: 'transparent',
                        minHeight: 'calc(100vh - 112px)',
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default BackOfficeLayout;
