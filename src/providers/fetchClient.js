import axios from 'axios'
import { Buffer } from 'buffer'
import AsyncStorage from '@react-native-async-storage/async-storage'

const provider = axios.create({
  baseURL: 'https://api.vimeo.com'
})

provider.interceptors.request.use(async ({ headers, ...config }) => {
  const client_id = 'e27861f4b3f2422a5090b25947fa1e1452576a45'
  const client_secret =
    'jmW57DvJn+tXKDKAsX28GwdYiYspob/srIZs4UsIflNr6J6qDRvrhccWw0uNTqQ9e2Pj9RgDup8UH6ieLIJRQvvT8yiByaY/sLoOIrSY6HXHm2c6kjj6oZHoRo7WV10r'

  // const auth_token = String(new Buffer(`${client_id}:${client_secret}`).toString('base64'))
  const auth_token = await AsyncStorage.getItem('@VideoPoc:VimeoToken')

  return {
    ...config,
    headers: {
      ...headers,
      Authorization: `Bearer ${auth_token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.vimeo.*+json;version=3.4'
    }
  }
})

provider.interceptors.response.use(
  response => response?.data,
  err => Promise.reject(err?.response?.data)
)

export default provider
