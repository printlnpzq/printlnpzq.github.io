window.onload = function () {

	//获取canvas元素
	var canvas = document.getElementById('canvas');

	//获取canvas上下文环境
	var context = canvas.getContext('2d');

	//游戏逻辑对象
	var game = {

		//地图横向地板数量
		xCount: 16,

		//地图纵向地板数量
		yCount: 16,

		//地板方块宽度
		w: 35,

		//地板方块高度
		h: 35,

		//当前地图信息
		curMap: null,

		//初始化地图信息
		curLevel: null,

		//人物
		curMan: null,

		//关卡序号
		iCurlevel: 0,

		//人物移动步数
		moveTimes: 0,

		//游戏所有图片信息对象
		oImgs: {
			block : "images/block.gif", 	//地板
			wall 	: "images/wall.png",		//障碍物
			box 	: "images/box.png",			//箱子
			ball 	: "images/ball.png",		//目标物品
			up		: "images/up.png",			//上人物
			down 	: "images/down.png",		//下人物
			left 	: "images/left.png",		//左人物
			right : "images/right.png"		//右人物
		},

		//图片实例对象
		imgInstance: {},

		//初始化人物坐标
		manCoordinate: {
			x: 0,
			y: 0
		},

		//预加载游戏所有图片
		imgPreload: function (oImgs, cb) {
			//oImgs: 游戏所有图片信息对象
			//cb: 预加载的回调函数

			//保留this指向game对象
			var self = this;

			//预加载图片对象
			var images = {};

			//记录预加载图片数量
			var imgCount = 0;

			//记录游戏所需图片总数量
			var originImgCount = Object.keys(oImgs).length;

			//循环生成图片实例, 并加载到 images
			for (var key in oImgs) {

				//创建图片实例
				images[key] = new Image();

				images[key].onload = function () {
					if (++imgCount >= originImgCount) {
						cb(images);
					}
				}

				//为图片实例加载图片资源
				images[key].src = oImgs[key];

			}

		},

		//创建地图
		createMap: function () {

			var self = this;

			//canvas绘制图片必须等待图片加载完成后才能绘制

				//按行绘制地板
				for (var i = 0; i < self.xCount; i++) {

					for (var j = 0; j < self.yCount; j++) {

						//绘制地板 block
						context.drawImage(self.imgInstance.block, self.w * j, self.h * i, self.w, self.h);

					}

				}



		},

		//创建每个关卡的地图
		createEveryMap: function (levelData, man) {

			//levelData: 关卡数据源

			//man: 方向人物 

			var self = this;

			//按行绘制相应图片
			for (var i = 0; i < levelData.length; i++) {

				for (var j = 0; j < levelData[i].length; j++) {

					//初始化地板信息
					var picture = self.imgInstance.block;

					switch (levelData[i][j]) {

						case 1: //绘制障碍物
							picture = self.imgInstance.wall;
							break;

						case 2: //绘制目标物品
							picture = self.imgInstance.ball;
							break;

						case 3: //绘制箱子
							picture = self.imgInstance.box;
							break;

						case 4: //绘制人物
							picture = man || self.imgInstance.down;
							//设置人物坐标
							self.manCoordinate.x = i;
							self.manCoordinate.y = j;
							break;

						case 5: //绘制箱子和目标物品位置
							picture = self.imgInstance.box;
							break;

					}

					// 每个图片不一样宽 需要在对应地板的中心绘制地图
						context.drawImage(picture, self.w * j - (picture.width - self.w) / 2, self.h * i - (picture.height - self.h), picture.width, picture.height);

				}

			}

		},

		//初始化游戏等级
		initLevel: function () {

			//当前移动过的游戏地图
			this.curMap = this.copyArray(levels[this.iCurlevel]);

			//当前等级的初始地图
			this.curLevel = levels[this.iCurlevel];

			//初始化人物方向图片
			this.curMan = this.imgInstance.down;

			//初始化地图
			this.createMap();

			//创建初始化等级地图
			this.createEveryMap(this.curMap);

			//设置当前关卡序号
			document.getElementById('cardCount').textContent = this.iCurlevel + 1;

			//设置步数
			document.getElementById('stepCount').textContent = this.moveTimes;
		},

		//初始化地图
		initMap: function () {
			var self = this;

			//预加载游戏所有图片, 并且生成图片实例
			self.imgPreload(self.oImgs, function (images) {
				for (var key in images) {
					self.imgInstance[key] = images[key];
				}

				//初始化等级
				self.initLevel();
			});

		},

		//i: -1 ==> 上一关卡,  0 ==> 重玩本关卡, 1 ==> 下一关卡
		//d: 关卡数组
		selectLevel: function (i, d) {
			//this.iCurlevel当前的地图关卡序号
			this.iCurlevel += i;

			var len = d.length;

			if (this.iCurlevel < 0) {

				this.iCurlevel = 0;

			} else if (this.iCurlevel > len - 1) {

				this.iCurlevel = len - 1;

			} else {
				this.moveTimes = 0;//游戏关卡移动步数清零
				this.initLevel();//初始当前等级关卡

			}

		},

		//判断所有目标物品是否被箱子覆盖, 若是推动成功, 否则推动失败
		checkSuccess: function () {

			//对比移动后的当前地图this.curMap和初始化地图this.curLevel

			for (var i = 0; i < this.curMap.length; i++) {
				for (var j = 0; j < this.curMap[i].length; j++) {

					//如果初始化地图的目标物品不是移动后地图的箱子, 则推动失败
					if ((this.curLevel[i][j] == 2 || this.curLevel[i][j] == 5) && this.curMap[i][j] != 3) {

						return false;

					}

				}
			}

			return true;

		},

		//人物移动
		moving: function (direction) {
			//direction: 人物移动方向, up: 上, down: 下, left: 左, right: 右

			//保存人物移动1个位置后的坐标
			var man = {};

			//保存人物移动2个位置后的坐标, 主要判断盒子是否能够移动
			var box = {};

			//x: 上下(up, down), y: 左右(left, right)

			switch (direction) {

				case 'up':
					//人物向上
					this.curMan = this.imgInstance.up;

					man.x = this.manCoordinate.x - 1;
					man.y = this.manCoordinate.y;

					box.x = this.manCoordinate.x - 2;
					box.y = this.manCoordinate.y;
					break;

				case 'down':
					//人物向下
					this.curMan = this.imgInstance.down;

					man.x = this.manCoordinate.x + 1;
					man.y = this.manCoordinate.y;

					box.x = this.manCoordinate.x + 2;
					box.y = this.manCoordinate.y;
					break;

				case 'left':
					//人物向左
					this.curMan = this.imgInstance.left;

					man.x = this.manCoordinate.x;
					man.y = this.manCoordinate.y - 1;

					box.x = this.manCoordinate.x;
					box.y = this.manCoordinate.y - 2;
					break;

				case 'right':
					//人物向右
					this.curMan = this.imgInstance.right;

					man.x = this.manCoordinate.x;
					man.y = this.manCoordinate.y + 1;

					box.x = this.manCoordinate.x;
					box.y = this.manCoordinate.y + 2;
					break;

			}

			//如果人物成功移动, 则更新移动步数
			if (this.controlMoving(man, box)) {
				this.moveTimes++;
			}

			//设置步数
			document.getElementById('stepCount').textContent = this.moveTimes;


			//初始化地图
			this.createMap();

			//创建初始化等级地图
			this.createEveryMap(this.curMap, this.curMan);

			//校验是否推动成功
			if (this.checkSuccess()) {
				this.selectLevel(1, levels);
			}

		},

		//控制人物是否可移动
		controlMoving: function (o1, o2) {
			//x: 上下(up, down), y: 左右(left, right)
			//o1: 保存人物移动1个位置后的坐标
			//o2: 保存人物移动2个位置后的坐标, 主要判断盒子是否能够移动

			//如果超出地图上下左右边界, 则人物不能移动
			//o1.x: 地图上边界或者下边界
			//o1.y: 地图左边界或者右边界
			if (o1.x < 0 || o1.y < 0 || o1.x > this.curMap.length || o1.y > this.curMap[0].length) {
				return false;
			}

			//如果小人前面是障碍物, 则小人不能移动
			if (this.curMap[o1.x][o1.y] == 1) {
				return false;
			}

			//如果人物前面是箱子, 则需要判断箱子前面是否有箱子或者障碍物, 否则箱子移动一步
			if (this.curMap[o1.x][o1.y] == 3 || this.curMap[o1.x][o1.y] == 5) {

				if (this.curMap[o2.x][o2.y] == 1 || this.curMap[o2.x][o2.y] == 3) {
					return false;
				}

				//如果前面条件均不成立, 则箱子移动
				this.curMap[o2.x][o2.y] = 3;

			}

			//如果前面条件均不成立, 则人物移动
			this.curMap[o1.x][o1.y] = 4;

			//如果人物移动, 纠正人物移动前的图片显示
			var index = this.curLevel[this.manCoordinate.x][this.manCoordinate.y];

			//如果不是目标物品
			if (index != 2) {

				//则有可能是盒子和目标物品重叠
				if (index == 5) {
					//显示目标物品
					index = 2;
				} else {
					//显示为地板
					index = 0;
				}

			}

			//将人物的移动前位置纠正图片显示
			this.curMap[this.manCoordinate.x][this.manCoordinate.y] = index;

			//更新人物移动后的坐标
			this.manCoordinate.x = o1.x;
			this.manCoordinate.y = o1.y;

			//可移动
			return true;

		},

		//为document绑定keydown事件, left: 37, up: 38, right: 39, down: 40
		addEvent: function () {

			var self = this;

			document.onkeydown = function (e) {

				//获取键盘码点(键码)
				var keyCode = e.keyCode;

				switch (keyCode) {

					//left: 左箭头
					case 37:
						self.moving('left');
						break;

					//up: 上箭头
					case 38:
						self.moving('up');
						break;

					//right: 右箭头
					case 39:
						self.moving('right');
						break;

					//down: 下箭头
					case 40:
						self.moving('down');
						break;
				}
				
			};

			//为按钮绑定点击事件
			var lists = document.getElementsByClassName('level');

			for (var i = 0; i < lists.length; i++) {

				lists[i].onclick = function () {

					var level = Number(this.getAttribute('id'));

					self.selectLevel(level, levels);

				}
			}

			document.getElementById('know').onclick = function () {
				document.getElementById('layer').style.display = 'none';
			}

			document.getElementById('gameIntroduce').onclick = function () {
				document.getElementById('layer').style.display = 'block';
			}
		},

		//复制二维数组数据
		copyArray: function (data) {

			//data: 二维数组

			var d = [];

			for (var i = 0; i < data.length; i++) {
				d[i] = data[i].concat(); //防止复制后两个数组共用一个引用地址
			}

			return d;
		},

		//初始化游戏
		initGame: function () {
			this.initMap();
			this.addEvent();
		}

	};


	//初始化
	game.initGame();

}