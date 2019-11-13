import React from 'react';
import { Modal, ScrollView, Linking, Platform, Image, Alert, FlatList, Text, View, Dimensions, TouchableOpacity, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Request } from '../../utils/request';
import HomeHeader from '../../components/fromKirin/HomeHeader';
import { px } from '../../utils/px';
import Colors from '../../constants/Colors';
import { versionDisplay } from '../../utils/Global';
import ShareUtils from '../../utils/ShareUtil'
const { width, height } = Dimensions.get('window');
const isIphoneX = (Platform.OS === 'ios' && (Number(((height / width) + "").substr(0, 4)) * 100) === 216);
var Xtop = 0;
const cateViewRefs = []
const cateBarRefs = []
const cateBarTextRefs = []
if (isIphoneX) {
  Xtop = 0
}
var old_Cate_index = 0;
export default class CenterScreen extends React.Component {

  constructor(props) {
    super(props);
    this.isjifen = false;
    this.jifenlock = 0;
    this.jifenpageNum = 0;
    this.jifenpageSize = 10;
    this.state = {
      userId: '',
      name: '',
      phone: '',
      email: '',
      company: '',
      department: '',
      titleList: [],
      answerList: [],
      questionList: [],
      language: '',
      isProfessor: false,
      isModal: false,
      currentPage: 0,
      currentQuestionPage: 0
    }
    this._renderEmpty = this._renderEmpty.bind(this);

    this._signOutAsync = this._signOutAsync.bind(this);
  }
  _renderEmpty() {

    return (
      <View style={{ height: 200, alignItems: 'center' }}>
        <Image style={{ marginTop: 20, width: px(233), height: px(249) }} source={require('../../images/nother.png')} />
      </View>)

  }
  _collectInfoList(item) {
    if (item.clazz == 'PLAN') {
      this.props.navigation.navigate('projectDetail', {
        itemId: item.id,
        name: item.topic
      })
    } else if (item.clazz == 'PROD') {
      this.props.navigation.navigate('productDetail', {
        itemId: item.id,
        name: item.topic
      })
    } else if (item.clazz == 'CASE') {
      this.props.navigation.navigate('contractDetail', {
        itemId: item.id,
        name: item.topic
      })
    } else if (item.clazz == 'INTE') {
      this.props.navigation.navigate('aptitudeDetail', {
        itemId: item.id,
        name: item.topic
      })
    } else if (item.clazz == 'KNOW') {
      this.props.navigation.navigate('NewsDetail', { id: item.id })
    }
  }

  _onCatepress = (index) => {

    cateViewRefs[old_Cate_index].setNativeProps({
      display: 'none',
    });
    cateBarRefs[old_Cate_index].setNativeProps({
      borderBottomWidth: 0,
    });
    cateBarTextRefs[old_Cate_index].setNativeProps({
      style: {
        color: '#000',
      }
    });
    cateViewRefs[index].setNativeProps({
      display: 'flex',
    });
    cateBarRefs[index].setNativeProps({
      borderBottomWidth: 2,
    });
    cateBarTextRefs[index].setNativeProps({
      style: {
        color: '#33a6fa',
      }


    });
    old_Cate_index = index;
  }

  componentWillMount() {
    this._getUserInfo();
  }

