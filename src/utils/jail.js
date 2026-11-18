const fs = require('node:fs');
const path = require('node:path');
const FILE = path.join(__dirname, '..', '..', 'data', 'jails.json');
function load() { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; } }
function save(data) { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(data, null, 2)); }
function parseDuration(input) {
  if (!input) return null;
  const m = String(input).match(/^(\d+)(s|m|h|d|w)$/i);
  if (!m) return undefined;
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 }[m[2].toLowerCase()];
  const ms = Number(m[1]) * unit;
  return ms > 0 && ms <= 365 * 86400000 ? ms : undefined;
}
async function restoreMember(member, record, jailRoleId) {
  if (jailRoleId && member.roles.cache.has(jailRoleId)) await member.roles.remove(jailRoleId, 'انتهاء/فك السجن');
  const roleIds = (record?.roles || []).filter(id => member.guild.roles.cache.has(id) && id !== member.guild.id);
  if (roleIds.length) await member.roles.add(roleIds, 'استرجاع الرتب السابقة بعد السجن');
}
module.exports = { load, save, parseDuration, restoreMember };
