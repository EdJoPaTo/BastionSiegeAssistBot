import {PoweruserCondition, PoweruserConditionType, Context} from '../types'

import {emoji} from './output-text'

export function getHintStrings(ctx: Context, conditions: readonly PoweruserCondition[]): string[] {
  const hints = []

  hints.push(createHintText(
    conditions.find(o => o.type === 'name'),
    `${ctx.i18n.t('poweruser.nameOld')} ${ctx.i18n.t('name.update')}`,
    ctx.i18n.t('poweruser.nearlyOld')
  ))

  hints.push(createHintText(
    conditions.find(o => o.type === 'buildings'),
    ctx.i18n.t('poweruser.buildingsOld'),
    ctx.i18n.t('poweruser.nearlyOld')
  ))

  hints.push(createHintText(
    conditions.find(o => o.type === 'workshop'),
    ctx.i18n.t('poweruser.workshopOld'),
    ctx.i18n.t('poweruser.nearlyOld')
  ))

  return hints
    .filter((o): o is string => Boolean(o))
}

function createHintText(condition: PoweruserCondition | undefined, badText: string, additionalWarningText: string): string | undefined {
  if (!condition || (condition.status && !condition.warning)) {
    return
  }

  let hint = condition.status ? emoji.warning : emoji.danger
  hint += badText
  if (condition.status) {
    hint += '\n' + additionalWarningText
  }

  return hint
}

export function conditionEmoji(condition: PoweruserCondition): string {
  if (condition.status && !condition.warning) {
    return emoji.yes
  }

  if (condition.required && !condition.status) {
    return emoji.no
  }

  return emoji.warning
}

export function conditionTypeTranslation(ctx: Context, type: PoweruserConditionType): string {
  switch (type) {
    case 'battlereports':
      return ctx.i18n.t('battlereports')
    case 'name':
      return ctx.i18n.t('name.nameAndAlliance')
    case 'buildings':
    case 'workshop':
      return ctx.i18n.t('bs.' + type)
    default:
      return type
  }
}
