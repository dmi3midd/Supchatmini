import { createSuperadmin } from './superadmin.js';
import { app } from './app.js';
import { config } from './configs/env-config.js';
import { initPostgre } from './services/postgreService.js';
import { initRedis } from './services/redisService.js'
import { wssInit } from './services/wsService.js';
import emailService from './services/emailService.js';

async function start() {
    try {
        initPostgre();
        initRedis();
        wssInit();
        await emailService.checkConnection();
        await createSuperadmin('supadmin', 'qwerty123@gmail.com', 'qwerty12345');
        app.listen(config.PORT, () => console.log(`Server is running on PORT ${config.PORT}`));
    } catch (error) {
        console.error(error);
    }
}
start();