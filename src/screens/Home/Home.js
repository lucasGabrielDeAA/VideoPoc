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

import { VideoPlayer, Thumbnail } from 'src/components'

import { fetchClient } from 'src/providers'

const VIMEO_ID = '510404006' //Scaffold video
// const VIMEO_ID = '514365095' // my own video
const DIRECTORY_NAME = '.scaffold'

const Home = () => {
  const { push } = useNavigation()

  const [videoUrl, setVideoUrl] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [video, setVideo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [thumbnail, setThumnbail] = useState(null)

  const authenticate = async () => {
    try {
      // const access_token = '0b3eded54fe734c72e3e90e9df2d9b9c' // my onw access_token
      const access_token = '254491c0898dea7edf6ae709b3246256' //scaffold access_token

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
      const response = await fetchClient.get(`/videos/${VIMEO_ID}`)
      console.log(response)

      // await makeDirectory()

      // const name = `${video.title.split(' ').join('_')}`
      // const fileName = `${name}.mp4`

      // const options = Platform.select({
      //   android: {
      //     addAndroidDownloads: {
      //       useDownloadManager: true,
      //       notification: true,
      //       mime: 'video/mp4',
      //       description: `${name}`,
      //       path: `${DownloadDirectoryPath}/${DIRECTORY_NAME}/${fileName}`
      //     },
      //     fileCache: true
      //   },
      //   ios: {
      //     fileCache: true,
      //     path: `${DocumentDirectoryPath}/${DIRECTORY_NAME}/${fileName}`
      //   }
      // })

      // RNFetchBlob.config(options)
      //   .fetch('GET', downloadUrl)
      //   .then(response => {
      //     console.log(response)
      //     if (Platform.OS === 'android') {
      //       RNFetchBlob.android.actionViewIntent(response.path(), 'video/mp4')
      //     }

      //     if (Platform.OS === 'ios') {
      //       RNFetchBlob.ios.openDocument(response.data)
      //     }
      //   })
      //   .catch(error => console.log(error))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    async function loadContent() {
      await requestPermission()
      await authenticate()
      fetchVideo()
    }

    loadContent()
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
