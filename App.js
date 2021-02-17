import React, { useEffect } from 'react'
import { StatusBar, ActivityIndicator, Platform } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'

import Routes from './Routes'

export default () => (
  <SafeAreaProvider>
    <NavigationContainer>
      <StatusBar backgroundColor='#fff' barStyle='dark-content' />

      <Routes />
    </NavigationContainer>
  </SafeAreaProvider>
)
