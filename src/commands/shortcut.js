const fs = require('node:fs'); const path = require('node:path');
const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer, infoContainer } = require('../utils/components');
const configPath = path.join(__dirname, '..', '..', 'config.json');
function readConfig() { return JSON.parse(fs.readFileSync(configPath, 'utf8')); }
function writeConfig(c) { fs.writeFileSync(configPath, JSON.stringify(c, null, 2)); }
module.exports = {
 name: 'shortcut', aliases: ['اختصار', 'alias'], description: 'إضافة اختصار لأي أمر مع البريفكس أو بدونه', usage: '+اختصار إضافة jail س مع | بدون',
 async execute(message, args) {
  if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) return message.reply(errorContainer('صلاحيات', 'تحتاج صلاحية إدارة السيرفر.'));
  const action = (args[0] || '').toLowerCase(); const config = readConfig(); config.commandAliases ||= [];
  if (['قائمة','list'].includes(action)) {
   const rows = config.commandAliases.map(a => `• \`${a.alias}\` ← \`${a.command}\` (${a.requirePrefix ? 'يتطلب +' : 'يعمل مع + أو بدونه'})`);
   return message.reply(infoContainer('الاختصارات', rows.join('\n') || 'لا توجد اختصارات مخصصة.'));
  }
  if (['حذف','remove','delete'].includes(action)) {
   const alias = (args[1] || '').toLowerCase(); const before = config.commandAliases.length;
   config.commandAliases = config.commandAliases.filter(a => a.alias.toLowerCase() !== alias);
   if (before === config.commandAliases.length) return message.reply(errorContainer('غير موجود', 'لم أجد هذا الاختصار.'));
   writeConfig(config); return message.reply(successContainer('تم الحذف', `تم حذف الاختصار \`${alias}\`.`));
  }
  if (!['إضافة','اضافة','add'].includes(action) || args.length < 4) return message.reply(infoContainer('طريقة الاستخدام', '`+اختصار إضافة اسم_الأمر الاختصار مع`\n`+اختصار إضافة jail س بدون`\n`+اختصار حذف س`\n`+اختصار قائمة`\n\n**مع** = يتطلب +، و**بدون** = يعمل مع + أو بدونه.'));
  const commandName = args[1].toLowerCase(); const alias = args[2].toLowerCase(); const mode = args[3].toLowerCase();
  const command = message.client.commands.get(commandName);
  if (!command) return message.reply(errorContainer('أمر غير موجود', `لم أجد الأمر \`${commandName}\`. استخدم الاسم الإنجليزي الأساسي للأمر.`));
  if (!/^[\p{L}\p{N}_-]{1,32}$/u.test(alias) || alias === message.client.prefix) return message.reply(errorContainer('اختصار غير صالح', 'استخدم حروفًا أو أرقامًا أو - أو _.'));
  const existing = config.commandAliases.find(a => a.alias.toLowerCase() === alias);
  if (existing) return message.reply(errorContainer('الاختصار مستخدم', 'احذف الاختصار الحالي أولًا أو اختر اسمًا آخر.'));
  config.commandAliases.push({ alias, command: command.name, requirePrefix: ['مع','prefix','نعم','+'].includes(mode) });
  writeConfig(config);
  return message.reply(successContainer('تمت إضافة الاختصار', `**الأمر:** \`${command.name}\`\n**الاختصار:** \`${alias}\`\n**الاستخدام:** ${['مع','prefix','نعم','+'].includes(mode) ? '`+'+alias+'` فقط' : '`'+alias+'` أو `+'+alias+'`'}`));
 }
};
