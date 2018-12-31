# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.3.1"></a>
## [2.3.1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v2.3.0...v2.3.1) (2018-12-31)


### Bug Fixes

* **alerts:** dont create alerts that are way to far in the future ([7c4d9b7](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/7c4d9b7))
* **battlereport:** tell the user, the report itself was saved ([1292c9f](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/1292c9f))
* **battlereports:** only add when report could be read ([556a132](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/556a132))
* **gamescreen:** all winners of 0 return home ([a7f91a1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/a7f91a1))



<a name="2.3.0"></a>
# [2.3.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v2.2.4...v2.3.0) (2018-12-18)


### Features

* **playerstats:** use every soldier lost as min ([e993d98](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/e993d98))



<a name="2.2.4"></a>
## [2.2.4](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v2.2.3...v2.2.4) (2018-12-18)


### Bug Fixes

* adapt link to support group ([b4c643d](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/b4c643d))



<a name="2.2.3"></a>
## [2.2.3](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v2.2.2...v2.2.3) (2018-12-18)


### Bug Fixes

* **battlereports:** set providingTgUser on added battlereport ([bb207be](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/bb207be))
* **battlereports:** set providingTgUser on not migrateable report ([837e51b](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/837e51b))



<a name="2.2.2"></a>
## [2.2.2](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v2.2.1...v2.2.2) (2018-12-18)


### Bug Fixes

* **battlereport:** answer on everything the bot detected as battlereport ([d7b153d](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/d7b153d))
* **battlereports:** dont crash on start when something couldn't be read ([80321b4](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/80321b4))
* **effects:** work with castle effect ([d689079](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/d689079))



<a name="2.2.1"></a>
## [2.2.1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v2.2.0...v2.2.1) (2018-12-18)


### Bug Fixes

* **battlereport:** dont detect balista gem stuff as battlereport ([df597a1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/df597a1))



<a name="2.2.0"></a>
# [2.2.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v2.1.0...v2.2.0) (2018-12-18)


### Bug Fixes

* **alerts:** use output emojis ([694bba6](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/694bba6))
* **battlereports:** remove empty (old) battlereport files ([ff24efb](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/ff24efb))
* **errorhandling:** send error to user when chat is not available ([5e6d2b3](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/5e6d2b3))
* **playerstats:** inline keyboard text is now consistent ([4e0ad2b](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/4e0ad2b))


### Features

* **alerts:** add "Open BastionSiege" button on Alert ([0a1fcf2](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/0a1fcf2))
* **battlestats:** let the user chose the timeframe ([1c42dec](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/1c42dec))
* **battlestats:** show more details about enemy alliances ([334771f](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/334771f))
* **playerstats:** add "Back to BastionSiege" button ([2006a7d](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/2006a7d))
* **playerstats:** show alliance of enemy ([21077ef](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/21077ef))



<a name="2.1.0"></a>
# [2.1.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v2.0.3...v2.1.0) (2018-12-17)


### Bug Fixes

* dont send user 'too many requests' ([4ebd157](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/4ebd157))


### Features

* **alerts:** show alerts for BS /effects ([4811f57](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/4811f57))



<a name="2.0.3"></a>
## [2.0.3](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v2.0.2...v2.0.3) (2018-12-16)


### Bug Fixes

* **battlereports:** ensure time is Number ([15bb11f](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/15bb11f))
* **errorhandling:** show errors to user so the user 'wants' to help ([b6522f5](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/b6522f5))
* **help:** tell users about the /settings ([491f604](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/491f604))
* **playerstats:** loot is only calculated from won attacks ([8347188](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/8347188))



<a name="2.0.2"></a>
## [2.0.2](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v2.0.1...v2.0.2) (2018-12-16)


### Bug Fixes

* **alerts:** show /upcoming without setting alerts first ([39cf24d](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/39cf24d))



<a name="2.0.1"></a>
## [2.0.1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v2.0.0...v2.0.1) (2018-12-16)


### Bug Fixes

* **alerts:** enable alerts for workshop stuff ([5bd15f5](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/5bd15f5))
* **alerts:** remove debug output ([9dd5d65](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/9dd5d65))
* **debug:** dont show complete ctx.update on empty ([a3ecef1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/a3ecef1))
* **playerstats:** ≥ is Math.floor ([64c988e](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/64c988e))



<a name="2.0.0"></a>
# [2.0.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.16.1...v2.0.0) (2018-12-16)


### Bug Fixes

* **alerts:** show alert type emoji next to description ([8317b0d](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/8317b0d))
* **buildings:** improve user ui texts ([2594ffa](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/2594ffa))


### Features

