import React, { useState, useEffect, useCallback } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  ActivityIndicator
} from 'react-native'
import axios from 'axios'
import { DocumentDirectoryPath, DownloadDirectoryPath, mkdir, exists } from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'
import { useNavigation } from '@react-navigation/native'

import { VideoPlayer, Thumbnail } from 'src/components'

const VIMEO_ID = '510404006'

const Home = () => {
  const navigation = useNavigation()

  const [videoUrl, setVideoUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [thumbnail, setThumnbail] = useState(null)

  const authenticate = async () => {
    try {
      // Trying to authenticate via vimeo API
      const response = await axios.post('https://api.vimeo.com/oauth/authorize/client', {
        grant_type: 'client_credentials',
        scope: 'public'
      })

      console.log(response)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchVideo = async () => {
    try {
      // This request needs authentication to work
      // const response = await axios.get(`https://api.vimeo.com/videos/${VIMEO_ID}`)
      // console.log(response)
      setIsLoading(true)

      const { data } = await axios.get(`https://player.vimeo.com/video/${VIMEO_ID}/config`)
      const { video, request, user } = data

      // The user's object contains informations about authentication, tokens, etc...
      // console.log(user)

      setThumnbail(video?.thumbs['640'])
      // request?.files?.hls?.cdns?.[data.request?.files?.hls?.default_cdn]?.url
      setVideoUrl(request?.files?.hls?.cdns[request?.files?.hls?.default_cdn]?.url)
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
      await makeDirectory()

      const name = `${video.title.split(' ').join('_')}`
      const fileExtension = `${url.split('?')[0].split('.').pop()}`
      const fileName = `${name}.mp4`

      const options = Platform.select({
        android: {
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            mime: 'video/mp4',
            description: `${name}`,
            path: `${DownloadDirectoryPath}/${DIRECTORY_NAME}/${fileName}`
          },
          fileCache: true
        },
        ios: {
          fileCache: true,
          path: `${DocumentDirectoryPath}/${DIRECTORY_NAME}/${fileName}`
        }
      })

      RNFetchBlob.config(options)
        .fetch('GET', url)
        .then(response => {
          console.log(response)
          if (Platform.OS === 'android') {
            RNFetchBlob.android.actionViewIntent(response.path(), 'video/mp4')
          }

          if (Platform.OS === 'ios') {
            RNFetchBlob.ios.openDocument(response.data)
          }
        })
        .catch(error => console.log(error))
    } catch (error) {
      console.log(error)
    }
  }

  const handleNavigate = useCallback(() => {
    navigation.push('Player', { url: videoUrl })
  }, [navigation, videoUrl])

  useEffect(() => {
    async function loadContent() {
      await requestPermission()
      fetchVideo()
    }

    loadContent()
    // authenticate()
  }, [])

  return !isLoading ? (
    <Thumbnail
      backgroundImage={thumbnail}
      mainAction={() => handleNavigate()}
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
