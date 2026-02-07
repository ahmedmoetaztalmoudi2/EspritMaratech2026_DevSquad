// FrontOffice Layout - User Interface with TILI Logo
import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Typography, Space, Button } from 'antd';
import {
    DashboardOutlined,
    FileTextOutlined,
    CalendarOutlined,
    ProjectOutlined,
    BellOutlined,
    LogoutOutlined,
    UserOutlined,
    SettingOutlined,
    MenuOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { getInitials, getAvatarColor, canAccessBackoffice } from '../utils/helpers';
import NotificationDropdown from '../components/common/NotificationDropdown';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const FrontOfficeLayout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Tableau de bord',
        },
        {
            key: '/mes-documents',
            icon: <FileTextOutlined />,
            label: 'Mes Documents',
        },
        {
            key: '/mes-projets',
            icon: <ProjectOutlined />,
            label: 'Mes Projets',
        },
        {
            key: '/mes-reunions',
            icon: <CalendarOutlined />,
            label: 'Mes Réunions',
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Mon profil',
            onClick: () => navigate('/profil'),
        },
        ...(canAccessBackoffice(user) ? [{
            key: 'admin',
            icon: <SettingOutlined />,
            label: 'Administration',
            onClick: () => navigate('/admin/dashboard'),
        }] : []),
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
            <Header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    width: '100%',
                    padding: '0 24px',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    height: 64,
                }}
            >
                {/* Logo */}
                <div
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 12 }}
                    onClick={() => navigate('/dashboard')}
                >
                    <img
                        src="/logo-tili.png"
                        alt="TILI"
                        style={{ height: 50 }}
                    />
                    <div style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: 12, lineHeight: 1.15 }}>
                        <Text style={{ fontSize: 10, fontWeight: 700, color: '#1e4a8d', display: 'block', letterSpacing: 1 }}>
                            TUNISIA
                        </Text>
                        <Text style={{ fontSize: 10, fontWeight: 700, color: '#1e4a8d', display: 'block', letterSpacing: 1 }}>
                            INCLUSIVE
                        </Text>
                        <Text style={{ fontSize: 10, fontWeight: 700, color: '#1e4a8d', display: 'block', letterSpacing: 1 }}>
                            LABOR
                        </Text>
                        <Text style={{ fontSize: 10, fontWeight: 700, color: '#1e4a8d', display: 'block', letterSpacing: 1 }}>
                            INSTITUTE
                        </Text>
                    </div>
                </div>

                {/* Desktop Menu */}
                <Menu
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => {
                        navigate(key);
                        setMobileMenuOpen(false);
                    }}
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        border: 'none',
                        background: 'transparent',
                    }}
                    className="desktop-menu"
                />

                {/* Right Actions */}
                <Space size={16}>
                    <NotificationDropdown />
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                        <Space style={{ cursor: 'pointer' }}>
                            <Avatar
                                src={user?.photoProfil}
                                style={{ background: '#c9a227' }}
                            >
                                {user && getInitials(user.nom, user.prenom)}
                            </Avatar>
                            <Text className="user-name-desktop" style={{ fontWeight: 500 }}>
                                {user?.prenom}
                            </Text>
                        </Space>
                    </Dropdown>
                    <Button
                        type="text"
                        icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{ display: 'none' }}
                        className="mobile-menu-button"
                    />
                </Space>
            </Header>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 64,
                        left: 0,
                        right: 0,
                        background: '#fff',
                        zIndex: 99,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Menu
                        mode="vertical"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        onClick={({ key }) => {
                            navigate(key);
                            setMobileMenuOpen(false);
                        }}
                        style={{ border: 'none' }}
                    />
                </div>
            )}

            <Content
                style={{
                    padding: '24px',
                    background: '#f5f7fa',
                    minHeight: 'calc(100vh - 64px - 70px)',
                }}
            >
                <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <Outlet />
                </div>
            </Content>

            <Footer
                style={{
                    textAlign: 'center',
                    background: '#1e4a8d',
                    color: 'rgba(255, 255, 255, 0.8)',
                    padding: '20px 24px',
                }}
            >
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    TILI - Tunisia Inclusive Labor Institute © {new Date().getFullYear()}
                </Text>
            </Footer>

            <style>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-button {
            display: inline-flex !important;
          }
          .user-name-desktop {
            display: none;
          }
        }
      `}</style>
        </Layout>
    );
};

export default FrontOfficeLayout;
