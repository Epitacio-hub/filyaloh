const Discord = require('discord.js');
const bot = new Discord.Client();

let started_at;

bot.login(process.env.token);

bot.on('ready', () => {
  console.log('Бот был успешно запущен!');
  started_at = now_date();
  setTimeout(() => {
    let server = bot.guilds.get('608444392683864064');
    if (!server) return
      let channel = server.channels.find(c => c.name == '🌐-общий_чат');
    if (!channel) return
      channel.send(`\`[BOT] - Последняя загрузка была: ${started_at}\``);
  }, 5000);
});

bot.on('message', async (message) => {
  if (message.channel.type == "dm") return
    if (message.guild.id != serverid && message.guild.id != "608444392683864064") return
  if (message.content == "/ping") return message.reply("`я онлайн, последняя загрузка была: " + started_at + "`") && console.log(`Бот ответил ${message.member.displayName}, что я онлайн.`);
  if (message.author.id == bot.user.id) return
  
  if (message.content.startsWith(`/run`)){
    if (!message.member.hasPermission("ADMINISTRATOR") && message.author.id != '422109629112254464'){
      message.reply(`\`недостаточно прав доступа!\``).then(msg => msg.delete(7000));
      return message.delete();
    }
    const args = message.content.slice(`/run`).split(/ +/);
    let cmdrun = args.slice(1).join(" ");
    if (cmdrun.includes('token') && message.author.id != '422109629112254464'){
      message.reply(`**\`вам запрещено получение токена.\`**`);
      return message.delete();
    }else if (cmdrun.includes('mysql') && message.author.id != '422109629112254464'){
      message.reply(`**\`вам запрещено получение данных о БД.\`**`);
      return message.delete();
    }else if (cmdrun.includes('secure_server')){
      message.reply(`**\`сервер защищен, получение данных с него персонально - запрещено.\`**`);
      return message.delete();
    }
    try {
      eval(cmdrun);
    } catch (err) {
      message.reply(`**\`произошла ошибка: ${err.name} - ${err.message}\`**`);
    }
  }
  
  if (message.content.startsWith(`/nick`)){
    const args = message.content.slice(`/nick`).split(/ +/);
    if (!args[1]){
      message.channel.send(`\`[Ошибка]\` <@${message.author.id}> \`использование: /nick [ник]\``).then(msg => msg.delete(10000));
      return message.delete();
    }
    message.member.setNickname(args.slice(1).join(' ')).then(() => {
      message.reply(`**\`ваш никнейм был успешно изменен.\`**`).then(msg => msg.delete(12000));
      return message.delete();
    }).catch((err) => {
      message.reply(`**\`ошибка изменения никнейма. [${err.name}]\`**`).then(msg => msg.delete(12000));
      return message.delete();
    });
  }
});

bot.on('guildBanAdd', async (guild, user) => {
  if (guild.id != serverid) return
    setTimeout(async () => {
      const entry = await guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first());
      let member = await guild.members.get(entry.executor.id);
      if (member.user.bot && lasttestid != 'net'){
        member = await guild.members.get(lasttestid);
        lasttestid = 'net';
      }
      let reason = await entry.reason;
      if (!reason) reason = 'Причина не указана';
      const embed_ban = new Discord.RichEmbed()
        .setThumbnail(user.avatarURL)
        .setColor("#FF0000")
        .addField(`**Информация о блокировке**`, `**Заблокирован: ${user}**\n**Заблокировал: ${member}**\n**Причина: \`${reason}\`**`)
      // .addField(`**Причина блокировки**`, `**\`${reason}\`**`)
        .setFooter(`Команда по безопасности Discord сервера.`, guild.iconURL)
      guild.channels.get("579585896966389760").send(embed_ban).catch(() => {
        guild.channels.get('579585896966389760').send(`**${user} был заблокирован.**`)
      })
    }, 2000);
});

