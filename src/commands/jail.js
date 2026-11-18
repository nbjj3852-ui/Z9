const { PermissionFlagsBits } = require('discord.js');
const { successContainer, errorContainer } = require('../utils/components');
const config = require('../../config.json');
const { sendLog } = require('../utils/logger');
const jailStore = require('../utils/jail');
module.exports = {
  name: 'jail', aliases: ['سجن'], description: '🔒 سجن عضو لمدة محددة واسترجاع رتبته تلقائياً', usage: '+jail @user [10m|2h|3d] [reason]',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply(errorContainer('خطأ', 'ما عندك صلاحية استخدام هذا الأمر.'));
    const target = message.mentions.members.first();
    if (!target) return message.reply(errorContainer('خطأ', 'منشن العضو المراد سجنه. مثال: `+jail @user 30m مخالفة`'));
    const jailRole = message.guild.roles.cache.get(config.jailRoleId);
    if (!jailRole) return message.reply(errorContainer('خطأ', 'حدد jailRoleId في config.json أولاً.'));
    if (target.id === message.author.id || target.user.bot) return message.reply(errorContainer('خطأ', 'لا يمكنك سجن نفسك أو بوت.'));
    if (target.roles.highest.position >= message.member.roles.highest.position) return message.reply(errorContainer('خطأ', 'لا يمكنك سجن عضو رتبته أعلى منك أو مساوية لك.'));
    const store = jailStore.load(); const key = `${message.guild.id}_${target.id}`;
    if (store[key]) return message.reply(errorContainer('خطأ', 'هذا العضو مسجون بالفعل.'));
    const durationMs = jailStore.parseDuration(args[1]);
    if (args[1] && durationMs === undefined && /^\d+[a-z]+$/i.test(args[1])) return message.reply(errorContainer('مدة غير صحيحة', 'استخدم مثلًا `10m` أو `2h` أو `3d` أو `1w`.'));
    const hasDuration = durationMs !== null && durationMs !== undefined;
    const reasonStart = hasDuration ? 2 : 1;
    const reason = args.slice(reasonStart).join(' ') || 'لم يتم تحديد سبب';
    const roles = target.roles.cache.filter(r => r.id !== message.guild.id && !r.managed && r.id !== jailRole.id).map(r => r.id);
    try {
      store[key] = { guildId: message.guild.id, userId: target.id, roles, jailedAt: Date.now(), expiresAt: hasDuration ? Date.now() + durationMs : null, reason, moderatorId: message.author.id };
      jailStore.save(store);
      await target.roles.set([jailRole.id], reason);
      const durationText = hasDuration ? `\n**المدة:** ${args[1]}\n**ينتهي:** <t:${Math.floor(store[key].expiresAt / 1000)}:R>` : '\n**المدة:** سجن دائم';
      await message.reply(successContainer('تم السجن', `**العضو:** ${target}\n**بواسطة:** ${message.author}\n**السبب:** ${reason}${durationText}\n\n> ستتم استعادة الرتب السابقة تلقائيًا عند انتهاء المدة.`));
      await sendLog(message.client, { title: 'سجن عضو', color: 0xe74c3c, fields: { 'العضو': `${target}`, 'بواسطة': `${message.author}`, 'السبب': reason, 'المدة': hasDuration ? args[1] : 'دائم' } });
    } catch (error) { delete store[key]; jailStore.save(store); await message.reply(errorContainer('خطأ', `فشل سجن العضو: ${error.message}`)); }
  }
};
