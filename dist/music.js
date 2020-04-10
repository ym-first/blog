const ap = new APlayer({
    container: document.getElementById('aplayer'),
    // mini: true,
    autoplay: false,
    audio: [
        {
            name: "分手总要在雨天",
            artist: '张学友',
            url: 'http://music.163.com/song/media/outer/url?id=187741.mp3',
            cover: 'http://p2.music.126.net/G3WbwV7xfv-V-pVE36iTTA==/18255191556505451.jpg?param=40y40',
            },
        {
        name: "等",
        artist: '陈百强',
        url: 'http://music.163.com/song/media/outer/url?id=27874927.mp3',
        cover: 'http://p2.music.126.net/cwHgs1tjNlOLtDj8YJcD1A==/109951163067903912.jpg?param=40y40',
        },
      {
        name: "My Way",
        artist: '张敬轩',
        url: 'http://music.163.com/song/media/outer/url?id=189243.mp3',
        cover: 'https://p1.music.126.net/7a77DZlspSaBZexOr8mdLw==/18863221486279082.jpg?param=40y40',
      },
      {
        name: '情人',
        artist: 'Beyond',
        url: 'http://music.163.com/song/media/outer/url?id=347241.mp3', 
        cover: 'http://p2.music.126.net/pHr2hq_QGGDrM3JOedJyVQ==/93458488373022.jpg?param=40y40',
      }
    ]
});
