const ap = new APlayer({
    container: document.getElementById('aplayer'),
    mini: true,
    autoplay: false,
    audio: [
      {
        name: "My Way",
        artist: '张敬轩',
        url: 'http://music.163.com/song/media/outer/url?id=189243.mp3',
        cover: '/blog/img/yuanbao.png',
      },
      {
        name: '听妈妈的话',
        artist: '周杰伦',
        url: 'http://www.ytmp3.cn/down/51577.mp3',
        cover: '/blog/img/avatar.jpg',
      }
    ]
});
