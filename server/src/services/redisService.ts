import * as redis from 'redis';

const redisClient = redis.createClient();

async function initRedis() {
    redisClient.on('connect', () => console.log('Redis Client Connecting...'));
    redisClient.on('ready', () => console.log('Redis Client Ready'));
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    redisClient.on('end', () => console.log('Redis Client Disconnected'));

    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Could not establish a connection with Redis:', error);
    }
}

export {
    redisClient,
    initRedis
};