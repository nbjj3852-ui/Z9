const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs'); const path = require('node:path'); const config = require('./config.json');
if (!config.token || config.token.includes('PUT_NEW')) throw new Error('ضع توكن البوت في config.json أولاً.');
if (!config.clientId || !config.guildId) throw new Error('ضع clientId و guildId في config.json.');
const folder = path.join(__dirname, 'src', 'commands');
const files = fs.readdirSync(folder).filter(f => f.endsWith('.js'));
const names = new Set(); const commands = [];
for (const file of files) {
  const command = require(path.join(folder, file));
  if (!command.name || names.has(command.name)) continue;
  names.add(command.name);
  const desc = String(command.description || `تنفيذ أمر ${command.name}`).replace(/[\r\n]/g,' ').slice(0,100) || `تنفيذ أمر ${command.name}`;
  const builder = new SlashCommandBuilder().setName(command.name).setDescription(desc);
  builder.addStringOption(o => o.setName('args').setDescription('المعاملات الإضافية للأمر (اختياري)').setRequired(false).setMaxLength(1000));
  builder.addUserOption(o => o.setName('target').setDescription('العضو المستهدف إن كان الأمر يحتاج عضوًا').setRequired(false));
  builder.addRoleOption(o => o.setName('role').setDescription('الرتبة المستهدفة إن كان الأمر يحتاج رتبة').setRequired(false));
  builder.addChannelOption(o => o.setName('channel').setDescription('القناة المستهدفة إن كان الأمر يحتاج قناة').setRequired(false));
  commands.push(builder.toJSON());
}
const rest = new REST({ version: '10' }).setToken(config.token);
(async () => {
  await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
  console.log(`تم تسجيل ${commands.length} أمر سلاش في السيرفر ${config.guildId}.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
