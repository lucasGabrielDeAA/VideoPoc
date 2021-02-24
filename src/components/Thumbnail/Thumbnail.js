import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'

const Thumbnail = ({ backgroundImage, mainAction, secondAction, ...props }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={mainAction}>
        <Image source={{ uri: backgroundImage }} style={styles.image} />
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
    height: 200,
    width: '100%'
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
