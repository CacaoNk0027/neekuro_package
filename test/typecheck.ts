import {
    APIClient,
    BaseUser,
    Error as LegacyError,
    NekoError,
    SFW,
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
void SFW.getGif('action', 'hug');
void SFW.getGifs('reaction', 'angry');
SFW.clearCache('action', 'hug');
SFW.clearCache('reaction');
SFW.clearCache();
SFW.setBaseURL('https://example.com/api/sfw');
SFW.setCacheTTL(300_000);
const tokenVersion: number = BaseUser.getTokenVersion();
const globalToken: string | null = BaseUser.getToken();
void tokenVersion;
void globalToken;

const current: NekoError = new NekoError('Test', 'message');
const legacy: NekoError = new LegacyError('Test', 'message');
void current;
void legacy;
