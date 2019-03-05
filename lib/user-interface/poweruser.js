const {emoji} = require('./output-text')

function getHintStrings(ctx, conditions) {
  const hints = []

  hints.push(createHintText(
    conditions.filter(o => o.type === 'name')[0],
    ctx.i18n.t('poweruser.nameOld') + ' ' + ctx.i18n.t('name.update'),
    ctx.i18n.t('poweruser.nearlyOld')
  ))

  hints.push(createHintText(
    conditions.filter(o => o.type === 'buildings')[0],
    ctx.i18n.t('poweruser.buildingsOld'),
    ctx.i18n.t('poweruser.nearlyOld')
  ))

  hints.push(createHintText(
    conditions.filter(o => o.type === 'workshop')[0],
    ctx.i18n.t('poweruser.workshopOld'),
    ctx.i18n.t('poweruser.nearlyOld')
  ))

  return hints
    .filter(o => o)
}

function createHintText(condition, badText, additionalWarningText) {
  if (condition.status && !condition.warning) {
    return
  }

  let hint = condition.status ? emoji.warning : emoji.danger
  hint += badText
  if (condition.status) {
    hint += '\n' + additionalWarningText
  }

  return hint
}

function conditionEmoji(condition) {
  if (condition.status && !condition.warning) {
    return emoji.yes
  }

  if (condition.required && !condition.status) {
    return emoji.no
  }

  return emoji.warning
}

function conditionTypeTranslation(ctx, type) {
  switch (type) {
    case 'battlereports':
      return ctx.i18n.t('botstats.battlereports')
    case 'buildings':
    case 'workshop':
      return ctx.i18n.t('bs.' + type)
    default:
      return type
  }
}

module.exports = {
  conditionEmoji,
  conditionTypeTranslation,
  getHintStrings
}
