import React from 'react'
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'

const Thumbnail = ({ backgroundImage, mainAction, secondAction, ...props }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={mainAction}>
        <ImageBackground source={{ uri: backgroundImage }} style={styles.image}>
          <Text style={styles.label}>Play</Text>
        </ImageBackground>
      </TouchableOpacity>

      <TouchableOpacity onPress={secondAction} style={styles.downloadButton}>
        <Text style={styles.downloadButtonLabel}>Download</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    width: '100%'
  },
  label: {
    color: '#f00',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  downloadButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#000',
    justifyContent: 'center',
    marginVertical: 8,
    padding: 8
  },
  downloadButtonLabel: {
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase'
  }
})

Thumbnail.propTypes = {
  backgroundImage: PropTypes.string,
  mainAction: PropTypes.func,
  secondAction: PropTypes.func
}

export default Thumbnail
