import { app } from './app.js';
import { config } from './configs/env-config.js';
import { initPostgre } from './services/postgreService.js';

async function start() {
    try {
        initPostgre();
        app.listen(config.PORT, () => console.log(`Server is running on PORT ${config.PORT}`));
    } catch (error) {
        console.error(error);
    }
}
start();