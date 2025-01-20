const fs = require('fs');
const axios = require('axios');
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
require('dotenv').config();
const envGuildId = process.env.DISCORD_GUILD;
const token = process.env.DISCORD_TOKEN;
let debug = true; // Debugging-Modus ACHTUNG der token ist bei true im Klartext sichtbar!!!

if (debug) {
    console.log("Debugging enabled");
    console.log("Token:", token);
    console.log("Guild ID:" ,envGuildId);
}

console.log("Bot wird gestartet... Drücke Strg+C, um den Bot zu beenden.");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const chatDataFile = './chatData.json';

let chatData = {};
if (fs.existsSync(chatDataFile)) {
    chatData = JSON.parse(fs.readFileSync(chatDataFile));
}

function saveChatData() {
    fs.writeFileSync(chatDataFile, JSON.stringify(chatData, null, 2));
}

client.on('ready', () => {
    console.log(`Bot ist eingeloggt als ${client.user.tag}`);

    
    const guildId = envGuildId; // ID der Discord-Gilde
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return console.error("Guild nicht gefunden");

    guild.commands.create(
        new SlashCommandBuilder()
            .setName('bug')
            .setDescription('Melde einen Bug mit deinem Chatverlauf.')
    );

    guild.commands.create(
        new SlashCommandBuilder()
            .setName('löschen')
            .setDescription('Lösche deinen Chatverlauf.')
    );

    guild.commands.create(
        new SlashCommandBuilder()
            .setName('persönlichkeit')
            .setDescription('Definiere die Persönlichkeit des Bots für dich.')
    );
});

client.on('interactionCreate', async (interaction) => {
    const userId = interaction.user.id;

    if (interaction.isCommand()) {
        if (interaction.commandName === 'bug') {
            if (!chatData[userId] || !chatData[userId].history.length) {
                await interaction.reply({ content: 'Kein Chatverlauf gefunden, der gemeldet werden könnte.', ephemeral: true });
                return;
            }

            const recentHistory = chatData[userId].history.slice(-5);
            const logContent = recentHistory.map(entry => `${entry.role === 'user' ? 'Benutzer' : 'Bot'}: ${entry.content}`).join('\n');

            const logFilePath = `./LOG_${userId}.txt`;
            fs.writeFileSync(logFilePath, logContent);

            await interaction.reply({ content: 'Vielen Dank für deine Meldung. Dein Chatverlauf wurde geloggt.', ephemeral: true });
        }

        if (interaction.commandName === 'löschen') {
            delete chatData[userId];
            saveChatData();
            await interaction.reply({ content: 'Dein Chatverlauf wurde gelöscht.', ephemeral: true });
        }

        if (interaction.commandName === 'persönlichkeit') {
            const modal = new ModalBuilder()
                .setCustomId('set_personality')
                .setTitle('Definiere die Persönlichkeit des Bots');

            const input = new TextInputBuilder()
                .setCustomId('personality_input')
                .setLabel('Wie soll die Persönlichkeit des Bots sein?')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('z. B. freundlich, humorvoll, professionell...')
                .setRequired(true);

            const actionRow = new ActionRowBuilder().addComponents(input);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'set_personality') {
            const personality = interaction.fields.getTextInputValue('personality_input');

            if (!chatData[userId]) {
                chatData[userId] = { history: [], personality: '' };
            }

            chatData[userId].personality = personality;
            saveChatData();

            await interaction.reply({ content: `Deine Persönlichkeitseinstellung wurde gespeichert: "${personality}".`, ephemeral: true });
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'accept_alpha') {
            chatData[userId] = { history: [], personality: '' };
            saveChatData();
            await interaction.reply({ content: 'Vielen Dank! Du kannst jetzt mit dem Bot chatten.', ephemeral: true });
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.mentions.has(client.user)) {
        const userId = message.author.id;

        if (!chatData[userId]) {
            chatData[userId] = { history: [], personality: '' };
            saveChatData();
        }

        const personality = chatData[userId].personality || 'Ich bin ein neutraler Assistent, der bereit ist zu helfen.';
        const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();

        if (!prompt) {
            message.reply('Bitte sende mir eine Nachricht, auf die ich antworten kann.');
            return;
        }

        const userHistory = chatData[userId].history.map(entry => `${entry.role === 'user' ? 'Benutzer' : 'Bot'}: ${entry.content}`).join('\n');
        const fullPrompt = `${personality}\n${userHistory}\nBenutzer: ${prompt}`;

        chatData[userId].history.push({ role: 'user', content: prompt });

        try {
            const response = await axios.post('http://127.0.0.1:11434/api/generate', {
                model: 'llama3',
                prompt: fullPrompt,
                stream: false
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const botResponse = response.data.response;

            if (!botResponse) {
                message.reply('Entschuldigung, ich habe keine gültige Antwort erhalten.');
                return;
            }

            chatData[userId].history.push({ role: 'bot', content: botResponse });
            saveChatData();

            message.reply(botResponse);
        } catch (error) {
            console.error('Fehler bei der Kommunikation mit der API:', error);
            message.reply('Entschuldigung, ich konnte keine Antwort generieren.');
        }
    }
});

client.login(token);