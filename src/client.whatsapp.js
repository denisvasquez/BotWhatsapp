const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const { detectIntent, normalizeText } = require('./helpers/message.helpers');
const {
    replyMessage,
    updateLastInteraction,
    validateInfo,
    registerClient,
    activateSession,
    updateHasFirstMessage,
    findProductByName,
    updateAskingProduct,
    validateSessions,
} = require('./helpers/client.helpers');

const RESPONSES = require('./responses');

if (process.env.MODE === 'development') {
    SESSION_FILE_PATH = './tokens';
} else {
    SESSION_FILE_PATH = '/mnt/auth';
}

try {
    const sessionDir = path.resolve(SESSION_FILE_PATH);
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
        console.log(`Se creó el directorio de sesión en: ${sessionDir}`);
    }
} catch (err) {
    console.warn(
        'No se pudo crear/validar SESSION_FILE_PATH:',
        SESSION_FILE_PATH,
        err.message
    );
}

const client = new Client({
    webVersionCache: {
        type: 'remote',
        remotePath:
            'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    },
    authStrategy: new LocalAuth({
        dataPath: SESSION_FILE_PATH,
        clientId: 'web',
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-extensions',
            '--disable-gpu',
        ],
    },
});

client.on('qr', async (qr) => {
    const qrDir = path.resolve('src/qr');

    if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir, { recursive: true });
        console.log(`Se creó el directorio del qr en: ${qrDir}`);
    }

    const qrImagePath = path.join(__dirname, 'qr', 'qr.png');

    qrcode.toFile(qrImagePath, qr, (err) => {
        if (err) {
            console.error('Error generating QR code image:', err);
        } else {
            console.log('QR code image saved to:', qrImagePath);
        }
    });
});

client.on('authenticated', () => {
    console.log('Authenticated successfully!');
});

client.on('auth_failure', (msg) => {
    console.error('Authentication failed:', msg);
});

client.on('ready', () => {
    console.log('Client is ready!');

    // node chron to validate sessions every minute
    cron.schedule('* * * * *', async () => {
        try {
            console.log('Validating sessions...');
            await validateSessions(client);
        } catch (error) {
            console.error('Error validating sessions:', error);
        }
    });
});

client.on('message', async (msg) => {
    try {
        if (!msg.body) return;
        if (msg.fromMe) return;

        const numberId = msg.from;

        const clientInfo = await validateInfo(numberId);

        await updateLastInteraction(numberId);

        if (!clientInfo) {
            await registerClient(numberId);

            await msg.reply(RESPONSES.greeting);
        }

        if (clientInfo && !clientInfo.active_session) {
            await activateSession(numberId);

            await msg.reply(RESPONSES.greeting);
        }

        if (
            clientInfo &&
            clientInfo.active_session &&
            clientInfo.first_message &&
            !clientInfo.asking_product
        ) {
            const intent = detectIntent(msg.body);
            await replyMessage(msg, intent);
        }

        if (
            clientInfo &&
            clientInfo.active_session &&
            clientInfo.first_message &&
            clientInfo.asking_product
        ) {
            if (normalizeText(msg.body) === 'menu') {
                await msg.reply(RESPONSES.menu);
                await updateAskingProduct(numberId, 0);
                return;
            }

            // Handle the case where the user is asking for product information
            const product = await findProductByName(msg.body);
            if (product) {
                if (product.product_stock === 0) {
                    await msg.reply(
                        `Lo siento, el producto "${product.product_name}" está agotado en este momento.`
                    );
                    return;
                }
                await msg.reply(
                    `Información del producto: ${product.product_name} - Precio: Q.${product.product_price} - Stock disponible: ${product.product_stock}`
                );
            } else {
                await msg.reply(RESPONSES.productNotFound);
            }
        }

        await updateHasFirstMessage(numberId);
    } catch (error) {
        console.error('Error al procesar mensaje:', error);
    }
});

// initialize the client
client.initialize();
