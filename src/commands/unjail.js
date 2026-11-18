const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const config = require('../../config.json');
const { sendLog } = require('../utils/logger');
const jailStore = require('../utils/jail');
module.exports = {
  name: 'unjail', aliases: ['فك-السجن'], description: '🔓 فك السجن وإرجاع الرتب السابقة', usage: '+unjail @user',
  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
    const target = message.mentions.members.first();
    if (!target) return message.reply(errorContainer('خطأ', 'منشن العضو المراد فك سجنه.'));
    const store = jailStore.load(); const key = `${message.guild.id}_${target.id}`; const record = store[key];
    if (!record && !target.roles.cache.has(config.jailRoleId)) return message.reply(errorContainer('خطأ', 'هذا العضو غير مسجون.'));
    try {
      if (record) await jailStore.restoreMember(target, record, config.jailRoleId);
      else if (config.jailRoleId) await target.roles.remove(config.jailRoleId, 'فك السجن');
      delete store[key]; jailStore.save(store);
      await message.reply(successContainer('تم فك السجن', `**العضو:** ${target}\nتم فك السجن واستعادة الرتب السابقة المحفوظة إن وُجدت.`));
      await sendLog(message.client, { title: 'فك سجن', color: 0x2ecc71, fields: { 'العضو': `${target}`, 'بواسطة': `${message.author}` } });
    } catch (error) { await message.reply(errorContainer('خطأ', `فشل فك السجن: ${error.message}`)); }
  }
};
