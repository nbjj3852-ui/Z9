const { Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../../config.json');
const jailStore = require('../utils/jail');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log('             🤖 EnzoBot v2          ');
		console.log(` ✅ Online as: ${client.user.tag.padEnd(20)}`);
		console.log(` 📡 Servers: ${String(client.guilds.cache.size).padEnd(23)}`);
		console.log(` 📝 Commands: ${String(client.commands.size).padEnd(22)}`);

		client.user.setActivity('🔧 Z9 System | +help');

		// Check timed jail expirations and restore saved roles.
		const releaseExpiredJails = async () => {
			const data = jailStore.load();
			let changed = false;
			for (const [key, record] of Object.entries(data)) {
				if (!record.expiresAt || record.expiresAt > Date.now()) continue;
				try {
					const guild = client.guilds.cache.get(record.guildId);
					if (!guild) continue;
					const member = await guild.members.fetch(record.userId).catch(() => null);
					if (member) await jailStore.restoreMember(member, record, config.jailRoleId);
					delete data[key]; changed = true;
					if (config.jailChannelId) { const ch = guild.channels.cache.get(config.jailChannelId); if (ch) await ch.send(`🔓 انتهت مدة سجن <@${record.userId}> وتمت استعادة رتبته.`).catch(() => {}); }
				} catch (e) { console.error('[Timed Jail]', e.message); }
			}
			if (changed) jailStore.save(data);
		};
		releaseExpiredJails().catch(console.error);
		setInterval(() => releaseExpiredJails().catch(console.error), 15000).unref();

		
		try {
			require('../dashboard/server.js')(client);
		} catch (err) {
			console.error('[Dashboard] Error starting web dashboard:', err);
		}
	},
};
