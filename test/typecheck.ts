import {
    APIClient,
    Error as LegacyError,
    NekoError,
    User,
    Welcome
} from 'neekuro';

new User();
new User('token');
new Welcome()
    .setResolution('default', 520)
    .setLayout('center')
    .setAvatar(Buffer.alloc(12))
    .setBackground('color', '#23272A');

const client = new APIClient('https://example.com', { token: 'token' });
void client.get('/endpoint', { timeout: 5_000 });

const current: NekoError = new NekoError('Test', 'message');
const legacy: NekoError = new LegacyError('Test', 'message');
void current;
void legacy;
