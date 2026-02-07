// User Profile Page
import React, { useState } from 'react';
import {
    Card, Row, Col, Typography, Avatar, Tag, Descriptions,
    Button, Space, Modal, Form, Input, Divider, Upload
} from 'antd';
import {
    UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined,
    EditOutlined, LockOutlined, PictureOutlined, LoadingOutlined, PlusOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { setUser } from '../../redux/authSlice';
import api from '../../api/axiosConfig';
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/constants';
import { formatDate, getInitials, getAvatarColor } from '../../utils/helpers';

const { Title, Text } = Typography;

const ProfilPage = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    // Modals state
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);

    // Forms
    const [editForm] = Form.useForm();
    const [passwordForm] = Form.useForm();



    // --- Profile Edit Logic ---
    // Upload state
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState();

    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            toast.error('Vous ne pouvez télécharger que des fichiers JPG/PNG !');
            return Upload.LIST_IGNORE;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            toast.error('L\'image doit être inférieure à 2MB !');
            return Upload.LIST_IGNORE;
        }

        // Read file directly here since we don't have an upload server
        getBase64(file, (url) => {
            setLoading(false);
            setImageUrl(url);
            editForm.setFieldValue('photoProfil', url);
        });

        return false; // Prevent automatic upload
    };

    const handleUploadChange = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
    };

    // --- Profile Edit Logic ---
    const showEditModal = () => {
        editForm.setFieldsValue({
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            tel: user.telephone || user.tel,
            photoProfil: user.photoProfil
        });
        setImageUrl(user.photoProfil);
        setEditModalVisible(true);
    };

    const handleEditSubmit = async (values) => {
        try {
            const updateData = {
                ...user,
                nom: values.nom,
                prenom: values.prenom,
                email: values.email,
                tel: values.tel,
                photoProfil: values.photoProfil
            };

            const response = await api.put(`/users/${user.id || user.idUser}`, updateData);

            dispatch(setUser(response.data));

            toast.success("Profil mis à jour avec succès !");
            setEditModalVisible(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Erreur lors de la mise à jour du profil");
        }
    };

    // --- Password Change Logic ---
    const showPasswordModal = () => {
        passwordForm.resetFields();
        setPasswordModalVisible(true);
    };

    const handlePasswordSubmit = async (values) => {
        try {
            await api.put(`/users/${user.id || user.idUser}/change-password`, {
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            });

            toast.success("Mot de passe modifié avec succès !");
            setPasswordModalVisible(false);
            passwordForm.resetFields();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || "Erreur lors du changement de mot de passe");
        }
    };

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
                                background: user.photoProfil ? 'none' : getAvatarColor(user.nom),
                                fontSize: 36,
                                fontWeight: 600,
                            }}
                            src={user.photoProfil}
                        >
                            {!user.photoProfil && getInitials(user.nom, user.prenom)}
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
                        <Button type="primary" icon={<EditOutlined />} onClick={showEditModal}>
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
                        {user.telephone || user.tel || '-'}
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
                            onClick={showPasswordModal}
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
                    {/* Preferences Removed as per request */}
                </Row>
            </Card>


            {/* Edit Profile Modal */}
            <Modal
                title="Modifier mon profil"
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                footer={null}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="prenom"
                                label="Prénom"
                                rules={[{ required: true, message: 'Le prénom est requis' }]}
                            >
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="nom"
                                label="Nom"
                                rules={[{ required: true, message: 'Le nom est requis' }]}
                            >
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'L\'email est requis' },
                            { type: 'email', message: 'Email invalide' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} />
                    </Form.Item>
                    <Form.Item
                        name="tel"
                        label="Téléphone"
                    >
                        <Input prefix={<PhoneOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="photoProfil"
                        label="Photo de Profil"
                    >
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            className="avatar-uploader"
                            showUploadList={false}
                            beforeUpload={beforeUpload}
                            onChange={handleUploadChange}
                        >
                            {imageUrl ? (
                                <Avatar src={imageUrl} size={64} shape="square" />
                            ) : (
                                <button style={{ border: 0, background: 'none' }} type="button">
                                    {loading ? <LoadingOutlined /> : <PlusOutlined />}
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </button>
                            )}
                        </Upload>
                    </Form.Item>

                    <Divider />

                    <div style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setEditModalVisible(false)}>
                                Annuler
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Enregistrer
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                title="Changer le mot de passe"
                open={passwordModalVisible}
                onCancel={() => setPasswordModalVisible(false)}
                footer={null}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordSubmit}
                >
                    <Form.Item
                        name="oldPassword"
                        label="Ancien mot de passe"
                        rules={[{ required: true, message: 'Requis' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="Nouveau mot de passe"
                        rules={[
                            { required: true, message: 'Requis' },
                            { min: 6, message: 'Au moins 6 caractères' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Confirmer le mot de passe"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Requis' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Divider />

                    <div style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setPasswordModalVisible(false)}>
                                Annuler
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Changer le mot de passe
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ProfilPage;
