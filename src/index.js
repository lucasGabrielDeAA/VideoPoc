import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import Video from 'react-native-video'
import axios from 'axios'

const VIMEO_ID = '179859217'

const App = () => {
  const videoRef = useRef(null)

  const [video, setVideo] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [thumbnail, setThumnbail] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function fetchVideo() {
    try {
      setIsLoading(true)

      const { data: { video, request } } = await axios.get(`https://player.vimeo.com/video/${VIMEO_ID}/config`)

      setVideo(video)
      setVideoUrl(request?.files?.hls?.cdns[request?.files?.hls?.default_cdn]?.url)
      setThumnbail(video?.thumbs['640'])
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVideo()
  }, [])

  return (
    <SafeAreaView>
      {isLoading ? (
        <ActivityIndicator size="small" color="#ddd" />
      ) : (
        <Video
          startInLoadingState
          controls
          fullscreen
          fullscreenOrientation="landscape"
          ref={videoRef}
          style={styles.player}
          source={{ uri: videoUrl }}
          onBuffer={() => console.log("Buffering")}
          onLoad={() => console.log("On load end")}
          onLoadStart={() => console.log("On load start")}
          onLoadEnd={() => console.log("On load end")}
          onError={error => console.log(error)}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  player: {
    height: "100%",
    width: "100%"
  },
});

export default App;
