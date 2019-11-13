import React from 'react';
import { DeviceEventEmitter, Alert, Linking, Modal, FlatList, ScrollView, Dimensions, TouchableOpacity, Image, TextInput, Platform, StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/Colors.js';
import { px } from '../../utils/px';
import { Request } from '../../utils/request';
import { SafeAreaView } from 'react-navigation';
import Header from '../../components/fromKirin/Header';
const { width, height } = Dimensions.get('window');
import AsyncStorage from '@react-native-community/async-storage';
import Filter from '../../components/fromKirin/Filter';


export default class Myquestions extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerBackTitle: null,
    };
  };

  constructor(props) {
    super(props);
    this.userId = this.props.navigation.getParam('userId', '111');
    this.lock = 0;
    this.pageNum = 1;
    this.pageSize = 10;
    this.state = {
      sort: 1,
      filterNow: new Map(),
      filterItems: {
        industry: ''
      },
      userId: this.userId,
      questionlist: [],
      top: 0
    }
  }
  componentWillMount() {

    this._getUserInfo();
    setTimeout(() => {
      this.loadQuestions();
    }, 100)

  }

  async _getUserInfo() {
    const userInfo = await AsyncStorage.getItem('userInfo');
    const { id } = JSON.parse(userInfo);
    this.setState({
      userId: id,
    })
  }
  componentDidMount() {
    this.subscription = DeviceEventEmitter.addListener("EventType", (param) => {
      //this.loadQuestions()
    });
  }
  componentWillUnmount() {
    this.subscription.remove();
  }
  _onEndReached = () => {
    this.loadQuestions(true);
  
  }
  loadQuestions = async (page) => {
    
    if (page) {
      this.pageNum = this.pageNum + 1;
    } else {
      this.pageNum = 1;
    }
    if (this.lock == 1)
      return;
    this.lock = 1;
    try {
      const result = await Request.post(`personal/question`, {
        userId: this.state.userId,
        pageSize: this.pageSize,
        pageNum: this.pageNum
      });
      if (result != null && result.status === 0) {
        let questionlist = result.data.content == null ? [] : result.data.content
        let questionlistnow = this.state.questionlist
        if (page) {
          questionlistnow = questionlistnow.concat(questionlist)
        } else {
          questionlistnow = questionlist
        }
        this.setState({
          questionlist: questionlistnow
        })
      }else if(result.status === 500){

      } else {
        Alert.alert(
          '出错啦',
          respDesc,
          [
            { text: '确定' },
          ],
          { cancelable: false }
        )
      }
      this.lock = 0;
    } catch (err) {
      this.lock = 0;
      Alert.alert(
        '请求后台服务失败，请重试',
        '',
        [
          { text: '确定' },
        ],
        { cancelable: false }
      )
    }
  }

  _godetail = (item) => {
    this.props.navigation.navigate('QuestionDetail', {
      id: item.id
    });
  }

  _keyExtractor = (item) => item.id;
  layout = (e) => {
    this.setState({
      top: e.layout.y
    })
  }
  render() {
    return (
      <SafeAreaView forceInset={{ top: 'never' }} style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff' }}>
        <Header title="我的提问" />
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <FlatList style={{ paddingLeft: 15, paddingRight: 15 }}
            data={this.state.questionlist}
            ListEmptyComponent={this._renderEmpty}
            onEndReachedThreshold={1}
            onEndReached={this._onEndReached}
            renderItem={({ item }) => {
              const info = item.industry;

              return (
                <TouchableOpacity onPress={() => this._godetail(item)} style={{ borderRadius: px(10), paddingLeft: 15, paddingRight: 15, marginTop: px(20), backgroundColor: 'white', borderBottomWidth: px(1), paddingBottom: px(10), borderBottomColor: '#eee' }}>
                  <View style={{ borderBottomColor: '#e8e8e8', borderBottomWidth: px(1), paddingVertical: px(30) }}>
                    <Text style={{ fontSize: 15, lineHeight: px(40), marginBottom: px(20) }}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {
                        info.map((item) => {
                          return (
                            <Text key={item.id} style={{ marginTop: px(10), fontSize: px(18), color: "#999999", paddingVertical: px(5), borderRadius: 3, borderWidth: 0.5, borderColor: '#cccccc', marginRight: px(10), paddingHorizontal: px(10) }}>{item}</Text>
                          )
                        })
                      }
                    </View>
                  </View>
                  <View style={{ paddingTop: px(20), flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#666666', fontSize: 13, marginBottom: px(13) }}></Text>
                    <Text style={{ color: '#666666', fontSize: 13, marginBottom: px(13) }}>{item.createDate}</Text>
                  </View>
                </TouchableOpacity>
              )
            }
            }
            keyExtractor={this._keyExtractor}
          />
        </View>
      </SafeAreaView>
    );
  }
}


const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        /* shadowColor: 'black',
        
        shadowOffset: { height: -3 },
        shadowOpacity: 0.7,
        shadowRadius: 3, */
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowOffset: {
          width: 0,
          height: 0.5
        },
        shadowRadius: 5,
        shadowOpacity: 1
      },
      android: {

      },
    })
  }
});


const filterStyles = StyleSheet.create({

  filterBtn: {
    borderRadius: px(25),
    backgroundColor: Colors.backgroundV2,
    paddingHorizontal: px(20),
    height: px(50),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },

})