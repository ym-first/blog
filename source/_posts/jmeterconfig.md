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
        * 2.不重复的订单号有了，在【CSV 数据文件设置】的【变量名称选项】设置变量名，就可以通过${变量名}从配置文件中读取对应的数据。
<!-- more -->
        * ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gdr5ehxuwgj30l10cnwfn.jpg)
        * 3.请求中替换相应的变量，使请求与变量及配置文件相互关联。
        * ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gdr5esg3hmj30jp0cpgme.jpg)
    * 补充：
        * 1.也可以通过bean shell调用UUID的randomUUID()方法来实现参数化
        * <a href="https://blog.csdn.net/lirong_s/article/details/79914532">参考资料</a>
* 也可以使用随机函数拼接当前时间
    * ${__Random(1000000,100000000000000,random)}${__time(yyyyMMddHHmmss,time)} 

## 问题二：
### 下单请求，需要MD5加密，怎么解决？
* jmeter第三方插件Custom JMeter Functions中有__MD5函数。
    * 如果没有安装插件管理中心, 则先在jmeter 的lib/ext 目录下放插件管理中心 <a href="https://jmeter-plugins.org/get/">plugins-manager.jar</a> 这个jar包, 然后重启JMeter, 就能使用该函数了
    * 具体用法可以通过【选项】-【函数助手对话框】进行查看。
    * ![](https://tva1.sinaimg.cn/large/007S8ZIlly1gdr5f5f1zyj30ke0bwaat.jpg)
* 用添加用户自定义变量的方法，添加加密所需要参数变量，再通过__V函数（用法：${__V(变量名)} ）获取加密所需要的值。
* 如果加密字符串还包含变量名，直接在__MD5函数中填写对应的变量名即可![](https://tva1.sinaimg.cn/large/007S8ZIlly1gdr5fe6wqgj305j00swea.jpg)
* 如果还需要对加密后字符串转换成大写，则可以用uppercase转换成大写。
![](https://tva1.sinaimg.cn/large/007S8ZIlly1gdr5fo654wj309v00o0sj.jpg)
* 而该方法的实现其实就是继承了AbstractFunction这个抽象类, 然后重写4个方法. 后续如果需要自己添加额外的逻辑, 也可以按照这个方式去实现, 打成jar包后, 放到lib/ext目录下.
```Java
package kg.apc.jmeter.functions;

import org.apache.jmeter.engine.util.CompoundVariable;
import org.apache.jmeter.functions.AbstractFunction;
import org.apache.jmeter.functions.InvalidVariableException;
import org.apache.jmeter.samplers.SampleResult;
import org.apache.jmeter.samplers.Sampler;
import org.apache.jmeter.threads.JMeterVariables;
import org.apache.jorphan.util.JOrphanUtils;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

public class MD5 extends AbstractFunction {

    private static final List<String> desc = new LinkedList<String>();
    private static final String KEY = "__MD5";

    static {
        desc.add("String to calculate MD5 hash");
        desc.add("Name of variable in which to store the result (optional)");
    }

    private Object[] values;

    /**
     * No-arg constructor.
     */
    public MD5() {
    }

    /**
     * {@inheritDoc} 
     */
    @Override
    public synchronized String execute(SampleResult previousResult, Sampler currentSampler)
            throws InvalidVariableException {
        // 获取存放了当前线程的所有变量的一个容器对象
        JMeterVariables vars = getVariables();
        // 从数组中获取要加密的原始字符串, 强转为CompoundVariable类型后, 通过execute方法转成字符串
        String str = ((CompoundVariable) values[0]).execute();
        MessageDigest digest;
        try {
            digest = MessageDigest.getInstance("md5");
        } catch (NoSuchAlgorithmException ex) {
            return "Error creating digest: " + ex;
        }
        digest.update(str.getBytes());
        byte[] digestArray = digest.digest();

        for (byte b: digestArray){
            stringBuffer.append(String.format("%02x",b));
        }

        String res = stringBuffer.toString();

        if (vars != null && values.length > 1) {
            // 把第二个参数(也就是要替换的变量名)作为键, 加密后的结果作为值, 存入到vars容器中
            // 后续就可以通过${varName的值}来获取加密后的字符串
            String varName = ((CompoundVariable) values[1]).execute().trim();
            vars.put(varName, res);
        }

        return res;
    }

    /**
     * {@inheritDoc} 解析参数, 并存到数组中, 此时参数的类型是CompoundVariable
     */
    @Override
    public synchronized void setParameters(Collection<CompoundVariable> parameters) throws InvalidVariableException {
        checkMinParameterCount(parameters, 1);
        values = parameters.toArray();
    }

    /**
     * {@inheritDoc} 函数助手中显示的方法名, 其中__是不显示的
     */
    @Override
    public String getReferenceKey() {
        return KEY;
    }

    /**
     * {@inheritDoc} 参数描述
     */
    @Override
    public List<String> getArgumentDesc() {
        return desc;
    }
}
```
<a href="https://www.cnblogs.com/lixiaowei395659729/articles/7223110.html">参考资料1</a>
<a href="http://www.fblinux.com/?p=951">参考资料2</a>