* **alerts:** add alerts for buildings ([244674e](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/244674e))
* **alerts:** show list of upcoming alerts with /upcoming ([8ede11b](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/8ede11b))
* **battlereport:** hint user when report is from diffrent name ([f206a1c](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/f206a1c))
* **battlereports:** use new way to store battlereports ([5924679](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/5924679))
* **playerstats:** battles observed are all involving player ([51052f3](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/51052f3))
* **playerstats:** show active timewindow ([4b85e9f](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/4b85e9f))
* **playerstats:** show inactive timeframe ([e52c7ad](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/e52c7ad))
* **playerstats:** use alliance attacks against single target for loot ([bd29b7e](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/bd29b7e))
* **playerstats:** when last battle <24h ago show hours instead of 0d ([ed8053c](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/ed8053c))
* **poweruser:** rework player immunity ([e9d16de](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/e9d16de))
* **settings:** migrate search stuff to the settings menu ([5ab5137](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/5ab5137))
* **user-sessions:** save sessions deterministic ([9ba77a7](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/9ba77a7))
* show join BSA Support Group as an inline button instead ([cac6551](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/cac6551))
* show performance information in debug mode ([34e9583](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/34e9583))


### BREAKING CHANGES

* **poweruser:** powerusers have to send their main screen in order to
let immunity continue to work
* **battlereports:** This version can read battlereports from earlier
versions, but not the other way around. Older versions can not use
battlereports from after this change.



<a name="1.16.1"></a>
## [1.16.1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.16.0...v1.16.1) (2018-12-11)


### Bug Fixes

* **gamescreen:** fix detection of alliance battle in russian lang ([3df3358](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/3df3358))
* **gamescreen:** fix everyone died but won in russian lang ([1b4a790](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/1b4a790))



<a name="1.16.0"></a>
# [1.16.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.15.5...v1.16.0) (2018-12-11)


### Bug Fixes

* **battlereport:** show terra later in quick stats ([034591c](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/034591c))
* **gamescreen-name:** detect russian undead / dragon ([97a43ff](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/97a43ff))


### Features

* **siegemath:** add building cost until calculation ([66354fd](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/66354fd))



<a name="1.15.5"></a>
## [1.15.5](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.15.4...v1.15.5) (2018-12-09)


### Bug Fixes

* **alerts:** next attack is influnced by alliance attacks too ([98f6bf2](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/98f6bf2))



<a name="1.15.4"></a>
## [1.15.4](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.15.3...v1.15.4) (2018-12-09)


### Bug Fixes

* **search:** remove free searches ([153876f](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/153876f))
* **search:** simplify search system by applying it only to inline search ([e74a883](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/e74a883))



<a name="1.15.3"></a>
## [1.15.3](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.15.2...v1.15.3) (2018-12-09)


### Bug Fixes

* **playerstats:** calculate army lost excluding reports without loss ([6518f62](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/6518f62))



<a name="1.15.2"></a>
## [1.15.2](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.15.1...v1.15.2) (2018-12-09)


### Bug Fixes

* **alerts:** do not try to create alert in NaN milliseconds ([646de64](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/646de64))



<a name="1.15.1"></a>
## [1.15.1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.15.0...v1.15.1) (2018-12-08)


### Bug Fixes

* **alerts:** users without alert settings can use the bot ([aa6d090](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/aa6d090))



<a name="1.15.0"></a>
# [1.15.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.14.1...v1.15.0) (2018-12-08)


### Bug Fixes

* **battlestats:** get enemies from alliance battles too ([37763b7](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/37763b7))
* **buildings:** fix food production when houses < farm ([b3f3711](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/b3f3711))
* **playerstats:** genderfriendly immunity message ([fdb217a](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/fdb217a))


### Features

* **alerts:** add alert system ([3483921](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/3483921))
* **battlereport:** save timestamp of last solo / alliance attack ([b0ffcbe](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/b0ffcbe))
* **battlereport:** show terra, gems, karma in stats when possible ([009d9ed](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/009d9ed))
* **battlereport:** update gold after battlereport ([c28b8f4](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/c28b8f4))
* **buildings:** show buildings based on user settings ([38960c0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/38960c0))
* **buildings:** show gold per min / hour ([6b73402](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/6b73402))
* **playerstats:** ignore battles without loss on army assumption ([31931f3](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/31931f3))
* **settings:** add settings menu ([e1b0526](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/e1b0526))



<a name="1.14.1"></a>
## [1.14.1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.14.0...v1.14.1) (2018-12-05)


### Bug Fixes

* **battlereport:** save raw at all costs ([92ec141](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/92ec141))
* **battlereport:** use more extreme win/lost emojis ([3ceebbd](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/3ceebbd))
* **battlereports:** save reports when raw not existing ([667d49b](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/667d49b))
* **gamescreen:** read different kind of 'none returned' ([5234c69](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/5234c69))
* **playerstats:** only show stats for up to date messages ([53c5afa](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/53c5afa))



