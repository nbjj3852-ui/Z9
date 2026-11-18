const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');
const { errorContainer, successContainer, infoContainer } = require('../utils/components');
const config = require('../../config.json');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			return executeSlashCommand(interaction);
		}
		
		if (interaction.isButton()) {
			const customId = interaction.customId;
			const [action, ...args] = customId.split('_');

			
			if (action === 'confirm-ban') {
				const userId = args[0];
				const guild = interaction.guild;

				try {
					await guild.members.ban(userId, { reason: 'تم التأكيد بواسطة الأدمن' });
					await interaction.update(
						successContainer('تم الحظر', `تم حظر <@${userId}> بنجاح.`),
					);
				} catch (error) {
					await interaction.update(
						errorContainer('خطأ', `فشل حظر العضو: ${error.message}`),
					);
				}
			}

			if (action === 'cancel-ban') {
				await interaction.update(
					infoContainer('تم الإلغاء', 'تم إلغاء عملية الحظر.'),
				);
			}

			
			if (action === 'roleassign') {
				const roleId = args[0];
				
				await interaction.deferReply({ ephemeral: true });

				const role = interaction.guild.roles.cache.get(roleId);
				if (!role) {
					return interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`الرتبة لم تعد موجودة في السيرفر!`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
				
				try {
					if (interaction.member.roles.cache.has(roleId)) {
						await interaction.member.roles.remove(roleId);
						await interaction.editReply({
							components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`➖ تم إزالة رتبة **${role.name}** منك.`))],
							flags: MessageFlags.IsComponentsV2
						});
					} else {
						await interaction.member.roles.add(roleId);
						await interaction.editReply({
							components: [new ContainerBuilder().setAccentColor(0x2ecc71).addTextDisplayComponents(t => t.setContent(`➕ حصلت على رتبة **${role.name}** بنجاح.`))],
							flags: MessageFlags.IsComponentsV2
						});
					}
				} catch (err) {
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`❌ حدث خطأ، تأكد من صلاحيات البوت وأنه أعلى من الرتبة المحددة.`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
			}

			
			if (customId === 'open-ticket') {
				try {
					const channelName = `ticket-${interaction.user.username}`;
					const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName);
					if (existingChannel) {
						return interaction.reply(errorContainer('تنبيه', `لديك تيكت مفتوح بالفعل: ${existingChannel}`, { ephemeral: true }));
					}

					const channel = await interaction.guild.channels.create({
						name: channelName,
						type: ChannelType.GuildText,
						permissionOverwrites: [
							{ id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
							{ id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
						]
					});

					await channel.send({
						content: `${interaction.user} أهلاً بك!\nالإدارة ستتواصل معك قريباً. لإغلاق التيكت استخدم أمر \`+ticket-close\``,
					});

					await interaction.reply({ content: `تم فتح التيكت الخاص بك: ${channel}`, ephemeral: true });
				} catch (error) {
					console.error('[Ticket Error]', error);
					await interaction.reply({ content: 'فشل إنشاء التيكت. تواصل مع الإدارة.', ephemeral: true });
				}
			}

			
			if (customId === 'apply-open-modal') {
				const modal = new ModalBuilder()
					.setCustomId('modal-apply')
					.setTitle('تقديم طلب الإدارة');

				const nameInput = new TextInputBuilder()
					.setCustomId('apply-name')
					.setLabel('الاسم الحقيقي:')
					.setStyle(TextInputStyle.Short);

				const ageInput = new TextInputBuilder()
					.setCustomId('apply-age')
					.setLabel('العمر:')
					.setStyle(TextInputStyle.Short);

				const expInput = new TextInputBuilder()
					.setCustomId('apply-exp')
					.setLabel('خبراتك السابقة:')
					.setStyle(TextInputStyle.Paragraph);

				modal.addComponents(
					new ActionRowBuilder().addComponents(nameInput),
					new ActionRowBuilder().addComponents(ageInput),
					new ActionRowBuilder().addComponents(expInput)
				);

				await interaction.showModal(modal);
			}

			
			if (action === 'apply-accept' || action === 'apply-reject') {
				if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
					return interaction.reply({ content: 'لست أدمن لاتخاذ هذا القرار!', ephemeral: true });
				}

				const isAccept = action === 'apply-accept';
				const applicantId = args[0];

				try {
					const applicant = await interaction.guild.members.fetch(applicantId);
					await applicant.send({
						components: [
							new ContainerBuilder()
								.setAccentColor(isAccept ? 0x2ecc71 : 0xe74c3c)
								.addTextDisplayComponents(
									t => t.setContent(isAccept ? `## 🎉 تم قبولك!` : `## ❌ نأسف لرفضك.`)
								)
								.addSeparatorComponents(sep => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
								.addTextDisplayComponents(
									t => t.setContent(isAccept ? `لقد تم قبول تقديمك للإدارة في السيرفر!` : `لم يتم قبولك هذه المرة. حظاً أوفر المرة القادمة.`)
								)
						],
						flags: MessageFlags.IsComponentsV2
					}).catch(() => {});
				} catch (e) {  }

				
				const msg = interaction.message;
				const embed = EmbedBuilder.from(msg.embeds[0]);
				embed.setColor(isAccept ? 0x2ecc71 : 0xe74c3c);
				embed.setFooter({ text: `تم ${isAccept ? 'القبول' : 'الرفض'} بواسطة ${interaction.user.tag}` });
				
				await interaction.update({ embeds: [embed], components: [] });
			}
		}

		
		if (interaction.isModalSubmit()) {
			if (interaction.customId === 'modal-apply') {
				const name = interaction.fields.getTextInputValue('apply-name');
				const age = interaction.fields.getTextInputValue('apply-age');
				const exp = interaction.fields.getTextInputValue('apply-exp');

				const logChannelId = config.applicationLogChannelId;
				if (!logChannelId) {
					return interaction.reply({ content: 'لم يتم إعداد روم التقديمات! استخدم العرض لاحقاً.', ephemeral: true });
				}

				const logChannel = interaction.guild.channels.cache.get(logChannelId);
				if (!logChannel) {
					return interaction.reply({ content: 'الروم غير موجود.', ephemeral: true });
				}

				const embed = new EmbedBuilder()
					.setColor(0xf1c40f)
					.setTitle(`تقديم جديد من ${interaction.user.tag}`)
					.addFields(
						{ name: 'الاسم', value: name, inline: true },
						{ name: 'العمر', value: age, inline: true },
						{ name: 'الخبرة', value: exp },
						{ name: 'حساب ديسكورد', value: `${interaction.user} (\`${interaction.user.id}\`)` }
					)
					.setTimestamp();

				const row = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId(`apply-accept_${interaction.user.id}`)
							.setLabel('✅ قبول')
							.setStyle(ButtonStyle.Success),
						new ButtonBuilder()
							.setCustomId(`apply-reject_${interaction.user.id}`)
							.setLabel('❌ رفض')
							.setStyle(ButtonStyle.Danger)
					);

				await logChannel.send({ embeds: [embed], components: [row] });
				await interaction.reply({ content: 'تم إرسال تقديمك بنجاح! سيتم إشعارك بالقرار.', ephemeral: true });
			}
			
			
			if (interaction.customId === 'modal_tempvc_rename') {
				const newName = interaction.fields.getTextInputValue('tempvc_newname');
				const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
				const channel = member?.voice?.channel;
				if (!channel) return interaction.reply({ content: '❌ ادخل الروم الصوتي الذي تريد تغيير اسمه أولاً.', ephemeral: true });
				if (!member.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels)) {
					return interaction.reply({ content: '❌ ليس لديك صلاحية التحكم بهذا الروم الصوتي.', ephemeral: true });
				}
				
				await interaction.deferReply({ ephemeral: true });

				try {
					await channel.setName(newName);
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0x2ecc71).addTextDisplayComponents(t => t.setContent(`✅ تم تغيير اسم الروم إلى **${newName}**.`))],
						flags: MessageFlags.IsComponentsV2
					});
				} catch (err) {
					console.error('Rename VC Error', err);
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`❌ حدث خطأ، ديلي الليمت الخاص بتغيير الأسماء (مرتين كل 10 دقائق).`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
			}
		}

		
		if (interaction.isButton() && interaction.customId.startsWith('tempvc_')) {
			const action = interaction.customId;
			
			
			if (action !== 'tempvc_rename') {
				await interaction.deferReply({ ephemeral: true });
			}

			const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
			const channel = member?.voice?.channel;
			if (!channel) {
				const payload = { content: '❌ ادخل الروم الصوتي الذي تريد التحكم فيه أولاً.', ephemeral: true };
				return action === 'tempvc_rename' ? interaction.reply(payload) : interaction.editReply(payload);
			}
			
			if (!member.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels)) {
				if (action === 'tempvc_rename') {
					return interaction.reply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`❌ ليس لديك صلاحية للتحكم بهذا الروم.`))],
						flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
					});
				} else {
					return interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`❌ ليس لديك صلاحية للتحكم بهذا الروم.`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
			}

			try {
				if (action === 'tempvc_lock') {
					await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { Connect: false });
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`🔒 تم قفل الروم للمشتركين.`))],
						flags: MessageFlags.IsComponentsV2
					});
				} 
				else if (action === 'tempvc_unlock') {
					await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { Connect: null });
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0x2ecc71).addTextDisplayComponents(t => t.setContent(`🔓 تم فتح الروم للجميع.`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
				else if (action === 'tempvc_hide') {
					await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { ViewChannel: false });
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0x95a5a6).addTextDisplayComponents(t => t.setContent(`🙈 تم إخفاء الروم.`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
				else if (action === 'tempvc_show') {
					await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { ViewChannel: null });
					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0x3498db).addTextDisplayComponents(t => t.setContent(`👁️ أصبح الروم مرئياً.`))],
						flags: MessageFlags.IsComponentsV2
					});
				}
				else if (action === 'tempvc_rename') {
					const modal = new ModalBuilder()
						.setCustomId('modal_tempvc_rename')
						.setTitle('تغيير اسم الروم');

					const nameInput = new TextInputBuilder()
						.setCustomId('tempvc_newname')
						.setLabel('الاسم الجديد')
						.setStyle(TextInputStyle.Short)
						.setRequired(true)
						.setMaxLength(32);

					modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
					return interaction.showModal(modal); 
				}
			} catch (err) {
				console.error('Temp VC Control Error', err);
				await interaction.editReply({
					components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`❌ حدث خطأ، يرجى التأكد من صلاحيات البوت.`))],
					flags: MessageFlags.IsComponentsV2
				});
			}
		}

		
		if (interaction.isUserSelectMenu()) {
			if (interaction.customId === 'tempvc_whitelist') {
				await interaction.deferReply({ ephemeral: true });
				const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
				const channel = member?.voice?.channel;
				if (!channel) return interaction.editReply({ content: '❌ ادخل الروم الصوتي الذي تريد التحكم فيه أولاً.' });
				
				if (!member.permissionsIn(channel).has(PermissionFlagsBits.ManageChannels)) {
					return interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0xe74c3c).addTextDisplayComponents(t => t.setContent(`❌ ليس لديك صلاحية للتحكم بهذا الروم.`))],
						flags: MessageFlags.IsComponentsV2
					});
				}

				try {
					const users = [...interaction.users.values()];
					for (const user of users) {
						await channel.permissionOverwrites.create(user.id, {
							Connect: true,
							ViewChannel: true
						});
					}

					await interaction.editReply({
						components: [new ContainerBuilder().setAccentColor(0x2ecc71).addTextDisplayComponents(t => t.setContent(`✅ تم إضافة **${users.length}** أشخاص بنجاح ليتمكنوا من دخول الروم.`))],
						flags: MessageFlags.IsComponentsV2
					});
				} catch (err) {
					console.error('Whitelist Error', err);
					await interaction.editReply({ content: '❌ خطأ أثناء إضافة الأشخاص.' });
				}
			}
		}

		
		if (interaction.isStringSelectMenu()) {
			if (interaction.customId === 'color-role-select') {
				const liveConfig = JSON.parse(require('node:fs').readFileSync(require('node:path').join(__dirname, '../../config.json'), 'utf8'));
				const configured = liveConfig.colorRoles || [];
				const chosenId = interaction.values[0];
				const chosen = configured.find(x => x.roleId === chosenId);
				const member = await interaction.guild.members.fetch(interaction.user.id);
				if (!chosen || !interaction.guild.roles.cache.has(chosenId)) return interaction.reply({ content: 'هذا اللون لم يعد متاحًا. أبلغ الإدارة.', ephemeral: true });
				try {
					for (const item of configured) if (item.roleId !== chosenId && member.roles.cache.has(item.roleId)) await member.roles.remove(item.roleId, 'تغيير لون الاسم');
					if (!member.roles.cache.has(chosenId)) await member.roles.add(chosenId, 'اختيار لون الاسم');
					return interaction.reply({ content: `🎨 تم اختيار لون **${chosen.name}** بنجاح!`, ephemeral: true });
				} catch (e) { return interaction.reply({ content: 'تعذر تغيير اللون. تأكد أن رتبة البوت أعلى من رتب الألوان وأن لديه صلاحية إدارة الرتب.', ephemeral: true }); }
			}
			if (interaction.customId === 'help-menu') {
				const value = interaction.values[0];
				
				
				const commands = interaction.client.commands;
				const uniqueCommands = new Map();
				commands.forEach(cmd => { if (!uniqueCommands.has(cmd.name)) uniqueCommands.set(cmd.name, cmd); });

				const categories = {
					cat_moderation: { title: '🛡️ الإدارة', cmds: ['mute', 'unmute', 'ban', 'kick', 'timeout', 'jail', 'unjail', 'warn', 'warnings', 'clearwarns', 'role', 'nickname'] },
					cat_channels: { title: '📝 الرومات', cmds: ['open', 'hide', 'unhide', 'close', 'lock', 'unlock', 'slowmode', 'purge', 'nuke', 'autoline', 'line', 'join', 'leave'] },
					cat_info: { title: 'ℹ️ المعلومات', cmds: ['userinfo', 'serverinfo', 'avatar', 'banner', 'help'] },
					cat_interaction: { title: '🎭 التفاعل مع البوت', cmds: ['say', 'embed', 'announce', 'poll', 'copy'] },
					cat_protection: { title: '🔐 الحماية', cmds: ['antiraid', 'antispam', 'antilink'] },
					cat_giveaway: { title: '🎁 القيف أواي', cmds: ['giveaway', 'gend', 'greroll'] },
					cat_levelstats: { title: '📈 التلفيل والإحصائيات', cmds: ['rank', 'leaderboard', 'setlevelrole', 'setupstats'] },
					cat_tickets: { title: '🎫 التيكت والتقديمات', cmds: ['ticket-setup', 'ticket-close', 'ticket-add', 'apply-setup'] },
					cat_config: { title: '⚙️ الإعدادات', cmds: ['setlog', 'setwelcome', 'setleave', 'setlevelchannel', 'setsuggestchannel'] },
					cat_systems: { title: '✨ أنظمة إضافية', cmds: ['shortcut', 'backup', 'backups', 'restore', 'colors', 'voicetop', 'voicepanel'] }
				};

				const cat = categories[value];
				if (!cat) return;

				const activeCmds = cat.cmds.filter(n => uniqueCommands.has(n));
				const arabicCommandNames = {
					mute: 'كتم', unmute: 'فك-الكتم', ban: 'حظر', kick: 'طرد', timeout: 'تايم-اوت',
					jail: 'سجن', unjail: 'فك-السجن', warn: 'انذار', warnings: 'الانذارات',
					clearwarns: 'مسح-الانذارات', role: 'رتبة', nickname: 'لقب',
					open: 'فتح', hide: 'اخفاء', unhide: 'اظهار', close: 'اغلاق', lock: 'قفل',
					unlock: 'فتح-القفل', slowmode: 'بطء', purge: 'مسح', nuke: 'مسح-شامل',
					autoline: 'خط-تلقائي', line: 'خط', join: 'دخول-صوتي', leave: 'خروج-صوتي',
					userinfo: 'معلومات-العضو', serverinfo: 'معلومات-السيرفر', avatar: 'صورة',
					banner: 'بانر', help: 'help', say: 'قل', embed: 'امبد', announce: 'اعلان',
					poll: 'تصويت', copy: 'نسخ-ايموجي', antiraid: 'حماية-الريد',
					antispam: 'منع-السبام', antilink: 'منع-الروابط', giveaway: 'سحب',
					gend: 'انهاء-السحب', greroll: 'اعادة-السحب', rank: 'مستوى',
					leaderboard: 'المتصدرين', setlevelrole: 'ضبط-رتبة-المستوى',
					setupstats: 'اعداد-الاحصائيات', 'ticket-setup': 'اعداد-التيكت',
					'ticket-close': 'اغلاق-التيكت', 'ticket-add': 'اضافة-للتيكت',
					'apply-setup': 'اعداد-التقديم', setlog: 'ضبط-اللوق',
					setwelcome: 'ضبط-الترحيب', setleave: 'ضبط-الوداع',
					setlevelchannel: 'ضبط-روم-المستويات', setsuggestchannel: 'ضبط-روم-الاقتراحات', shortcut: 'اختصار', backup: 'نسخ-احتياطي', backups: 'النسخ-الاحتياطية', restore: 'استرجاع-النسخة', colors: 'الألوان', voicetop: 'توب-الفويس', voicepanel: 'لوحة-الفويس'
				};

				const listText = activeCmds.map(n => {
					const cmd = uniqueCommands.get(n);
					const shownName = arabicCommandNames[cmd.name] || cmd.name;
					return `\`+${shownName}\` — ${cmd.description}`;
				}).join('\n');

				const row = interaction.message.components[1]; 

				await interaction.update({
					components: [
						new ContainerBuilder()
							.setAccentColor(0x5865F2)
							.addTextDisplayComponents(t => t.setContent(`## ${cat.title}`))
							.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
							.addTextDisplayComponents(t => t.setContent(listText)),
						row
					],
					flags: MessageFlags.IsComponentsV2
				});
			}
		}


