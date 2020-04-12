---
title: jmeter请求参数化
tags: 性能测试
categories: 性能测试
abbrlink: b8d58d05
date: 2020-04-12 18:08:43
---
## 问题一：
### 使用jmeter对下单进行压测的时候，订单号不允许重复，那怎么办呢。
* 可以采用读取csv文件进行参数化。
    * 具体操作步骤：
        * 1.选中线程组，右键的配置元件就可以看到【CSV 数据文件设置】
        * 2.不重复的订单号有了，然后设置用户自定义变量，并将变量名填写在【CSV 数据文件设置】的【变量名称选项】，此时设置的特定变量的值就可以从配置文件中读取。
<!-- more -->
        * ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gdr5ehxuwgj30l10cnwfn.jpg)
        * 3.请求中替换相应的变量，使请求与变量及配置文件相互关联。
        * ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gdr5esg3hmj30jp0cpgme.jpg)
    * 补充：
        * 1.也可以通过bean shell调用UUID的randomUUID()方法来实现参数化
        * <a href="https://blog.csdn.net/lirong_s/article/details/79914532">参考资料</a>

## 问题二：
### 下单请求，需要MD5加密，怎么解决？
* jmeter中有自带的MD5函数。具体用法可以通过【选项】-【函数助手对话框】进行查看。
    * ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gdr5f5f1zyj30ke0bwaat.jpg)
* 用上面提到的添加用户自定义变量的方法，添加加密所需要参数变量，再通过__V函数（用法：${__V(变量名)} ）获取加密所需要的值。
* 如果加密字符串还包含变量名，直接在__MD5函数中填写对应的变量名即可![](https://tva1.sinaimg.cn/large/007S8ZIlly1gdr5fe6wqgj305j00swea.jpg)
* 如果还需要对加密后字符串转换成大写，则可以用uppercase转换成大写。
![](https://tva1.sinaimg.cn/large/007S8ZIlly1gdr5fo654wj309v00o0sj.jpg)
<a href="https://www.cnblogs.com/lixiaowei395659729/articles/7223110.html">参考资料1</a>
<a href="http://www.fblinux.com/?p=951">参考资料2</a>
