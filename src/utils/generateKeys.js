import { virgilCrypto } from 'react-native-virgil-crypto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ASYNC_STORAGE_PRIVATE_KEY, ASYNC_STORAGE_PUBLIC_KEY } from 'src/constants'

export const generateKeys = async () => {
  const { publicKey, privateKey } = virgilCrypto.generateKeys()

  await AsyncStorage.multiSet([
    [ASYNC_STORAGE_PRIVATE_KEY, JSON.stringify(privateKey)],
    [ASYNC_STORAGE_PUBLIC_KEY, JSON.stringify(publicKey)]
  ])
}
