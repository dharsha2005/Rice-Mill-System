

const login = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', data);
    } catch (err) {
        console.error('Error:', err);
    }
};

login();
