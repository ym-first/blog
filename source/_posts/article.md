---
title: Dubbo接口框架相关概念
tags: 测试
abbrlink: f0c13426
date: 2020-04-12 11:11:30
---
# **关于dubbo**：
## why:
* 为了解决,随着互联网发展,而日益增长的业务复杂度,网站应用规模不断扩大,且常规的垂直应用架构也无法应付,而提出的解决方案.![](https://tva1.sinaimg.cn/large/00831rSTgy1gdbnrp2sl3j30jg05u3z5.jpg)
<!-- more -->
### 1. 架构发展角度:
* 单一应用架构
    * 网站流量很小时,将所有功能都部署在一个应用,节省部署节点和成本.此时,重点是简化增删改查工作量的数据访问框架ORM
    <img src="https://tva1.sinaimg.cn/large/00831rSTgy1gdbnsa0v00j310w0cgn0z.jpg" width="70%">
    (图源https://www.jianshu.com/p/92ca0bfbd52f)
    <img src="https://tva1.sinaimg.cn/large/00831rSTgy1gdbnsx15sdj30su0yg46t.jpg" width="60%" height="10%">
    * 单体架构相关资料:
        * 单体架构指应用代码都作为同一个进程,部署和运行在单一节点中.
            * 单一节点服务器中,整体中的所有的模块都组装到单一的内存镜像中,作为一个进程运行在单一节点上.
            * 其中,如果将应用程序部署到多个服务器（如在水平扩展上下文中），它仍然是一个整体。
                
                <img src="https://tva1.sinaimg.cn/large/00831rSTgy1gdbo2vsnw7j30g80jqtiq.jpg" width="50%">
        * <a href="https://herbertograca.com/2017/07/31/monolithic-architecture/">单体架构参考资料1</a> <a href="https://sunnycoding.cn/2018/07/28/monolithic-and-microservices-part1/">单体架构参考资料2</a> <a href="https://microservices.io/patterns/monolithic.html">单体架构参考资料3</a>
* 垂直应用架构
    * 访问量逐渐增大,单一应用增加机器(通过在负载均衡器后端运行多个拷贝，实现多个扩展)带来的加速度越来越小,于是需要将应用拆成互不相干的几个应用来提升效率,此时的重点是用于加速前端页面开发的Web框架(MVC).
* 分布式服务架构
    * 为了应对增长的业务量,一台机器的性能已经无法满足,需要多台机器才能应对大规模的应用场景,同时也为了提高整个系统架构的可用性,消除单点故障,而垂直或水平拆分业务系统为多个应用.
    * 当垂直应用越来越多,应用之间需要交互,将核心业务抽取出来,作为独立的服务,逐渐形成稳定的服务中心,使前端应用能更快速的响应多变的市场需求.此时,重点是解决进程间通信问题和提高业务复用及整合的分布式服务框架RPC.
* 流动计算架构
    * 当服务越来越多,容量的评估,小服务资源的浪费等问题逐渐显现,此时需要增加一个调度中心基于访问实时管理集群容量,提高集群利用率.此时,重点是提高机器利用率的资源调度和治理中心SOA.

### 2. 要解决的问题:
* 在大规模服务化之前，应用可能只是通过 RMI 或 Hessian 等工具，简单的暴露和引用远程服务，通过配置服务的URL地址进行调用，通过 F5 等硬件进行负载均衡。当服务越来越多时，服务 URL 配置管理变得非常困难，F5 硬件负载均衡器的单点压力也越来越大。
    * 需要服务调用方能自动感知到服务提供方的地址,而对服务提供方进行横向扩展的时候,服务调用方能自动感知到
    * 因此需要一个服务注册中心，动态地注册和发现服务, 通过消费方获取服务提供方地址列表,实现软负载均衡和 Failover，降低对 F5 硬件负载均衡器的依赖，也能减少部分成本。
* 解决清晰描述错综复杂的服务依赖关系的问题
* 服务的调用量越来越大，服务的容量问题就暴露出来，这个服务需要多少机器支撑？什么时候该加机器？ 为了解决这些问题，第一步，要将服务现在每天的调用量，响应时间，都统计出来，作为容量规划的参考指标。其次，要可以动态调整权重，在线上，将某台机器的权重一直加大，并在加大的过程中记录响应时间的变化，直到响应时间到达阈值，记录此时的访问量，再以此访问量乘以机器数反推总容量。
![](https://tva1.sinaimg.cn/large/00831rSTgy1gdbo9udlymj30mk0cq7cq.jpg)

## what:
* 一个远程服务调用的分布式框架，调用协议通常包含传输协议和序列化协议。
* Dubbo本身支持多种远程调用方式，例如Dubbo RPC（二进制序列化 + tcp协议）、http invoker（二进制序列化 + http协议）、hessian（二进制序列化 + http协议）、WebServices （文本序列化 + http协议）等。

## 架构说明:
* ![](https://tva1.sinaimg.cn/large/00831rSTgy1gdboappmpdj30ci08cdho.jpg)
* <a href="https://dubbo.apache.org/zh-cn/docs/user/preface/architecture.html">官网介绍地址</a>
### 1. 节点角色说明

    |  节点   | 角色说明  |
    |  ----  | ----  |
    | Provider  | 暴露服务的服务提供方 |
    | Consumer  | 调用远程服务的服务消费方 |
    | Registry  | 服务注册与发现的注册中心 |
    | Monitor  | 统计服务的调用次数和调用时间的监控中心 |
    | Container  | 暴露服务的服务提供方 |
    | Consumer  | 服务运行容器 |

###  2. 调用关系说明
    1. 服务容器负责启动，加载，运行服务提供者。
    2. 服务提供者在启动时，向注册中心注册自己提供的服务。
    3. 服务消费者在启动时，向注册中心订阅自己所需的服务。
    4. 注册中心返回服务提供者地址列表给消费者，如果有变更，注册中心将基于长连接推送变更数据给消费者。
    5. 服务消费者，从提供者地址列表中，基于软负载均衡算法，选一台提供者进行调用，如果调用失败，再选另一台调用。
    6. 服务消费者和提供者，在内存中累计调用次数和调用时间，定时每分钟发送一次统计数据到监控中心。

## 管理控制台的编译安装：
* 新版管理控制台主要的作用：服务查询，服务治理(包括Dubbo2.7中新增的治理规则)以及服务测试、配置管理![](https://tva1.sinaimg.cn/large/00831rSTgy1gdboh1ognhj30ti0b8aax.jpg)
### 步骤:
```bash
# 克隆项目到本地，并编译安装和启动（如果是Windows下，则在powershell进行）
git clone https://github.com/apache/incubator-dubbo-ops.git

# 切到项目根目录
cd incubator-dubbo-admin-develop

# 编译构建
mvn clean package

# 修改配置文件，指定注册中心地址
dubbo-admin-server/src/main/resources/application-production.properties

　# 主要的配置有：
　　admin.config-center=zookeeper://127.0.0.1:2181
　　admin.registry.address=zookeeper://127.0.0.1:2181　
　　admin.metadata-report.address=zookeeper://127.0.0.1:2181

# 启动服务
cd dubbo-distribution/target
java -jar dubbo-admin-0.1.jar
# 或以下命令启动服务
mvn --projects dubbo-admin-server spring-boot:run

# 启动完成后，直接访问http://localhost:8080
```
* <a href="https://github.com/apache/dubbo-samples/tree/master/java">官方示例地址</a>

