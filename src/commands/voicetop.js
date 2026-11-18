const { EmbedBuilder } = require('discord.js'); const voiceXp = require('../utils/voiceXp');
module.exports = { name:'voicetop', aliases:['توب-الفويس','توب-الصوت'], description:'عرض أكثر الأعضاء نشاطًا في الفويس', usage:'+voicetop', async execute(message) {
 const rows = voiceXp.top(message.guild.id, 10);
 const lines = rows.map((r,i)=>`**${i+1}.** <@${r.userId}> — **${r.xp.toLocaleString()} XP** · ${r.minutes} دقيقة`);
 return message.reply({ embeds:[new EmbedBuilder().setColor(0x5865f2).setTitle('🎙️ توب الفويس').setDescription(lines.join('\n') || 'لا توجد نقاط فويس حتى الآن.').setFooter({text:'Z9 Server • Voice XP'}).setTimestamp()] });
} };
