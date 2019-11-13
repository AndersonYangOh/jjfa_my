import {ToastAndroid,BackHandler,NativeModules, NativeEventEmitter,DeviceEventEmitter,Alert,Platform, StyleSheet, Text, View,AppState} from 'react-native';
import codePush from "react-native-code-push";
import React, {Component} from 'react';
import { Provider } from 'mobx-react';
import AppNavigator from './src/navigation/AppNavigator';
import store from './src/mobx';
import {Request} from './src/utils/request';
import AsyncStorage from '@react-native-community/async-storage';
import {loginurl} from './src/utils/Global';
import {versionNow} from './src/utils/Global';



let flag = false;


export default class App extends Component<Props> {

  constructor(props) {
    
    super(props);
    const calendarManagerEmitter = new NativeEventEmitter(NativeModules.RNIOSExportJsToReact);
    let that = this;
    this.subscription = calendarManagerEmitter.addListener('SpotifyHelper',function(iosparam){
      if(that.refs.appnav._navigation.state.index == 2) {
        return;
      }
    

    this.state={
        push_id:props.param,
       
    }

    this.lastBackPressed = 0;
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }
    this.listener.remove();
    this.subscription.remove();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  onBackAndroid = () => {
    
    };



  _handleAppStateChange = async (nextAppState) => {
    if (nextAppState!= null && nextAppState === 'active') {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if(userInfo != null && userInfo != '') {
        const user = JSON.parse(userInfo);
        if(user != null && user.password != null && user.password != '') {
          const result = await Request.post(loginurl, {
            username: user.login,
            password: user.password
          });
          if(result == null || result.code != '001') {
            AsyncStorage.clear(function (err) {
              if (err) {
              } else {
              }
            });
            this.refs.appnav._navigation.navigate('Login');
          } else {
            this.checkVersion()
          }
        }
      }
      
    }
  }

  login =async () => {
    const userInfo = await AsyncStorage.getItem('userInfo');
    if(userInfo != null && userInfo != '') {
      const user = JSON.parse(userInfo);
      if(user != null && user.password != null && user.password != '') {
        const result = await Request.post(loginurl, {
          username: user.login,
          password: user.password
        });
        if(result == null || result.code != '001') {
          AsyncStorage.clear(function (err) {
            if (err) {
            } else {
            }
          });
          this.refs.appnav._navigation.navigate('Login');
        } else {
          if(this.state.push_id != null && this.state.push_id != 0) {
            let json = JSON.parse(this.state.push_id);  
        }   
      }
    }
  }

  componentDidMount(){
    this.login();
    let that=this;
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }

    this.listener =DeviceEventEmitter.addListener('tt_param',function(param){
      if(that.refs.appnav._navigation.state.index == 2) {
        return;
      }
      let json = JSON.parse(param); 
      });
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  handleNavigationChange = (prevState, newState, action) => {
  }

  render() {
    return (
      <Provider rootStore={store}>
        <AppNavigator ref='appnav'
          onNavigationStateChange={this.handleNavigationChange}  
          uriPrefix="/app"
        />
      </Provider>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
