'use strict';

var $info = document.querySelector('#info_id'),
	$play = document.querySelector('#play'),
	$content = document.querySelector('#content_id'),
	$code = document.querySelector('#code_id'),
	$block = document.querySelector('#block_id'),
	$blocks = document.querySelectorAll('#block_id .grey');

var $elem = null;
var instructions = [];
var instructionIndex = 0;
var HEIGHT = 592, WIDTH = 640;

var blocks = {

	init: function() {
		[].forEach.call($blocks, function(block) {
			block.addEventListener('dragstart', blocks.dragStart, false);
			block.addEventListener('dragover', blocks.dragOver, false);
			block.addEventListener('dragend', blocks.dragEnd, false);
		});
	},

	dragStart: function(e) {
		this.style.opacity = 0.4;

		$elem = this;

		e.dataTransfer.effectAllowed = 'copy';
		e.dataTransfer.setData('text/html', this.innerHTML);
	},

	dragOver: function(e) {
		if(e.preventDefault) {
			e.preventDefault();
		}

		return false;
	},

	dragEnd: function(e) {
		this.style.opacity = 1;
	}
};

var code = {

	elm: null,

	init: function() {
		$code.addEventListener('drop', code.drop, false);
		$code.addEventListener('dragover', code.dragOver, false);
	},

	dragOver: function(e) {
		if(e.preventDefault) {
			e.preventDefault();
		}

		return false;
	},
	drop: function(e) {
		if(e.stopPropagation) {
			e.stopPropagation();
		}

		e.preventDefault();

		var $copyElem = $elem.cloneNode(true);
		$copyElem.style.opacity = 1;
		this.appendChild($copyElem);
		var $codeChild = this.children;
		[].forEach.call($codeChild, function($child) {
			$child.addEventListener('dblclick', code.removeElem, false);

		});
		
		return false;
	},

	removeElem: function(e) {
		var $el = e.target.parentNode;
		$el.outerHTML = '';
	}
};

var pGame = {

	p: null,
	ninja: null,
	anim: null,
	isMoving: false,
	grid: [],
	flag: null,
	nbMove: 0,

	init: function() {
		pGame.p = new Phaser.Game(
			WIDTH, 
			HEIGHT, 
			Phaser.AUTO, 
			$content, {
				preload: pGame.preload, 
				create: pGame.create,
				update: pGame.update, 
				render: pGame.render
			}
		)
	}
};

pGame.is = function (x, y) {
	if(x === 544 && y === 256) {
		return 'flag';
	}

	var tileX = Math.floor(x / 32), tileY = Math.floor(y / 32);

	var tile = pGame.level.getTile(tileX, tileY);
	console.log(tile.index);
	if(tile.index !== 45 && tile.index !== 24 && tile.index !== 66 && tile.index !== 44 && tile.index !== 47) {
		return 'block';
	}

	return 'floor';
};

pGame.drawGrid = function(game) {
	for (var i = 0; i < WIDTH; i+=32) {
		for (var j = 0; j < HEIGHT; j+=32) {
			var g = game.add.graphics(i, j);
			g.lineStyle(1, 0xffffff, 1);
			g.moveTo(0, 0);  
    		g.lineTo(32, 0);

    		g.moveTo(32, 0);  
    		g.lineTo(32, 32);

    		g.moveTo(32, 32);  
    		g.lineTo(0, 32);

    		g.moveTo(0, 32);  
    		g.lineTo(0, 0);
		}
	}
};

pGame.animationStopped = function (sprite, animation) {
	animation.stop();
	sprite.frame = 0;
	this.isMoving = false;
	this.nbMove = 1;

	setTimeout(function() {
		Game.nextInstruction();
	}, 1000);

};

pGame.preload = function() {
	
	this.load.spritesheet('ninja', 'assets/characters/1.png', 64/4, 112/7);
	this.load.spritesheet('flag', 'assets/background-elements/sprite-flag.png', 64/4, 16);
	this.load.tilemap('map_lvl1', 'assets/tilemap/lvl1.json', null, Phaser.Tilemap.TILED_JSON);
	this.load.image('indoor', 'assets/background-elements/indoor-tileset.png');

};

