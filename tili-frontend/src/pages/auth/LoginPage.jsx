import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message, Space, Row, Col, Select, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, loginGoogle, clearError } from '../../redux/authSlice';
import { canAccessBackoffice } from '../../utils/helpers';

const { Title, Text } = Typography;

const LoginPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth);

    const from = location.state?.from?.pathname || '/dashboard';

    useEffect(() => {
        if (isAuthenticated && user) {
            if (canAccessBackoffice(user) && from.startsWith('/admin')) {
                navigate(from, { replace: true });
            } else if (canAccessBackoffice(user)) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate, from]);

    useEffect(() => {
        if (error) {
            message.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const onFinish = async (values) => {
        dispatch(login(values));
    };

    const onRegister = async (values) => {
        try {
            const userData = {
                ...values,
                dateNaissance: values.dateNaissance ? values.dateNaissance.format('YYYY-MM-DD') : null,
            };
            if (userData.confirmMotDePasse) {
                delete userData.confirmMotDePasse;
            }

            await dispatch(register(userData)).unwrap();
            message.success('Inscription réussie ! Veuillez vous connecter.');
            setIsSignUp(false);
        } catch (err) {
            // Error is handled by the useEffect watching 'error' state, or we can handle specific UI actions here
        }
    };

    const handleGoogleLoginResponse = async (response) => {
        try {
            // Decode the JWT credential from Google
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const { email, family_name, given_name, picture } = JSON.parse(jsonPayload);

            const googleData = {
                email,
                nom: family_name,
                prenom: given_name,
                photoProfil: picture
            };

            await dispatch(loginGoogle(googleData)).unwrap();
            message.success('Connexion Google réussie !');
        } catch (err) {
            message.error(err || 'Erreur lors de la connexion Google');
        }
    };

    useEffect(() => {
        // Initialize Google Identity Services
        /* global google */
        const initializeGoogle = () => {
            if (window.google) {
                google.accounts.id.initialize({
                    // Note: In production, use your own Client ID from Google Cloud Console
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || "75385610540-v2i2lq5mll987c67j6h1sh18m2n07k9p.apps.googleusercontent.com",
                    callback: handleGoogleLoginResponse
                });

                // Render the native button into the overlay container
                google.accounts.id.renderButton(
                    document.getElementById("googleButtonContainer"),
                    { theme: "outline", size: "large", width: 400 }
                );
            }
        };

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div id="main-content" style={{
            height: '100vh',
            width: '100vw',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#fff',
            display: 'flex'
        }}>

            {/* Login Form Container (Left) */}
            <div style={{
                width: '50%',
                height: '100%',
                padding: '0 100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'absolute',
                top: 0,
                left: 0,
                transition: 'all 0.6s ease-in-out',
                zIndex: 2,
                opacity: isSignUp ? 0 : 1,
                pointerEvents: isSignUp ? 'none' : 'all',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
                    <img src="/logo-tili.png" alt="TILI Logo" style={{ height: 60 }} />
                    <span style={{ fontSize: 24, fontWeight: 'bold', color: '#1e3a8a' }}>TILI</span>
                </div>

                <Title level={1} style={{ color: '#1e3a8a', marginBottom: 10, fontSize: '2.5rem' }}>De retour !</Title>
                <Text type="secondary" style={{ marginBottom: 40, fontSize: '1.1rem' }}>Connectez-vous pour continuer</Text>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                    style={{ width: '100%', maxWidth: '400px' }}
                >
                    <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email invalide' }]}>
                        <Input prefix={<MailOutlined />} placeholder="Email" aria-label="Email" style={{ borderRadius: 8, height: 50 }} />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'Mot de passe requis' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Mot de passe" aria-label="Mot de passe" style={{ borderRadius: 8, height: 50 }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={isLoading} block style={{
                            borderRadius: 8, height: 50, fontWeight: 'bold', background: '#1e3a8a', fontSize: '1rem'
                        }}>
                            Se connecter
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '10px auto 0' }}>
                    <Button
                        icon={<GoogleOutlined />}
                        block
                        aria-hidden="true"
                        style={{
                            height: 50, borderRadius: 8,
                            borderColor: '#db4437', color: '#db4437', fontWeight: 500, fontSize: '1rem'
                        }}
                    >
                        Connecter avec Gmail
                    </Button>
                    {/* Native Google button hiddenly overlayed */}
                    <div
                        id="googleButtonContainer"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            overflow: 'hidden'
                        }}
                    />
                </div>

                <div style={{ marginTop: 30 }}>
                    <Text type="secondary" style={{ fontSize: '1rem' }}>Pas encore de compte ? </Text>
                    <a onClick={() => setIsSignUp(true)} style={{ color: '#1e3a8a', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
                        Créer un compte
                    </a>
                </div>
            </div>

            {/* Register Form Container (Right) */}
            <div style={{
                width: '50%',
                height: '100%',
                padding: '20px 80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'absolute',
                top: 0,
                right: 0,
                transition: 'all 0.6s ease-in-out',
                zIndex: 1,
                opacity: isSignUp ? 1 : 0,
                pointerEvents: isSignUp ? 'all' : 'none',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15 }}>
                    <img src="/logo-tili.png" alt="TILI Logo" style={{ height: 40, objectFit: 'contain' }} />
                    <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1e3a8a' }}>TILI</span>
                </div>

                <Title level={2} style={{ color: '#1e3a8a', marginBottom: 5, fontSize: '1.8rem' }}>Créer un compte</Title>
                <Text type="secondary" style={{ marginBottom: 15, fontSize: '0.95rem' }}>Rejoignez notre plateforme</Text>

                <Form
                    layout="vertical"
                    size="middle"
                    onFinish={onRegister}
                    style={{ width: '100%', maxWidth: '380px', textAlign: 'left' }}
                    scrollToFirstError
                >
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="prenom" rules={[{ required: true, message: 'Prénom requis' }]} style={{ marginBottom: 12 }}>
                                <Input prefix={<UserOutlined />} placeholder="Prénom" aria-label="Prénom" style={{ borderRadius: 6 }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="nom" rules={[{ required: true, message: 'Nom requis' }]} style={{ marginBottom: 12 }}>
                                <Input placeholder="Nom" aria-label="Nom" style={{ borderRadius: 6 }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email invalide' }]} style={{ marginBottom: 12 }}>
                        <Input prefix={<MailOutlined />} placeholder="Email" aria-label="Email inscription" style={{ borderRadius: 6 }} />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="sexe" rules={[{ required: true, message: 'Sexe requis' }]} style={{ marginBottom: 12 }}>
                                <Select placeholder="Sexe" style={{ borderRadius: 6 }}>
                                    <Select.Option value="Homme">Homme</Select.Option>
                                    <Select.Option value="Femme">Femme</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dateNaissance" rules={[{ required: true, message: 'Date requise' }]} style={{ marginBottom: 12 }}>
                                <DatePicker style={{ width: '100%', borderRadius: 6 }} placeholder="Date naissance" format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="tel" style={{ marginBottom: 12 }}>
                        <Input prefix={<PhoneOutlined />} placeholder="Téléphone" aria-label="Téléphone" style={{ borderRadius: 6 }} />
                    </Form.Item>

                    <Form.Item name="motDePasse" rules={[{ required: true, message: 'Mot de passe requis' }]} style={{ marginBottom: 12 }}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Mot de passe" aria-label="Mot de passe inscription" style={{ borderRadius: 6 }} />
                    </Form.Item>

                    <Form.Item
                        name="confirmMotDePasse"
                        dependencies={['motDePasse']}
                        style={{ marginBottom: 12 }}
                        rules={[
                            { required: true, message: 'Confirmez le mot de passe' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('motDePasse') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirmer le mot de passe" aria-label="Confirmer le mot de passe" style={{ borderRadius: 6 }} />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 8 }}>
                        <Button type="primary" htmlType="submit" loading={isLoading} block style={{
                            borderRadius: 6, height: 42, fontWeight: 'bold', background: '#1e3a8a', fontSize: '0.95rem'
                        }}>
                            S'inscrire
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ marginTop: 10 }}>
                    <Text type="secondary" style={{ fontSize: '0.9rem' }}>Déjà membre ? </Text>
                    <a onClick={() => setIsSignUp(false)} style={{ color: '#1e3a8a', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}>
                        Se connecter
                    </a>
                </div>
            </div>

            {/* Sliding Overlay / Image Container */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0, // Starts on right
                width: '50%',
                height: '100%',
                overflow: 'hidden',
                transition: 'transform 0.6s ease-in-out',
                zIndex: 100,
                transform: isSignUp ? 'translateX(-100%)' : 'translateX(0)',
                borderRadius: 0, // No border radius
                boxShadow: '0 0 50px rgba(0,0,0,0.2)', // Add shadow for depth
            }}>
                {/* The Image Itself */}
                <div style={{
                    background: '#1e3a8a',
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    color: '#fff',
                }}>
                    <img
                        src="/login-illustration.png"
                        alt="Background"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                    {/* Overlay Text */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to bottom, rgba(30,58,138,0.3), rgba(30,58,138,0.7))',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        padding: '60px',
                    }}>
                        <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '3rem', marginBottom: '20px' }}>
                            {isSignUp ? "Gestion Intelligente" : "Tunisia Inclusive Labor Institute"}
                        </h1>
                        <p style={{ color: 'white', fontSize: '1.5rem', maxWidth: '600px' }}>
                            {isSignUp ? "Simplifiez votre travail quotidien." : "Votre plateforme de gestion interne."}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default LoginPage;
