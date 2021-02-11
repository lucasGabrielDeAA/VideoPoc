import React, { useRef, useState, useEffect, useCallback } from 'react'
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
import { downloadFile, DownloadDirectoryPath } from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'

const VIMEO_ID = '510404006'

const App = () => {
  const videoRef = useRef(null)

  const [video, setVideo] = useState(null)
  const [videoURL, setVideoURL] = useState(null)
  const [thumbnail, setThumnbail] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchVideo = async () => {
    try {
      setIsLoading(true)

      // Trying to authenticate via vimeo API
      const response = await axios.post('https://api.vimeo.com/oauth/authorize/client', {
        grant_type: 'client_credentials',
        scope: 'public'
      })

      console.log(response)

      // const response = await axios.get(`https://api.vimeo.com/videos/${VIMEO_ID}`)
      // console.log(response)

      // const { data } = await axios.get(`https://player.vimeo.com/video/${VIMEO_ID}/config`)
      // const { video, request } = data

      // console.log(request)

      // setVideo(video)
      // setThumnbail(video?.thumbs['640'])
      // setVideoURL(request?.files?.hls?.cdns[request?.files?.hls?.default_cdn]?.url)
      // setIsLoading(false)
    } catch (error) {
      console.log(`Error ${error}`)
    }
  }

  const downloadVideo = useCallback(async () => {
    try {
      let downloadEnabled = false

      if (Platform.OS === 'android') {
        const permissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        ])
        downloadEnabled =
          permissions['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED
      } else {
        downloadEnabled = true
      }

      if (downloadEnabled) {
        const name = `${video.title.split(' ').join('_')}`
        const fileExtension = `${videoURL.split('?')[0].split('.').pop()}`
        const fileName = `${name}.mp4`

        const options = Platform.select({
          android: {
            addAndroidDownloads: {
              useDownloadManager: true,
              notification: true,
              mime: 'video/mp4',
              description: `${name}`,
              path: `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`
            },
            fileCache: true
          },
          ios: {
            fileCache: true,
            path: `${RNFetchBlob.fs.dirs.DocumentDir}/${fileName}`
          }
        })

        RNFetchBlob.config(options)
          .fetch('GET', videoURL)
          .then(response => {
            if (Platform.OS === 'ios') {
              RNFetchBlob.ios.openDocument(response.data)
            }
          })
          .catch(error => console.log(error))

        // const config = {
        //   fromUrl: videoURL,
        //   toFile: `${DownloadDirectoryPath}/${fileName}`
        // }

        // const response = await downloadFile(config).promise
      }
    } catch (error) {
      console.log(error)
    }
  }, [videoURL, video])

  useEffect(() => {
    fetchVideo()
  }, [])

  return (
    <>
      <StatusBar barStyle='light-content' />

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
                source={{ uri: videoURL }}
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
    height: '100%',
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
