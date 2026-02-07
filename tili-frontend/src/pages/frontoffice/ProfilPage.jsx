// User Profile Page
import React from 'react';
import { Card, Row, Col, Typography, Avatar, Tag, Descriptions, Button, Space, Divider } from 'antd';
import {
    UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined,
    EditOutlined, LockOutlined, SettingOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/constants';
import { formatDate, getInitials, getAvatarColor } from '../../utils/helpers';

const { Title, Text, Paragraph } = Typography;

const ProfilPage = () => {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return null;
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Profile Header */}
            <Card
                bordered={false}
                style={{ borderRadius: 16, marginBottom: 24 }}
            >
                <Row gutter={24} align="middle">
                    <Col>
                        <Avatar
                            size={100}
                            style={{
                                background: getAvatarColor(user.nom),
                                fontSize: 36,
                                fontWeight: 600,
                            }}
                        >
                            {getInitials(user.nom, user.prenom)}
                        </Avatar>
                    </Col>
                    <Col flex="auto">
                        <Title level={3} style={{ marginBottom: 4 }}>
                            {user.prenom} {user.nom}
                        </Title>
                        <Tag color={ROLE_COLORS[user.role]} style={{ marginBottom: 8 }}>
                            {ROLE_LABELS[user.role]}
                        </Tag>
                        <br />
                        <Text type="secondary">
                            Membre depuis {formatDate(user.dateInscription)}
                        </Text>
                    </Col>
                    <Col>
                        <Button type="primary" icon={<EditOutlined />}>
                            Modifier le profil
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Profile Details */}
            <Card
                title="Informations personnelles"
                bordered={false}
                style={{ borderRadius: 16, marginBottom: 24 }}
            >
                <Descriptions column={1} labelStyle={{ width: 150 }}>
                    <Descriptions.Item
                        label={<><UserOutlined style={{ marginRight: 8 }} />Nom complet</>}
                    >
                        {user.prenom} {user.nom}
                    </Descriptions.Item>
                    <Descriptions.Item
                        label={<><MailOutlined style={{ marginRight: 8 }} />Email</>}
                    >
                        {user.email}
                    </Descriptions.Item>
                    <Descriptions.Item
                        label={<><PhoneOutlined style={{ marginRight: 8 }} />Téléphone</>}
                    >
                        {user.telephone || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item
                        label={<><CalendarOutlined style={{ marginRight: 8 }} />Date d'inscription</>}
                    >
                        {formatDate(user.dateInscription)}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Security Section */}
            <Card
                title="Sécurité"
                bordered={false}
                style={{ borderRadius: 16 }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Card
                            size="small"
                            style={{ borderRadius: 8, cursor: 'pointer' }}
                            hoverable
                        >
                            <Space>
                                <LockOutlined style={{ fontSize: 24, color: '#1e40af' }} />
                                <div>
                                    <Text strong>Changer le mot de passe</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Mettre à jour votre mot de passe
                                    </Text>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card
                            size="small"
                            style={{ borderRadius: 8, cursor: 'pointer' }}
                            hoverable
                        >
                            <Space>
                                <SettingOutlined style={{ fontSize: 24, color: '#64748b' }} />
                                <div>
                                    <Text strong>Préférences</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        Paramètres de notification
                                    </Text>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default ProfilPage;
