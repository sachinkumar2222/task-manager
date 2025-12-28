const axios = require('axios');

const sendTestNotification = async () => {
    try {
        const response = await axios.post(
            'http://localhost:4003/api/notify',
            {
                userId: 'test-user-id-123',
                event: {
                    type: 'TEST_EVENT',
                    message: 'This is a test notification',
                    payload: {}
                }
            },
            {
                headers: {
                    'x-internal-api-key': 's3cr3t-internal-key-for-service-to-service-auth-9z8y7x'
                }
            }
        );
        console.log('Status:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

sendTestNotification();
