const {emoji} = require('../lib/create-stats-strings')

const buildingNames = {
  townhall: emoji.townhall + ' Townhall',
  storage: emoji.storage + ' Storage',
  houses: emoji.houses + ' Houses',
  farm: emoji.farm + ' Farm',
  sawmill: emoji.sawmill + ' Sawmill',
  mine: emoji.mine + ' Mine',
  barracks: emoji.barracks + ' Barracks',
  wall: emoji.wall + ' Wall',
  trebuchet: emoji.trebuchet + ' Trebuchet',
  ballista: emoji.ballista + ' Ballista'
}

const defaultBuildingsToShow = ['townhall', 'storage', 'houses', 'mine', 'barracks', 'wall', 'trebuchet', 'ballista']

module.exports = {
  buildingNames,
  defaultBuildingsToShow
}
