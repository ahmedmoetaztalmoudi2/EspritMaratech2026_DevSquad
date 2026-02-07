// Documents Management Page with Role-Based Permissions
import React, { useEffect, useState } from 'react';
import {
    Card, Table, Button, Space, Tag, Modal, Form, Input, Select, Upload,
    Typography, message, Row, Col, Tooltip, Popconfirm, Alert,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, InboxOutlined,
    FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileOutlined,
    EyeOutlined, DownloadOutlined, MoreOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocuments, createDocument, updateDocument, deleteDocument, uploadDocument } from '../../redux/documentSlice';
import { fetchProjets } from '../../redux/projetSlice';
import {
    TYPE_DOCUMENT_LABELS, TYPE_DOCUMENT_COLORS,
    DOCUMENT_UPLOAD_PERMISSIONS
} from '../../utils/constants';
import { formatDate, formatFileSize, getFileExtension } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const { Title, Text } = Typography;
const { Search } = Input;
const { Dragger } = Upload;

const DocumentsManagement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [typeFilter, setTypeFilter] = useState(null);
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
        dispatch(fetchProjets());
    }, [dispatch]);

    const handleOpenModal = (document = null) => {
        setEditingDocument(document);
        if (document) {
            form.setFieldsValue(document);
        } else {
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDocument(null);
        form.resetFields();
    };


    const handleSubmit = async (values) => {
        try {
            if (editingDocument) {
                const data = {
                    ...values,
                    uploadeur: user,
                    dateUpload: new Date().toISOString(),
                };
                await dispatch(updateDocument({ id: editingDocument.id, data })).unwrap();
                message.success('Document modifié avec succès');
            } else {
                // Handle file upload
                const file = values.fichier?.file || values.fichier?.fileList?.[0]?.originFileObj;

                if (!file && values.fichier?.originFileObj) {
                    // Sometimes ant design upload behavior varies
                }

                const uploadData = {
                    file: file?.originFileObj || file, // Antd Dragger returns file object wrapped
                    titre: values.titre,
                    description: values.description,
                    type: values.type,
                    isPublic: true, // Default to true or add field
                    projetId: values.projetId,
                    uploaderId: user?.id || user?.idUser,
                };

                if (!uploadData.file) {
                    message.error('Veuillez sélectionner un fichier');
                    return;
                }

                await dispatch(uploadDocument(uploadData)).unwrap();
                message.success('Document uploadé avec succès');
            }
            handleCloseModal();
        } catch (error) {
            console.error(error);
            message.error(error || 'Une erreur est survenue');
        }
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteDocument(id)).unwrap();
            message.success('Document supprimé');
        } catch (error) {
            message.error('Erreur lors de la suppression');
        }
    };

    const getFileIcon = (filename) => {
        const ext = getFileExtension(filename);
        const iconStyle = { fontSize: 20 };
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

    const columns = [
        {
            title: 'Document',
            key: 'document',
            render: (_, record) => (
                <Space>
                    {getFileIcon(record.cheminFichier)}
                    <div>
                        <Text strong>{record.titre}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatFileSize(record.taille)}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={TYPE_DOCUMENT_COLORS[type]}>{TYPE_DOCUMENT_LABELS[type]}</Tag>
            ),
        },
        {
            title: 'Projet',
            dataIndex: 'projet',
            key: 'projet',
            render: (projet) => projet?.nom || '-',
        },
        {
            title: 'Uploadé par',
            dataIndex: 'uploadeur',
            key: 'uploadeur',
            render: (uploadeur) => uploadeur ? `${uploadeur.prenom} ${uploadeur.nom}` : '-',
        },
        {
            title: 'Date',
            dataIndex: 'dateUpload',
            key: 'dateUpload',
            render: (date) => formatDate(date),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Voir">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
                    </Tooltip>
                    <Tooltip title="Télécharger">
                        <Button type="text" icon={<DownloadOutlined />} onClick={() => handleDownload(record)} />
                    </Tooltip>
                    <Tooltip title="Modifier">
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                    </Tooltip>
                    <Popconfirm
                        title="Supprimer ce document ?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Oui"
                        cancelText="Non"
                    >
                        <Tooltip title="Supprimer">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (isLoading && documents.length === 0) {
        return <LoadingSpinner tip="Chargement des documents..." />;
    }

    return (
        <div>
            {/* Header */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} style={{ marginBottom: 4 }}>Gestion des Documents</Title>
                    <Text type="secondary">{documents.length} document(s)</Text>
                </Col>
                <Col>
                    {userPermissions.canUpload && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpenModal()}
                            style={{ borderRadius: 8 }}
                        >
                            Nouveau Document
                        </Button>
                    )}
                </Col>
            </Row>

            {/* Permission Info */}
            <Alert
                message={
                    <Space>
                        <InfoCircleOutlined />
                        <Text>Types de documents autorisés: <Text strong>{userPermissions.description}</Text></Text>
                    </Space>
                }
                type="info"
                showIcon={false}
                style={{ marginBottom: 16, borderRadius: 8 }}
            />

            {/* Filters & Table */}
            <Card bordered={false} style={{ borderRadius: 12 }}>
                <Row gutter={16} style={{ marginBottom: 16 }}>
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
                            placeholder="Type"
                            allowClear
                            style={{ width: 150 }}
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

                <Table
                    columns={columns}
                    dataSource={filteredDocuments}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `${total} document(s)`,
                    }}
                />
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={editingDocument ? 'Modifier le document' : 'Nouveau document'}
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
                    {!editingDocument && (
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
                    )}

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
                            <Button type="primary" htmlType="submit">
                                {editingDocument ? 'Modifier' : 'Uploader'}
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
                            <p><Text strong>Date d'ajout :</Text> {formatDate(viewDocument.dateUpload)}</p>
                            <p><Text strong>Projet associé :</Text> {viewDocument.projet?.nom || 'Aucun'}</p>
                            <p><Text strong>Ajouté par :</Text> {viewDocument.uploadeur?.prenom} {viewDocument.uploadeur?.nom}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DocumentsManagement;
