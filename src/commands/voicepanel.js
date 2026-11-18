const { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder, AttachmentBuilder } = require('discord.js');
const { createPanelImage } = require('../utils/panelImage');
const { errorContainer, successContainer, infoContainer } = require('../utils/components');

module.exports = {
  name: 'voicepanel',
  aliases: ['لوحة-الفويس', 'لوحة-التحكم', 'vc-panel'],
  description: 'إرسال لوحة التحكم بالرومات الصوتية',
  usage: '+لوحة-الفويس',
  async execute(message) {
    if (!message.guild) return message.reply('هذا الأمر يعمل داخل السيرفر فقط.');
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels) && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply(errorContainer('صلاحيات', 'تحتاج صلاحية إدارة الرومات أو إدارة السيرفر لإرسال لوحة التحكم.'));
    }

    const embed = new EmbedBuilder()
      .setColor('#ff4fa3')
      .setAuthor({ name: 'Z9 Server • Voice Control Panel' })
      .setTitle('🎙️ لوحة تحكم الفويس')
      .setDescription([
        'استخدم الأزرار للتحكم بالروم الصوتي الذي أنت موجود فيه.',
        '',
        '🔒 قفل وفتح الروم • 🙈 إخفاء وإظهار • 📝 تغيير الاسم',
        '👥 اختر أعضاء من القائمة للسماح لهم بالدخول.',
        '',
        '**ملاحظة:** لازم تكون داخل الروم الصوتي الذي تريد التحكم فيه، وتحتاج صلاحية التحكم به.'
      ].join('\n'))
      .setFooter({ text: '© Z9 Server • Voice Control Panel' });

    const image = new AttachmentBuilder(createPanelImage('VOICE CONTROL PANEL', '© Z9 Server • الحقوق محفوظة'), { name: 'z9-voice-panel.png' });
    embed.setImage('attachment://z9-voice-panel.png');

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('tempvc_lock').setLabel('قفل الروم').setEmoji('🔒').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('tempvc_unlock').setLabel('فتح الروم').setEmoji('🔓').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('tempvc_hide').setLabel('إخفاء').setEmoji('🙈').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('tempvc_show').setLabel('إظهار').setEmoji('👁️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('tempvc_rename').setLabel('تغيير الاسم').setEmoji('📝').setStyle(ButtonStyle.Primary)
    );
    const row2 = new ActionRowBuilder().addComponents(
      new UserSelectMenuBuilder().setCustomId('tempvc_whitelist').setPlaceholder('👥 اختر أعضاء للسماح لهم بالدخول').setMinValues(1).setMaxValues(10)
    );

    try {
      await message.channel.send({ embeds: [embed], files: [image], components: [row1, row2] });
      if (typeof message.reply === 'function') return message.reply(successContainer('تم إرسال اللوحة', 'تم إرسال لوحة التحكم بالفويس في هذه القناة.'));
    } catch (error) {
      console.error('[Voice Panel]', error);
      if (typeof message.reply === 'function') return message.reply(errorContainer('خطأ', 'تعذر إرسال اللوحة. تأكد من صلاحيات إرسال الرسائل وإرفاق الملفات.'));
    }
  }
};
