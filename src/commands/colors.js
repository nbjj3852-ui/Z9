const fs=require('node:fs');
const path=require('node:path');
const {
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
}=require('discord.js');

const {
  successContainer,
  errorContainer,
  infoContainer
}=require('../utils/components');

const configPath=path.join(__dirname,'..','..','config.json');

// =====================================================
// ضع رابط صورة لوحة الألوان هنا
// مثال:
// const COLOR_PANEL_IMAGE_URL='https://example.com/colors.png';
// =====================================================
const COLOR_PANEL_IMAGE_URL='https://cdn.discordapp.com/attachments/1552373033698857092/1555880067803127898/C81F205A-D447-48C6-BF3E-5ACA7C0CA1CE.png?backend=b2&ex=6ac4c4bb&is=6ac3733b&hm=663e51340a205c511690f86a2a0977ad1f7343251ee8655b1bc50bd5ffb0055a&';

function read(){
  return JSON.parse(fs.readFileSync(configPath,'utf8'));
}

function write(c){
  fs.writeFileSync(
    configPath,
    JSON.stringify(c,null,2)
  );
}

module.exports={
  name:'colors',

  aliases:[
    'ألوان',
    'الوان',
    'لوحة-الألوان'
  ],

  description:'لوحة اختيار ألوان الأعضاء وربط كل لون برتبة',

  usage:'+colors panel | +colors add اسم #ff00aa @role',

  async execute(message,args){

    const c=read();

    c.colorRoles ||= [];

    const sub=(args[0]||'panel').toLowerCase();

    // =================================================
    // إضافة لون
    // =================================================
    if([
      'add',
      'إضافة',
      'اضافة'
    ].includes(sub)){

      if(
        !message.member.permissions.has(
          PermissionFlagsBits.ManageRoles
        )
      ){
        return message.reply(
          errorContainer(
            'صلاحيات',
            'تحتاج إدارة الرتب.'
          )
        );
      }

      const role=message.mentions.roles.first();
      const name=args[1];
      const hex=args[2];

      if(
        !role ||
        !name ||
        !/^#?[0-9a-f]{6}$/i.test(hex||'')
      ){
        return message.reply(
          infoContainer(
            'طريقة الإضافة',
            '`+colors add اسم #ff00aa @رتبة`'
          )
        );
      }

      const color=`#${hex.replace('#','')}`;

      await role.setColor(color).catch(()=>{});

      const old=c.colorRoles.findIndex(
        x=>x.roleId===role.id
      );

      const item={
        name,
        roleId:role.id,
        hex:color,
        emoji:'🎨'
      };

      if(old>=0){
        c.colorRoles[old]=item;
      }else{
        c.colorRoles.push(item);
      }

      write(c);

      return message.reply(
        successContainer(
          'تم حفظ اللون',
          `**اللون:** ${name} (${color})\n**الرتبة:** ${role}`
        )
      );
    }

    // =================================================
    // حذف لون
    // =================================================
    if([
      'remove',
      'حذف',
      'إزالة',
      'ازالة'
    ].includes(sub)){

      if(
        !message.member.permissions.has(
          PermissionFlagsBits.ManageRoles
        )
      ){
        return message.reply(
          errorContainer(
            'صلاحيات',
            'تحتاج إدارة الرتب.'
          )
        );
      }

      const role=message.mentions.roles.first();
      const name=args[1];

      const before=c.colorRoles.length;

      c.colorRoles=c.colorRoles.filter(
        x =>
          x.roleId!==(role?.id||'') &&
          x.name!==name
      );

      if(before===c.colorRoles.length){
        return message.reply(
          errorContainer(
            'غير موجود',
            'حدد رتبة اللون أو اسمه.'
          )
        );
      }

      write(c);

      return message.reply(
        successContainer(
          'تم حذف اللون',
          'تمت إزالة اللون من قائمة الاختيار.'
        )
      );
    }

    // =================================================
    // قائمة الألوان
    // =================================================
    if([
      'list',
      'قائمة'
    ].includes(sub)){

      return message.reply(
        infoContainer(
          'ألوان الأعضاء',
          c.colorRoles
            .map(
              x =>
                `• ${x.emoji||'🎨'} **${x.name}** — ${x.hex} — <@&${x.roleId}>`
            )
            .join('\n') ||
            'لم تتم إضافة ألوان بعد.'
        )
      );
    }

    // =================================================
    // لا توجد ألوان
    // =================================================
    if(!c.colorRoles.length){

      return message.reply(
        infoContainer(
          'إعداد لوحة الألوان',
          'أضف الألوان أولًا: `+colors add وردي #ff4fa3 @رتبة`\nثم أرسل اللوحة: `+colors panel`'
        )
      );
    }

    // =================================================
    // خيارات الألوان
    // =================================================
    const options=c.colorRoles
      .slice(0,25)
      .map(
        x =>
          new StringSelectMenuOptionBuilder()
            .setLabel(x.name.slice(0,100))
            .setValue(x.roleId)
            .setDescription(
              `${x.hex} • اختر هذا اللون`
            )
            .setEmoji(x.emoji||'🎨')
      );

    const menu=
      new StringSelectMenuBuilder()
        .setCustomId('color-role-select')
        .setPlaceholder('🎨 اختر لون اسمك')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options);

    // =================================================
    // لوحة الألوان
    // =================================================
    const embed=
      new EmbedBuilder()
        .setColor(0x22232a)
        .setAuthor({
          name:'Z9 Server • نظام الألوان'
        })
        .setTitle('🎨 اختر لون اسمك')
        .setDescription(
          'اختر لونك من القائمة بالأسفل، وسيتم إعطاؤك الرتبة المرتبطة به وإزالة رتبة اللون السابقة تلقائيًا.'
        )
        .addFields({
          name:'طريقة الاستخدام',
          value:
            '1. افتح القائمة\n' +
            '2. اختر اللون\n' +
            '3. انتظر تأكيد تغيير رتبتك'
        })
        .setFooter({
          text:'© Z9 Server • الحقوق محفوظة'
        });

    // =================================================
    // صورة اللوحة من الرابط
    // =================================================
    if(COLOR_PANEL_IMAGE_URL.trim()){
      embed.setImage(
        COLOR_PANEL_IMAGE_URL.trim()
      );
    }

    return message.channel.send({
      embeds:[embed],
      components:[
        new ActionRowBuilder().addComponents(menu)
      ]
    });
  }
};