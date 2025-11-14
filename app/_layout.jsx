import "./global.css"
import { Stack } from 'expo-router'
import Toast from "react-native-toast-message"
import {Provider} from "react-redux"
import store from './store/store'
export default function _layout() {
  return (
  <Provider store={store}>

 <Stack screenOptions={{headerShown:false}}>
  <Stack.Screen  name='(tab)' />
 </Stack>
           <Toast />

 </Provider>
  )
}