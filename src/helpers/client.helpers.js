import { pool } from '../database.js';
import RESPONSES from '../responses.js';
import { normalizeText } from './message.helpers.js';

export const replyMessage = async (msg, intent) => {
    switch (intent) {
        case 'locations':
            await msg.reply(RESPONSES.locations);
            break;

        case 'schedule':
            await msg.reply(RESPONSES.schedule);
            break;

        case 'priceAvailability':
            await msg.reply(RESPONSES.priceAvailability);
            const numberId = msg.from;
            await updateAskingProduct(numberId, 1);
            break;

        default:
            await msg.reply(RESPONSES.fallback);
            break;
    }
};

export const validateInfo = async (numberId) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM Numbers WHERE number_id = ?',
            [numberId]
        );
        return rows[0];
    } catch (error) {
        console.error('Error validating client info:', error);
        throw error;
    }
};

export const registerClient = async (numberId) => {
    try {
        const [result] = await pool.query(
            'INSERT INTO Numbers (number_id) VALUES (?)',
            [numberId]
        );
        return result;
    } catch (error) {
        console.error('Error registering client:', error);
        throw error;
    }
};

export const activateSession = async (numberId) => {
    try {
        const [result] = await pool.query(
            'UPDATE Numbers SET active_session = 1 WHERE number_id = ?',
            [numberId]
        );
        return result;
    } catch (error) {
        console.error('Error activating session:', error);
        throw error;
    }
};

export const deactivateSession = async (numberId) => {
    try {
        const [result] = await pool.query(
            'UPDATE Numbers SET active_session = 0 WHERE number_id = ?',
            [numberId]
        );
        // first_message, asking_product reset to 0
        await pool.query(
            'UPDATE Numbers SET first_message = 0, asking_product = 0 WHERE number_id = ?',
            [numberId]
        );
        return result;
    } catch (error) {
        console.error('Error deactivating session:', error);
        throw error;
    }
};

export const updateLastInteraction = async (numberId) => {
    try {
        const [result] = await pool.query(
            'UPDATE Numbers SET last_message = NOW() WHERE number_id = ?',
            [numberId]
        );
        return result;
    } catch (error) {
        console.error('Error updating last interaction:', error);
        throw error;
    }
};

export const updateHasFirstMessage = async (numberId) => {
    try {
        const [result] = await pool.query(
            'UPDATE Numbers SET first_message = 1 WHERE number_id = ?',
            [numberId]
        );
        return result;
    } catch (error) {
        console.error('Error updating first message:', error);
        throw error;
    }
};

export const updateAskingProduct = async (numberId, asking) => {
    try {
        const [result] = await pool.query(
            'UPDATE Numbers SET asking_product = ? WHERE number_id = ?',
            [asking, numberId]
        );
        return result;
    } catch (error) {
        console.error('Error updating asking product:', error);
        throw error;
    }
};

export const findProductByName = async (productName) => {
    try {
        const normalizedProductName = normalizeText(productName);

        const [rows] = await pool.query(
            'SELECT * FROM Products WHERE product_name = ?',
            [normalizedProductName]
        );
        return rows[0];
    } catch (error) {
        console.error('Error finding product by name:', error);
        throw error;
    }
};

export const validateSessions = async (client) => {
    try {
        const [rows] = await pool.query(
            'SELECT number_id, last_message FROM Numbers WHERE active_session = 1'
        );
        const now = new Date();
        for (const row of rows) {
            const lastMessageTime = new Date(row.last_message);

            // validate if the last message was sent more than 5 minutes ago, if so, deactivate the session
            const timeDifference = now.getTime() - lastMessageTime.getTime();
            const time = 1000 * 60 * 5; // 5 minutes
            // const time = 10 * 1000;

            const isSessionExpired = timeDifference > time;

            if (isSessionExpired) {
                await deactivateSession(row.number_id);
                await sendSessionExpiredMessage(client, row.number_id);
            }

        }
    } catch (error) {
        console.error('Error validating sessions:', error);
        throw error;
    }
}

const sendSessionExpiredMessage = async (client, numberId) => {
    try {
        await client.sendMessage(numberId, RESPONSES.sessionExpired);
    } catch (error) {
        console.error('Error sending session expired message:', error);
        throw error;
    }
}
