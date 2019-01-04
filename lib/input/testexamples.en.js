/* eslint no-irregular-whitespace: 0 */

module.exports = [
  {
    type: 'main',
    information: {
      player: {
        bonus: undefined,
        achievements: undefined,
        alliance: '🐱',
        name: 'not used name'
      },
      resources: {
        gold: 2768991,
        wood: 8065450,
        stone: 11765450,
        food: 11434985
      }
    },
    text: `[🐱]not used name
Stalker

Status            City
Territory      29761🗺

Season        Summer🍃
Weather        Storm⛈
Time        14:22:03🕓

People          9680👥
Army            5000⚔️
Gold         2768991💰
Wood         8065450🌲
Stone       11765450⛏
Food        11434985🍖`
  }, {
    type: 'buildings',
    information: {buildings: {
      townhall: 342,
      storage: 476,
      houses: 484,
      farm: 100,
      sawmill: 63,
      mine: 63,
      barracks: 125,
      wall: 80
    }},
    text: `Buildings

🏤   342⛔️
🏚   476⛔️ 4760/4760👥
🏘   484⛔️ 9680/9680👥
🌻   100​✅ 1000/1000👥
🌲    63​✅   630/630👥
⛏    63​✅   630/630👥
🛡   125⛔️ 5000/5000⚔️
🏰    80⛔️   800/800🏹

What will we build?`
  }, {
    type: 'storage',
    information: {resources: {
      gold: 3439446,
      wood: 11578680,
      stone: 11778680,
      food: 11349345
    }},
    text: `🏚Storage

Level            476
Workers   4760/4760👥

Resources
  11578680/11804800🌲
  11778680/11804800⛏
  11349345/11804800🍖

Hire           1💰/1👥

Gold        3439446💰
People         9680👥

Fill        1415390💰

Upgrade
         22800600💰⛔️
         11400300🌲​✅
         11400300⛏​✅`
  }, {
    type: 'workshop',
    information: {workshop: {
      trebuchet: 21,
      ballista: undefined
    }},
    text: `Workshop

⚔Trebuchet 21⛔️   5/5👥`
  }, {
    type: 'workshop',
    information: {workshop: {
      trebuchet: 21,
      ballista: 1
    }},
    text: `Workshop

⚔Trebuchet 21​✅   5/5👥
⚔Ballista   1​✅   1/1👥`
  }, {
    type: 'resources',
    information: {resources: {
      gold: 2768991,
      wood: 8065450,
      stone: 11765450,
      food: 11434985
    }},
    text: `Resources
Gold         2768991💰
Wood         8065450🌲
Stone       11765450⛏
Food        11434985🍖`
  }, {
    type: 'trebuchet',
    text: `⚔️Trebuchet

Level             21
Workers         5/5👥

Hire           1💰/1👥

Atk. bonus      +10⚔️
Attack          420⚔️

Gold        3102582💰
People         9680👥

Upgrade
          2024000💰​✅
           253000🌲​✅
            75900⛏​✅`
  }, {
    type: 'resources',
    information: {resources: {
      gold: 135551,
      wood: 11900,
      stone: 6711900,
      food: 11761385
    }},
    text: `Resources
Gold          135551💰
Wood           11900🌲
Stone        6711900⛏
Food        11761385🍖

Buy
Wood       200💰/100🌲
Stone      200💰/100⛏
Food       200💰/100🍖


500000⛏ delivered to 🏚Storage`
  }, {
    type: 'effects',
    information: {effects: [
      {
        emoji: '🛡',
        name: 'Immunity from attacks',
        minutesRemaining: 28
      }, {
        emoji: '🤵🏻',
        name: 'Steward',
        timestamp: 1546046050
      }, {
        emoji: '⚔️',
        name: '⚔️Holy blades',
        timestamp: 1545209005
      }, {
        emoji: '🔥️',
        name: '🔥️Inquisition fires',
        timestamp: 1545208996
      }, {
        emoji: '🎯',
        name: '🎯Accurate calculation',
        timestamp: 1545366639
      }
    ]},
    text: `🛡 - Immunity from attacks. Opponents will not be able to find you in the search. Will continue: 28 min.
🤵🏻 - Steward. He will help you quickly acquire the missing resources to upgrade the buildings with enough gold. Just press ⚒Upgrade. Also, the 🤵🏻Steward can equip your barracks or the walls with just one command. It is enough to press the Fill button in the corresponding building. 🤵🏻Steward will stand side by side, holding the lamp, while you get the gems, which will give +5% to success. Will last until: 2018-12-29 01:14:10 +0000 UTC
⚔️ - ⚔️Holy blades. Adds +100 to the win chance in the battle with undead army. Will last until: 2018-12-19 08:43:25 +0000 UTC
🔥️ - 🔥️Inquisition fires. Reduces the duration of the 💀Plague effect by half and prevents the appearance of the latter. You can buy several times. Will last until: 2018-12-19 08:43:16 +0000 UTC
🎯 - 🎯Accurate calculation. Adds +100 to accuracy in the battle with the 🐲Dragon. Will last until: 2018-12-21 04:30:39 +0000 UTC`
  }, {
    type: 'effects',
    information: {effects: [
      {
        emoji: '🏰',
        name: 'Castle'
      }, {
        emoji: '🛡',
        name: 'Immunity from attacks',
        minutesRemaining: 28
      }
    ]},
    text: `🏰 - Castle. The income of gold, resources and population increased on 20%.
🛡 - Immunity from attacks. Opponents will not be able to find you in the search. Will continue: 28 min.`
  }, {
    type: 'war',
    information: {
      domainStats: {
        wins: 4817,
        karma: 5059,
        terra: 23579
      }
    },
    text: `Wins           4817🎖
Gems            112💎
Karma          5059☯
Territory     23579🗺
Time       10:49:14🕓
Weather   Snowstorm🌪

🏰Walls   11300/11300⚒
          1130/1130🏹

⚔Trebuchet    18/18👥

      15000/15000⚔​✅
         21607780🍖​✅`
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: false,
      enemyAlliance: '⚡',
      enemies: [
        'Maximys_dd'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 12000,
      soldiersAlive: 11436,
      reward: 64783
    }},
    text: `‼️The battle with {🎖💎⛏}[⚡]Maximys_dd complete. Congratulations, not used name! Your army won. The winners 11436⚔ of 12000⚔ proudly return home. Your reward is 64783💰.
For 11436⚔ of 11436⚔ not found a place in the 🛡Barracks and had to disband. They join the ranks of 👥People. The next time take care of availability for the winners.
1266⚔ of the 11436⚔ dismissed soldiers did not find myself dwelling places in your domain.`
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: false,
      enemies: [
        'Kkk66'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 9661,
      soldiersAlive: 6218,
      reward: 383274
    }},
    text: `‼️The battle with {🎖}Kkk66 complete. Congratulations, not used name! Your army won. The winners 6218⚔ of 9661⚔ proudly return home. Your reward is 383274💰.
For 6218⚔ of 6218⚔ not found a place in the 🛡Barracks and had to disband. They join the ranks of 👥People. The next time take care of availability for the winners.`
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: false,
      enemyAlliance: '🐺',
      enemies: [
        'Destroyer'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 12000,
      soldiersAlive: 9661,
      reward: 2622665
    }},
    text: '‼️The battle with {🎖}[🐺]Destroyer complete. Congratulations, not used name! Your army won. The winners 9661⚔ of 12000⚔ proudly return home. Your reward is 2622665💰.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: false,
      attack: true,
      enemies: [
        'Bob'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 15000,
      soldiersAlive: 1,
      reward: -4400940
    }},
    text: '‼️The battle with Bob complete. Unfortunately, not used name, your army lose. Only 1⚔ of 15000⚔ returned from the battlefield... You lose 4400940💰.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: false,
      attack: false,
      enemyAlliance: '🐮',
      enemies: [
        'General Balltz'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 38,
      soldiersAlive: 0,
      terra: -102,
      reward: -4400940
    }},
    text: '‼️The battle with {🎖}[🐮]General Balltz complete. Unfortunately, not used name, your army lose. None of the 38⚔ returned from the battlefield... You lose 4400940💰, and 102🗺 joined to {🎖}[🐮]General Balltz.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: false,
      attack: false,
      enemyAlliance: '🌲',
      enemies: [
        'ЭЛИС'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 8212,
      soldiersAlive: 38,
      terra: -106,
      reward: -6094875
    }},
    text: '‼️The battle with {⛏🎖🏰}[🌲]ЭЛИС complete. Unfortunately, not used name, your army lose. Only 38⚔ of 8212⚔ returned from the battlefield... You lose 6094875💰, and 106🗺 joined to {⛏🎖🏰}[🌲]ЭЛИС.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: true,
      enemies: [
        'Jesus_Hrist'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 12000,
      soldiersAlive: 12000,
      karma: 2,
      terra: 59,
      reward: 40380
    }},
    text: '‼️The battle with Jesus_Hrist complete. Congratulations, not used name! Your army won. The winners 12000⚔ without a loss proudly return home. Your reward is 40380💰, and 59🗺 joined to your domain. Your karma has been modified by 2☯.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: true,
      enemies: [
        'Орехи'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 12000,
      soldiersAlive: 11996,
      terra: 87,
      karma: 3,
      reward: 10776
    }},
    text: '‼️The battle with Орехи complete. Congratulations, not used name! Your army won. The winners 11996⚔ of 12000⚔ proudly return home. Your reward is 10776💰, and 87🗺 joined to your domain. Your karma has been modified by 3☯.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: true,
      enemies: [
        'Торпеда'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 11015,
      soldiersAlive: 11015,
      terra: 24,
      karma: 0,
      reward: 3408
    }},
    text: '‼️The battle with Торпеда complete. Congratulations, not used name! Your army won. The winners 11015⚔ without a loss proudly return home. Your reward is 3408💰, and 24🗺 joined to your domain.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: false,
      enemyAlliance: '🌶',
      enemies: [
        'Undeads'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 12000,
      soldiersAlive: 8092,
      reward: 1044287
    }},
    text: '‼️The battle with 😈[🌶]Undeads complete. Congratulations, not used name! Your army won. The winners 8092⚔ of 12000⚔ proudly return home. Your reward is 1044287💰.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: true,
      enemies: [
        'Danijil'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 12000,
      soldiersAlive: 12000,
      karma: 2,
      terra: 85,
      reward: 28603
    }},
    text: `‼️The battle with Danijil complete. Congratulations, not used name! Your army won. The winners 12000⚔ without a loss proudly return home. Your reward is 28603💰, and 85🗺 joined to your domain. Your karma has been modified by 2☯.
For 460⚔ of 12000⚔ not found a place in the 🛡Barracks and had to disband. They join the ranks of 👥People. The next time take care of availability for the winners.
460⚔ of the 460⚔ dismissed soldiers did not find myself dwelling places in your domain.`
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: false,
      attack: false,
      enemyAlliance: '⛱',
      enemies: [
        'Меверик'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 12000,
      soldiersAlive: 0,
      terra: -140,
      reward: -9091973
    }},
    text: '‼️The battle with 🗡[⛱]Меверик complete. Unfortunately, not used name, your army lose. None of the 12000⚔ returned from the battlefield... You lose 9091973💰, and 140🗺 joined to 🗡[⛱]Меверик.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: false,
      attack: false,
      enemyAlliance: '☢',
      enemies: [
        'House Targaryen'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 12000,
      soldiersAlive: 0,
      terra: -150,
      reward: -10760574
    }},
    text: '‼️The battle with 🎃[☢]House Targaryen complete. Unfortunately, not used name, your army lose. None of the 12000⚔ returned from the battlefield... You lose 10760574💰, and 150🗺 joined to 🎃[☢]House Targaryen.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: false,
      attack: false,
      enemyAlliance: '⚡',
      enemies: [
        'Лион ЭльДжонсон', 'tankist', 'Древень', 'Ланселотович', 'Rey De-f', 'Maximys_dd', 'Веледис', 'BepTeJl_Te69'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 12000,
      soldiersAlive: 45,
      terra: -111,
      reward: -11014520
    }},
    text: `‼️The battle with alliance [⚡​]Адептус Астартес complete. Unfortunately, not used name, your army lose. Only 45⚔ of 12000⚔ returned from the battlefield... You lose 11014520💰, and 111🗺 joined to [⚡​]Адептус Астартес.
Winners: Лион ЭльДжонсон, tankist, Древень, Ланселотович, Rey De-f, Maximys_dd, Веледис, BepTeJl_Te69
Losers: not used name
For 45⚔ of 45⚔ not found a place in the 🛡Barracks and had to disband. They join the ranks of 👥People. The next time take care of availability for the winners.`
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: false,
      enemyAlliance: '🐂',
      enemies: ['Vlomissimo', 'AUroom', 'Киллер'],
      friends: ['not used name'],
      soldiersTotal: 10040,
      soldiersAlive: 2163,
      reward: 546724
    }},
    text: `‼️The battle with alliance [🐂​]Buffalo complete. Congratulations, not used name! Your army won. The winners 2163⚔ of 10040⚔ proudly return home. Your reward is 546724💰.
Winners: not used name
Losers: Vlomissimo, AUroom, Киллер
For 2163⚔ of 2163⚔ not found a place in the 🛡Barracks and had to disband. They join the ranks of 👥People. The next time take care of availability for the winners.`
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: false,
      enemyAlliance: '🐺',
      enemies: ['Demonhunter'],
      friends: ['Raphi', 'not used name'],
      soldiersTotal: 10040,
      soldiersAlive: 1079,
      reward: 557368
    }},
    text: `‼️The battle with [🐺]Demonhunter complete. Congratulations, not used name! Your alliance won. The winners 1079⚔ of 10040⚔ proudly return home. Your reward is 557368💰.
Winners: Raphi, not used name
Losers: Demonhunter`
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: false,
      enemyAlliance: '🐺',
      enemies: ['C'],
      friends: ['A', 'B'],
      soldiersTotal: 0,
      soldiersAlive: 0,
      reward: 557368
    }},
    text: `‼️The battle with [🐺]C complete. Congratulations, not used name! Your alliance won. The winners 0⚔ without a loss proudly return home. Your reward is 557368💰.
Winners: A, B
Losers: C`
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: true,
      enemyAlliance: '🥖',
      enemies: ['Батон'],
      friends: ['A', 'B'],
      soldiersTotal: 15000,
      soldiersAlive: 0,
      reward: 6429697,
      karma: 4,
      terra: 2003
    }},
    text: `‼️The battle with {🎖}[🥖]Батон complete. Congratulations, A! Your alliance won. But, unfortunately, each of 15000⚔ gave his life for this victory... Your reward is 6429697💰, and 2003🗺 joined to your domain. Your karma has been modified by 4☯.
Winners: A, B
Losers: Батон`
  }, {
    type: 'patrolreport',
    text: `⚔ The battle was all night. But your warriors lost. The survivors decided to retreat. 317⚔ returned home, but they haven't brought gold.
For 317⚔ of 317⚔ not found a place in the 🛡Barracks and had to disband. They join the ranks of 👥People. The next time take care of availability for the winners.
317⚔ of the 317⚔ dismissed soldiers did not find myself dwelling places in your domain.`
  }, {
    type: 'patrolreport',
    text: `⚔ The battle was all night and your warriors won the battle. But your soldiers suffered heavy losses. 7050⚔ returned home. Your treasury is replenished 18593698💰.
For 7050⚔ of 7050⚔ not found a place in the 🛡Barracks and had to disband. They join the ranks of 👥People. The next time take care of availability for the winners.
7050⚔ of the 7050⚔ dismissed soldiers did not find myself dwelling places in your domain.`
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: false,
      enemies: [
        '🐲Dragon'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 14000,
      soldiersAlive: 14000,
      gems: 2,
      reward: 153884652
    }},
    text: '‼️The battle with 🐲Dragon complete. Congratulations, not used name! Your army won. The winners 14000⚔ without a loss proudly return home. The wounded 🐲Dragon is hiding behind the horizon, dropping jewels worth a 153884652💰 and 2💎.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: false,
      attack: false,
      enemies: [
        '🐲Dragon'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 0,
      soldiersAlive: 0,
      reward: 0
    }},
    text: '‼️The battle with 🐲Dragon complete. Unfortunately, not used name, your army lose. Only 0⚔ of 0⚔ returned from the battlefield... Almost all buildings are covered by fire, and some of the population died. A new effect is obtained: 🔥Flaming city.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: true,
      attack: false,
      enemies: [
        '☠️Undead army'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 12000,
      soldiersAlive: 4943,
      gems: 3,
      reward: 188386727
    }},
    text: '‼️The battle with ☠️Undead army complete. Congratulations, not used name! Your army won. The winners 4943⚔️ of 12000⚔️ proudly return home. Going around the bodies of enemies, your warriors found many valuable jewels worth a 188386727💰 and 3💎.'
  }, {
    type: 'battlereport',
    information: {battlereport: {
      won: false,
      attack: false,
      enemies: [
        '☠️Undead army'
      ],
      friends: [
        'not used name'
      ],
      soldiersTotal: 0,
      soldiersAlive: 0,
      reward: 0
    }},
    text: '‼️The battle with ☠️Undead army complete. Unfortunately, not used name, your army lose. None of the 0⚔️ returned from the battlefield... All food was poisoned, and a part of the population was killed.A new effect is obtained: 💀Plague.'
  }, {
    type: 'attackscout',
    information: {attackscout: {
      player: 'Slave',
      terra: 5446,
      karma: 5
    }},
    text: 'Our scouts found [🎴]Slave in his domain Pledge with 5446🗺 territory. If you win, you\'ll get 5☯ karma points.'
  }, {
    type: 'attackincoming',
    information: {attackincoming: {
      player: 'Son of Gods'
    }},
    text: '‼️Your domain attacked! [🐮]Son of Gods approaches the border! Your whole ⚔Army will be sent to the defense!'
  }, {
    text: 'Your ⚔️Ballista will receive +100 to accuracy in the battle with the 🐲️Dragon until 2018-12-21 04:30:39 +0000 UTC.'
  }
]
  .map(o => ({...o, lang: 'en'}))
