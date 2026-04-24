import type { Payload } from 'payload'

export async function seedUsers(
  payload: Payload,
  opts?: {
    count?: number
    domain?: string
    password?: string
  },
) {
  const count = opts?.count ?? 10
  const domain = opts?.domain ?? 'gmail.de'
  const password = opts?.password ?? 'user'

  for (let i = 1; i <= count; i++) {
    const email = `user${i}@${domain}`
    const name = `User ${i}`

    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })

    const data = {
      email,
      password, // Payload will hash it
      name,
      role: 'user',
    } as any

    if (existing.docs.length) {
      await payload.update({
        collection: 'users',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'users',
        data,
        overrideAccess: true,
      })
    }
  }
}
