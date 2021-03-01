(function(w, d) {
	const test="";
	const body = d.body,
		$ = d.querySelector.bind(d),
		$$ = d.querySelectorAll.bind(d),
		root = $('html'),
		gotop = $('#gotop'),
		menu = $('#menu'),
		main = $('#main'),
		header = $('#header'),
		mask = $('#mask'),
		menuToggle = $('#menu-toggle'),
		menuOff = $('#menu-off'),
		title = $('.header-title'),
		loading = $('#loading'),
		isPost = location.href.indexOf('post') !== -1,
		animate = w.requestAnimationFrame,
		scrollSpeed = 200 / (1000 / 60),
		forEach = Array.prototype.forEach,
		isWX = /micromessenger/i.test(navigator.userAgent),
		noop = function() {},
		offset = function(el) {
			let x = el.offsetLeft,
				y = el.offsetTop
			if (el.offsetParent) {
				const pOfs = arguments.callee(el.offsetParent)
				x += pOfs.x
				y += pOfs.y
			}
			return {
				x: x,
				y: y
			}
		}
	let even =
		'ontouchstart' in w &&
		/Mobile|Android|iOS|iPhone|iPad|iPod|Windows Phone|KFAPWI/i.test(
			navigator.userAgent
		)
			? 'touchstart'
			: 'click'
	let docEl = d.documentElement
	if (w.innerWidth > 600) {
		if (
			(window.navigator.userAgent.indexOf('WOW') > -1 ||
				window.navigator.userAgent.indexOf('Edge') > -1 ||
				window.navigator.userAgent.indexOf('MSIE') > -1) &&
			window.navigator.userAgent.indexOf('Trident') === -1
		) {
			docEl = body
		}
	} else {
		if (window.navigator.userAgent.indexOf('Android') > -1) {
			if (window.navigator.userAgent.indexOf('Browser') > -1) {
				docEl = body
			}
		}
	}
	const Blog = {
		goTop: function(end) {
			const top = docEl.scrollTop
			const interval =
				arguments.length > 2 ? arguments[1] : Math.abs(top - end) / scrollSpeed
			if (top && top > end) {
				docEl.scrollTop = Math.max(top - interval, 0)
				animate(arguments.callee.bind(this, end, interval))
			} else if (end && top < end) {
				docEl.scrollTop = Math.min(top + interval, end)
				animate(arguments.callee.bind(this, end, interval))
			} else {
				this.toc.actived(end)
			}
		},
		toggleGotop: function(top) {
			if (top > w.innerHeight / 2) {
				gotop.classList.add('in')
			} else {
				gotop.classList.remove('in')
			}
		},
		toggleMenu: function(flag) {
			if (flag) {
				menu.classList.remove('hide')
				if (!isPost) {
					main.classList.remove('menuoff')
					jQuery(title).animate({
						marginRight: '15%'
						// marginRight: '-20%'
					})
				}
				if (w.innerWidth < 1241) {
					mask.classList.add('in')
					menu.classList.add('show')

					if (isWX) {
						const top = docEl.scrollTop
						main.classList.add('lock')
						main.scrollTop = top
					} else {
						root.classList.add('lock')
					}
				}
			} else {
				mask.classList.remove('in')
				menu.classList.remove('show')

				if (isWX) {
					const top = main.scrollTop
					main.classList.remove('lock')
					docEl.scrollTop = top
				} else {
					root.classList.remove('lock')
				}
			}
		},
		fixedHeader: function(top) {
			if (top > header.clientHeight) {
				header.classList.add('fixed')
			} else {
				header.classList.remove('fixed')
			}
		},
		toc: (function() {
			const toc = $('#post-toc')
			if (!toc || !toc.children.length) {
				if (isPost) {
					main.classList.add('show')
				}

				return {
					fixed: noop,
					actived: noop
				}
			}
			const bannerH = $('.post-header').clientHeight,
				headerH = header.clientHeight,
				titles = $('#post-content').querySelectorAll('h1, h2, h3, h4, h5, h6')
			toc
				.querySelector(`a[href="#${titles[0].id}"]`)
				.parentNode.classList.add('active')

			main.classList.add('tocshow')

			title.classList.add('toc')
			$('.footer').classList.add('toc')

			return {
				fixed: function(top) {
					if (top >= bannerH - headerH) {
						toc.classList.add('fixed')
					} else {
						toc.classList.remove('fixed')
					}
				},
				actived: function(top) {
					for (let i = 0, len = titles.length; i < len; i++) {
						if (top > offset(titles[i]).y - headerH - 5) {
							toc.querySelector('li.active').classList.remove('active')
							const active = toc.querySelector(`a[href="#${titles[i].id}"]`)
								.parentNode
							active.classList.add('active')
						}
					}
					if (top < offset(titles[0]).y) {
						toc.querySelector('li.active').classList.remove('active')
						toc
							.querySelector(`a[href="#${titles[0].id}"]`)
							.parentNode.classList.add('active')
					}
				}
			}
		}()),
		hideOnMask: [],
		modal: function(target) {
			this.$modal = $(target)
			this.$off = this.$modal.querySelector('.close')
			const mythis = this
			this.show = function() {
				mask.classList.add('in')
				if (w.innerWidth > 800) {
					main.classList.add('Mask')
					menu.classList.add('Mask')
				}
				mythis.$modal.classList.add('ready')
				setTimeout(function() {
					mythis.$modal.classList.add('in')
				}, 0)
			}
			this.onHide = noop
			this.hide = function() {
				mythis.onHide()
				mask.classList.remove('in')
				if (w.innerWidth > 800) {
					main.classList.remove('Mask')
					menu.classList.remove('Mask')
					const myimg = d.querySelector('.imgShow')
					if (myimg) {
						document.body.removeChild(myimg)
					}
				}

				mythis.$modal.classList.remove('in')
				setTimeout(function() {
					mythis.$modal.classList.remove('ready')
				}, 300)
			}
			this.toggle = function() {
				return mythis.$modal.classList.contains('in')
					? mythis.hide()
					: mythis.show()
			}
			Blog.hideOnMask.push(this.hide)
			if (this.$off) {
				this.$off.addEventListener(even, this.hide)
			}
		},
		share: function() {
			const pageShare = $('#pageShare'),
				fab = $('#shareFab'),
				shareModal = new this.modal('#globalShare')
			if (fab) {
				fab.addEventListener(
					even,
					function() {
						pageShare.classList.toggle('in')
					},
					false
				)
				d.addEventListener(
					even,
					function(e) {
						if (!fab.contains(e.target)) {
							pageShare.classList.remove('in')
						}
					},
					false
				)
			}
			const wxModal = new this.modal('#wxShare')
			wxModal.onHide = shareModal.hide
			forEach.call($$('.wxFab'), function(el) {
				el.addEventListener(even, wxModal.toggle)
			})
		},
		reward: function() {
			const modal = new this.modal('#reward')
			const $rewardCode = $('#rewardCode')
			const $rewardToggle = $('#rewardToggle')
			let tipFirstt = false,
				tipPosition = -1
			const wechatPay = $('.wechatPay')
			const alipayPay = $('.alipayPay')
			const caret = $('.icon-caret-up')
			$('#rewardBtn').addEventListener(even, function() {
				if (tipPosition === -1) {
					$rewardCode.src = $rewardCode.dataset.img
				} else if (tipPosition === 1) {
					$rewardCode.src = $rewardToggle.dataset.alipay
				} else if (tipPosition === 0) {
					$rewardCode.src = $rewardToggle.dataset.wechat
				}
				modal.toggle()
			})

			wechatPay.addEventListener('click', function() {
				tipFirstt = true
			})
			if ($rewardToggle) {
				$rewardToggle.addEventListener('change', function() {
					if (!this.checked) {
						$rewardCode.src = this.dataset.alipay
						alipayPay.classList.add('show')
						wechatPay.classList.remove('show')
						caret.style = 'margin-left:20%;'
						tipPosition = 1
					} else if (!tipFirstt) {
						$rewardCode.src = this.dataset.alipay
						alipayPay.classList.add('show')
						wechatPay.classList.remove('show')
						caret.style = 'margin-left:20%;'
						this.checked = false
						tipPosition = 1
					} else {
						$rewardCode.src = this.dataset.wechat
						alipayPay.classList.remove('show')
						wechatPay.classList.add('show')
						caret.style = 'margin-left:-20%;'
						tipPosition = 0
					}
				})
			}
		},
		tabBar: function(el) {
			el.parentNode.parentNode.classList.toggle('expand')
		},
		page: (function() {
			const $elements = $$('.fade, .fade-scale')
			let visible = false
			return {
				loaded: function() {
					forEach.call($elements, function(el) {
						el.classList.add('in')
					})
					visible = true
				},
				unload: function() {
					forEach.call($elements, function(el) {
						el.classList.remove('in')
					})
					visible = false
				},
				visible: visible
			}
		}()),
		lightbox: (function() {
			function LightBox(element) {
				this.$img = element.querySelector('img')
				this.$overlay = element.querySelector('overlay')
				this.margin = 40
				this.title = this.$img.title || this.$img.alt || ''
				this.isZoom = false
				let naturalW, naturalH, imgRect, docW, docH
				this.calcRect = function() {
					docW = body.clientWidth
					docH = body.clientHeight
					const inH = docH - this.margin * 2
					let ww = naturalW
					let h = naturalH
					const t = this.margin
					const l = 0
					const sw = ww > docW ? docW / ww : 1
					const sh = h > inH ? inH / h : 1
					const s = Math.min(sw, sh)
					ww = ww * s
					h = h * s
					return {
						w: ww,
						h: h,
						t: (docH - h) / 2 - imgRect.top,
						l: (docW - ww) / 2 - imgRect.left + this.$img.offsetLeft
					}
				}
				this.setImgRect = function(rect) {
					this.$img.style.cssText = `width: ${rect.w}px; max-width: ${
						rect.w
					}px; height:${rect.h}px; top: ${rect.t}px; left: ${rect.l}px`
				}
				this.setFrom = function() {
					this.setImgRect({
						w: imgRect.width,
						h: imgRect.height,
						t: 0,
						l: (element.offsetWidth - imgRect.width) / 2
					})
				}
				this.setTo = function() {
					this.setImgRect(this.calcRect())
				}
				this.addTitle = function() {
					if (!this.title) {
						return
					}
					this.$caption = d.createElement('div')
					this.$caption.innerHTML = this.title
					this.$caption.className = 'overlay-title'
					element.appendChild(this.$caption)
				}
				this.removeTitle = function() {
					if (this.$caption) {
						element.removeChild(this.$caption)
					}
				}
				const mythis = this
				this.zoomIn = function() {
					naturalW = this.$img.naturalWidth || this.$img.width
					naturalH = this.$img.naturalHeight || this.$img.height
					imgRect = this.$img.getBoundingClientRect()
					element.style.height = `${imgRect.height}px`
					element.classList.add('ready')
					this.setFrom()
					this.addTitle()
					this.$img.classList.add('zoom-in')
					setTimeout(function() {
						element.classList.add('active')
						mythis.setTo()
						mythis.isZoom = true
					}, 0)
				}
				this.zoomOut = function() {
					this.isZoom = false
					element.classList.remove('active')
					this.$img.classList.add('zoom-in')
					this.setFrom()
					setTimeout(function() {
						mythis.$img.classList.remove('zoom-in')
						mythis.$img.style.cssText = ''
						mythis.removeTitle()
						element.classList.remove('ready')
						element.removeAttribute('style')
					}, 300)
				}
				element.addEventListener('click', function(e) {
					if (mythis.isZoom) {
						mythis.zoomOut()
					} else if (e.target.tagName === 'IMG') {
						mythis.zoomIn()
					}
				})
				d.addEventListener('scroll', function() {
					if (mythis.isZoom) {
						mythis.zoomOut()
					}
				})
				w.addEventListener('resize', function() {
					if (mythis.isZoom) {
						mythis.zoomOut()
					}
				})
			}
			forEach.call($$('.img-lightbox'), function(el) {
				new LightBox(el)
			})
		}()),
		loadScript: function(scripts) {
			scripts.forEach(function(src) {
				const s = d.createElement('script')
				s.src = src
				s.async = true
				body.appendChild(s)
			})
		}
	}
	/* 页面加载第二个执行的事件 */
	w.addEventListener('load', function() {
		loading.classList.remove('active')
		Blog.page.loaded()
		if (w.lazyScripts && w.lazyScripts.length) {
			Blog.loadScript(w.lazyScripts)
		}
		// issues的内容写到microw节点下
		// document.querySelector("#microw").innerHTML= resStr;
	})
	/* 页面加载第一个执行的事件 */
	w.addEventListener('DOMContentLoaded', function() {
		const top = docEl.scrollTop
		Blog.toc.fixed(top)
		Blog.toc.actived(top)
		Blog.page.loaded()
	})
	/* 打开邮箱时，不触发关闭页面事件 */
	let ignoreUnload = false
	const $mailTarget = $('a[href^="mailto"]')
	if ($mailTarget) {
		$mailTarget.addEventListener(even, function() {
			ignoreUnload = true
		})
	}
	/* 页面关闭 刷新事件 */
	w.addEventListener('beforeunload', function() {
		if (!ignoreUnload) {
			Blog.page.unload()
		} else {
			ignoreUnload = false
		}
	})
	/* 页面加载第三个执行的事件 */
	w.addEventListener('pageshow', function() {
		if (!Blog.page.visible) {
			Blog.page.loaded()
		}
	})
	/* 调整窗口大小时，自动 */
	w.addEventListener('resize', function() {
		even = 'ontouchstart' in w ? 'touchstart' : 'click'
		w.BLOG.even = even
		Blog.toggleMenu()
	})
	gotop.addEventListener(
		even,
		function() {
			animate(Blog.goTop.bind(Blog, 0))
		},
		false
	)
	menuToggle.addEventListener(
		even,
		function(e) {
			Blog.toggleMenu(true)
			e.preventDefault()
		},
		false
	)
	menuOff.addEventListener(
		even,
		function() {
			menu.classList.add('hide')
			if (!isPost) {
				main.classList.add('menuoff')
				jQuery(title).animate({
					marginRight: '15%'
					// marginRight: '-3%'
				})
			}
		},
		false
	)
	mask.addEventListener(
		even,
		function(e) {
			Blog.toggleMenu()
			Blog.hideOnMask.forEach(function(hide) {
				hide()
			})
			e.preventDefault()
		},
		false
	)
	d.addEventListener(
		'scroll',
		function() {
			const top = docEl.scrollTop
			Blog.toggleGotop(top)
			Blog.fixedHeader(top)
			Blog.toc.fixed(top)
			Blog.toc.actived(top)
		},
		false
	)
	if (w.BLOG.SHARE && isPost) {
		Blog.share()
	}
	if (w.BLOG.REWARD) {
		Blog.reward()
	}
	Blog.noop = noop
	Blog.even = even
	Blog.$ = $
	Blog.$$ = $$
	Object.keys(Blog).reduce(function(g, e) {
		g[e] = Blog[e]
		return g
	}, w.BLOG)

	if (w.Waves) {
		Waves.init()
		Waves.attach('.global-share li', ['waves-block'])
		Waves.attach('.article-tag-list-link, #page-nav a, #page-nav span', [
			'waves-button'
		])
	} else {
		console.error('Waves loading failed.')
	}
}(window, document))

