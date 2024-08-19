---
title: Dubbo接口测试
tags: 
- 测试
- 接口测试
categories: 接口测试
abbrlink: 81c88605
date: 2020-04-03 13:30:40
---
<!-- ![](https://cdn.pixabay.com/photo/2019/03/22/08/40/night-4072727__480.jpg) -->
# 接上文,了解Dubbo接口后,如何测试dubbo接口：
## **Python版解决方案:**
### 1. **hessian+http的方式调用(python-hessian库):**
<!-- more -->
* (1) dubbo项目中，增加hessian方式序列化，及相关依赖。下图为xml配置方式示例。
    * <a href="https://dubbo.apache.org/zh-cn/docs/user/references/protocol/hessian.html">官方配置hessian协议及依赖例子</a>
    * <a href="https://dubbo.apache.org/zh-cn/docs/user/demos/multi-protocols.html">官方配置多协议例子</a>![](https://image.baidu.com/search/down?url=https://tva1.sinaimg.cn/large/00831rSTgy1gdboopoouuj30po0h5dif.jpg)

* (2) 获取接口地址（可在管理台查看）、方法及方法的入参。
* (3) 安装 python-hessian               
    ```bash 
    python -m pip install python-hessian
    ```
* (4) 编写Python脚本调用接口; <a href="https://github.com/theatlantic/python-hessian/blob/master/README.rst">pyhessian官方调用例子</a>
    ```python
    # coding=utf-8
    import pytest
    from pyhessian.client import HessianProxy

    class TestDubbo(object):
        url = "http://169.254.210.145:1234/"
        interface = "com.xxx.user.service.UserService"
        full_url = url + interface
        # full_url = "http://169.254.210.145:8888/com.xxx.user.service.FileService"
        def testsayHelloWithSpec(self):
            params = u"什么我调用成功了吗"
            # 创建连接对象
            service = HessianProxy(self.full_url)
            # 重载方法__call()__里发送二进制数据进行请求，调用方法
            res = service.sayHello(params)
            assert "什么我调用成功了吗" in res
            print(res)

        # @pytest.mark.skip()
        def testsayHelloWithInt(self):
            params = 123
            service = HessianProxy(self.full_url)
            res = service.sayHello(params)
            assert 123 in res
            print(res)

    if __name__ == "__main__":
        pytest.main(["-q","TestDubbo.py"])
    ```

### 2. **使用dubbo-client**
* dubbo项目中，provicer.xml 增加 jsonrpc 协议
* <a href="https://github.com/dubbo/dubbo-client-py">官方地址</a>
<a href="https://www.twblogs.net/a/5d4061a4bd9eee51fbf993e7/zh-cn">其他参考示例</a>
    ```python
    config = ApplicationConfig('test_rpclib')
    service_interface = 'com.ofpay.demo.api.UserProvider'

    # Contains a connection to zookeeper, which needs caching.
    registry = ZookeeperRegistry('192.168.59.103:2181', config)
    user_provider = DubboClient(service_interface, registry, version='1.0')
    
    for i in range(1000):
        try:
            print user_provider.getUser('A003')
            print user_provider.queryUser(
                {u'age': 18, u'time': 1428463514153, u'sex': u'MAN', u'id': u'A003', u'name': u'zhangsan'})
            print user_provider.queryAll()
            print user_provider.isLimit('MAN', 'Joe')
            print user_provider('getUser', 'A005')
        except DubboClientError, client_error:
            print client_error
        time.sleep(5)
    ```

## **java:**
### 1. **XML配置文件方式:**
* 拿到服务的jar包或maven依赖
* 在resources下创建consumer.xml,配置好注册中心地址,接口名全称(有包名限定),每个接口有其唯一的标识reference id
* 调用测试方法中,使用springframework提供的方法加载consumer.xml配置文件,得到context对象,调用start方法启动
* 调用context对象的getBean方法,传入接口标识作为实参,获取接口的具体实现对象,这步会进行远程过程调用
* 通过获取的对象调用其提供的方法
    ```java
    import com.xxx.user.service.UserService;
    import org.junit.BeforeClass;
    import org.junit.Test;
    import org.springframework.context.support.ClassPathXmlApplicationContext;
    import static org.hamcrest.CoreMatchers.containsString;
    import static org.junit.Assert.assertThat;
    public class ConsumerTest {
        static ClassPathXmlApplicationContext context;
        static UserService userService;
        @BeforeClass
        public static void beforeClass(){
             if(context==null) {
                 // 默认从类路径中加载配置文件
                 context = new ClassPathXmlApplicationContext("consumer.xml");
                 System.out.println("load");
                 // 在Spring中还提供了Lifecycle接口，Lifecycle中包含start/stop方法，实现此接口后Spring保证在启动的时候调用其start方法开始生命周期,主要用于控制异步处理过程
                context.start();
    //            System.out.println("start");
             }
    　　　　　　 // 创建接口实例（定义接口的引用变量，再引用实现了该接口的实例）
            userService=(UserService) context.getBean("userService");
    
         }
        @Test
        public void consumerTestCase1(){
    　　　　　　 // 调用方法
             String hello = userService.sayHello("world");
             assertThat(hello,containsString("world");
             System.out.println(hello);
         }
     }
    ```

### 2. **API方式的泛化调用:**
* 不需要获取被测接口的jar包或依赖
* <a href="http://dubbo.apache.org/zh-cn/blog/dubbo-generic-invoke.html">官方示例1</a> <br/> <a href="http://dubbo.apache.org/zh-cn/docs/user/demos/generic-reference.html">官方示例2</a>
* 创建连接实例:
    * 使用 org.apache.dubbo.config.ApplicationConfig 配置消费者应用名
    * 使用 org.apache.dubbo.config.ReferenceConfig; 创建reference配置实例,设置接口全类名,声明泛化调用,配置消费者
    * 使用org.apache.dubbo.config.RegistryConfig; 配置注册中心地址
    * 调用reference配置实例的get方法,获取GenericService类型的连接实例
* 调用服务提供的方法:
    * 调用org.apache.dubbo.rpc.service.GenericService 这个接口名为 $invoke方法，它接受三个参数，分别为方法名、方法参数类型数组和参数值数组；
        * 对于方法参数类型数组:
            * 如果是基本类型，如 int 或 long，可以使用 int.class.getName()获取其类型；
            * 如果是基本类型数组，如 int[]，则可以使用 int[].class.getName()；
            * 如果是 POJO，则直接使用全类名，如 com.alibaba.dubbo.samples.generic.api.Params。
        * 参数值数组:
            * 如果是POJO,则转成Map,再将转换后的Map作为参数传入
```java
    @Test
    public void test2(){
        ApplicationConfig application = new ApplicationConfig();
        application.setName("api-generic-consumer");

        // 使用RegistryConfig,动态配置注册中心地址
        RegistryConfig registry = new RegistryConfig();
        registry.setAddress("zookeeper://127.0.0.1:2181");
        application.setRegistry(registry);

        ReferenceConfig<GenericService> reference = new ReferenceConfig<GenericService>();
        // 弱类型接口名
        reference.setInterface("com.ymxdclass.user.service.UserService");
        // 声明为泛化接口
        reference.setGeneric(true);

        reference.setApplication(application);

        // 用com.alibaba.dubbo.rpc.service.GenericService可以替代所有接口引用
        GenericService genericService = reference.get();

        String name = (String) genericService.$invoke("sayHello", new String[]{String.class.getName()}, new Object[]{"who am i"});
        System.out.println(name);
    }
```