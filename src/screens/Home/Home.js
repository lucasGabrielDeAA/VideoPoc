import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Linking
} from 'react-native'
import axios from 'axios'
import { DocumentDirectoryPath, DownloadDirectoryPath, mkdir, exists } from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { virgilCrypto } from 'react-native-virgil-crypto'

import { VideoPlayer, Thumbnail } from 'src/components'

import { fetchClient } from 'src/providers'

import { generateKeys } from 'src/utils'

import { ASYNC_STORAGE_PRIVATE_KEY, ASYNC_STORAGE_PUBLIC_KEY } from 'src/constants'

const VIMEO_ID = '510404006' //Scaffold video
const DIRECTORY_NAME = '.scaffold'

const Home = () => {
  const { push } = useNavigation()

  const [videoUrl, setVideoUrl] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [video, setVideo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [thumbnail, setThumnbail] = useState(null)
  const [publicKey, setPublicKey] = useState(null)

  const authenticate = async () => {
    try {
      const access_token = '67129ad799b211455b059f0e6282706c' //scaffold access_token

      await AsyncStorage.setItem('@VideoPoc:VimeoToken', access_token)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchVideo = async () => {
    try {
      setIsLoading(true)

      const { data } = await axios.get(`https://player.vimeo.com/video/${VIMEO_ID}/config`)
      const { video, request, user } = data

      setThumnbail(video?.thumbs['640'])
      setVideo(video)
      setDownloadUrl(request?.files?.progressive?.[0]?.url)
      setVideoUrl(
        request?.files?.hls?.cdns[request?.files?.hls?.default_cdn]?.url ||
          request?.files?.progressive?.[0]?.url
      )
    } catch (error) {
      console.log(`Error ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const requestPermission = async (
    permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
  ) => {
    try {
      let permissionEnabled = false

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(permission)
        permissionEnabled = granted === PermissionsAndroid.RESULTS.GRANTED
      } else {
        permissionEnabled = true
      }

      return permissionEnabled
    } catch (error) {
      console.log(error)
    }
  }

  const makeDirectory = async () => {
    try {
      const path = `${
        Platform.OS === 'android' ? DownloadDirectoryPath : DocumentDirectoryPath
      }/${DIRECTORY_NAME}`

      if (!(await exists(path))) {
        await mkdir(path)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const downloadVideo = async () => {
    try {
      const { files } = await fetchClient.get(`/videos/${VIMEO_ID}`)

      // const url = files[1].link

      await makeDirectory()

      const { config } = RNFetchBlob

      const name = `${video.title.split(' ').join('_')}`
      const filePath = `${
        Platform.OS === 'android' ? DownloadDirectoryPath : DocumentDirectoryPath
      }/${DIRECTORY_NAME}/${name}.mp4`

      const options = Platform.select({
        android: {
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            mime: 'video/mp4',
            description: `${name}`,
            path: filePath
          },
          fileCache: true
        },
        ios: {
          fileCache: true,
          path: filePath
        }
      })

      const { path } = await config(options).fetch('GET', videoUrl)

      const keys = virgilCrypto.generateKeys()

      await virgilCrypto.encryptFile({
        inputPath: path(),
        outputPath: filePath,
        publicKeys: keys.publicKey
      })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    ;(async () => {
      const [[, storedPrivateKey], [, storedPublicKey]] = await AsyncStorage.multiGet([
        ASYNC_STORAGE_PRIVATE_KEY,
        ASYNC_STORAGE_PUBLIC_KEY
      ])

      if (!storedPrivateKey && !storedPublicKey) {
        await generateKeys()
      } else {
        setPublicKey(JSON.parse(storedPublicKey))
      }

      await requestPermission()
      await authenticate()
      fetchVideo()
    })()
  }, [setPublicKey])

  return !isLoading ? (
    <Thumbnail
      backgroundImage={thumbnail}
      mainAction={() => push('Player', { url: videoUrl })}
      secondAction={() => downloadVideo()}
    />
  ) : (
    <ActivityIndicator size='small' color='#000' />
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff'
  }
})

export default Home