pGame.create = function() {
	
	this.stage.backgroundColor = 0x000000;

	pGame.level = this.add.tilemap('map_lvl1');
	pGame.level.addTilesetImage('lvl1', 'indoor');

	pGame.layerMap = pGame.level.createLayer('indoor');
	pGame.layerMap.scale.set(2, 2);

	pGame.layerMap.resizeWorld();

	pGame.ninja = this.add.sprite(64, 256, 'ninja', 0);
	pGame.ninja.scale.setTo(2, 2);

	pGame.ninja.animations.add('stand', 0, 60);
	pGame.ninja.animations.add('mLeft', [2, 6, 10, 14], 60);
	pGame.ninja.animations.add('mRight', [3, 7, 11, 15], 60);
	pGame.ninja.animations.add('mUp', [1, 5, 9, 13], 60);
	pGame.ninja.animations.add('mDown', [0, 4, 8, 12], 60);

	pGame.flag = this.add.sprite(544, 256, 'flag', 0);
	pGame.flag.scale.setTo(2,2);

	pGame.flag.animations.add('animate', [0, 1, 2, 3], 60);
	pGame.flag.animations.play('animate', 4, true);

	pGame.drawGrid(this);
	
};

pGame.update = function() {

	if(pGame.anim === null) {
		return;
	}

	if(pGame.nbMove > 32) {

		return;
	}

	if(pGame.isMoving && pGame.is(pGame.ninja.x, pGame.ninja.y) === 'floor') {
		pGame.nbMove++;
		if(pGame.anim.name === 'mLeft') {
			pGame.ninja.x -= 1;
		}

		if(pGame.anim.name === 'mRight') {
			pGame.ninja.x += 1;
		}

		if(pGame.anim.name === 'mUp') {
			pGame.ninja.y -= 1;
		}

		if(pGame.anim.name === 'mDown') {
			pGame.ninja.y += 1;
		}
	}
}

pGame.moveLeft = function() {
	while(!this.isMoving) {
		this.isMoving = true;	
		pGame.anim = this.ninja.animations.play('mLeft', 4);
		pGame.anim.onComplete.add(pGame.animationStopped, this);

	}
	
}

pGame.moveRight = function() {
	while(!this.isMoving) {
		this.isMoving = true;	
		pGame.anim = this.ninja.animations.play('mRight', 4);
		pGame.anim.onComplete.add(pGame.animationStopped, this);
	}
}

pGame.moveUp = function() {
	while(!this.isMoving) {
		this.isMoving = true;	
		pGame.anim = this.ninja.animations.play('mUp', 4);
		pGame.anim.onComplete.add(pGame.animationStopped, this);
	}
}

pGame.moveDown = function() {
	while(!this.isMoving) {
		this.isMoving = true;	
		pGame.anim = this.ninja.animations.play('mDown', 4);
		pGame.anim.onComplete.add(pGame.animationStopped, this);
	}
}

pGame.render = function () {
}

var Game = {

	run: function() {
		blocks.init();
		code.init();
		pGame.init();

		$play.addEventListener('click', Game.play, false);

	},

	play: function(e) {
		var $codeChildren = $code.children;

		instructions = [];
		instructionIndex = 0;
		pGame.ninja.position.setTo(64, 256);
		[].forEach.call($codeChildren, function($child) {
			instructions.push($child.children[0].innerHTML);
		});

		Game.execute(instructionIndex);

	},

	execute: function(id) {
		switch(instructions[id]) {

			case 'MOVE LEFT':
				pGame.moveLeft();
				break;

			case 'MOVE RIGHT':
				pGame.moveRight();
				break;

			case 'MOVE UP':
				pGame.moveUp();
				break;

			case 'MOVE DOWN':
				pGame.moveDown();
				break;

		}
	},

	nextInstruction: function() {
		instructionIndex++;
		Game.execute(instructionIndex);
	}
};

Game.run();