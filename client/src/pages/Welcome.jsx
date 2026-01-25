import React, { useEffect, useState } from 'react';
import { ArrowRight, Wheat } from 'lucide-react';
import '../styles/global.css';

const Welcome = ({ onEnter }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
    }, []);

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: 'radial-gradient(circle at center, #1f2329 0%, #0f1115 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Elements */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '20%',
                width: '300px',
                height: '300px',
                background: 'rgba(212, 175, 55, 0.05)',
                borderRadius: '50%',
                filter: 'blur(80px)'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '10%',
                width: '400px',
                height: '400px',
                background: 'rgba(16, 185, 129, 0.03)',
                borderRadius: '50%',
                filter: 'blur(100px)'
            }}></div>

            <div style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
                textAlign: 'center',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{
                    marginBottom: '30px',
                    display: 'inline-flex',
                    padding: '20px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(0,0,0,0))',
                    border: '1px solid rgba(212, 175, 55, 0.2)'
                }}>
                    <Wheat size={64} color="#d4af37" strokeWidth={1.5} />
                </div>

                <h1 style={{
                    fontSize: '3.5rem',
                    fontWeight: 700,
                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '10px',
                    letterSpacing: '-0.02em'
                }}>
                    Murugan Modern Rice Mill
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--accent-gold)',
                    marginBottom: '50px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                }}>
                    Integrated Management System
                </p>

                <button
                    onClick={onEnter}
                    className="btn-primary"
                    style={{
                        padding: '16px 48px',
                        fontSize: '1.1rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderRadius: '50px',
                        boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
                    }}
                >
                    <span>Initialize Dashboard</span>
                    <ArrowRight size={20} />
                </button>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '30px',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                opacity: 0.5
            }}>
                Version 2.0.0 • Authorized Access Only
            </div>
        </div>
    );
};

export default Welcome;
