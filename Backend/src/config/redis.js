import { createClient } from 'redis';

const redisClient = createClient({
    
    username: 'default',

    
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-17216.crce182.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 17216
    }
});

// console.log(process.env.REDIS_PASSWORD);

export {redisClient};