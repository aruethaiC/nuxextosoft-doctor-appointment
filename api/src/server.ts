import { Server } from 'http';
import app from './app';
import config from './config';

async function bootstrap() {
    let server: Server;

    const startServer = () => {
        server = app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });

        server.on('close', () => {
            console.log('Server closed, restarting...');
            startServer();
        });
    };

    const exitHandler = () => {
        if (server) {
            server.close(() => {
                console.log('Server closed');
            });
        }
    };

    const unexpectedHandler = (error: Error) => {
        console.error('Unhandled Error:', error);
        exitHandler();
    };

    process.on('uncaughtException', unexpectedHandler);
    process.on('unhandledRejection', unexpectedHandler);

    process.on('SIGTERM', () => {
        console.log('SIGTERM received');
        if (server) {
            server.close();
        }
    });

    startServer();
}

bootstrap();