const fs = require('node:fs'); const path = require('node:path');
const { PermissionFlagsBits, ChannelType } = require('discord.js'); const { successContainer,errorContainer,infoContainer } = require('../utils/components');
const DIR = path.join(__dirname,'..','..','data','backups');
function safe(s){ return String(s).replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,40); }
module.exports = { name:'backup', aliases:['نسخ-احتياطي'], description:'حفظ نسخة من الرتب والرومات والصلاحيات', usage:'+backup [اسم]', async execute(message,args) {
 if(!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply(errorContainer('صلاحيات','هذا الأمر للأدمن فقط.'));
 await message.guild.roles.fetch(); await message.guild.channels.fetch();
 const roles = message.guild.roles.cache.filter(r=>r.id!==message.guild.id && !r.managed).map(r=>({id:r.id,name:r.name,color:r.color,hoist:r.hoist,mentionable:r.mentionable,permissions:r.permissions.bitfield.toString(),position:r.position}));
 const channels = message.guild.channels.cache.filter(c=>[ChannelType.GuildCategory,ChannelType.GuildText,ChannelType.GuildVoice,ChannelType.GuildAnnouncement,ChannelType.GuildStageVoice,ChannelType.GuildForum].includes(c.type)).map(c=>({id:c.id,name:c.name,type:c.type,parentId:c.parentId,position:c.rawPosition,topic:c.topic||null,nsfw:!!c.nsfw,rateLimitPerUser:c.rateLimitPerUser||0,bitrate:c.bitrate,userLimit:c.userLimit,rtcRegion:c.rtcRegion,permissionOverwrites:c.permissionOverwrites.cache.map(o=>({id:o.id,type:o.type,allow:o.allow.bitfield.toString(),deny:o.deny.bitfield.toString()}))}));
 const createdAt = new Date().toISOString().replace(/[:.]/g,'-'); const name=safe(args.join('-')||`backup-${createdAt}`); const file=`${message.guild.id}-${name}.json`;
 fs.mkdirSync(DIR,{recursive:true}); fs.writeFileSync(path.join(DIR,file),JSON.stringify({version:1,guildId:message.guild.id,guildName:message.guild.name,createdAt:new Date().toISOString(),roles,channels},null,2));
 return message.reply(successContainer('تم النسخ الاحتياطي',`تم حفظ **${roles.length} رتبة** و**${channels.length} روم** مع الصلاحيات.\n**الملف:** \`${file}\`\nلا يتم حذف أي شيء عند الاسترجاع؛ ستضاف العناصر الناقصة فقط.`));
} };
