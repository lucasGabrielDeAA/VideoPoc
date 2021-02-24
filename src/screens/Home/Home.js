import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native'
import axios from 'axios'
import { DocumentDirectoryPath, DownloadDirectoryPath, mkdir, exists } from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { virgilCrypto } from 'react-native-virgil-crypto'

import { VideoPlayer, Thumbnail } from 'src/components'

import { fetchClient } from 'src/providers'

const VIMEO_ID = '420362546' //Scaffold video
const DIRECTORY_NAME = `${
  Platform.OS === 'android' ? DownloadDirectoryPath : DocumentDirectoryPath
}/.scaffold`

const keyPair = virgilCrypto.generateKeys()

const Home = () => {
  const { push } = useNavigation()

  const [videoUrl, setVideoUrl] = useState('')
  const [video, setVideo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [thumbnail, setThumnbail] = useState(null)
  const [content, setContent] = useState('')

  const authenticate = async () => {
    try {
      const access_token = '386532eff8de53d9e5682dda8ba80019' //scaffold access_token

      await AsyncStorage.setItem('@VideoPoc:VimeoToken', access_token)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchVideo = async () => {
    try {
      setIsLoading(true)

      const { pictures, ...rest } = await fetchClient.get(`/videos/${VIMEO_ID}`)

      // const response = await axios.get(`https://player.vimeo.com/video/${VIMEO_ID}/config`)
      // console.log(response)
      // const { video, request, user } = data

      setThumnbail(pictures?.sizes[3]?.link_with_play_button)
      // setVideo(video)
      // setVideoUrl(
      //   request?.files?.hls?.cdns[request?.files?.hls?.default_cdn]?.url ||
      //     request?.files?.progressive?.[0]?.url
      // )
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
      if (!(await exists(DIRECTORY_NAME))) {
        await mkdir(DIRECTORY_NAME)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const downloadVideo = async () => {
    try {
      const { config } = RNFetchBlob

      const { files } = await fetchClient.get(`/videos/${VIMEO_ID}`)

      const url = files[1].link

      await makeDirectory()

      config({ fileCache: true, appendExt: 'mp4' })
        .fetch('GET', url)
        .progress((received, total) =>
          console.log(`Download - received: ${received} / total: ${total}`)
        )
        .then(async response => {
          const encryptedFile = await virgilCrypto.encryptFile({
            inputPath: response.path(),
            outputPath: `${DIRECTORY_NAME}/${video.title.split(' ').join('_')}.mp4`,
            publicKeys: keyPair.publicKey
          })

          console.log(`encryptedFile ${encryptedFile}`)

          const decryptedFile = await virgilCrypto.decryptFile({
            inputPath: encryptedFile,
            outputPath: undefined,
            privateKey: keyPair.privateKey
          })

          console.log(`decryptedFile ${decryptedFile}`)

          setContent(`file://${decryptedFile}`)
        })
        .catch(err => console.log(`Error ${err}`))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    ;(async () => {
      await requestPermission()
      await authenticate()
      fetchVideo()
    })()
  }, [])

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
