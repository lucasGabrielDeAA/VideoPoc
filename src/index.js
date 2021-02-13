import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  PermissionsAndroid,
  Platform
} from 'react-native'
import Video from 'react-native-video'
import axios from 'axios'
import { DocumentDirectoryPath, DownloadDirectoryPath, mkdir, exists } from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'

const VIMEO_ID = '510404006'
const DIRECTORY_NAME = '.scaffold'

const App = () => {
  const videoRef = useRef(null)

  const [url, setUrl] = useState(null)
  const [thumbnail, setThumnbail] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

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
      setIsLoading(true)

      // This request needs authentication to work
      // const response = await axios.get(`https://api.vimeo.com/videos/${VIMEO_ID}`)
      // console.log(response)

      const { data } = await axios.get(`https://player.vimeo.com/video/${VIMEO_ID}/config`)
      const { video, request, user } = data

      // The user's object contains informations about authentication, tokens, etc...
      console.log(user)

      setThumnbail(video?.thumbs?.base)
      setUrl(request?.files?.hls?.cdns[request?.files?.hls?.default_cdn]?.url)
      setIsLoading(false)
    } catch (error) {
      console.log(`Error ${error}`)
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

  useEffect(() => {
    async function loadContent() {
      await requestPermission()
      fetchVideo()
    }

    loadContent()
    // authenticate()
  }, [])

  return (
    <>
      <StatusBar barStyle='dark-content' backgroundColor='#fff' />

      <SafeAreaView>
        <View style={styles.container}>
          {!isLoading && (
            <View style={styles.videoContainer}>
              <TouchableOpacity style={styles.downloadButton} onPress={downloadVideo}>
                <Text style={styles.downloadbuttonLabel}>Download</Text>
              </TouchableOpacity>

              <Video
                startInLoadingState
                controls
                muted
                ref={videoRef}
                style={styles.player}
                source={{ uri: url }}
                onBuffer={() => console.log('Buffering')}
                onLoad={() => console.log('On load end')}
                onLoadStart={() => console.log('On load start')}
                onLoadEnd={() => console.log('On load end')}
                onError={error => console.log(error)}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff'
  },
  videoContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    paddingVertical: 16
  },
  player: {
    height: 200,
    width: '100%'
  },
  downloadButton: {
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 5,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  downloadbuttonLabel: {
    color: '#fff',
    fontWeight: '700'
  }
})

export default App
