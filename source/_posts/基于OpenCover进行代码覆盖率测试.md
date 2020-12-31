---
title: 基于OpenCover的代码覆盖率测试
abbrlink: 8920367b
date: 2020-12-03 07:40:59
tags:
  - 覆盖率测试
  - 测试
---
## 前言
之前的工作中有用到OpenCover对项目中的Asp.Net站点、服务进行覆盖率测试, 现在重新整理下笔记.

## OpenCover简介：
* 一个用于.NET 2.0及以上应用程序的代码覆盖的开源命令行工具;
<!-- more -->
* 使用PDB文件提供序列信息，来确定dll文件中哪些代码行与源代码的每一行相关联，然后检测、插桩每个序列点以记录命中的行;
    * 因此必须要有的是PDB文件以及可执行文件和程序集，应该在调试模式下构建测试中的应用程序。如果未找到PDB文件，则不会收集任何覆盖数据;
* 使用COM（组件对象模型）开发，检测程序profiler部分则使用c++;
* 使用mono.Cecil来分析分支或IL以确定在何处检测代码;

### OpenCover提供的指标有：
1. 声明范围, 即已涵盖的行数。
2. 方法覆盖范围，即涵盖了哪些方法。
3. 分支覆盖范围, 即采取了哪些分支, 这与圈复杂度有关

## OpenCover主要命令参数：
* -target： 应用程序可执行文件或服务名称的路径  
我的理解：就是配置将被测程序运行起来的程序或服务。大多用的NUnit。本文例子用的是IIS Express
* -filter： 应用于选择性地包括或排除coverage结果中的程序集和类的过滤器列表 
 * 默认选择所有的类和方法
 * 使用PartCover语法，(+|-)[Assembly-Filter]Type-Filter。
 * 例如，+[Open\*]* 包括以Open开头的程序
 * -[\*]Core.\* 排除Core命名空间中的所有类型(跟程序集无关)。
 * 如果未提供过滤器，+[\*]\*则会自动应用默认包含所有的过滤器。
* -output： 输出XML文件的路径，如果为空，则将在当前目录中创建results.xml
* -register [：user] - 注册和取消注册代码覆盖率分析器
* -targetargs： - 要传递给目标进程的参数（可指定被测程序的路径）
* -targetdir： - 目标目录的路径或PDB文件的备用路径  
如果-targetargs 已经指定了被测程序的路径，那么这里可作为查找PDB文件的依据。本文例子则作为查找PDB文件的路径
<a href="https://github.com/OpenCover/opencover/wiki/Usage">用法  </a><a href="https://github.com/opencover/opencover/blob/master/main/OpenCover.Documentation/Usage.pdf">文档</a>
<a href="http://www.cnblogs.com/binyao/category/477233.html">参考1  </a><a href="http://www.cnblogs.com/tylerzhou/p/9076386.html">参考2  </a><a href="http://blog.alantsai.net/posts/2017/01/devopsseries-opencover-intro">参考3  </a><a href="https://www.codeproject.com/Articles/677691/Getting-code-coverage-from-your-NET-testing-using">参考4</a>


