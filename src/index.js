import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  View,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text
} from 'react-native'
import Video from 'react-native-video'
import axios from 'axios'
import { downloadFile, DocumentDirectoryPath, writeFile } from 'react-native-fs'

const VIMEO_ID = '179859217'

const App = () => {
  const videoRef = useRef(null)

  const [video, setVideo] = useState(null)
  const [videoUri, setVideoUri] = useState(null)
  const [videoUrlForDownload, setVideoUrlForDownload] = useState(null)
  const [thumbnail, setThumnbail] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchVideo = async () => {
    try {
      setIsLoading(true)

      const { data } = await axios.get(`https://player.vimeo.com/video/${VIMEO_ID}/config`)
      const { video, request } = data

      setVideo(video)
      setVideoUri(request?.files?.hls?.cdns[request?.files?.hls?.default_cdn]?.url)
      setVideoUrlForDownload(request?.files?.hls?.captions)
      setThumnbail(video?.thumbs['640'])
      setIsLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  const downloadVideo = useCallback(async () => {
    try {
      const fileName = `${video.title.split(' ').join('_')}.${videoUrlForDownload.split('.').pop()}`

      const config = {
        fromUrl: videoUri,
        toFile: `${DocumentDirectoryPath}/${fileName}`
      }

      const response = await downloadFile(config).promise

      console.log(response)
    } catch (error) {
      console.log(error)
    }
  }, [videoUrlForDownload, videoUri, video])

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
