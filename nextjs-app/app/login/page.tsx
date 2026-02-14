'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { loginUser } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await loginUser({
                username: username.trim(),
                password: password.trim()
            });

            // Store auth data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('permissions', JSON.stringify(data.permissions));

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error: unknown) {
            setError((error as Error).message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)'
        }}>
            <div className="glass-panel" style={{
                width: '400px',
                padding: '40px',
                borderTop: '2px solid var(--accent-gold)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'var(--accent-gold-dim)',
                        borderRadius: '50%',
                        margin: '0 auto 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Lock size={30} color="var(--accent-gold)" />
                    </div>
                    <h2 style={{ marginBottom: '10px' }}>System Access</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Rice Mill Control System (Internal)
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '10px',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            color: 'var(--text-secondary)',
                            marginBottom: '8px',
                            fontSize: '0.9rem'
                        }}>
                            ADMIN ID
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter ID"
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                borderColor: 'var(--border-subtle)'
                            }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{
                            display: 'block',
                            color: 'var(--text-secondary)',
                            marginBottom: '8px',
                            fontSize: '0.9rem'
                        }}>
                            SECURE KEY
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                borderColor: 'var(--border-subtle)'
                            }}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={loading}
                    >
                        {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
                    </button>
                </form>

                <div style={{
                    marginTop: '30px',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    opacity: 0.5
                }}>
                    Authorized Personnel Only • IP Logged
                </div>
            </div>
        </div>
    );
}
