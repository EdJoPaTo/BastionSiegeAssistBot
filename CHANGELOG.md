# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
