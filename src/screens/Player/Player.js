import React from 'react'
import { View, StyleSheet } from 'react-native'
import { VideoPlayer } from 'src/components'

const Player = ({ route }) => {
  const {
    params: { url }
  } = route

  return (
    <View style={styles.container}>
      <VideoPlayer url={url} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

export default Player