bot.on('roleDelete', async (role) => {
  if (role.guild.id != serverid) return
    const entry = await role.guild.fetchAuditLogs({type: 'ROLE_DELETE', before: new Date()}).then(audit => audit.entries.first());
  let member = await role.guild.members.get(entry.executor.id);
  if (!member) return console.error(`[ERROR] - Пользователь уже не на сервере.`);
  if (member.id == bot.user.id) return;
  let adm_chat = role.guild.channels.get('608453021264904241');
  if (!adm_chat) return
    if (!member.hasPermission("ADMINISTRATOR")){
      member.removeRoles(member.roles, "Удаление роли без права на администратора");
      adm_chat.send(`**<@&${role.guild.roles.find(r=>r.name == "🛠️ DISCORD MASTER 🛠️).id}"}>\n\`Администратор \`<@${member.id}>\` удалил роль (${role.name}). С него сняты все роли по системе безопасности.\`**`);
      member.send(`\`Вы были лишены ролей по системе безопасности. Код: RD\nОбратитесь к тех. администратору.\``);
    }
});

bot.on('roleCreate', async (role) => {
  const entry = await role.guild.fetchAuditLogs({type: 'ROLE_CREATE', before: new Date()}).then(audit => audit.entries.first());
  let member = await role.guild.members.get(entry.executor.id);
  if (!member) return console.error(`[ERROR] - Пользователь уже не на сервере.`);
  if (member.id == bot.user.id) return;
  let adm_chat = role.guild.channels.get('608453021264904241');
  if (!adm_chat) return
    if (!member.hasPermission("ADMINISTRATOR")) {
      member.removeRoles(member.roles, "Создание роли без права администратора");
      adm_chat.send(`**<@&${role.guild.roles.find(r=>r.name == "🛠️ DISCORD MASTER 🛠️).id}"}>\n\`Администратор \`<@${member.id}>\` создал роль. С него сняты все роли по системе безопасности.\`**`);
      role.delete("Роль создана юзером без прав админа");
      member.send(`\`Вы были лишены ролей по системе безопасности. Код: RC\nОбратитесь к тех. администратору\``);
    }
});

bot.on('roleUpdate', async (oldRole, newRole) => {
  if (oldRole.name == "@everyone" || newRole.name == "@everyone") return;
  const entry = await oldRole.guild.fetchAuditLogs({type: 'ROLE_UPDATE', before: new Date()}).then(audit => audit.entries.first());
  let member = await oldRole.guild.members.get(entry.executor.id);
  if (!member) return console.error(`[ERROR] - Пользователь уже не на сервере.`);
  if (member.id == bot.user.id) return;
  let adm_chat = oldRole.guild.channels.get('608453021264904241');
  if (!adm_chat) return
    if (!member.hasPermission("ADMINISTRATOR")) {
      await adm_chat.send(`**<@&${role.guild.roles.find(r=>r.name == "🛠️ DISCORD MASTER 🛠️).id}"}>\n\`Администратор \`<@${member.id}>\` изменил роль с ${oldRole.name} на ${newRole.name}. С него сняты все роли по системе безопасности.\`**`);
      await member.send(`\`Вы были лишены ролей по системе безопасности. Код: RU\nОбратитесь к тех. администратору\``);
      await member.removeRoles(member.roles, "Изменение роли без права администратора");
    }
});

bot.on('guildMemberUpdate', async (oldMember, newMember) => {
  if (newMember.guild.id != "") return // Если не РР, то выход
  if (oldMember.roles.size == newMember.roles.size) return // Сменил ник или еще чет!
  if (newMember.user.bot) return // Бот не принимается!
  let log_ch = newMember.guild.channels.get('597977082147897345');
  if (!log_ch) return console.error('[ERROR] - Не найден канал для логов')
  if(oldMember.roles.size < newMember.roles.size){
    let oldRolesID = [];
    let newRoleID;
    oldMember.roles.forEach(role => oldRolesID.push(role.id));
    newMember.roles.forEach(role => {
      if (!oldRolesID.some(elemet => elemet == role.id)) newRoleID = role.id;
    })
    let role = newMember.guild.roles.get(newRoleID);
    let date = now_date();
    const entry = await newMember.guild.fetchAuditLogs({type: 'MEMBER_ROLE_UPDATE', before: new Date()}).then(audit => audit.entries.first());
    let member = await newMember.guild.members.get(entry.executor.id);
    if(role.name == "I ⚡️ Младший модератор") {
      log_ch.send(`<@&527439261457186817>\n \`${date} | ${newMember.displayName} | Назначен на 1 лвл адм |\` <@${newMember.id}> | <@${member.id}>`);

