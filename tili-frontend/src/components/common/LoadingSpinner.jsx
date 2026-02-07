// Loading Spinner Component
import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const LoadingSpinner = ({ size = 'large', tip = 'Chargement...', fullScreen = false }) => {
    const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 40 : 24 }} spin />;

    if (fullScreen) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.9)',
                }}
            >
                <Spin indicator={antIcon} tip={tip} size={size} />
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px',
                width: '100%',
            }}
        >
            <Spin indicator={antIcon} tip={tip} size={size} />
        </div>
    );
};

export default LoadingSpinner;
