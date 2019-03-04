const {emoji} = require('./output-text')

function getHintStrings(ctx, conditions) {
  const hints = []

  const conditionName = conditions.filter(o => o.type === 'name')[0]
  if (!conditionName.status || conditionName.warning) {
    let hint = conditionName.status ? emoji.warning : emoji.danger
    hint += ctx.i18n.t('poweruser.nameOld')
    hint += ' ' + ctx.i18n.t('name.update')
    if (conditionName.status) {
      hint += '\n' + ctx.i18n.t('poweruser.nearlyOld')
    }

    hints.push(hint)
  }

  const conditionBuildings = conditions.filter(o => o.type === 'buildings')[0]
  if (!conditionBuildings.status || conditionBuildings.warning) {
    let hint = conditionBuildings.status ? emoji.warning : emoji.danger
    hint += ctx.i18n.t('poweruser.buildingsOld')
    if (conditionBuildings.status) {
      hint += '\n' + ctx.i18n.t('poweruser.nearlyOld')
    }

    hints.push(hint)
  }

  return hints
}

function conditionEmoji(condition) {
  if (!condition.status) {
    return emoji.no
  }

  if (condition.warning) {
    return emoji.warning
  }

  return emoji.yes
}

function conditionTypeTranslation(ctx, type) {
  switch (type) {
    case 'battlereports':
      return ctx.i18n.t('botstats.battlereports')
    case 'buildings':
      return ctx.i18n.t('bs.buildings')
    default:
      return type
  }
}

module.exports = {
  conditionEmoji,
  conditionTypeTranslation,
  getHintStrings
}
