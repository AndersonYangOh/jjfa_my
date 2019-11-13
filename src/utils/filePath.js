import filePathData from '../files/files.json';

exports.getFilePath = (baseId, name) => {
  const fileNow = filePathData.find(item => {
    return item.baseId == baseId && item.name == name
  })
  if (['畜牧监控-解决方案.docx', '互联网加政务服务产品解决方案v7.docx', '中国联通5G融媒体产品方案.pptx', '中国联通5G筑基工业互联畅想智能未来-2019工业互联网峰会演讲版.pdf', '中国联通沃VR制播一体化解决方案.pptx', '走进5G新时代.pdf'].indexOf(name) !== -1) {
    return name;
  }
  return fileNow ? fileNow.location : null;
}