/*search*/
;(function() {
	const G = window || this,
		even = G.BLOG.even,
		$ = G.BLOG.$,
		searchIco = $('#search'),
		searchWrap = $('#search-wrap'),
		keyInput = $('#key'),
		back = $('#back'),
		searchPanel = $('#search-panel'),
		searchResult = $('#search-result'),
		searchTpl = $('#search-tpl').innerHTML,
		JSON_DATA = `${G.BLOG.ROOT}/content.json`.replace(/\/{2}/g, '/')
	let searchData

	function loadData(success) {
		if (!searchData) {
			const xhr = new XMLHttpRequest()

			xhr.open('GET', JSON_DATA, true)

			xhr.onload = function() {
				if (this.status >= 200 && this.status < 300) {
					const res = JSON.parse(this.response)

					searchData = res instanceof Array ? res : res.posts

					success(searchData)
				} else {
					console.error(this.statusText)
				}
			}

			xhr.onerror = function() {
				console.error(this.statusText)
			}

			xhr.send()
		} else {
			success(searchData)
		}
	}

	function tpl(html, data) {
		return html.replace(/\{\w+\}/g, function(str) {
			const prop = str.replace(/\{|\}/g, '')
			return data[prop] || ''
		})
	}

	const root = $('html')

	const Control = {
		show: function() {
			if (G.innerWidth < 760) {
				root.classList.add('lock-size')
			}
			searchPanel.classList.add('in')
		},
		hide: function() {
			if (G.innerWidth < 760) {
				root.classList.remove('lock-size')
			}
			searchPanel.classList.remove('in')
		}
	}

	function render(data) {
		let html = ''
		if (data.length) {
			html = data
				.map(function(post) {
					return tpl(searchTpl, {
						title: post.title,
						path: `${G.BLOG.ROOT}/${post.path}`.replace(/\/{2,}/g, '/'),
						date: new Date(post.date).toLocaleDateString(),
						tags: post.tags
							.map(function(tag) {
								return `<span>#${tag.name}</span>`
							})
							.join('')
					})
				})
				.join('')
		} else {
			html =
				'<li class="tips"><i class="icon icon-coffee icon-3x"></i><p>Results not found!</p></li>'
		}

		searchResult.innerHTML = html
	}

	function regtest(raw, regExp) {
		regExp.lastIndex = 0
		return regExp.test(raw)
	}

	function matcher(post, regExp) {
		return (
			regtest(post.title, regExp) ||
			post.tags.some(function(tag) {
				return regtest(tag.name, regExp)
			}) ||
			regtest(post.text, regExp)
		)
	}

	function search(e) {
		const key = this.value.trim()
		if (!key) {
			return
		}
		//对括号取消转义,当成普通字符串
		nkey = key.replace(/[(]/g, '\\(').replace(/[)]/g,'\\)')
		const regExp = new RegExp(nkey.replace(/[ ]/g, '|'), 'gmi')

		loadData(function(data) {
			const result = data.filter(function(post) {
				return matcher(post, regExp)
			})

			render(result)
			Control.show()
		})

		e.preventDefault()
	}

	searchIco.addEventListener(even, function() {
		searchWrap.classList.toggle('in')
		keyInput.value = ''
		if (searchWrap.classList.contains('in')) {
			keyInput.focus()
		} else {
			keyInput.blur()
		}
	})

	back.addEventListener(even, function() {
		searchWrap.classList.remove('in')
		Control.hide()
	})

	document.addEventListener(even, function(e) {
		if (e.target.id !== 'key' && even === 'click') {
			Control.hide()
		}
	})

	keyInput.addEventListener('input', search)
	keyInput.addEventListener(even, search)
	// 添加音乐播放器
	var bodywrap = document.getElementsByClassName('nav')[0]
	var aplaycss = document.createElement('link')
	aplaycss.rel = 'stylesheet'
	aplaycss.href = '/blog/dist/APlayer.min.css'
	// bodywrap.parentNode.insertBefore(aplaycss,bodywrap)
	bodywrap.appendChild(aplaycss)

	var aplaydiv = document.createElement('div')
	aplaydiv.id = 'aplayer'
	// bodywrap.parentNode.insertBefore(aplaydiv,bodywrap)
	bodywrap.appendChild(aplaydiv)

	var aplaysc = document.createElement('script')
	aplaysc.type = 'text/javascript'
	aplaysc.src = '/blog/dist/APlayer.min.js'
	// bodywrap.parentNode.insertBefore(aplaysc,bodywrap)
	bodywrap.appendChild(aplaysc)

	function getChanges(res){
		if (res.data["changes"].length>0){
			document.getElementById("temp").remove();
		}
		const microw = document.getElementById("microw");
		let tempcontent="";
		res.data["changes"].reverse().forEach(element => {
			let content = element["file"]["content"];
			if ((tempcontent.substr(0,10) != content.substr(0,10)) && content.charAt(0)===" "){
				var issue = document.createElement("div");
				issue.setAttribute("class", "is-issue-content")

				let foot = document.createElement("i");
				foot.setAttribute("class", "icon is-icon");
				foot.innerText="🍓 Yummy🥝";
				issue.append(foot);

				
				var cont = document.createElement("div");
				cont.innerText=element["file"]["content"];
				issue.append(cont);

				var head = document.createElement("div");
				head.innerText=element["at"].replace("T", " ").replace("Z", " ");
				head.setAttribute("class", "is-issue-header")
				issue.append(head);

				microw.append(issue);

				tempcontent = content;
				}
			});
		}
	
	//<!-- <div id="temp" class="is-issue-content"><i class="icon is-icon">🍓 Yummy🥝</i><div> 最近一个月应该至少有20天是，一天花1小时练ukulele，起的茧也开始脱皮了。。。<br>其实就是跟着节拍器的节奏爬格子，爬完之后练不同和弦的扫弦。扫弦我是真的纠结了好久，怎么练都跟视频里的声音不对。所以就把自己弹的和视频里的也录下来，然后一遍遍的听、比对，但只是知道明显不对，又听不出来哪里不对。<br>然后又去YouTube、b站找了一堆扫弦、strumming之类的视频看，还包括Jake Shimabukuro讲的。。。<br>继续录音、录视频，暂停、播放，调音、换弦，观察、比对姿势和琴弦的变化，才终于发现，别人扫弦是真的如清风一般轻轻又快速的扫过，弦的振幅很小的，而我总是太着急，总是想着快，快着快着就成了“击”弦了，所以总是有杂音。。。<br>然后昨天练习，突然发现，好像有点那种该有的味道了，节奏感也有那么点了！😄<br>所以总结下来就是:<br>1.扫弦要真的扫到弦，现在我还只是入门，每根弦都扫到，后面进阶应该还得学些乐理什么的才知道什么时候又不用扫哪根弦；<br>2.力度要轻而且要稳，这个真的得像做饭掌握火候一样，得多练才知道怎样才是合适的力度。静下心来观察自己不对的地方，不要急，年轻人，是你的总会是你的，该会的总该会的；<br>3.琴弦和琴的构造都会影响音色，反正我看了那么多视频，他们弹出来的声音都是有差别的；</div><div class="is-issue-header">2021-02-25 14:53:22 </div></div>
	// <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
	async function getcontent(){
		// axios.get("https://api.github.com")
		let res = await axios.get("https://cors-anywhere.herokuapp.com/https://api.cacher.io/libraries/cb7723cbce059cfa0f7d/snippets/7d52434c5531f01447c0/files/b754cca0c3b8cc2ebeca/changes", {
		"headers": {
		"accept": "application/json",
		"accept-language": "zh-CN,zh;q=0.9",
		"access-token": "838AALQKQGgd3QJDZDD7jg",
		"client": "7qm4_6_9LQ11ZK0zP0JkCQ",
		"content-type": "application/json",
		"expiry": "1645674645",
		"provider": "github",
		"token-type": "Bearer",
		"uid": "45418706",
		"x-client-session": "aa82caa2-d978-3a4c-62b9-5d0503cb258e"
		},
		"referrerPolicy": "same-origin",
		"body": null,
		"method": "GET",
		"mode": "cors",
		"credentials": "omit"
		});
		return res
	}

	async function getSnippet(){
		let res = await axios.get("https://cors.bridged.cc/https://api.cacher.io/libraries/cb7723cbce059cfa0f7d/snippets/7d52434c5531f01447c0", {
			"headers": {
				"accept": "application/json",
				"accept-language": "zh-CN,zh;q=0.9",
				"access-token": "838AALQKQGgd3QJDZDD7jg",
				"client": "7qm4_6_9LQ11ZK0zP0JkCQ",
				"content-type": "application/json",
				"expiry": "1645674645",
				"provider": "github",
				"token-type": "Bearer",
				"uid": "45418706",
				"x-client-session": "d415f9e6-af8e-b46b-25df-7fa688ec7ef9"
			},
			"referrerPolicy": "same-origin",
			"body": "{\"snippet\":{\"id\":993500,\"guid\":\"7d52434c5531f01447c0\",\"title\":\"ymblog\",\"description\":\"\",\"isPrivate\":true,\"createdAt\":\"2021-02-25T14:53:22Z\",\"updatedAt\":\"2021-02-26T00:51:52Z\",\"gistId\":\"8fd3880afecb8583aaf8d7a013666524\",\"gistboxId\":null,\"syncToGist\":true,\"gistUpdatedAt\":\"2021-02-25T14:53:42Z\",\"pagePermission\":null,\"files\":[{\"id\":1462119,\"guid\":\"b754cca0c3b8cc2ebeca\",\"filename\":\"ymblog\",\"filetype\":\"text\",\"content\":\" 最近一个月应该至少有20天是，一天花1小时练ukulele，起的茧也开始脱皮了。。。\\n其实就是跟着节拍器的节奏爬格子，爬完之后练不同和弦的扫弦。扫弦我是真的纠结了好久，怎么练都跟视频里的声音不对。所以就把自己弹的和视频里的也录下来，然后一遍遍的听、比对，但只是知道明显不对，又听不出来哪里不对。\\n然后又去YouTube、b站找了一堆扫弦、strumming之类的视频看，还包括Jake Shimabukuro讲的。。。\\n继续录音、录视频，暂停、播放，调音、换弦，观察、比对姿势和琴弦的变化，才终于发现，别人扫弦是真的如清风一般轻轻又快速的扫过，弦的振幅很小的，而我总是太着急，总是想着快，快着快着就成了“击”弦了，所以总是有杂音。。。\\n然后昨天练习，突然发现，好像有点那种该有的味道了，节奏感也有那么点了！😄\\n所以总结下来就是:\\n1.扫弦要真的扫到弦，现在我还只是入门，每根弦都扫到，后面进阶应该还得学些乐理什么的才知道什么时候又不用扫哪根弦；\\n2.力度要轻而且要稳，这个真的得像做饭掌握火候一样，得多练才知道怎样才是合适的力度。静下心来观察自己不对的地方，不要急，年轻人，是你的总会是你的，该会的总该会的；\\n3.琴弦和琴的构造都会影响音色，反正我看了那么多视频，他们弹出来的声音都是有差别的；\",\"contentLength\":548,\"isShared\":false,\"snippetFileOrder\":0,\"createdAt\":\"2021-02-25T14:53:22Z\",\"updatedAt\":\"2021-02-25T14:53:22Z\"},{\"id\":1462534,\"guid\":\"de165b07d86e897ee13f\",\"filename\":\"test\",\"filetype\":\"python\",\"content\":\"just test\\n2021/02/25\",\"contentLength\":9,\"isShared\":false,\"snippetFileOrder\":1,\"createdAt\":\"2021-02-26T00:51:52Z\",\"updatedAt\":\"2021-02-26T00:51:52Z\"}],\"starredBy\":[],\"createdBy\":{\"id\":43802,\"name\":null,\"email\":\"541897923@qq.com\",\"image\":\"https://avatars.githubusercontent.com/u/45418706?v=4\",\"nickname\":\"ym-first\",\"provider\":\"github\"},\"lastUpdatedBy\":{\"id\":43802,\"name\":null,\"email\":\"541897923@qq.com\",\"image\":\"https://avatars.githubusercontent.com/u/45418706?v=4\",\"nickname\":\"ym-first\",\"provider\":\"github\"}},\"assignToUserId\":null,\"autosave\":false}",
			"method": "PUT",
			"mode": "cors",
			"credentials": "omit"
			});
		return res;
	}
	
	window.onload = function(){
		var msc = document.createElement('script')
		msc.type = 'text/javascript'
		msc.src = '/blog/dist/music.js'
		bodywrap.appendChild(msc)

		
		// let t = document.querySelector("relative-time");
		// var ovser = new MutationObserver((mutations)=>{
		// 	mutations.forEach((mu)=>{
		// 	if (mu.type=="attributes"){
		// 		let temptime = new Date(t.getAttribute("datetime")).getTime();
		// 	t.innerHTML = timeDifference(new Date().getTime(),temptime)
		// 	}})}
		// )
		// ovser.observe(t,{attributes:true})

		// // 从cacher获取即时代码片段
		// let res = getSnippet();
		// let resArray = []
		// let i = 0
		// let snippetsArray = document.querySelectorAll("#microw .cacher-snippet");
		// snippetsArray.forEach((element)=>{
		// 	element.setAttribute("class","is-issue-content");
			
		// 	let foot = element.lastChild;
		// 	let author = document.createElement("em");
		// 	author.innerText="🍓 Yummy🥝 ";
		// 	element.insertBefore(author,element.firstChild);

		// 	foot.innerHTML= "";
		// 	let empostTime = document.createElement("em")
			
		// 	let postTime = document.createElement("relative-time");
		// 	empostTime.appendChild(postTime);
		// 	postTime.innerText = "hold on ...";
		// 	foot.appendChild(empostTime);
		// 	foot.setAttribute("id", "snippetFoot");
		// })
		// // 遍历接口获取的数据，修改片段时间
		// res.then(response=>{
		// 	resArray = response.data["snippet"]["files"].reverse();
		// 	snippetsArray.forEach((element)=>{
		// 		let postTime = element.lastChild.lastChild;
		// 		let createAt = new Date(resArray[i]["createdAt"]).getTime();
		// 		postTime.innerText= timeDifference(new Date().getTime(),createAt)
		// 		i ++;
		// 	});
		// })
	}
	// if (G.innerWidth > 760) {// }
}.call(this))
