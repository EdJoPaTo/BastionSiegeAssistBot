/* eslint no-irregular-whitespace: 0 */

module.exports = [
  {
    type: 'alliance-battlereport',
    information: {battlereport: {
      won: true,
      attack: true,
      enemies: [
        'Алишер', 'Cuclas', 'TheBestOne', 'crovax', 'Majesty', 'kjalarr', 'Красный кхмер', 'Тим и Брим', 'Лучик'
      ],
      friends: [
        'Оптимус Лис', 'Лисий Бот', 'Горбачев', 'Лисьи усы', 'smol fox', 'в', 'Лисий твинк', 'Number of the beast', 'Эмульгатор соевый', 'Лисья внезапность', 'Лисий нoсик', 'Andrey Brasco', 'Глютен'
      ],
      soldiersTotal: 26000,
      soldiersAlive: 20019,
      terra: 205117,
      karma: 5,
      reward: 6685041
    }},
    text: `‼️Битва с альянсом [⛱​]Umbrella Corporation окончена. Поздравляю, Лисий твинк! Твой альянс одержал победу. Победители 20019⚔ из 26000⚔ гордо возвращаются домой. Твоя награда составила 6685041💰, a 205117🗺 отошли к твоим владениям. Твоя карма изменилась на 5☯.
Победители: Оптимус Лис, Лисий Бот, Горбачев, Лисьи усы, smol fox, в, Лисий твинк, Number of the beast, Эмульгатор соевый, Лисья внезапность, Лисий нoсик, Andrey Brasco, Глютен
Проигравшие: Алишер, Cuclas, TheBestOne, crovax, Majesty, kjalarr, Красный кхмер, Тим и Брим, Лучик`
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: false,
      attack: false,
      enemies: [
        'Союз-IlIIlIlIlI'
      ],
      friends: [
        'в'
      ],
      soldiersTotal: 13567,
      soldiersAlive: 0,
      terra: -12672,
      reward: -9544261
    }},
    text: '‼️Битва с [🚀]Союз-IlIIlIlIlI окончена. К сожалению, в, твоя армия потерпела поражение. Никто из 13567⚔ не вернулся с поля боя... Твоя казна опустела на 9544261💰, a 12672🗺 отошли [🚀]Союз-IlIIlIlIlI.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: true,
      enemies: [
        'Херзерберг'
      ],
      friends: [
        'в'
      ],
      soldiersTotal: 10780,
      soldiersAlive: 10780,
      terra: 48,
      karma: 1,
      reward: 812679
    }},
    text: '‼️Битва с [🦋]Херзерберг окончена. Поздравляю, в! Твоя армия одержала победу. Победители 10780⚔ без единой потери гордо возвращаются домой. Твоя награда составила 812679💰, a 48🗺 отошли к твоим владениям. Твоя карма изменилась на 1☯.'
  }, {
    type: 'attackincoming',
    information: {attackincoming: {
      player: 'Союз-IlIIlIlIlI'
    }},
    text: '‼️Твои владения атакованы! [🚀]Союз-IlIIlIlIlI подступает к границе! Вся твоя ⚔Армия будет отправлена на защиту!'
  }, {
    type: 'workshop',
    information: {workshop: {
      trebuchet: 21,
      ballista: 30
    }},
    text: `Мастерская

⚔Требушет 21​✅   3/5👥
⚔Баллиста 30​✅   7/7👥`
  }, {
    type: 'trebuchet',
    text: `⚔Требушет

  Уровень           21
  Рабочие         3/5👥

  Отправить      1💰/1👥

  Нападение       +10⚔
  Атака           420⚔

  Золото    220631762💰
  Жители        19680👥

  Улучшить
            2024000💰​✅
             253000🌲​✅
              75900⛏​✅`
  }, {
    type: 'resources',
    information: {resources: {
      gold: 107739860,
      wood: 828650,
      stone: 828650,
      food: 48506250
    }},
    text: `Ресурсы
Кристаллы         11💎
Золото     107739860💰
Дерево        828650🌲
Камень        828650⛏
Еда         48506250🍖`
  }, {
    type: 'attackscout',
    information: {attackscout: {
      player: 'Terrorchik',
      karma: 3,
      terra: 10815
    }},
    text: 'Разведчики докладывают, что неподалеку расположился Terrorchik в своих владениях Sklep размером 10815🗺. За победу ты получишь 3☯.'
  }, {
    type: 'storage',
    information: {resources: {
      wood: 833060,
      stone: 47835650,
      food: 48483094,
      gold: 17610076
    }},
    text: `🏚Склад

Уровень          976
Рабочие   9600/9760👥

Ресурсы
    833060/48604800🌲
  47835650/48604800⛏
  48483094/48604800🍖

Отправить      1💰/1👥

Золото     17610076💰
Жители        11568👥

Заполнить  97325192💰

Улучшить
         95550600💰⛔️
         47775300🌲⛔️
         47775300⛏​✅`
  }, {
    type: 'buildings',
    information: {buildings: {
      townhall: 695,
      storage: 976,
      houses: 984,
      farm: 100,
      sawmill: 63,
      mine: 100,
      barracks: 375,
      wall: 111
    }},
    text: `Постройки

🏤   695⛔️
🏚   976⛔️ 9600/9760👥
🏘   984⛔️17472/19680👥
🌻   100​✅ 1000/1000👥
🌲    63​✅   630/630👥
⛏   100​✅ 1000/1000👥
🛡   375⛔️15000/15000⚔
🏰   111⛔️    0/1110🏹

Что будем строить?`
  }, {
    type: 'main',
    information: {resources: {
      gold: 26151498,
      wood: 838100,
      stone: 47843650,
      food: 48427110
    }},
    text: `🛡[🐱]not used name
Stalker

Статус       Посёлок🏘
Территория      8185🗺

Сезон          Весна🌸
Погода      Солнечно☀️
Время       18:49:38🕓

Жители         19440👥
Армия          15000⚔
Кристаллы         11💎
Золото      26151498💰
Дерево        838100🌲
Камень      47843650⛏
Еда         48427110🍖`
  }, {
    type: 'patrolreport',
    text: `⚔ Завязалась кровавая битва. В воздухе стоял запах крови, а земля окрасилась в багровый цвет. К рассвету, твоим воинам удалось одержать победу, однако потери среди солдат были не малы. Домой вернулись 57⚔. Измученные и израненные они смогли унести лишь часть богатств разбойников. Твоя казна пополнилась на 36130💰.
Для 57⚔ из 57⚔ не нашлось мест в 🛡Казармах и их пришлось распустить. Они пополнят ряды свободных 👥Жителей.
57⚔ из 57⚔ уволенных солдат не нашли себе жилых мест в твоих владениях. Все они были вынуждены безмолвно уйти в закат...`
  }
]
  .map(o => ({...o, lang: 'ru'}))