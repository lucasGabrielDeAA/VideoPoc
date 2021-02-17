import React, { useState, useEffect } from 'react'
import { StatusBar, StyleSheet, Text, Platform, Dimensions } from 'react-native'
import IOSVideoPlayer from 'react-native-video'
import AndroidVideoPlayer from 'react-native-video-controls'
import Orientation from 'react-native-orientation-locker'
import PropTypes from 'prop-types'

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen')

const DIRECTORY_NAME = '.scaffold'

const VideoPlayer = ({ url, ...props }) => {
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (fullscreen) {
      Orientation.lockToLandscape()
      StatusBar.setHidden(true)
    }

    return () => {
      Orientation.lockToPortrait()
      StatusBar.setHidden(false)
    }
  }, [fullscreen])

  return Platform.OS === 'ios' ? (
    <IOSVideoPlayer
      controls
      fullscreen={fullscreen}
      style={fullscreen ? styles.fullscreen : styles.player}
      source={{ uri: url }}
    />
  ) : (
    <AndroidVideoPlayer
      disableBack
      toggleResizeModeOnFullscreen={false}
      source={{ uri: url }}
      fullscreen={fullscreen}
      controlTimeout={5000}
      style={fullscreen ? styles.fullscreen : styles.player}
      onEnterFullscreen={() => setFullscreen(true)}
      onExitFullscreen={() => setFullscreen(false)}
    />
  )
}

const styles = StyleSheet.create({
  player: {
    height: 200,
    width: '100%'
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 99,
    elevation: 99,
    backgroundColor: '#000',
    width: screenHeight,
    height: screenWidth
  },
  downloadButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#000',
    borderRadius: 5,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  downloadbuttonLabel: {
    color: '#fff',
    fontWeight: '700'
  }
})

VideoPlayer.propTypes = {
  url: PropTypes.string
}

export default VideoPlayer