  async _getMyQuestion(id) {
    try {
      const result = await Request.post(`personal/question`, { userId: id, pageNum: 1, pageSize: 3 });
      if (result && result.status === 0) {

        this.setState({
          questionList: result.data.content

        })

      } else {
        Alert.alert(
          '后台数据返回失败，请重试',
          '',
          [
            { text: '确定' },
          ],
          { cancelable: false }
        )
      }
    } catch (error) {
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

  async _getMyAnswer(id) {
    try {
      const result = await Request.post(`personal/answer`, { userId: id, pageNum: 1, pageSize: 3 });
      if (result && result.status === 0) {

        this.setState({
          answerList: result.data.content

        })

      } else {
        Alert.alert(
          '后台数据返回失败，请重试',
          '',
          [
            { text: '确定' },
          ],
          { cancelable: false }
        )
      }
    } catch (error) {
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
  async _getMyDetail(id) {
    try {
      const result = await Request.post(`personal/info`, { userId: id });
      if (result && result.status === 0) {

        this.setState({
          titleList: result.data.professorTitles,
          jifen: result.data.integral,
          answerNumber: result.data.answerTimes,
          shareNumber: result.data.shareTimes,
          supportMoney: result.data.supportAmount,
          supportNumber: result.data.supportTimes,
          isProfessor: result.data.isProfessor

        })

      } else {
        Alert.alert(
          '后台数据返回失败，请重试',
          '',
          [
            { text: '确定' },
          ],
          { cancelable: false }
        )
      }
    } catch (error) {
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
  async _getUserInfo() {
    const user = await AsyncStorage.getItem('userInfo');
    const { id, name, email, phone, orgName, org2Name, org3Name } = JSON.parse(user);
    const departmentArr = [];
    if (org2Name) {
      departmentArr.push(org2Name)
    };
    if (org3Name) {
      departmentArr.push(org3Name)
    };
    this.setState({
      name,
      phone,
      email,
      company: orgName,
      department: departmentArr.join(' - '),
      tabNow: 1,
      userId: id
    })
    this.isjifen = true;
    this._getMyDetail(id)
    this._getMyQuestion(id)
    this._getMyAnswer(id)

    this.getMyInfoContext(id, 'PLAN');
    this.getMyInfoContext(id, 'CASE');
    this.getMyCollectContext(id);
    this.getMyJifenContext(false);
  }


  componentDidMount() {

  }

  async _signOutAsync() {
    const that = this;
    const userInfo = await AsyncStorage.getItem('userInfo');

    AsyncStorage.clear(function (err) {
      if (err) {
      } else {
      }
    });
    await AsyncStorage.setItem('userInfo', userInfo)
    that.props.navigation.navigate('Auth');
  };
  _changeTab1() {
    if (this.state.userId != null)
      this.getMyInfoContext(this.state.userId, 'PLAN');

    this.setState({
      tabNow: 1
    })
  }
  _changeTab2() {
    if (this.state.userId != null)
      this.getMyInfoContext(this.state.userId, 'PROD');


    this.setState({
      tabNow: 2
    })
  }
  _changeTab3() {
    if (this.state.userId != null)
      this.getMyInfoContext(this.state.userId, 'CASE');


    this.setState({
      tabNow: 3
    })
  }
  _changeTab4() {
    if (this.state.userId != null)
      this.getMyCollectContext(this.state.userId);

    this.setState({
      tabNow: 4
    })
  }
  _changeTab5() {
    if (this.state.userId != null)
      this.getMyJifenContext(false);

    this.setState({
      tabNow: 5
    })
  }
  _ewm() {

    this.setState({
      isModal: true
    })
  }
  async getMyJifenContext(ispage) {
    if (ispage) {
      this.jifenpageNum = this.jifenpageNum + 1;
    } else {
      this.jifenpageNum = 0;
    }
    if (this.isjifen) {
      try {
        const result = await Request.post(`personal/integrals`, {
          userId: this.state.userId,
          pageSize: this.jifenpageSize,
          pageNum: this.jifenpageNum,
          startTime: '',
          endTime: '',
          statistic: '',
          weekFlag: '',
          monthFlag: ''
        })
        if (result && result.status === 0) {
          let jifenlist = result.data.content.map(item => {
            return {
              id: item.linkIdid,
              time: item.time,
              subtitle: item.subTitle,
              rule: item.rule,
              type: item.type,
              title: item.title,
              value: item.value,
              click: item.click
            }
          })
          let jifenlistnow = this.state.jifenList
          if (ispage) {
            jifenlistnow = jifenlistnow.concat(jifenlist)
          } else {
            jifenlistnow = jifenlist
          }
          this.setState({
            jifenList: jifenlistnow,
          })
        } else {
          Alert.alert(
            '后台数据返回失败，请重试',
            '',
            [
              { text: '确定' },
            ],
            { cancelable: false }
          )
        }
      } catch (error) {
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
  }
  async getMyCollectContext(userId) {
    try {
      const result = await Request.post(`personal/collections`, {
        userId: userId,
        pageSize: 1000,
        pageNum: 0
      })
      if (result && result.status === 0) {
        const resulFormat = result.data.content.map(item => {
          return {
            id: item.id,
            time: item.time,
            title: item.title,
            clazz: item.clazz,
            clazzName: item.clazzName
          }
        })
        this.setState({
          collectList: resulFormat,
        })
      } else {
        Alert.alert(
          '后台数据返回失败，请重试',
          '',
          [
            { text: '确定' },
          ],
          { cancelable: false }
        )
      }
    } catch (error) {
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
  async getMyInfoContext(userId, clazz) {
    try {
      const result = await Request.post(`personal/share`, {
        userId: userId,
        clazz: clazz,
        pageSize: 1000,
        pageNum: 1
      })
      console.log('|My|=======>' + clazz + '|||' + result.data.content);
      if (result && result.status === 0) {
        if (clazz == 'PLAN') {//方案
          const resulFormat = result.data.content.map(item => {
            return {
              id: item.id,
              topic: item.topic,
              describe: item.desc
            }
          })
          this.setState({
            planList: resulFormat,
          })
        } else if (clazz == 'PROD') {
          const resulFormat = result.data.content.map(item => {
            return {
              id: item.id,
              topic: item.topic,
              describe: item.desc
            }
          })
          this.setState({
            prodList: resulFormat,
          })
        } else if (clazz == 'CASE') {
          const resulFormat = result.data.content.map(item => {
            return {
              id: item.id,
              topic: item.topic,
              describe: item.desc
            }
          })
          this.setState({
            caseList: resulFormat,
          })
        }

      } else {
        Alert.alert(
          '后台数据返回失败，请重试',
          '',
          [
            { text: '确定' },
          ],
          { cancelable: false }
        )
      }
    } catch (error) {
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

  _onAnimationAnswer(e) {
    var offsetX = e.nativeEvent.contentOffset.x;
    var currentPage = Math.floor(offsetX / (width * 0.8));
    this.setState({
      currentPage: currentPage
    })
  }
  _renderPageCircleAnswer(recentAnswer) {
    var assembly = [];
    var style;
    if (recentAnswer != null) {
      var infolist = recentAnswer;
      for (var i = 0; i < infolist.length; i++) {
        style = (i == this.state.currentPage) ? { color: '#33a6fa' } : { color: '#999999' }
        assembly.push(
          <Text key={i} style={[{ fontSize: 20 }, style]}>&bull;</Text>
        );
      }
    }
    return assembly;
  }
  _renderAllInfoViewAnswer = (that, recentAnswer) => {
    var assembly = [];
    if (recentAnswer != null) {
      var infolist = recentAnswer;
      for (var i = 0; i < infolist.length; i++) {
        var infoitem = infolist[i];
        const id = infoitem.question.id;
        assembly.push(
          <TouchableOpacity style={{ width: width * 0.85 }} onPress={() => that.props.navigation.navigate('QuestionDetail', { id: id })}>
            <Text style={{ color: '#000000', fontSize: 16 }}>{`${infoitem.question.title}`}</Text>
            <Text style={{ marginTop: px(15), justifyContent: 'center', color: '#999999', fontSize: 13 }} numberOfLines={2}>{`${infoitem.answer.content}`}</Text>
          </TouchableOpacity>
        );
      }
    }
    return assembly;
  }
  _onAnimationQuestion(e) {
    var offsetX = e.nativeEvent.contentOffset.x;
    var currentQuestionPage = Math.floor(offsetX / (width * 0.8));
    this.setState({
      currentQuestionPage: currentQuestionPage
    })
  }
  _renderPageCircleQuestion(recentAnswer) {
    var assembly = [];
    var style;
    if (recentAnswer != null) {
      var infolist = recentAnswer;
      for (var i = 0; i < infolist.length; i++) {
        style = (i == this.state.currentQuestionPage) ? { color: '#33a6fa' } : { color: '#999999' }
        assembly.push(
          <Text key={i} style={[{ fontSize: 20 }, style]}>&bull;</Text>
        );
      }
    }
    return assembly;
  }
  _renderAllInfoViewQuestion = (that, recentAnswer) => {
    var assembly = [];
    if (recentAnswer != null) {
      var infolist = recentAnswer;
      for (var i = 0; i < infolist.length; i++) {
        var infoitem = infolist[i];
        const id = infoitem.id;
        let tabarray = [];
        if (infoitem.industry.length > 3) {
          tabarray.push(infoitem.industry[0]);
          tabarray.push(infoitem.industry[1]);
          tabarray.push(infoitem.industry[2]);
        } else {
          tabarray = infoitem.industry;
        }
        assembly.push(
          <TouchableOpacity key={id} style={{ width: width * 0.85 }} onPress={() => that.props.navigation.navigate('QuestionDetail', { id: id })}>

            <Text style={{ color: '#000000', fontSize: 16 }}>{`${infoitem.title}`}</Text>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>

                {
                  tabarray.map((item) => {
                    return (
                      <Text key={item} style={{ marginTop: px(10), fontSize: px(18), color: "#999999", paddingVertical: px(5), borderRadius: 3, borderWidth: 0.5, borderColor: '#cccccc', marginRight: px(10), paddingHorizontal: px(10) }}>{item}</Text>
                    )
                  }
                  )
                }

              </View>
              <Text style={{ color: '#999999', fontSize: 13, width: 100, paddingRight: 20, textAlign: 'right' }}>{`${infoitem.createDate}`}</Text>
            </View>
          </TouchableOpacity>
        );
      }
    }
    return assembly;
  }
  shareQQ() {
    ShareUtils.share('sssss', 'http://dev.umeng.com/images/tab2_1.png', 'http://www.umeng.com/', 'title', 0, (code, message) => {
      this.setState({ result: message });

    });
  }
  shareWeixin() {
    ShareUtils.share('sssss', 'http://dev.umeng.com/images/tab2_1.png', 'http://www.umeng.com/', 'title', 2, (code, message) => {
      this.setState({ result: message });
    });
  }

  sharepengyouquan() {
    ShareUtils.share('sssss', 'http://dev.umeng.com/images/tab2_1.png', 'http://www.umeng.com/', 'title', 3, (code, message) => {
      this.setState({ result: message });
    });
  }
  sharedingd() {
    ShareUtils.share('sssss', 'http://dev.umeng.com/images/tab2_1.png', 'http://www.umeng.com/', 'title', 32, (code, message) => {
      this.setState({ result: message });
    });
  }


  _myQuestionMore(userId) {

    this.props.navigation.navigate('myQuestion', { userId: userId });
  }

  _myAnswerMore(userId) {
    this.props.navigation.navigate('myAnswer', { userId: userId });
  }
  _onEndReached() {
    this.getMyJifenContext(true);

  }
  onRequestClose() {
    this.setState({
      isModal: false
    });
  }

  handleScroll = (event) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    const scrollOffset = event.nativeEvent.contentOffset.y;

    const isEndReached = scrollOffset + scrollViewHeight >= contentHeight / 3 * 2; // 是否滑动到底部
    const isContentFillPage = contentHeight >= scrollViewHeight; // 内容高度是否大于列表高度

    if (isContentFillPage && isEndReached) {
      if (this.state.tabNow == 5) {
        this.getMyJifenContext(true);
      }
    }
  };

  render() {
    const zjicon = require('../../images/profess_icon.png')
    const job = require('../../images/comp.png')
    const phone = require('../../images/phone.png')
    const email = require('../../images/email.png')
    const avatar = null
    const setting = require('../../images/setting.png')
    const download = require('../../images/download.png')
    const zhuanjiaicon = require('../../images/zhuanjialeft.png')
    const zhuanjiazi = require('../../images/zhuanjiaright.png')
    const more = require('../../images/more.png')
    const erweima = require('../../images/erweima.png')
    const mycer = require('../../images/my_cer.png')
    const mylogin = require('../../images/my_login.png')
    const myshare = require('../../images/my_share.png')
    const mysupport = require('../../images/my_support.png')
    const planlist = this.state.planList;
    const caselist = this.state.caseList;
    const prodlist = this.state.prodList;
    const collectList = this.state.collectList;
    const jifenList = this.state.jifenList;
    /* const tabs = [
      { title: '动态' },
      { title: '方案' },
      { title: '收藏' },
      { title: '浏览' },
      { title: '动态' },
      { title: '方案' },
      { title: '收藏' },
      { title: '浏览' }
    ]; */
    const style = {
      minHeight: 150,
      backgroundColor: '#fff',
    };


    return (

      <View style={{ height: '100%', flexDirection: 'column', backgroundColor: '#fff', justifyContent: 'flex-start' }}>
        <HomeHeader
          theme='dark'
          left={
            <TouchableOpacity onPress={this._signOutAsync} style={{ padding: px(30) }}>
              {
                false &&
                <Image source={setting} style={{ zIndex: 1000, width: px(44), height: px(44) }}></Image>
              }
              <View style={{ zIndex: 1000, height: px(44), justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 16 }}>退出登录</Text>

              </View>
            </TouchableOpacity>
          }
          right={
            <View style={{ width: width * 0.6, alignItems: 'flex-end' }}>
              <TouchableOpacity style={{ padding: px(30), width: 30, }} onPress={() => this._ewm()}>
                <Image source={erweima} style={{ width: 18, height: 18, justifyContent: 'flex-end' }}></Image>
              </TouchableOpacity>
            </View>
          }
        />

        <ScrollView style={{}} onScrollEndDrag={this.handleScroll} stickyHeaderIndices={[5]}>

          <View style={{ width: px(750), height: px(265), backgroundColor: Colors.darkHeader }} />

          <View style={{ position: 'absolute', top: Xtop + px(22), right: 40, zIndex: 1000, width: px(180), height: px(180) }}>
            <View style={{ width: px(180), height: px(180), borderRadius: px(90), backgroundColor: Colors.mainColorV2, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 28 }}>{this.state.name.slice(this.state.name.length - 2, this.state.name.length)}</Text>
            </View>
            {
              avatar &&
              <Image source={avatar} style={{ width: px(180), height: px(180), borderRadius: px(90), borderColor: 'white', borderWidth: px(4) }}></Image>
            }
          </View>
          <View style={{
            shadowColor: '#333',
            shadowOffset: { h: px(20), w: px(20) },
            shadowRadius: px(10),
            shadowOpacity: 0.2,
            backgroundColor: 'white',
            marginHorizontal: px(30),
            marginTop: -px(153),
            borderRadius: px(10), width: width - px(60),
            paddingTop: px(50), paddingHorizontal: px(30), paddingBottom: px(40)
          }}>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Text style={{ fontSize: 22, color: "#000" }}>{this.state.name}</Text>
              {
                this.state.isProfessor &&
                <Image source={zjicon} style={{ marginLeft: 8, width: 45, height: 17, marginTop: 2 }}></Image>
              }
              <Image source={zhuanjiaicon} style={{ marginLeft: 8, width: 22, height: 19, marginTop: 2 }} resizeMode='stretch'></Image>
              <ImageBackground style={{ width: 40, height: 14, marginLeft: -4, marginTop: 2, paddingLeft: px(3) }} resizeMode='stretch' source={zhuanjiazi}>
                <Text style={{ fontSize: 9, color: "#fff", marginTop: 1, textAlign: 'center' }}>{this.state.jifen / 1000 >= 1 ? Math.floor(this.state.jifen / 1000) + 'k' : this.state.jifen}积分</Text>
              </ImageBackground>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 18, justifyContent: 'flex-start' }}>
              <Image source={job} style={{ width: 14, height: 14 }}></Image>
              <Text style={{ fontSize: 14, marginLeft: 15, color: "#000000" }}>{this.state.company}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 18, justifyContent: 'flex-start' }}>
              <Image source={job} style={{ width: 14, height: 14 }}></Image>
              <Text style={{ flex: 1, fontSize: 14, marginLeft: 15, color: "#666666" }}>{this.state.department}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 18, justifyContent: 'flex-start' }}>
              <Image source={phone} style={{ marginTop: 2, width: 14, height: 14 }}></Image>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL(`tel:${this.state.phone}`)
                }}>
                <Text style={{ fontSize: 14, marginLeft: 15, color: "#666666" }}>{this.state.phone}</Text></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 18, justifyContent: 'flex-start' }}>
              <Image source={email} style={{ marginTop: 2, width: 14, height: 14 }}></Image>
              <Text style={{ fontSize: 14, marginLeft: 15, color: "#666666" }} selectable={true}>{this.state.email}</Text>
            </View>
            {this.state.titleList != null &&
              <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: px(15) }}>
                {this.state.titleList.map((info) => {
                  return (
                    <View style={{ borderWidth: px(1), borderColor: '#999999', margin: px(5) }}>
                      <Text style={{ color: '#999999', fontSize: 9, margin: px(5) }}>{info.type}</Text>
                    </View>
                  );
                })}
              </View>
            }
            <View>
              <Text style={{ height: px(0.5), marginTop: 10, justifyContent: 'center', color: Colors.darkText, backgroundColor: '#e8e8e8' }}></Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center', justifyContent: 'space-around' }}>
              <View>
                <Text style={{ fontSize: 16, color: "#000000", textAlign: 'center' }}>{this.state.supportNumber}</Text>
                <Text style={{ fontSize: 12, color: "#666666", marginTop: 5 }}>支撑次数</Text>
              </View>
              <View>
                {this.state.supportMoney / 100000000 >= 1 &&
                  <Text style={{ fontSize: 16, color: "#000000", textAlign: 'center' }}>
                    {Math.floor((this.state.supportMoney / 100000000) * 100) / 100 + '亿'}
                  </Text>
                }
                {this.state.supportMoney / 100000000 < 1 && this.state.supportMoney / 10000 >= 1 &&
                  <Text style={{ fontSize: 16, color: "#000000", textAlign: 'center' }}>
                    {Math.floor((this.state.supportMoney / 10000) * 100) / 100 + '万'}
                  </Text>
                }
                {this.state.supportMoney < 10000 &&
                  <Text style={{ fontSize: 16, color: "#000000", textAlign: 'center' }}>
                    {this.state.supportMoney}
                  </Text>

                }
                {this.state.supportMoney == null &&
                  <Text style={{ fontSize: 16, color: "#000000", textAlign: 'center' }}>
                    {this.state.supportMoney}
                  </Text>

                }
                <Text style={{ fontSize: 12, color: "#666666", marginTop: 5 }}>支撑金额</Text>
              </View>
              <View>
                <Text style={{ fontSize: 16, color: "#000000", textAlign: 'center' }}>{this.state.shareNumber / 1000 >= 1 ? Math.floor(this.state.shareNumber / 1000) + 'k' : this.state.shareNumber}</Text>
                <Text style={{ fontSize: 12, color: "#666666", marginTop: 5 }}>分享</Text>
              </View>
              <View>
                <Text style={{ fontSize: 16, color: "#000000", textAlign: 'center' }}>{this.state.answerNumber / 1000 >= 1 ? Math.floor(this.state.answerNumber / 1000) + 'k' : this.state.answerNumber}</Text>
                <Text style={{ fontSize: 12, color: "#666666", marginTop: 5 }}>回答</Text>
              </View>
            </View>
          </View>

        

          <View style={{
            shadowColor: '#333',
            shadowOffset: { h: px(20), w: px(20) },
            shadowRadius: px(10),
            shadowOpacity: 0.2,
            backgroundColor: 'white',
            marginHorizontal: px(30),
            marginTop: 12,
            borderRadius: px(10), width: width * 0.92,
            paddingTop: px(30), paddingHorizontal: px(30), paddingBottom: px(20)
          }}>
            <View style={{ marginTop: 10, flexDirection: 'row' }}>
              <Text style={{ fontSize: 16, color: "#000000" }}>我的回答</Text>
              {<TouchableOpacity style={{ flexDirection: 'row', flex: 1, marginRight: 6, marginBottom: 5, alignItems: 'center', justifyContent: 'flex-end' }} onPress={() => this._myAnswerMore(this.state.userId)}>
                <Text style={{ fontSize: 13, color: "#666666", textAlign: "right" }}>更多</Text>
                <Image source={more} style={{ width: 8, height: 12, marginLeft: 6 }}></Image>
              </TouchableOpacity>}
            </View>
            <Text style={{ height: px(0.5), marginTop: 8, marginBottom: 8, justifyContent: 'center', color: Colors.darkText, backgroundColor: '#e8e8e8' }}></Text>
            <ScrollView horizontal={true}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => this._onAnimationAnswer(e)}
              pagingEnabled={true}>
              {this._renderAllInfoViewAnswer(this, this.state.answerList)}
            </ScrollView>
            <View style={{ height: 25, justifyContent: 'center', backgroundColor: '#ffffff', bottom: 0, flexDirection: 'row', flex: 1, alignItems: 'center' }}>
              {this._renderPageCircleAnswer(this.state.answerList)}
            </View>
          </View>

