---
title: 通过behave学习BDD
abbrlink: e6f54ca7
date: 2020-12-30 21:04:57
tags:
---
## 前言
最近觉得学习一个东西最好的方式就是使用它, 把抽象的东西变得具体而实际(ps:这好像刚好也是行为驱动开发存在的原因😄), 所以, 直接从pyhon的BDD工具behave着手, 感受BDD的逻辑和好处.
## 实例化需求的定义:
> 维基百科: *Specification by example (SBE) is a collaborative approach to defining requirements and business-oriented functional tests for software products based on capturing and illustrating requirements using realistic examples instead of abstract statements. It is applied in the context of agile software development methods, in particular behavior-driven development.*
<!-- more -->
* 实例化需求就是使用具体的例子来澄清需求和基于业务功能测试的一种协作方式. 实践方式通常为敏捷开发的行为驱动开发.

## 行为驱动开发的定义
>On the “Agile specifications, BDD and Testing eXchange” in November 2009 in London, Dan North gave the following definition of BDD:

>BDD is a second-generation, outside–in, pull-based, multiple-stakeholder, multiple-scale, high-automation, agile methodology. It describes a cycle of interactions with well-defined outputs, resulting in the delivery of working, tested software that matters.
* 行为驱动开发就是使用一种通用的语言来描述验收条件的一些操作及被测程序对应的响应行为, 并由此自动验证代码的一种开发方法.

* 其中的通用语言一般使用Gherkin语言, 它基于领域驱动设计, 重点在于描述需求背景和目的, 让代码实现始终为需求服务.
而自动化验证则是为了提供及时的反馈和回归测试.

## behave基本使用
* python中常用的驱动框架有lettuce和behave, 但是lettuce不兼容python3.
而Django也有对应的插件behave-django, 以下操作都是基于behave-django来实现的.
### 步骤
* 安装behave-django
```bash
pip install behave-django
```
* settings.py文件中添加该插件
```bash
INSTALLED_APPS += ['behave_django']
```
* 1) 项目的根目录创建features目录
2) .feature文件中就是用Gerkin语言写的各个行为场景
3) environment.py会在执行用例前, 执行里面的代码, 一般全局的前置条件和后置条件的逻辑在这个文件中定义.
4) 目录下再创建steps目录, steps下就是各种需求例子的实现逻辑代码. 
![](https://image.baidu.com/search/down?url=https://tva1.sinaimg.cn/large/0081Kckwgy1gm72on9jlcj306b04jdgi.jpg)
### .feature文件的内容格式. 
* 其中双引号引起来的内容会被提取作为变量的值
* 格式为 As-a /I want to/So that 的内容不会被执行, 重点在于使用者和需求的背景
* Given/When/Then 分别描述用例的前置条件、操作和检查点
```Gerkin
Feature: My blog
  As a vister
  I want to be able to see the header in the page
  So that I know it is the right page
  Scenario: I access my blog
    Given I access the url "/blog/"
    Then I see the header M.Y
```
### environment.py中的内容
```python
from selenium import webdriver

# context为一个全局对象, behave运行的时候会给这个对象绑定很多属性, 
# 包括before_all(), before_feature(), …, after_all()等回调函数
# 因此我们也可以给context绑定自定义属性, 如下, 就绑定了browser属性, 其引用指向创建的webdriver实例
def before_all(context):
    # 谷歌浏览器配置对象
    opt = webdriver.ChromeOptions()
    # 解决“chrome正受到自动测试软件的控制”信息栏显示
    opt.add_experimental_option("useAutomationExtension", False)
    opt.add_experimental_option("excludeSwitches", ['enable-automation'])
    context.browser = webdriver.Chrome(options=opt, executable_path="./chromedriver")
    context.browser.base_url = "https://yummyisminer.xyz"
```
### my_step.py中的内容. 主要是对feature文件中的given和then的实现

```python
from behave import given, then
from commons.some_decorator import wait

# "{url}" 就是对应feature中的"/blog/", 用花括号变量名来标识为变量, 而这里的url作为变量引用/blog/这个值
@given(u'I access the url "{url}"')
def step_impl(context, url):
    context.browser.get(context.browser.base_url+url)


@then(u'I see the header {tex}')
@wait
def step_impl(context, tex):
    context.test.assertIn(
        tex,
        context.browser.find_element_by_css_selector("h1").text
    )
```
### my_step.py文件中有用到wait这个装饰器, 主要逻辑就是10s内, 每隔0.5s重新执行一遍被装饰的函数.
```python
import time

from selenium.common.exceptions import WebDriverException

MAX_WAIT = 10
def wait(fun):
    def wrapped_fun(*args, **kwargs):
        start_time = time.time()
        while True:
            try:
                return fun(*args, **kwargs)
            except(AssertionError, WebDriverException) as e:
                if time.time() - start_time > MAX_WAIT:
                    raise e
                time.sleep(0.5)
    return wrapped_fun
```
###  执行场景用例
```bash
python manage.py behave
```
![](https://image.baidu.com/search/down?url=https://tva1.sinaimg.cn/large/0081Kckwgy1gm734noye0j30hc09vadc.jpg)

## 启发
* 暂时的理解: BDD主要就是用来澄清需求, 使业务、开发、测试三方对需求的理解都一致, 所以应该一般require文件部分的内容由业务人员编写, 用来限定验收条件, 然后大家针对这些验收条件进行评审, 发现模糊的描述, 确认各种“如果xxx, 就xxx”的情况, 接着测试人员可以基于require文件编写对应的操作和验证实现方法, 每开发一个功能, 都需要跑通这些验收用例, 提前并持续不断的提供反馈, 降低后期返工的概率.
* 后续如果我要给自动化测试扩展BDD功能的话, 首先因为BDD主要就是用来写一些基于业务逻辑的验收用例, 那用例就应该跟自动化测试框架分离, 也就是BDD的逻辑是单独写在一个项目.

* 所以, 就需要把自动化测试框架打包成可安装模块.
然后实现了BDD项目中, 在用例实例方法里导入自动化测试框架这个模块, 然后调用相关的逻辑方法完成操作和验证.

### 项目打包的大致步骤
1. 创建一个目录, __init__.py文件, 自动化框架项目拷贝到该目录下, 并创建setup.py, 如下配置
```python
import setuptools


setuptools.setup(
    name="autotestwithstub",
    version="1.0.1",
    # 添加非py的数据文件
    # 列表中的每一个元组的第一个元素为数据文件将存储到的目录(相对于当前解释器安装的根目录)， 第二个元素为要添加的文件路径
    data_files=[('lib/Configs', ['autotestwithstub/Configs/MyApp.ini','autotestwithstub/Configs/logging_conf.ini'])],
    # 将目录下找到的包(也就是有__init__.py文件的目录)都安装
    packages=setuptools.find_packages(),
    include_package_data=True,
    author="ym",
    author_email="xx@qq.com",
    url="https://yummyisminer.xyz",
    description="a autotest framework with stub web server",
)
```
2. 开始打包, 执行命令之后会在项目下创建dist目录, dist目录下就会有对应的tar.gz和whl格式的安装包
```bash
python3 setup.py sdist bdist_wheel
```
3. 在当前使用的python解释器安装目录下, 安装刚刚生成的模块
```bash
pip install dist/autotestwithstub-1.0.1-py3-none-any.whl
```
4. 新项目中导入之前项目下的包, 调用对应的逻辑

<a href="https://packaging.python.org/tutorials/packaging-projects/">参考资料</a>

