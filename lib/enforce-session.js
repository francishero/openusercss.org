import raven from 'raven'
import staticConfig from './config'
import jwt from 'jsonwebtoken'

export default async (token, Session) => {
  const config = await staticConfig()
  let session = null

  session = await Session.findOne({
    token,
  })

  if (!session) {
    throw new Error('session-invalid')
  }

  try {
    jwt.verify(token, config.get('keypair.clientprivate'), {
      'issuer':     config.get('domain'),
      'algorithms': [
        'HS256',
      ],
    })
  } catch (error) {
    raven.captureException(error)
    throw new Error('session-invalid')
  }

  return session
}
