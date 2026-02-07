// Mes Documents Page (FrontOffice)
import React, { useEffect, useState } from 'react';
import {
    Card, Row, Col, Typography, Input, Select, Tag, Space, Empty,
    Tooltip, Button, Modal, Form, Upload, message, Alert
} from 'antd';
import {
    SearchOutlined, DownloadOutlined, EyeOutlined,
    FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileOutlined,
    CalendarOutlined, PlusOutlined, InboxOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocuments, createDocument } from '../../redux/documentSlice';
import { fetchProjets } from '../../redux/projetSlice';
import {
    TYPE_DOCUMENT_LABELS, TYPE_DOCUMENT_COLORS,
    DOCUMENT_UPLOAD_PERMISSIONS
} from '../../utils/constants';
import { formatRelativeTime, formatFileSize, getFileExtension } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const { Title, Text } = Typography;
const { Search } = Input;
const { Dragger } = Upload;

const MesDocuments = () => {
    const [searchText, setSearchText] = useState('');
    const [typeFilter, setTypeFilter] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const dispatch = useDispatch();
    const { documents, isLoading } = useSelector((state) => state.documents);
    const { projets } = useSelector((state) => state.projets);
    const { user } = useSelector((state) => state.auth);

    // Get user permissions
    const userPermissions = DOCUMENT_UPLOAD_PERMISSIONS[user?.role] || {
        canUpload: false,
        allowedTypes: [],
        description: '',
    };

    useEffect(() => {
        dispatch(fetchDocuments());
        if (userPermissions.canUpload) {
            dispatch(fetchProjets());
        }
    }, [dispatch, userPermissions.canUpload]);

    const handleOpenModal = () => {
        setIsModalOpen(true);
        form.resetFields();
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleSubmit = async (values) => {
        try {
            const data = {
                ...values,
                uploadeur: user,
                dateUpload: new Date().toISOString(),
            };

            await dispatch(createDocument(data)).unwrap();
            message.success('Document ajouté avec succès');
            handleCloseModal();
        } catch (error) {
            message.error('Erreur lors de l\'ajout du document');
        }
    };

    const getFileIcon = (filename) => {
        const ext = getFileExtension(filename);
        const iconStyle = { fontSize: 32 };
        switch (ext) {
            case 'pdf':
                return <FilePdfOutlined style={{ ...iconStyle, color: '#ef4444' }} />;
            case 'doc':
            case 'docx':
                return <FileWordOutlined style={{ ...iconStyle, color: '#3b82f6' }} />;
            case 'xls':
            case 'xlsx':
                return <FileExcelOutlined style={{ ...iconStyle, color: '#10b981' }} />;
            default:
                return <FileOutlined style={{ ...iconStyle, color: '#64748b' }} />;
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = searchText
            ? doc.titre?.toLowerCase().includes(searchText.toLowerCase())
            : true;
        const matchesType = typeFilter ? doc.type === typeFilter : true;
        return matchesSearch && matchesType;
    });

    // Filter allowed document types for dropdown
    const getAllowedDocumentTypes = () => {
        return Object.entries(TYPE_DOCUMENT_LABELS).filter(([key]) =>
            userPermissions.allowedTypes.includes(key)
        );
    };

    const [viewDocument, setViewDocument] = useState(null);

    const handleDownload = (doc) => {
        message.loading({ content: 'Téléchargement en cours...', key: 'download' });
        setTimeout(() => {
            message.success({ content: 'Téléchargement terminé', key: 'download' });
            // In a real app, this would trigger a file download
            // window.open(doc.cheminFichier, '_blank');
            console.log(`Downloading ${doc.titre} from ${doc.cheminFichier}`);
        }, 1000);
    };

    const handleView = (doc) => {
        setViewDocument(doc);
    };

    const closeViewModal = () => {
        setViewDocument(null);
    };

    if (isLoading && documents.length === 0) {
        return <LoadingSpinner tip="Chargement des documents..." />;
    }

    return (
        <div>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} style={{ marginBottom: 4 }}>Mes Documents</Title>
                    <Text type="secondary">{documents.length} documents disponibles</Text>
                </Col>
                <Col>
                    {userPermissions.canUpload && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleOpenModal}
                            style={{ borderRadius: 8, background: '#1e4a8d' }}
                        >
                            Nouveau Document
                        </Button>
                    )}
                </Col>
            </Row>

            {/* Permission Info if can Upload */}
            {userPermissions.canUpload && (
                <Alert
                    message={
                        <Space>
                            <InfoCircleOutlined />
                            <Text>Vous pouvez ajouter : <Text strong>{userPermissions.description}</Text></Text>
                        </Space>
                    }
                    type="info"
                    showIcon={false}
                    style={{ marginBottom: 16, borderRadius: 8 }}
                />
            )}

            {/* Filters */}
            <Card bordered={false} style={{ borderRadius: 12, marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col flex="auto">
                        <Search
                            placeholder="Rechercher un document..."
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 300 }}
                            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        />
                    </Col>
                    <Col>
                        <Select
                            placeholder="Type de document"
                            allowClear
                            style={{ width: 180 }}
                            onChange={(value) => setTypeFilter(value)}
                        >
                            {Object.entries(TYPE_DOCUMENT_LABELS).map(([key, label]) => (
                                <Select.Option key={key} value={key}>
                                    <Tag color={TYPE_DOCUMENT_COLORS[key]}>{label}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </Card>

            {/* Document Grid */}
            {filteredDocuments.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {filteredDocuments.map(doc => (
                        <Col xs={24} sm={12} md={8} lg={6} key={doc.id}>
                            <Card
                                bordered={false}
                                hoverable
                                style={{ borderRadius: 12, height: '100%' }}
                                bodyStyle={{ padding: 16 }}
                            >
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                    <div
                                        style={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: 12,
                                            background: '#f8fafc',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {getFileIcon(doc.cheminFichier)}
                                    </div>
                                </div>

                                <Text strong style={{ display: 'block', marginBottom: 8 }} ellipsis>
                                    {doc.titre}
                                </Text>

                                <Tag color={TYPE_DOCUMENT_COLORS[doc.type]} style={{ marginBottom: 12 }}>
                                    {TYPE_DOCUMENT_LABELS[doc.type]}
                                </Tag>

                                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {formatFileSize(doc.taille)}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        <CalendarOutlined style={{ marginRight: 4 }} />
                                        {formatRelativeTime(doc.dateUpload)}
                                    </Text>
                                </Space>

                                <div style={{ marginTop: 12, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                                    <Space>
                                        <Tooltip title="Voir">
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<EyeOutlined />}
                                                onClick={() => handleView(doc)}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Télécharger">
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<DownloadOutlined />}
                                                onClick={() => handleDownload(doc)}
                                            />
                                        </Tooltip>
                                    </Space>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Card bordered={false} style={{ borderRadius: 12 }}>
                    <Empty description="Aucun document trouvé" />
                </Card>
            )}

            {/* Upload Modal */}
            <Modal
                title="Nouveau document"
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                destroyOnClose
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item name="fichier">
                        <Dragger
                            maxCount={1}
                            beforeUpload={() => false}
                            style={{ marginBottom: 16 }}
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined style={{ color: '#1e4a8d', fontSize: 48 }} />
                            </p>
                            <p className="ant-upload-text">
                                Glissez un fichier ici ou cliquez pour sélectionner
                            </p>
                        </Dragger>
                    </Form.Item>

                    <Form.Item
                        name="titre"
                        label="Titre du document"
                        rules={[{ required: true, message: 'Titre requis' }]}
                    >
                        <Input placeholder="Titre du document" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="Type de document"
                                rules={[{ required: true, message: 'Type requis' }]}
                            >
                                <Select placeholder="Sélectionner un type">
                                    {getAllowedDocumentTypes().map(([key, label]) => (
                                        <Select.Option key={key} value={key}>
                                            <Tag color={TYPE_DOCUMENT_COLORS[key]}>{label}</Tag>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="projetId"
                                label="Projet associé"
                            >
                                <Select placeholder="Sélectionner un projet" allowClear>
                                    {projets.map(projet => (
                                        <Select.Option key={projet.id} value={projet.id}>
                                            {projet.nom}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={3} placeholder="Description du document..." />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCloseModal}>Annuler</Button>
                            <Button type="primary" htmlType="submit" style={{ background: '#1e4a8d' }}>
                                Uploader
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Details Modal */}
            <Modal
                title="Détails du document"
                open={!!viewDocument}
                onCancel={closeViewModal}
                footer={[
                    <Button key="download" icon={<DownloadOutlined />} onClick={() => handleDownload(viewDocument)}>
                        Télécharger
                    </Button>,
                    <Button key="close" type="primary" onClick={closeViewModal}>
                        Fermer
                    </Button>,
                ]}
            >
                {viewDocument && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: 20 }}>
                            {getFileIcon(viewDocument.cheminFichier)}
                            <Title level={4} style={{ marginTop: 10 }}>{viewDocument.titre}</Title>
                            <Tag color={TYPE_DOCUMENT_COLORS[viewDocument.type]}>
                                {TYPE_DOCUMENT_LABELS[viewDocument.type]}
                            </Tag>
                        </div>

                        <div style={{ textAlign: 'left', background: '#f8fafc', padding: 16, borderRadius: 8 }}>
                            <p><Text strong>Description :</Text> {viewDocument.description || 'Aucune description'}</p>
                            <p><Text strong>Taille :</Text> {formatFileSize(viewDocument.taille)}</p>
                            <p><Text strong>Date d'ajout :</Text> {formatRelativeTime(viewDocument.dateUpload)}</p>
                            <p><Text strong>Projet associé :</Text> {viewDocument.projet?.nom || 'Aucun'}</p>
                            <p><Text strong>Ajouté par :</Text> {viewDocument.uploadeur?.prenom} {viewDocument.uploadeur?.nom}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MesDocuments;
