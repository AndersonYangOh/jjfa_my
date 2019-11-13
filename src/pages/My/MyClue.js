import React from 'react';
import {px} from '../../utils/px';
import {Request} from '../../utils/request';
import {
  Platform,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Image,
  Alert,
  Text
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { log, logWarm, logError } from '../../utils/logs';

import { SafeAreaView } from 'react-navigation';
import Filter from '../../components/fromKirin/Filter';
import Header from '../../components/fromKirin/Header';
import Profile from '../../components/fromKirin/Profile';
import DTItem from '../../components/fromHan/DTItem';
import Colors from '../../constants/Colors';
import VerticalCard from '../../components/fromKirin/VerticalCard';


export default class ProjectHome extends React.Component {

  constructor(props) {
    super(props);
    let filterNow = new Map();
    let filterItems= {
      industry: '',
      source: '',
      reqKeywords: ''
    };
    // this.fiveG = this.props.navigation.getParam('fiveG',false);
    // if(this.fiveG) {
    //   filterNow.set('industry',new Map().set('100018',true))
    //   filterItems.industry = ['100018']
    // }
    this.state = {
      isLoading: false,
      clueList: [
        {
          clueId: 22,
          clueName: '黄山市公共安全视频大数据系统（雪亮工程）项目解析、应用、安全级1急急急急急急急急急',
          dept: '中国联通总部-产业互联网产品中心',
          custManager: '王小小',
          contactName: 'hhhh',
          state: '已转商机'
        },
        {
          clueId: 23,
          clueName: '黄山市公共安全视频大数据系统（雪亮工程）项目解析、应用、安全级1急急急急急急急急急',
          dept: '中国联通总部-产业互联网产品中心',
          custManager: '王小小',
          contactName: 'hhhh',
          state: '已转商机'
        },
        
      ],
      filterItems: filterItems,
      pageNum: 1,
      filterNow: filterNow
    }
    this.filters = [
      {
        name: '所属行业',
        value: 'industry',
        options: [
          {
            name: '全部',
            value :'1000'
          },
          {
            name: '金融业',
            value :'1001'
          },
          {
            name: '党政军部门',
            value: '1002'
          },
          {
            name: '公共服务业',
            value: '1006'
          },
          {
            name: '批发、零售业',
            value: '1008'
          },
          {
            name: '房地产业',
            value: '1009'
          },
          {
            name: '建筑业',
            value: '1010'
          },
          {
            name: '计算机信息业',
            value: '1011'
          },
          {
            name: '农林牧副渔',
            value: '1012'
          },
          {
            name: '其他',
            value: '1013'
          },
          {
            name: '交通运输、仓储和邮政业',
            value: '1007'
          },
          {
            name: '采掘业和加工、制造业',
            value: '1005'
          },
          {
            name: '旅游、饭店、娱乐服务业',
            value: '1004'
          },
          {
            name: '科学、教育、文化体育、卫生、出版业',
            value: '1003'
          }
          
          
        ]
      },
      {
        name: '线索来源',
        value: 'source',
        options: [
          {
            name: '全部',
            value :'1000'
          },
          {
            name: '客户拜访',
            value :'1001'
          },
          {
            name: '领导交办',
            value: '1002'
          },
          {
            name: '互联网爬取',
            value: '1003'
          },
          {
            name: '展会',
            value: '1004'
          },
          {
            name: '其他',
            value: '1005'
          }
        ]
      },
      {
        name: '业务类型',
        value: 'reqKeywords',
        options: [
          {
            name: '5G',
            value :'1001'
          },
          {
            name: '移动手机',
            value: '1002'
          },
          {
            name: '集团彩短信',
            value: '1003'
          },
          {
            name: '固话',
            value: '1004'
          },
          {
            name: '宽带',
            value: '1005'
          },
          {
            name: '互联网专线',
            value: '1006'
          },
          {
            name: '数据及网元',
            value: '1007'
          },
          {
            name: '云计算',
            value: '1008'
          },
          {
            name: '大数据',
            value: '1009'
          },
          {
            name: '物联网',
            value: '1010'
          },
          {
            name: 'IDC',
            value: '1011'
          },
          {
            name: 'IT服务',
            value: '1012'
          },
          {
            name: '其他',
            value: '1013'
          }

        ]
      },
      {
        name: '填报时间',
        value: 'optime',
        options: [
          {
            name: '今天',
            value :'1001'
          },
          {
            name: '近三天',
            value: '1003'
          },
          {
            name: '近七天',
            value: '1000'
          }
        ]
      },
    ]
    
  }

  componentDidMount() {
    this.getClue();
    // this.loadProjects();
  }

  getClue = async () => {
    const userInfo = await AsyncStorage.getItem('userInfo');
    const {id, login, orgId, org2Id,provCode} = JSON.parse(userInfo);
    try {
      const result = await Request.post2('Appclue/myclue',
        {
          userId: '1396335',
          // industry: '100001',
          pageNum: '1',
          pageSize: '10'
        }
      );
      const {msg,list,code} = result;
      if(code === '0000'){
        log('======chenjia======')
      }

    } catch (error) {
      log(error)
      Alert.alert(
        '请求线索失败，请重试',
        '',
        [
          {text: '确定'},
        ],
        { cancelable: false }
      )
    }
  }


  async loadProjects() {
    const querys = this._getQuery();
    try {
      const result = await Request.get(`schemeContl/getSchemeInfo?${querys}`)
      const {respCode, respDesc, data} = result;
      if (respCode === '001') {
        const resulFormat = data.map(item => {
          return {
            id: item[0] + '',
            topic: item[1],
            desc: item[2]
          }
        })
        this.setState({
          projectList: resulFormat,
          isLoading: false
        }) 
      } else {
        Alert.alert(
          '出错啦',
          respDesc,
          [
            {text: '确定'},
          ],
          { cancelable: false }
        )
      }
      
    } catch (error) {
      console.log(error.message);
      Alert.alert(
        '请求失败，请重试',
        '',
        [
          {text: '确定'},
        ],
        { cancelable: false }
      )
    }
  }

  _getQuery() {
    const filterItems = this.state.filterItems;
    let querys = `inputType=PLAN&pageSize=1000&busiType=&pageNum=${this.state.pageNum}`;
    for (let key in filterItems) {
      querys += `&${key}=${filterItems[key]}`
    }
    return  querys
  }

  _onFilter = (options) => {
    this.setState({
      isLoading: true
    })
    if(this.state.clueList.length > 0) {
      this.refs.clueList.scrollToIndex({
        index: 0,
        viewPosition: 0
      })
    }
    console.log('筛选条件',options)
    let filterItemsNow = JSON.parse(JSON.stringify(this.state.filterItems));
    for (let key of options.keys()) {
      const res = [...options.get(key)].filter(item => item[1]).map(item => item[0])
      filterItemsNow[key] = res;
    }
    console.log(filterItemsNow)
    this.setState({
      filterItems: filterItemsNow,
      filterNow: options
    }, () => {
      this.getClue();
    })
  }

  _keyExtractor = (item) => item.clueId;

  render() {
    const rightBtn = 
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity onPress={() => this.props.navigation.navigate('searchAll', {searchType: 'plan'})} style={{width: 44, height: 44, alignItems:"flex-end", justifyContent: "center"}}>
          <Image source={require('../../images/search_new.png')} style={{width: px(42), height: px(42)}}/>
        </TouchableOpacity>
      </View>
    const numColumns = 1;
    return (
      <SafeAreaView forceInset={{ top: 'never' }} style={{ flex: 1, backgroundColor:Colors.background}}>
        <Header title="我的线索" rightBtn={rightBtn}/>
        <Filter
          backgroundColor = '#fff' 
          filters={this.filters} 
          onFilter={options => this._onFilter(options)}
          checked = {this.state.filterNow} 
          style = {[{marginTop:0}]}
        />
        {
          this.state.isLoading && (
            <View style={{flex:1, padding:50}}>
              <ActivityIndicator />
            </View>
          )
        }
        {
          !this.state.isLoading && (
            <FlatList
              ref="clueList"
              numColumns={numColumns}
              horizontal={false}
              data={this.state.clueList}
              // onEndReachedThreshold={1}
              // onEndReached={this._onEndReached}
              // ListEmptyComponent={this._renderEmpty}
              renderItem={({ item }) =>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate('specialistDetail', {
                    // itemId: item.id,
                    // name: item.contactName,
                    
                    baseId:item.clueId
                  })}
                >
                  <View style={{ backgroundColor:'#ffffff',marginLeft:px(20),marginTop:px(20),marginRight:px(20),padding:px(30),borderRadius: px(10)}}>
                    <View>
                      <Text style={styles.title} numberOfLines={2}>
                        {item.clueName}
                      </Text>   
                    </View>

                    <View>
                      <Text style={{ height: px(0.5), marginTop: px(30), marginBottom: px(30),justifyContent: 'center', color: Colors.darkText, backgroundColor: '#e8e8e8' }}></Text>
                    </View>

                    <View>
                      <Profile
                        name={item.custManager} 
                        avatar = {null}
                        avatarName = {item.custManager}
                        describe={item.dept} 
                        describe2={item.state} 
                      />
                    </View> 
                  </View>
                </TouchableOpacity>
              }
              keyExtractor={this._keyExtractor}
            />
          )
        }
        
      </SafeAreaView>
    )
  }

}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    lineHeight: 20,
    color: '#000'
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowOffset: {
          width: 0,
          height: 0.5
        },
        shadowRadius: 5,
        shadowOpacity: 1
      },
      android: {
        elevation: 8,
      },
    })
  }
})