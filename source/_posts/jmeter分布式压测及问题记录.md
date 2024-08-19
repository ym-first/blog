---
title: jmeter分布式压测及问题记录
tags: 
- 测试 
- 性能测试
abbrlink: 270d5148
date: 2020-04-12 20:22:03
---
## 问题描述:
* 需要使用jmeter模拟大并发的情况时，单台压测机不能满足需求，可进行分布式压测。
* 简单来说就是，多台机器同时安装jmeter，选择一台机器作为调度机，其他作为压力机。进行相应的配置后，就可以用调度机操控压力机发起请求。
<!-- more -->

## 如何配置（以Windows为例）：
* 1.压力机：
    * 1）执行当前压力机下jmeter安装包bin目录下的jmeter-server的批处理文件，此时该机器上启动一个java进程，并随机分配端口，监听来自调度机的请求。
    * 但是这里我们需要配置成固定端口方式，否则调度机远程启动压力机时，会报错。
    ![](https://image.baidu.com/search/down?url=https://tva1.sinaimg.cn/large/007S8ZIlly1gdr9ci02nnj307z043dfr.jpg)
    * 配置固定端口：打开bin目录下的jmeter.properties文件，更改server_port、server.rmi.localport的端口为要配置的端口。
    ![](https://image.baidu.com/search/down?url=https://tva1.sinaimg.cn/large/007S8ZIlly1gdrfakhypej30lx0d5gms.jpg)
* 2.调度机：
    * 打开jmeter安装包bin目录下的jmeter.properties文件，更改remote_hosts为，压力机ip及执行jmeter-server后启动的端口。
    ![](https://image.baidu.com/search/down?url=https://tva1.sinaimg.cn/large/007S8ZIlly1gdrfazm678j30g708y3z2.jpg)
* 开始测试：
    * 1.调度机正常配置好要测试的地址、参数、监听器等后，选择远程启动，就可以用刚刚配置好的压力机，进行压测了。
    ![](https://image.baidu.com/search/down?url=https://tva1.sinaimg.cn/large/007S8ZIlly1gdrfbhswnnj30ju09m0tp.jpg)

## 补充Linux上的配置：
* 1、启动slave server 命令：jmeter-server -Djava.rmi.sver.hostname=192.168.0.64

## 遇到的问题及解决：
### 问题一：
* jmeter4.0，启动slave报错 “java.io.FileNotFoundException: rmi_keystore.jks (没有那个文件或目录)”
![](https://image.baidu.com/search/down?url=https://tva1.sinaimg.cn/large/007S8ZIlly1gdrfbvioh4j30j002p0su.jpg)
* 解决：
    * 方法一：slave的jmeter.properties中，设置“server.rmi.ssl.disable=true”
        * 原因：jmeter4.0以上的版本，默认启用RMI连接的安全通信，需要创建密钥库。所以将SSL禁用即可。
    * 方法二：手动生成秘钥和证书。执行create-rmi-keystore.bat（Windows适用）或create-rmi-keystore.sh（Linux适用）

### 问题二：
 * 调度机远程调用slave时，连接超时。查看slave上的jmeter-server.log，发现是与调度机的虚拟机网卡连接超时。
    * 解决：在调度机的jmeter.bat中修改配置指定客户端的网卡ip.
    * 增加配置项：set rmi_host=-Djava.rmi.server.hostname=xxx.xxx.xxx.xxx
    * 修改配置项：set ARGS=%DUMP% %HEAP% %NEW% %SURVIVOR% %TENURING% %PERM% %CLASS_UNLOAD% %DDRAW% %rmi_host%


## 注意事项：
1、master、slave的时间要同步，否则tps结果误差较大。

* 同步时间的命令：
```python
# Windows下：
w32tm /config /manualpeerlist:"time.windows.com" /syncfromflags:manu
al /reliable:yes /update

# Linux下：
ntpdate time.windows.com
```
<a href="http://www.fblinux.com/?p=339">参考资料1</a>
<a href="https://www.cnblogs.com/linbo3168/p/6042255.html">参考资料2</a>
<a href="https://jmeter.apache.org/usermanual/jmeter_distributed_testing_step_by_step.html">参考资料3</a>
<a href="https://stackoverflow.com/questions/50113061/jmeter-4-0-error-starting-remote-server?rq=1">参考资料4</a>
<a href="https://www.cnblogs.com/suntingme/p/5995721.html">参考资料5</a>
<a href="https://testerhome.com/topics/12474">参考资料6</a>
<a href="https://blog.csdn.net/dev666/article/details/79776450">参考资料7</a>
<a href="https://blog.51cto.com/ydhome/1862841?source=drt">参考资料8</a>