<a name="1.14.0"></a>
# [1.14.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.13.2...v1.14.0) (2018-12-02)


### Bug Fixes

* **playerstats:** only show loot with successful attacks ([8fb86e9](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/8fb86e9))
* fix the data from a previous bot bug ([c4725e4](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/c4725e4))


### Features

* **battlereport:** add attack and won emoji ([224ea40](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/224ea40))
* **battlereport:** reply to the specific report that added the report ([7ede6c9](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/7ede6c9))
* **battlereport:** show enemy playerstats on adding battlereport ([cf0be41](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/cf0be41))
* **playerstats:** limit searches ([1e4efbf](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/1e4efbf))
* **playerstats:** more compact playerstats ([46f4354](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/46f4354))



<a name="1.13.2"></a>
## [1.13.2](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.13.1...v1.13.2) (2018-11-29)


### Bug Fixes

* flatMap requires node 11 ([ed1e10c](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/ed1e10c))



<a name="1.13.1"></a>
## [1.13.1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.13.0...v1.13.1) (2018-11-28)


### Bug Fixes

* **gamescreen:** prevent error when gamescreen is unknown ([884680e](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/884680e))



<a name="1.13.0"></a>
# [1.13.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.12.0...v1.13.0) (2018-11-28)


### Bug Fixes

* **playerstats:** last battle was Infinity days ago ([7121e66](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/7121e66))


### Features

* **battlereports:** save raw version and fix battlereports with them ([091e81b](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/091e81b))



<a name="1.12.0"></a>
# [1.12.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.11.0...v1.12.0) (2018-11-28)


### Bug Fixes

* **playerstats:** remove additional hint for inactivity ([8c39359](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/8c39359))


### Features

* **buildings:** include mine ([485353a](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/485353a))
* **playerstats:** guess the enemy army based on gold lost to him ([a26b8e1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/a26b8e1))
* improve the help text ([c89097b](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/c89097b))
* **battlestats:** nicer battlereport added message ([6e2362e](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/6e2362e))
* **battlestats:** show average and total ([e4ee0e9](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/e4ee0e9))
* **playerstats:** only show time of last known battle ([89fe4a8](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/89fe4a8))



<a name="1.11.0"></a>
# [1.11.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.10.0...v1.11.0) (2018-11-27)


### Bug Fixes

* **playerstats:** send playerstats directly on battlreport button ([e928a96](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/e928a96))
* dont send help when the user searched for an immune player ([dcb47da](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/dcb47da))
* **botfather:** simplify command description ([62cdc46](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/62cdc46))
* **gamescreen:** dont detect lost attack as lost defence ([8937221](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/8937221))
* **gamescreen:** you only change karma when attacking and winning ([1643e04](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/1643e04))
* **number-function-strings:** improve spacing ([cb611e7](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/cb611e7))
* **playerstats:** show loot only for attacks and Dragons 🐲 ([561a297](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/561a297))


### Features

* **playerstats:** move playerstats sharing to playerstats ([059e8c3](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/059e8c3))
* **playerstats:** show loot average and max ([190ea24](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/190ea24))
* show stats with average and stdDeviation instead of min, max, … ([8546dc1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/8546dc1))
* **botstats:** add some botstats ([534074c](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/534074c))
* **help:** tell about the support group ([bce5e18](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/bce5e18))
* **playerstats:** share playerstats after adding battlereport ([4068e0a](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/4068e0a))



<a name="1.10.0"></a>
# [1.10.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.9.0...v1.10.0) (2018-11-26)


### Bug Fixes

* **playerstats:** only use battles where the army is known ([4d741a4](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/4d741a4))


### Features

* **gamescreen:** analyse russian gamescreens ([b9b5cb1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/b9b5cb1))


### Performance Improvements

* **gamescreen:** dont run function multiple times ([55348f1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/55348f1))



<a name="1.9.0"></a>
# [1.9.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.8.0...v1.9.0) (2018-11-25)


### Bug Fixes

* simplify createSumAverageAmountString with only 1 value ([4425428](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/4425428))
* **playerstats:** make more clear what the text means ([94c2387](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/94c2387))
* **playerstats:** rename for easier understanding ([635752e](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/635752e))


### Features

* **playerstats:** forward incoming attack to get playerstats ([3f7de68](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/3f7de68))
* add commands to the bot ([3346856](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/3346856))
* **battlestats:** dont show battlestats always ([07601f5](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/07601f5))
* **playerstats:** show army assumption in a more detailed manner ([a439be5](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/a439be5))
* show an inline query button below the help message ([9693626](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/9693626))



