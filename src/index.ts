import app from './bootstrap';

import Kernel from './foundation/kernel';

const kernel = app.get<Kernel>(Kernel);

kernel.run().then(() => {
    process.on('unhandledRejection', (e) => {
        kernel.terminateError(e);
    }).on('exit', () => {
        kernel.terminate();
    }).on('SIGTERM', () => {
        kernel.terminate();
    }).on('SIGINT', () => {
        kernel.terminate();
    });
});
