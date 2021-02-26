const axios = require('axios').default;
function getcontent(){
    axios.get("http://www.baidu.com")
}

module.exports=getcontent;