const ap = new APlayer({
    container: document.getElementById('aplayer'),
    // mini: true,
    autoplay: false,
    audio: [{
            name: "On Your Mask",
            artist: 'CHAGE and ASKA',
            url: 'http://music.163.com/song/media/outer/url?id=444676.mp3',
            cover: 'https://p2.music.126.net/H4cVz3-qKtYDSHZZ-XFoYw==/734473767376838.jpg?param=40y40',
        },
        {
            name: "雨中的恋人们",
            artist: '黄凯芹',
            url: 'http://music.163.com/song/media/outer/url?id=94576.mp3',
            cover: 'http://p2.music.126.net/1rwehhpnhVJKrn-H33XAuA==/68169720922853.jpg?param=40y40',
        },
        {
            name: '遥望-Demo',
            artist: 'Beyond',
            url: 'http://music.163.com/song/media/outer/url?id=29491864.mp3',
            cover: 'http://p2.music.126.net/pHr2hq_QGGDrM3JOedJyVQ==/93458488373022.jpg?param=40y40',
        },
        {
            name: "分手总要在雨天-Live",
            artist: '张学友',
            url: 'http://music.163.com/song/media/outer/url?id=187741.mp3',
            cover: 'http://p2.music.126.net/G3WbwV7xfv-V-pVE36iTTA==/18255191556505451.jpg?param=40y40',
        },
        {
            name: "じれったい",
            artist: '玉置浩二',
            url: 'http://music.163.com/song/media/outer/url?id=4910557.mp3',
            cover: 'https://p2.music.126.net/gxL5_d0N-d_ECgpv17WTkQ==/109951164061543352.jpg?param=40y40',
        },
        // {
        //     name: "等",
        //     artist: '陈百强',
        //     url: 'http://music.163.com/song/media/outer/url?id=27874927.mp3',
        //     cover: 'http://p1.music.126.net/luoiKIagB63n7Y3bxfsZYQ==/109951163633483361.jpg?param=40y40',
        // },
    ]
});
// // 触发播放列表展开事件
// setTimeout(() => {
//     document.querySelector('#aplayer > div.aplayer-body > div.aplayer-info > div.aplayer-controller > div.aplayer-time > button.aplayer-icon.aplayer-icon-menu').click();
// }, 1000);