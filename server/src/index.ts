import { app } from './app.js';
import { config } from './configs/env-config.js';
import { initPostgre } from './services/postgreService.js';
import emailService from './services/emailService.js';

async function start() {
    try {
        initPostgre();
        await emailService.checkConnection();
        app.listen(config.PORT, () => console.log(`Server is running on PORT ${config.PORT}`));
    } catch (error) {
        console.error(error);
    }
}
start();