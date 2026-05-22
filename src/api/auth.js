export const extractAuthToken = (response) => {
  if (typeof response === 'string') return response

  const candidates = [
    response?.accessToken,
    response?.token,
    response?.jwt,
    response?.bearerToken,
    response?.data?.accessToken,
    response?.data?.token,
    response?.data?.jwt,
    response?.data?.bearerToken,
    response?.user?.accessToken,
    response?.user?.token,
  ]

  return candidates.find((token) => typeof token === 'string' && token.trim()) || ''
}

export const formatAuthorization = (token) => {
  if (!token) return ''
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

export const saveAuthToken = (response) => {
  const token = extractAuthToken(response)

  if (!token) return ''

  window.localStorage.setItem('crewling-token', token)
  return token
}

export const clearAuth = () => {
  window.localStorage.removeItem('crewling-token')
  window.localStorage.removeItem('crewling-user')
}