          <View style={{
            shadowColor: '#333',
            shadowOffset: { h: px(20), w: px(20) },
            shadowRadius: px(10),
            shadowOpacity: 0.2,
            backgroundColor: 'white',
            marginHorizontal: px(30),
            marginTop: 12,
            marginBottom: 15,
            borderRadius: px(10), width: width * 0.92,
            paddingTop: px(30), paddingHorizontal: px(30), paddingBottom: px(20)
          }}>
            <View style={{ marginTop: 10, flexDirection: 'row' }}>
              <Text style={{ fontSize: 16, color: "#000000" }}>我的提问</Text>
              {<TouchableOpacity style={{ flexDirection: 'row', flex: 1, marginRight: 6, marginBottom: 5, alignItems: 'center', justifyContent: 'flex-end' }} onPress={() => this._myQuestionMore(this.state.userId)}>
                <Text style={{ fontSize: 13, color: "#666666", textAlign: "right" }}>更多</Text>
                <Image source={more} style={{ width: 8, height: 12, marginLeft: 6 }}></Image>
              </TouchableOpacity>}
            </View>
            <Text style={{ height: px(0.5), marginTop: 8, marginBottom: 8, justifyContent: 'center', color: Colors.darkText, backgroundColor: '#e8e8e8' }}></Text>
            <ScrollView horizontal={true}
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => this._onAnimationQuestion(e)}
              pagingEnabled={true}>
              {this._renderAllInfoViewQuestion(this, this.state.questionList)}
            </ScrollView>
            <View style={{ height: 25, justifyContent: 'center', backgroundColor: '#ffffff', bottom: 0, flexDirection: 'row', flex: 1, alignItems: 'center' }}>
              {this._renderPageCircleQuestion(this.state.questionList)}
            </View>
          </View>



          <View>
            <View style={{ backgroundColor: 'white', width: width, flexDirection: 'row' }}>
              <TouchableOpacity style={{ width: '20%', alignItems: 'center' }} onPress={() => this._changeTab1()}>

                {this.state.tabNow === 1 ?
                  <Text style={{ marginTop: 18, marginBottom: 18, fontSize: 16, color: "#33a6fa" }}>方案</Text>
                  :
                  <Text style={{ marginTop: 18, marginBottom: 18, fontSize: 16, color: "#000000" }}>方案</Text>
                }
                <View style={[(this.state.tabNow === 1) && { width: '30%' }, { position: 'absolute' },
                { bottom: (0) }, { marginTop: px(15) },
                { height: px(6) },
                { backgroundColor: Colors.mainColorV2 }]}></View>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: '20%', alignItems: 'center' }} onPress={() => this._changeTab2()}>
                {this.state.tabNow === 2 ?
                  <Text style={{ marginTop: 18, marginBottom: 18, fontSize: 16, color: "#33a6fa" }}>产品</Text>
                  :
                  <Text style={{ marginTop: 18, marginBottom: 18, fontSize: 16, color: "#000000" }}>产品</Text>
                }
                <View style={[(this.state.tabNow === 2) && { width: '30%' }, { position: 'absolute' },
                { bottom: (0) }, { marginTop: px(15) },
                { height: px(6) },
                { backgroundColor: Colors.mainColorV2 }]}></View>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: '20%', alignItems: 'center' }} onPress={() => this._changeTab3()}>
                {this.state.tabNow === 3 ?
                  <Text style={{ marginTop: 18, marginBottom: 18, fontSize: 16, color: "#33a6fa" }}>案例</Text>
                  :
                  <Text style={{ marginTop: 18, marginBottom: 18, fontSize: 16, color: "#000000" }}>案例</Text>
                }
                <View style={[(this.state.tabNow === 3) && { width: '30%' }, { position: 'absolute' },
                { bottom: (0) }, { marginTop: px(15) },
                { height: px(6) },
                { backgroundColor: Colors.mainColorV2 }]}></View>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: '20%', alignItems: 'center' }} onPress={() => this._changeTab4()}>
                {this.state.tabNow === 4 ?
                  <Text style={{ marginTop: 18, marginBottom: 18, fontSize: 16, color: "#33a6fa" }}>收藏</Text>
                  :
                  <Text style={{ marginTop: 18, marginBottom: 18, fontSize: 16, color: "#000000" }}>收藏</Text>
                }
                <View style={[(this.state.tabNow === 4) && { width: '30%' }, { position: 'absolute' },
                { bottom: (0) }, { marginTop: px(15) },
                { height: px(6) },
                { backgroundColor: Colors.mainColorV2 }]}></View>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: '20%', alignItems: 'center' }} onPress={() => this._changeTab5()}>
                {this.state.tabNow === 5 ?
                  <Text style={{ marginTop: 18, marginBottom: 18, fontSize: 16, color: "#33a6fa" }}>积分</Text>
                  :
                  <Text style={{ marginTop: 18, marginBottom: 18, fontSize: 16, color: "#000000" }}>积分</Text>
                }
                <View style={[(this.state.tabNow === 5) && { width: '30%' }, { position: 'absolute' },
                { bottom: (0) }, { marginTop: px(15) },
                { height: px(6) },
                { backgroundColor: Colors.mainColorV2 }]}></View>
              </TouchableOpacity>
            </View>
            <Text style={{ height: px(0.5), marginBottom: px(15), justifyContent: 'center', color: Colors.darkText, backgroundColor: '#e8e8e8' }}></Text>

          </View>
          {
            (this.state.tabNow === 1) && (
              <FlatList
                ref="planList"
                numColumns='1'
                ListEmptyComponent={this._renderEmpty}
                data={planlist}
                horizontal={false}
                renderItem={({ item }) =>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.navigate('projectDetail', {
                      itemId: item.id,
                      name: item.topic
                    })}>
                    <View style={{ backgroundColor: '#ffffff', marginLeft: px(20), marginTop: px(20), marginRight: px(20), padding: px(10), borderRadius: px(10) }}>
                      <Text style={{ color: '#000000', fontSize: 16 }}>{`${item.topic}`}</Text>
                      <Text style={{ marginTop: px(15), justifyContent: 'center', color: '#999999', fontSize: 13 }} numberOfLines={2}>{`${item.describe}`}</Text>
                      <Text style={{ height: px(0.5), marginTop: px(15), justifyContent: 'center', color: Colors.darkText, backgroundColor: '#e8e8e8' }}></Text>
                    </View>
                  </TouchableOpacity>
                }
              />
            )
          }
          {
            (this.state.tabNow === 2) && (
              <FlatList
                ref="prodList"
                numColumns='1'
                ListEmptyComponent={this._renderEmpty}
                data={prodlist}
                horizontal={false}
                renderItem={({ item }) =>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.navigate('productDetail', {
                      itemId: item.id,
                      name: item.topic
                    })}>
                    <View style={{ backgroundColor: '#ffffff', marginLeft: px(20), marginTop: px(20), marginRight: px(20), padding: px(10), borderRadius: px(10) }}>
                      <Text style={{ color: '#000000', fontSize: 16 }}>{`${item.topic}`}</Text>
                      <Text style={{ marginTop: px(15), justifyContent: 'center', color: '#999999', fontSize: 13 }} numberOfLines={2}>{`${item.describe}`}</Text>
                      <Text style={{ height: px(0.5), marginTop: px(15), justifyContent: 'center', color: Colors.darkText, backgroundColor: '#e8e8e8' }}></Text>
                    </View>
                  </TouchableOpacity>
                }
              />
            )
          }
          {
            (this.state.tabNow === 3) && (
              <FlatList
                ref="caseList"
                numColumns='1'
                ListEmptyComponent={this._renderEmpty}
                data={caselist}
                horizontal={false}
                renderItem={({ item }) =>
                  <TouchableOpacity
                    onPress={() => this.props.navigation.navigate('contractDetail', {
                      itemId: item.id,
                      name: item.topic
                    })}>
                    <View style={{ backgroundColor: '#ffffff', marginLeft: px(20), marginTop: px(20), marginRight: px(20), padding: px(10), borderRadius: px(10) }}>
                      <Text style={{ color: '#000000', fontSize: 16 }}>{`${item.topic}`}</Text>
                      <Text style={{ marginTop: px(15), justifyContent: 'center', color: '#999999', fontSize: 13 }} numberOfLines={2}>{`${item.describe}`}</Text>
                      <Text style={{ height: px(0.5), marginTop: px(15), justifyContent: 'center', color: Colors.darkText, backgroundColor: '#e8e8e8' }}></Text>
                    </View>
                  </TouchableOpacity>
                }
              />
            )
          }
          {
            (this.state.tabNow === 4) && (
              <FlatList
                ref="collectList"
                numColumns='1'
                ListEmptyComponent={this._renderEmpty}
                data={collectList}
                horizontal={false}
                renderItem={({ item }) =>
                  <TouchableOpacity style={{ paddingRight: 15 }}
                    onPress={() => this._collectInfoList(item)}>
                    <View style={{ backgroundColor: '#ffffff', marginLeft: px(20), marginTop: px(20), borderRadius: px(10) }}>
                      <View style={{ flexDirection: 'row', marginTop: px(15) }}>
                        {item.clazz == 'PLAN' &&
                          <View style={{ position: 'absolute', top: 2, marginRight: 5, borderRadius: 5, backgroundColor: '#33a6fa', height: 18, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                            <Text style={{ color: '#ffffff', lineHeight: 16, fontSize: 10, fontWeight: 'bold', textAlign: 'center', paddingLeft: 5, paddingRight: 5 }}>{`${item.clazzName}`}</Text>
                          </View>
                        }
                        {item.clazz == 'PROD' &&
                          <View style={{ position: 'absolute', top: 2, marginRight: 5, borderRadius: 5, backgroundColor: '#ff6933', height: 18, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                            <Text style={{ color: '#ffffff', lineHeight: 16, fontSize: 10, fontWeight: 'bold', textAlign: 'center', paddingLeft: 5, paddingRight: 5 }}>{`${item.clazzName}`}</Text>
                          </View>
                        }
                        {item.clazz == 'CASE' &&
                          <View style={{ position: 'absolute', top: 2, marginRight: 5, borderRadius: 5, backgroundColor: '#0ac89d', height: 18, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                            <Text style={{ color: '#ffffff', lineHeight: 16, fontSize: 10, fontWeight: 'bold', textAlign: 'center', paddingLeft: 5, paddingRight: 5 }}>{`${item.clazzName}`}</Text>
                          </View>
                        }
                        {item.clazz == 'INTE' &&
                          <View style={{ position: 'absolute', top: 2, marginRight: 5, borderRadius: 5, backgroundColor: '#ff2236', height: 18, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                            <Text style={{ color: '#ffffff', lineHeight: 16, fontSize: 10, fontWeight: 'bold', textAlign: 'center', paddingLeft: 5, paddingRight: 5 }}>{`${item.clazzName}`}</Text>
                          </View>
                        }
                        {item.clazz == 'KNOW' &&
                          <View style={{ position: 'absolute', top:2, marginRight: 5, borderRadius: 5, backgroundColor: '#5052c7', height: 18, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{ color: '#ffffff', lineHeight: 16, fontSize: 10, fontWeight: 'bold', textAlign: 'center', paddingLeft: 5, paddingRight: 5 }}>资讯</Text>
                          </View>
                        }
                        <Text style={{ color: '#000000', lineHeight: 20, fontSize: 16 }} numberOfLines={2}> {"       " + `${item.title}`}</Text>
                      </View>
                      <Text style={{ marginTop: px(15), justifyContent: 'center', color: '#999999', fontSize: 13 }}>收藏时间：{`${item.time}`}</Text>
                      <Text style={{ height: px(0.5), marginTop: px(15), justifyContent: 'center', color: Colors.darkText, backgroundColor: '#e8e8e8' }}></Text>
                    </View>
                  </TouchableOpacity>
                }
              />
            )
          }
          {
            (this.state.tabNow === 5) && (
              <FlatList style={{}}
                data={jifenList}
                ListEmptyComponent={this._renderEmpty}
                renderItem={({ item }) =>
                  <View>
                    <View style={{ flexDirection: 'row', marginTop: 20, marginLeft: 20 }}>
                      {item.type == '登录学习' &&
                        <Image source={mylogin} style={{ zIndex: 1000, width: px(44), height: px(44) }}></Image>
                      }
                      {item.type == '能力分享' &&
                        <Image source={myshare} style={{ zIndex: 1000, width: px(44), height: px(44) }}></Image>
                      }
                      {item.type == '商机支撑' &&
                        <Image source={mysupport} style={{ zIndex: 1000, width: px(44), height: px(44) }}></Image>
                      }
                      {item.type == '能力认证' &&
                        <Image source={mycer} style={{ zIndex: 1000, width: px(44), height: px(44) }}></Image>
                      }
                      <View style={{ flex: 1, backgroundColor: '#ffffff', marginLeft: px(20), marginRight: px(20), borderRadius: px(10) }}>
                        <Text style={{ color: '#000000', marginBottom: 10, fontSize: 16 }}>{`${item.title}`}</Text>
                        <Text style={{ justifyContent: 'center', marginBottom: 10, color: '#999999', fontSize: 13 }} numberOfLines={2}>{`${item.subtitle}`}</Text>
                        <Text style={{ justifyContent: 'center', color: '#999999', fontSize: 10 }}>{`${item.time}`}</Text>
                      </View>
                      <View style={{ width: 30, alignItems: 'center', marginRight: 10, justifyContent: 'center' }}>
                        <Text style={{ color: '#ff6933', fontSize: 20, textAlign: 'center' }}>+{`${item.value}`}</Text>
                      </View>
                    </View>

                    <Text style={{ textAlign: 'right', height: px(0.5), marginTop: px(30), justifyContent: 'center', color: Colors.darkText, backgroundColor: '#e8e8e8' }}></Text>

                  </View>
                }
              />
            )
          }

          <Modal
            animationType={"none"}         // 从底部滑入
            transparent={true}               // 不透明
            visible={this.state.isModal}    // 根据isModal决定是否显示
          // onRequestClose={() => {this.onRequestClose()}}  // android必须实现
          >
            <TouchableOpacity style={{ alignItems: 'center', flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center' }} onPress={() => this.onRequestClose()}>
              <View style={{ backgroundColor: '#fff', width: width * 0.9, alignItems: 'center', paddingBottom: 30 }}>
                <Image source={download} resizeMode="contain" style={{ zIndex: 1000, width: px(370) }}></Image>
                <Text style={{ fontSize: 20, marginBottom: px(10) }}>下载创新头条客户端</Text>
                <Text>{versionDisplay}</Text>
              </View>
            </TouchableOpacity>
          </Modal>

        </ScrollView>
      </View >
    )
  }
}