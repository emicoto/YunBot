import { Context, Dict, Random, Session, Time, User } from 'koishi'
import { Config } from '..'

export function Bind(ctx: Context, config: Config = {}) {
  ctx.i18n.define('zh', require('../locales/zh'))

  // 1: group (1st step)
  // 0: private
  // -1: group (2nd step)
  type TokenData = [platform: string, id: string, pending: number]
  const tokens: Dict<TokenData> = {}

  const { tokenPrefix: prefix = 'koishi/' } = config
  const { generateToken = () => `${prefix}` + Random.id(6, 10) } = config

  function generate(session: Session, pending: number) {
    const token = generateToken()
    tokens[token] = [session.platform, session.userId, pending]
    setTimeout(() => delete tokens[token], 5 * Time.minute)
    return token
  }

  async function bind(user: User.Observed<never>, platform: string, userId: string) {
    await ctx.database.remove('user', { [platform]: [userId] })
    //await ctx.database.remove('YunSave', { [platform]: [userId] })
    user[platform] = userId as never
    await user.$update()
  }

  ctx.command('bind', { authority: 1 })
    .action(({ session }) => {
      const token = generate(session, +(session.subtype === 'group'))
      return session.text('.generated-1', [token])
    })

  ctx.middleware(async (session, next) => {
    const data = tokens[session.content]
    if (!data) return next()
    if (data[2] < 0) {
      const sess = session.bot.session(session)
      sess.platform = data[0]
      sess.userId = data[1]
      const user = await sess.observeUser([session.platform as never])
      delete tokens[session.content]
      await bind(user, session.platform, session.userId)
      return session.text('commands.bind.messages.success')
    } else {
      const user = await session.observeUser(['authority', data[0] as never])
      if (!user.authority) return session.text('internal.low-authority')
      if (user[data[0]]) return session.text('commands.bind.messages.failed')
      delete tokens[session.content]
      if (data[2]) {
        const token = generate(session, -1)
        return session.text('commands.bind.messages.generated-2', [token])
      } else {
        await bind(user, data[0], data[1])
        return session.text('commands.bind.messages.success')
      }
    }
  }, true)
}
