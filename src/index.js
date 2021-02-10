import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  PermissionsAndroid
} from 'react-native'
import Video from 'react-native-video'
import axios from 'axios'
import { downloadFile, DownloadDirectoryPath } from 'react-native-fs'

const VIMEO_ID = '510404006'

const App = () => {
  const videoRef = useRef(null)

  const [video, setVideo] = useState(null)
  const [videoUri, setVideoUri] = useState(null)
  const [thumbnail, setThumnbail] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchVideo = async () => {
    try {
      setIsLoading(true)

      const { data } = await axios.get(`https://player.vimeo.com/video/${VIMEO_ID}/config`)
      const { video, request } = data

      setVideo(video)
      setThumnbail(video?.thumbs['640'])
      setVideoUri(request?.files?.hls?.cdns[request?.files?.hls?.default_cdn]?.url)
      setIsLoading(false)
    } catch (error) {
      console.log(error)
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
        const fileName = `${video.title.split(' ').join('_')}.${videoUri
          .split('?')[0]
          .split('.')
          .pop()}`

        const config = {
          fromUrl: videoUri,
          toFile: `${DownloadDirectoryPath}/${fileName}`
        }

        const response = await downloadFile(config).promise

        console.log(response)
      }
    } catch (error) {
      console.log(error)
    }
  }, [videoUri, video])

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
                source={{ uri: videoUri }}
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