## 未使用OpenCover时，被测程序的正常运行流程：
![](https://tva1.sinaimg.cn/large/0081Kckwgy1glabzct7wqj30ga03fmx3.jpg)

## 使用OpenCover、ReportGenerator后，被测程序的运行流程：
![](https://tva1.sinaimg.cn/large/0081Kckwgy1glac00ut37j30hd06ldg3.jpg)
* 1)命令行调用OpenCover.Console.exe
* 2)OpenCover使用SentrySdk收集崩溃报告
![](https://tva1.sinaimg.cn/large/0081Kckwgy1glac1j082fj30jp0hxwfy.jpg)
* 3)解析命令行中传入的参数（被测程序路径、要打印使用说明、是否启动服务、过滤信息等）
* 4)处理过滤器信息，如果命令行中未传-filter参数，则默认匹配分析所有的类和方法——>创建性能计数器
* 5)得到输出xml报告的全路径
* 6)初始化封装了注入框架依赖的容器
* 7)创建文件句柄，后续将覆盖率信息写入文件中。如果已经存在覆盖率xml文件，则合并
* 8)启动覆盖率分析进程。注册分析器，调用OpenCover.Profiler.dll
* 9)启动托管被测代码的程序(IIS Express)
* 10)访问站点测试被测程序
* 11)关闭IIS Express, 得到运行结果同时，也得到xml覆盖率结果
* 12)ReportGenerator将xml转成HTML
* ![](https://tva1.sinaimg.cn/large/0081Kckwgy1glacgqgvjyj316b0mcaig.jpg)

## OpenCover和ReportGenerator的主要配置流程：
### 以测试站点程序为例:
* 1)配置好OpenCover、ReportGenerator、被测程序的路径、IIS Express config的路径
* 2)执行配置好相关参数的CMD命令, 示例如下：
```python
H:\白盒测试\Debug\Opencover\OpenCover.Console.exe -target:"C:\Program Files (x86)\IIS Express\iisexpress.exe" -targetdir:"D:\被测站点\xxx.xxx.com\bin" -targetargs:"/site:xxx_bh.xxx.com /config:\"C:\Users\ym\Documents\IISExpress\config\applicationhost.config\"" -register:ym -output:"H:\白盒测试\xml_ym\xxx_bh.xxx.com\xxx_bh.xxx.com.xml"
```
* 3)此时IIS Express已经启动，访问在通过IIS Express配置的站点，开始测试。
* 4)测试完成后，退出IIS Express，生成xml文件。
* 5)使用ReportGenerator生成HTML文档，CMD命令示例如下：
```python
H:\白盒测试\Debug\ReportGenerator\ReportGenerator.exe -reports:H:\白盒测试\xml\白盒测试.xml -targetdir:H:\白盒测试\xml\html
```
* ![](https://tva1.sinaimg.cn/large/0081Kckwgy1glaci6hhr3j310r0fxwhk.jpg)

## ReportGenerator概述：
* ReportGenerator用于将OpenCover，PartCover，Visual Studio或NCover生成的XML报告转换为各种格式的友好可读报告。
* 主要就是配置xml文件的路径和输出html的路径, 执行命令后, ReportGenerator就会解析传入的参数, 然后输出报告
### 常用的命令行参数：
* -reports： - 应该解析的覆盖率报告，分号分隔，允许使用通配符
* -targetdir： - 应保存生成的报告的目录
* -sourcedirs：[;] [;] - 包含相应源代码的目录，可选，分号分隔
* -classfilters：<（+ | - ）filter> [; <（+ | - ）filter>] [; <（+ | - ）filter>] - 报表中应包含或排除的类列表，可选，可用通配符。
* 如果是测试Windows服务的覆盖率：
1）执行如下命令启动服务：
G:\Opencover所在路径\OpenCover.Console.exe -service:byname -target:安装好的服务名 -register:ym -output:H:\白盒测试保存路径\xxx\xxx.xml 
2）测试完毕后，正常关闭服务，则可收集覆盖数据。

### 报告部分截图
* 包含语句覆盖和分支覆盖情况。点击相应的页面，会进入对应程序，可看到具体覆盖到哪一行代码。
![](https://tva1.sinaimg.cn/large/0081Kckwgy1glac4ottr3j30s30hbaay.jpg)

### 代码覆盖详情截图
* 绿色表示完全覆盖，橙色表示该行代码还有分支未覆盖到，红色则未覆盖。
![](https://tva1.sinaimg.cn/large/0081Kckwgy1glac58dbfij30nf08qglt.jpg)

<a href="https://github.com/OpenCover/opencover/wiki/Service-Support">文档中的描述  </a><a href="https://www.cnblogs.com/tylerzhou/p/9076537.html">参考资料1  </a><a href="https://www.cnblogs.com/SivilTaram/p/vs_opencover_unit_coverage.html">参考资料2</a>

## 关于IIS Express：
* 一个兼具Visual Studio的ASP.NET开发服务器和Windows的IIS Web服务器功能的轻量级web服务器。
<a href="https://stackify.com/what-is-iis-express/">具体描述   </a><a href="https://blog.csdn.net/zhangjk1993/article/details/36671105">配置</a>

### 为什么用IIS Express：
更轻便, 易于实现自动化. 而结合实际需求，虽然也可以直接往-target传参为IIS的启动程序来进行监控测试情况，但是IIS还部署了其他非测试站点，会相互影响。所以实际应用还是采用IIS Express，每个测试人员部署自己的IIS Express，而不会相互影响。
### 启动完整的IIS的操作：
1）在调试模式下运行被测程序并启动OpenCover（将代码构建到调试模式获取PDB文件）
2）所有在站点下运行的应用程序都必须使用相同的应用程序池；否则，会报错
3）在调试模式下启动被测程序前，需要停止intserver（启动被测程序的服务）

### 原文描述：
```python Running against IIS
Normally I’d suggest running against IISEXPPRESS as I think it is easier to automate. However for those who really want to run against a full blown IIS then the following instructions (supplied by a user) will hopefully suffice.
“The trick is to start OpenCover to run the w3wp.exe process in debug mode e.g.
OpenCover.Console.exe -target:C:\Windows\System32\inetsrv\w3wp.exe -targetargs:-debug 
-targetdir:C:\Inetpub\wwwwoot\MyWebApp\bin\ -filter:+[*]* -register:user
There are some prerequisites though:
1.All applications running under the site must make use of the same app pool; you'll get errors in the EventLog otherwise.
2.inetserver needs to be stopped, before starting w3wp.exe in debug mode. You can use the following command:
net stop w3svc /y
After testing/code coverage completion you can close the w3wp.exe process and start the inetserver again:
net start w3svc
This procedure was tested on a Win2008 machine with IIS7.5”
You can also run multiple OpenCover instances against separate IIS sites by using the –s option when running IIS to choose the siteid e.g.
OpenCover.Console.exe -target:C:\Windows\System32\inetsrv\w3wp.exe 
    -targetargs:"-debug -s 1" 
    -targetdir:%WebSite_Path% 
    -filter:+[*]* 
    -register:user 
    -output:%CoverageResult_Path%
Then you can use ReportGenerator to merge the coverage results. 
```
 
## 关于PDB文件：
* PDB是Program Data Base 的缩写, 程序数据库（.pdb）文件（也称为符号文件）。
* 它将项目源代码中的标识符和语句映射为已编译应用程序中的相应标识符和指令。这些映射文件将调试器链接到您的源代码，从而可以进行调试, 跟踪到特定的函数和代码行。
* 它包含调试代码时所需的许多重要相关信息（在Visual Studio中），例如，在您希望调试器在Visual Studio中中断的位置插入断点。
* 当加载一个模块(dll文件), debugger找到对应的pdb(Program Debug Database)文件. 文件中记录了模块的变量、方法、类、源代码行数等信息, 包含类型和符号化调试信息编译和链接项目的过程中收集的二进制文件。
<a href="https://blogs.msdn.microsoft.com/vcblog/2016/02/08/whats-inside-a-pdb-file/">参考1 </a><a href="https://tpodolak.com/blog/2017/10/12/net-core-calculating-code-coverage-opencover-windows/">参考2  </a><a href="http://www.cnblogs.com/itech/archive/2011/08/15/2136522.html">参考3  </a><a href="https://blog.csdn.net/feihe0755/article/details/54233714">参考4</a>

## FAQ:
### 1）若提示
* ![](https://tva1.sinaimg.cn/large/0081Kckwgy1glae8bzjk4j30hr02e0sn.jpg)
* 原因有三：　
（1）未走到相关代码
（2）缺少对应的pdb文件
（3）未正确注册Profiler，添加参数-register:账号名