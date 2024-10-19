const crypto = require('crypto');
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_TOKEN = 'BOT TOKEN';
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Khóa và IV cho mã hóa
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// Tạo cặp khóa RSA
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
});

// Hàm mã hóa tin nhắn bằng AES
function encryptMessage(message) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Hàm giải mã tin nhắn bằng AES
function decryptMessage(encryptedMessage) {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function encryptWithRSA(message) {
    const encryptedBuffer = crypto.publicEncrypt(publicKey, Buffer.from(message));
    return encryptedBuffer.toString('base64');
}

function decryptWithRSA(encryptedMessage) {
    const decryptedBuffer = crypto.privateDecrypt(privateKey, Buffer.from(encryptedMessage, 'base64'));
    return decryptedBuffer.toString('utf8');
}

function encryptCode(code) {
    return encryptMessage(code);
}

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();

    try {
        if (text.startsWith('/encrypt ')) {
            const messageToEncrypt = text.split('/encrypt ')[1];
            if (messageToEncrypt) {
                const encryptedMessage = encryptMessage(messageToEncrypt);
                bot.sendMessage(chatId, `Encrypted message (AES): ${encryptedMessage}`);
            } else {
                bot.sendMessage(chatId, 'Please provide a message to encrypt. Example: /encrypt Your message here.');
            }
        } else if (text.startsWith('/decrypt ')) {
            const messageToDecrypt = text.split('/decrypt ')[1];
            if (messageToDecrypt) {
                const decryptedMessage = decryptMessage(messageToDecrypt);
                bot.sendMessage(chatId, `Decrypted message (AES): ${decryptedMessage}`);
            } else {
                bot.sendMessage(chatId, 'Please provide a message to decrypt. Example: /decrypt Your encrypted message here.');
            }
        } else if (text.startsWith('/rsa_encrypt ')) {
            const messageToEncrypt = text.split('/rsa_encrypt ')[1];
            if (messageToEncrypt) {
                const encryptedMessage = encryptWithRSA(messageToEncrypt);
                bot.sendMessage(chatId, `Encrypted message (RSA): ${encryptedMessage}`);
            } else {
                bot.sendMessage(chatId, 'Please provide a message to encrypt with RSA. Example: /rsa_encrypt Your message here.');
            }
        } else if (text.startsWith('/rsa_decrypt ')) {
            const messageToDecrypt = text.split('/rsa_decrypt ')[1];
            if (messageToDecrypt) {
                const decryptedMessage = decryptWithRSA(messageToDecrypt);
                bot.sendMessage(chatId, `Decrypted message (RSA): ${decryptedMessage}`);
            } else {
                bot.sendMessage(chatId, 'Please provide a message to decrypt with RSA. Example: /rsa_decrypt Your encrypted message here.');
            }            
        } else if (text.startsWith('/encrypt_code ')) {
            const codeToEncrypt = text.split('/encrypt_code ')[1];
            if (codeToEncrypt) {
                const encryptedCode = encryptCode(codeToEncrypt);
                bot.sendMessage(chatId, `Encrypted code (AES): ${encryptedCode}`);
            } else {
                bot.sendMessage(chatId, 'Please provide code to encrypt. Example: /encrypt_code Your code here.');
            }
        } else if (text.startsWith('/support')) {
            bot.sendMessage(chatId, 'Thank you for using my bot. If you need anything, you can inbox me @XXXXXXX');
        } else {
            bot.sendMessage(chatId, `Welcome to the bot! Available commands:
- /encrypt <your message>: Encrypt a message using AES.
- /decrypt <your encrypted message>: Decrypt a message using AES.
- /rsa_encrypt <your message>: Encrypt a message using RSA.
- /rsa_decrypt <your encrypted message>: Decrypt a message using RSA.
- /encrypt_code <your code>: Encrypt a block of code using AES.
- /support: support admin `);
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
        bot.sendMessage(chatId, `An error occurred: ${error.message}`);
    }
});