<a name="1.8.0"></a>
# [1.8.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.7.0...v1.8.0) (2018-11-22)


### Bug Fixes

* **playerstats:** ignore inline query result for help message ([f29892e](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/f29892e))


### Features

* **playerstats:** add gems to stats when possible ([5a75143](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/5a75143))



<a name="1.7.0"></a>
# [1.7.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.6.0...v1.7.0) (2018-11-22)


### Bug Fixes

* **inline:** use inline query caching in production mode ([f8c8dd6](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/f8c8dd6))
* **playerstats:** fix 33.33333…% ([d6f38fe](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/d6f38fe))
* **playerstats:** forward attackscout message now works ([aecc29d](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/aecc29d))
* **playerstats:** show desciption without starting spaces ([555b4f6](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/555b4f6))


### Features

* **number-functions:** show min and max with average, total, … ([13afeec](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/13afeec))
* **playerstats:** description has now the max gold instead of avg ([263c5a1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/263c5a1))
* **playerstats:** every win will included in loot ([dca45cc](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/dca45cc))
* **playerstats:** show army emoji (unit of number) ([1412be0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/1412be0))
* update help text ([75248da](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/75248da))



<a name="1.6.0"></a>
# [1.6.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.5.0...v1.6.0) (2018-11-22)


### Bug Fixes

* **playerstats:** fix typo ([a766d4f](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/a766d4f))
* **playerstats:** improve short text for inline mode ([98acd8b](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/98acd8b))


### Features

* **playerstats:** add search by inline mode ([69fa224](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/69fa224))
* **playerstats:** detect attackscouts message from BS ([1595370](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/1595370))
* **playerstats:** show playerstats to the forwarded attackscouts ([a3ccb54](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/a3ccb54))
* **playerstats:** show stats as text instead of json ([1c86605](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/1c86605))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.4.0...v1.5.0) (2018-11-07)


### Features

* **battlestats:** show stats of last 7d ([3779384](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/3779384))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.3.2...v1.4.0) (2018-11-03)


### Bug Fixes

* **battlestats:** get rid of a zero space joiner ([b5fb974](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/b5fb974))
* **battlestats:** get rid of emoji variant selector ([5243237](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/5243237))
* **battlestats:** parse halloween reports ([6950268](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/6950268))


### Features

* debounce build and battle stats ([8c5c49c](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/8c5c49c))



<a name="1.3.2"></a>
## [1.3.2](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.3.1...v1.3.2) (2018-10-27)


### Bug Fixes

* **battlestats:** correctly parse the conquerer emoji ([c13ca8a](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/c13ca8a))



<a name="1.3.1"></a>
## [1.3.1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.3.0...v1.3.1) (2018-10-22)


### Bug Fixes

* **battlestats:** fix soldiers alive when without loss and barracks full ([3bcae24](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/3bcae24))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.2.0...v1.3.0) (2018-10-20)


### Bug Fixes

* **battlestats:** correctly parse the negative karma emoji ([70804ac](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/70804ac))
* **battlestats:** detect alliance wars correctly ([f9ccefa](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/f9ccefa))
* **battlestats:** only show battle stats after battle reports ([03a80a0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/03a80a0))
* **battlestats:** only use valid numbers for stats calculation ([cd57ae2](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/cd57ae2))
* **battlestats:** show average as floating point ([dbfe198](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/dbfe198))


### Features

* **battlestats:** add karma, terra and overall rewards ([11b932e](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/11b932e))
* **battlestats:** seperate dragon and undead battles ([6cb4fc1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/6cb4fc1))
* **battlestats:** show alliance battle rewards ([bc6c13c](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/bc6c13c))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.1.0...v1.2.0) (2018-10-20)


### Bug Fixes

* handle dragon and undead battle reports ([14834fa](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/14834fa))
* make add synchronous ([dc1e96d](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/dc1e96d))


### Features

* detect name of player ([81d1bdb](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/81d1bdb))
* replace battlereport when it contains different information now ([527af6b](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/527af6b))
* save battlereports always deterministic ([2ac5d39](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/2ac5d39))
* **number-functions:** formatNumberShort support for negative numbers ([872a7b4](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/872a7b4))
* show battle stats ([454cdfb](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/454cdfb))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.0.1...v1.1.0) (2018-10-17)


### Features

* save battlereports ([8391b9f](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/8391b9f))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/EdJoPaTo/BastionSiegeAssistBot/compare/v1.0.0...v1.0.1) (2018-08-24)


### Bug Fixes

* use Object.assign as it works ([2a7ad70](https://github.com/EdJoPaTo/BastionSiegeAssistBot/commit/2a7ad70))



<a name="1.0.0"></a>
# 1.0.0 (2018-08-24)


start of versioning
