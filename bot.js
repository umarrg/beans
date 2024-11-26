require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const app = express();
const bot = new TelegramBot(process.env.TOKEN, { polling: true });
const PORT = process.env.PORT || 9000
const { fal } = require("@fal-ai/client");

fal.config({
    credentials: process.env.BEANS
});
app.use(express.json());
app.use(express.urlencoded({ extended: true, }));
app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', payload: "Beans Coin API" });
});


const commands = [
    { command: '/start', description: 'Start the bot' },
    { command: '/help', description: 'Display this help message' },
    { command: '/beansdegen', description: 'Generate an image based on the provided prompt' },

];

bot.setMyCommands(commands);


bot.onText(/\/start/, (msg, match) => {
    let name = msg.chat.first_name;

    const chatId = msg.chat.id;
    const welcomeMessage = `Hey ${name}! \n \nWelcome to Beans Coin AI Image Generation Bot! Here are some commands you can use: \n \n - /start: Start the bot \n - /help: Display this help message  \n - /reset: Reset your chat history  \n - /beansdegen: Generate an image from prompt /beansdegen < prompt > .  \n\nIf you have any questions or need assistance, feel free to ask! \n  \nDon't forget to check us out on Twitter and Telegram.`;


    const inlineKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Twitter', url: 'https://twitter.com/BeanscoinERC20' },

                ],
                [
                    { text: 'Telegram', url: 'https://t.me/BeanscoinERC20' }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, welcomeMessage, inlineKeyboard);
});
bot.onText(/\/help/, (msg, match) => {
    let name = msg.chat.first_name;

    const chatId = msg.chat.id;
    const welcomeMessage = `Hey ${name}! \n \nWelcome to Beans Coin AI Image Generation Bot! Here are some commands you can use: \n \n - /start: Start the bot \n - /help: Display this help message  \n - /reset: Reset your chat history  \n - /beansdegen: Generate an image from prompt /beansdegen < prompt > .  \n\nIf you have any questions or need assistance, feel free to ask! \n  \nDon't forget to check us out on Twitter and Telegram.`;


    const inlineKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Twitter', url: 'https://twitter.com/' },

                ],
                [
                    { text: 'Telegram', url: 'https://t.me/' }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, welcomeMessage, inlineKeyboard);
});
bot.onText(/\/beansdegen (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const prompt = "A beans " + match[1];
    const generatingMessage = await bot.sendMessage(chatId, "Generating...");
    console.log("yes")
    try {
        const result = await fal.subscribe("fal-ai/flux-lora", {
            input: {
                loras: [{
                    path: "https://v3.fal.media/files/lion/6FX1eqZYkRbB8-WlYdn8R_pytorch_lora_weights.safetensors",
                    scale: 1
                }],
                prompt: prompt,
                embeddings: [],
                model_name: null,
                enable_safety_checker: true
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        });
        console.log(result.data.images[0].url);
        console.log(result.requestId);



        const imageUrl = result.data.images[0].url
        setTimeout(async () => {
            try {

                await bot.sendPhoto(chatId, imageUrl);
            } catch (error) {
                console.error(error);
                await bot.sendMessage(chatId, "Error retrieving generated image.");
            }
        }, 50000);

    } catch (err) {
        console.error(err);
        await bot.sendMessage(chatId, "Failed to generate image.");
    } finally {
        setTimeout(async () => {
            await bot.deleteMessage(chatId, generatingMessage.message_id);

        }, 50000);
    }
});




app.listen(PORT, () => {
    console.log('Bot listening on port ' + PORT)
});