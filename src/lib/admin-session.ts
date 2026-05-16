const encoder = new TextEncoder()

function hexToBuffer(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g) ?? []
  return new Uint8Array(matches.map(b => parseInt(b, 16)))
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function createAdminToken(secret: string): Promise<string> {
  const payload = crypto.randomUUID()
  const key = await getHmacKey(secret)
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return `${payload}.${bufferToHex(sigBuffer)}`
}

export async function verifyAdminToken(
  token: string | undefined,
  secret: string | undefined
): Promise<boolean> {
  if (!token || !secret) return false
  const dot = token.lastIndexOf('.')
  if (dot === -1) return false
  const payload = token.slice(0, dot)
  const sigHex = token.slice(dot + 1)
  try {
    const key = await getHmacKey(secret)
    const sigBuffer = hexToBuffer(sigHex)
    return await crypto.subtle.verify('HMAC', key, sigBuffer.buffer as ArrayBuffer, encoder.encode(payload))
  } catch {
    return false
  }
}
