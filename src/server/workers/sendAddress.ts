import dgram from 'dgram';
import SettingsModel from '../Models/Settings.js';

if (process.env.IGNORE_BROADCAST === 'false') {
    const socket = dgram.createSocket('udp4');
    const port = Number(process.env.PORT) || 3000
    const protocol = process.env.PROTOCOL || 'http'
    const broadcastPort = 50000;

    socket.on('message', async function (message, remote) {
        const msgStr = message.toString();
        try {
            const url = new URL(msgStr);
            if (url.protocol === 'lanlauncher:') {
                if (url.hostname === 'get_ip') {
                    // Fetch server name from database
                    const serverName = await SettingsModel.getServerName();

                    const response = {
                        protocol: protocol,
                        port: port,
                        serverName: serverName
                    };

                    const json = JSON.stringify(response);
                    socket.send(json, 0, Buffer.byteLength(json), remote.port, remote.address);
                    console.log('Sent response to', remote.address + ':' + remote.port + ' - ' + json);
                }
            }
        } catch (e) {
            return;
        }
    });

    // Listen on a range of ports
    const startPort = broadcastPort;
    const endPort = broadcastPort; // Example: listen on 10 ports

    for (let p = startPort; p <= endPort; p++) {
        const s = dgram.createSocket('udp4');
        s.on('message', (...args) => socket.emit('message', ...args));
        s.bind(p, () => {
            console.log(`Listening on UDP port ${p}`);
        });
    }
} else {
    console.log('Broadcast listener is disabled via IGNORE_BROADCAST environment variable.');
}