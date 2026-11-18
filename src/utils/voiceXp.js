const fs = require('node:fs'); const path = require('node:path');
const FILE = path.join(__dirname, '..', '..', 'data', 'voice-xp.json');
function load() { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; } }
function save(d) { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }
function add(guildId, userId, minutes, perMinute = 10) { const d = load(); const key = `${guildId}_${userId}`; d[key] ||= { xp: 0, minutes: 0 }; d[key].xp += Math.max(0, minutes) * perMinute; d[key].minutes += Math.max(0, minutes); save(d); return d[key]; }
function top(guildId, limit = 10) { const d = load(); return Object.entries(d).filter(([k]) => k.startsWith(`${guildId}_`)).map(([k,v]) => ({ userId:k.slice(guildId.length+1), ...v })).sort((a,b)=>b.xp-a.xp).slice(0,limit); }
module.exports = { add, top };