async function executeSlashCommand(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return interaction.reply({ content: 'هذا الأمر غير متاح حاليًا.', ephemeral: true });
  const freeText = interaction.options.getString('args') || '';
  const targetUser = interaction.options.getUser('target');
  const targetRole = interaction.options.getRole('role');
  const targetChannel = interaction.options.getChannel('channel');
  const guild = interaction.guild;
  if (!guild) return interaction.reply({ content: 'هذا الأمر يعمل داخل السيرفر فقط.', ephemeral: true });
  const member = await guild.members.fetch(interaction.user.id).catch(() => null);
  const targetMember = targetUser ? await guild.members.fetch(targetUser.id).catch(() => null) : null;
  const args = [...(targetUser ? [`<@${targetUser.id}>`] : []), ...freeText.trim().split(/\s+/).filter(Boolean)];
  const mentionList = values => ({ first: () => values[0] || null, get: id => values.find(v => v.id === id) || null, values: () => values.values(), size: values.length });
  const users = mentionList(targetUser ? [targetUser] : []);
  const members = mentionList(targetMember ? [targetMember] : []);
  const roles = mentionList(targetRole ? [targetRole] : []);
  const channels = mentionList(targetChannel ? [targetChannel] : []);
  const message = {
    client: interaction.client, guild, channel: interaction.channel, author: interaction.user, member,
    content: `+${interaction.commandName}${targetUser ? ` <@${targetUser.id}>` : ''}${targetRole ? ` <@&${targetRole.id}>` : ''}${targetChannel ? ` <#${targetChannel.id}>` : ''}${freeText ? ` ${freeText}` : ''}`,
    mentions: { users, members, roles, channels },
    reply: async payload => interaction.replied || interaction.deferred ? interaction.followUp(payload) : interaction.reply(payload),
    delete: async () => { if (interaction.message) return interaction.message.delete(); },
    react: async emoji => { if (interaction.message) return interaction.message.react(emoji); },
    createdTimestamp: Date.now(),
  };
  try {
    await command.execute(message, args);
    if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: 'تم تنفيذ الأمر.', ephemeral: true });
  } catch (error) {
    console.error(`[Slash Command] ${interaction.commandName}:`, error);
    if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: 'حدث خطأ أثناء تنفيذ الأمر. راجع سجل الاستضافة.', ephemeral: true }).catch(() => {});
    else await interaction.followUp({ content: 'حدث خطأ أثناء تنفيذ الأمر.', ephemeral: true }).catch(() => {});
  }
}
	},
};
