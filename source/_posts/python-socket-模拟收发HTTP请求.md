---
title: socket 模拟收发HTTP包
tags:
  - 协议
  - python
  - socket
categories: 网络
abbrlink: 6178cbe6
date: 2020-12-29 18:30:15
---
## 网络中数据发送的过程

1. 应用层中, 服务端创建server_socket, 并通过bind的系统调用绑定端口, 
   再调用listen使server_socket变成被动socket, 然后调用accept在对应端口上阻塞并监听客户端的连接,
2. 客户端也创建自己的client_socket, 通过connect系统调用, 发送syn包给服务端的server_socket, 数据先会到tcp发送缓冲中,
   如果已经建立好连接, 则客户端的client_socket调用系统调用的write方法, 把数据写到tcp发送缓冲中, 
<!-- more -->
3. 然后数据开始进入tcp/ip协议栈, 首先是tcp层组装数据包, 并得到引用这些数据的数据包描述符sk_buff, 
4. 然后sk_buff进入IP层, 
5. 再进入发送队列, 
6. 再进入网卡的环形缓冲区, 
7. 然后网卡驱动调用DMA引擎, 把数据从网卡通过网线发送出去
* ![](https://tva1.sinaimg.cn/large/0081Kckwgy1gm530l9s8uj313k0pqkge.jpg)
* ![](https://tva1.sinaimg.cn/large/0081Kckwgy1gm4zdvk5cnj30wo0gq7ha.jpg)

## 网络中数据接收的过程
1. 数据到达服务端的网络接口, 先是检查数据包中的目的Mac地址跟网卡的Mac地址是否匹配, 
2. 然后数据达到网卡队列, 再进入网卡的环形缓冲区, 并封装成sk_buff, 
3. 网卡调用DMA引擎发起中断, 通知CPU把数据从环形缓冲区取走, 
4. 然后这些数据就以sk_buff的形式进入IP层, tcp层, 
5. 在tcp层如果这个数据包是请求连接的syn包, 那么会先放到tcp的半连接队列, 等收到ack包的时候, 才放到tcp的全连接队列, 
6. 然后进入tcp接收缓冲, 再到达应用层
* ![](https://tva1.sinaimg.cn/large/0081Kckwgy1gm5jf4oadbj30pq0u614l.jpg)
## python版服务端的简单实现
```python
# coding=utf-8
import socket
import threading

GREAT = """great"""
CONTENT_LENGTH = """Content-Length: 5"""
STATUS_CODE = "200 OK"
SAMEORIGIN = """X-Frame-Options: SAMEORIGIN"""
CHARSET = """Content-Type: text/plain; charset=utf-8"""
BICRLF = "\r\n\r\n"
CRLF = "\r\n"


def main():
    # 创建服务端的套接字
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # 绑定端口
    server_socket.bind(("", 3344))
    # 服务端套接字在端口3344监听
    # backlog 为等待(半)连接队列中的最大连接数
    server_socket.listen(128)
    while True:
        # 接收客户端连接，并得到一个新的socket与客户端进行通信
        client_socket, addr = server_socket.accept()
        thread_1 = threading.Thread(target=send_datas, args=(client_socket,))
        thread_1.start()


def send_datas(client_socket):
    “”“
    接收客户端连接后, 发送数据
    ”“”
    # 开启keep alive, 维持长连接
    client_socket.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)

    # 如果一直没有收到数据, 则每隔8秒给客户端发送keep alive的tcp链路检测包
    # define TCP_KEEPALIVE    0x10    /* idle time used when SO_KEEPALIVE is enabled */
    # https://github.com/apple/darwin-xnu/blob/0a798f6738bc1db01281fc08ae024145e84df927/bsd/netinet/tcp.h
    client_socket.setsockopt(socket.IPPROTO_TCP, 0x10, 8)
    # 接收数据，返回http格式的响应
    while True:
        # 接收数据的长度
        len_recv = 6148
        request = client_socket.recv(len_recv)
        # recv接收到fin包之后，就马上响应ack了，而服务端的fin包需要close之后才会发
        print("re   " + request.decode("utf-8"))
        # 如果客户端那边调用close, 服务端接收到的数据长度为0, 
        if request:
            content = input("what do u want to response?:: ")
            # 返回http格式的数据，只要格式符合http的格式，那么浏览器就会认为是一个http响应，从而能解析
            response = "HTTP/1.1 {}{}{}{}{}". \
                format(STATUS_CODE+CRLF,CHARSET+CRLF,SAMEORIGIN+CRLF,CONTENT_LENGTH+CRLF+CRLF,content)
            # 发送数据，且编码跟服务器设置的一致
            client_socket.send(response.encode("utf-8"))

        else:
            # 没加内层while循环前， 没进入这里是因为关闭浏览器的时候，没有再次接收客户端发送来的数据
            print("没数据了")
            # 客户端调用close后，服务端马上响应一个ack，且读通道也关闭
            # 而服务端还有写通道未关闭，写通道也关闭后，就会给客户端发fin包
            # 或者直接close也可以, 区别在于close不会马上释放连接
            client_socket.shutdown(socket.SHUT_WR)
            # client_socket.close()
            break


if __name__ == "__main__":
    main_thread = threading.Thread(target=main)
    main_thread.start()
```

## 客户端的实现
```python

import socket
import threading

COOKUE = '''Cookie: Idea-38dabdcb=1a3e1891-7313-4a6c-8141-c158de42e97'''
LANGUAGE = '''Accept-Language: zh-CN,zh;q=0.8'''
USER_AGENT = '''User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'''
ACCEPT = '''Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'''
CACHE_CONTROL_MAX_AGE = '''Cache-Control: max-age=0'''
CONNECTION_KEEP_ALIVE = '''Connection: keep-alive'''
HOST = '''Host: 192.168.0.101:8000'''
PATH = '''/blog/'''
# PATH = '''/blog/?date=yyy'''
BICRLF = "\r\n\r\n"
CRLF = "\r\n"
CONTENT_LEN = "Content-Length: "
send_flag = True

def send_data(tcp_socket):
    while send_flag:
        len_msg = int(input("how many char do you wanna send? : "))
        # 等待输入，如果comm为close，客户端关闭连接
        # content为要发送的内容，req_med为请求的方法，分别以空格分隔
        comm, content, req_med = input("comm :").split(" ")
        if req_med == "p":
            req_med = "POST"
        else:
            req_med = "GET"
        long_msg = content * len_msg  # .encode("utf-8")
        len_lmsg = str(len(long_msg))
        # 要发送的数据
        msg = ("%s %s HTTP/1.1" + CRLF + "%s%s%s%s%s%s%s%s") \
              % (req_med, PATH, HOST + CRLF + CONTENT_LEN + len_lmsg + CRLF, CONNECTION_KEEP_ALIVE + CRLF,
                 CACHE_CONTROL_MAX_AGE + CRLF,
                 ACCEPT + CRLF, USER_AGENT + CRLF, LANGUAGE + CRLF, COOKUE + BICRLF, long_msg)
        msg = msg.encode("utf-8")

        if comm.find("close") != -1:
            tcp_socket.shutdown(socket.SHUT_RDWR)
            # tcp_socket.close()
        elif comm.find("pass") != -1:
            pass
        elif send_flag == False:
            return
        else:
            tcp_socket.send(msg)


def recv_data(tcp_socket=None, len_recv=None):
    while True:
        recv = tcp_socket.recv(len_recv)
        if recv:
            global send_flag
            send_flag = True
        else:
            send_flag = False
            tcp_socket.shutdown(socket.SHUT_WR)
            return
        print(recv)


def main():
    while True:
        # 创建socket, 该socket对应一个打开文件和一个文件描述符
        # 入参1为指定协议族, 因为有的系统不一定有实现tcp/ip协议,
        # 入参2为socket的类型, tcp就对应SOCK_STREAM, 因为建立连接后, 数据就像流一样在两端传输
        tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        print(tcp_socket.fileno())

        # 连接服务端
        tcp_socket.connect(("192.168.0.101", 8000))
        global send_flag
        send_flag = True
        # 接收数据的长度
        len_recv = 6148
        # 同步阻塞的recv操作， 改成用一个线程异步接收数据，实时检测服务端发来的fin包，收到就马上把send_flag改为false
        thread = threading.Thread(target=recv_data, args=(tcp_socket, len_recv))
        thread.start()
        send_data(tcp_socket)


if __name__ == "__main__":
    main()
```

## whireshark 抓包截图
* ![](https://tva1.sinaimg.cn/large/0081Kckwgy1gm4ysa57cpj31rg0igdpc.jpg)
1. 如图, 客户端调用connect后, 发送请求与服务端建立连接的syn包, 包含一个客户端维护的序列号
2. 服务端收到syn包后, 也回一个混合了syn和ack的数据包, 其中包含服务端维护的序列号, 而ack包是作为对客户端syn包的确认回应, 所以ack号则是客户端的序列号+1,
3. 客户端收到服务端的syn+ack后, 再对该包确认回应而发送ack包, 此时序列号+1, ack号=服务端序列号+1,
4. 三次握手后, 客户端和服务端之间建立一条流通道,
5. 服务端的tcp接收缓冲区满了, 所以给客户端发送一个tcp window update的包,
6. 然后客户端发送http协议格式的数据, 
7. 服务端接收到数据回一个ack的包,
8. 由于距离tcp流通道的上一个数据包的时间已经满8秒了, 于是服务端给客户端发送keep-alive的tcp包, 
9. 客户端接收后马上回一个ack,
10. 服务端继续发送http格式的响应,
11. 客户端回ack
...
12. 最后, 客户端调用close后, 会给服务端发送fin包, 但由于上一个包是服务端发来的keep-alive ack包, 所以同时也会发送ack号为服务端发来的keep-alive ack包的序列号+1的ack,
13. 服务端马上单独回一个ack, 发送fin包的前提是服务端也调用了close, 而close还需要关闭接收通道释放资源等, 耗时较长, 所以就先单独回一个ack,
14. 服务端再发fin包, 而且为了防止客户端没收到前面的ack, 这个包里也包含一个ack,
15. 最后客户端回一个ack, tcp连接通道完全断开

