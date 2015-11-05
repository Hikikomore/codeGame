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
var HEIGHT = 600, WIDTH = 720;

var blocks = {

	init: function() {
		[].forEach.call($blocks, function(block) {
			block.addEventListener('dragstart', blocks.dragStart, false);
			block.addEventListener('dragleave', blocks.dragLeave, false);
			block.addEventListener('dragend', blocks.dragEnd, false);
		});
	},

	dragStart: function(e) {
		this.style.opacity = 0.4;

		$elem = this;

		e.dataTransfer.effectAllowed = 'copy';
		e.dataTransfer.setData('text/html', this.innerHTML);
	},

	dragLeave: function(e) {
		//console.log('dragleave');
	},

	dragEnd: function(e) {
		this.style.opacity = 1;
	}



};

var code = {

	init: function() {
		$code.addEventListener('drop', code.drop, false);
		$code.addEventListener('dragenter', code.dragEnter, false);
		$code.addEventListener('dragover', code.dragOver, false);
		$code.addEventListener('dragleave', code.dragLeave, false);
	},

	dragOver: function(e) {
//		console.log('dragover code');
		if(e.preventDefault) {
			e.preventDefault();
		}

		return false;
	},

	dragLeave: function(e) {

	},

	drop: function(e) {
		if(e.stopPropagation) {
			e.stopPropagation();
		}


		var $copyElem = $elem.cloneNode(true);
		$copyElem.style.opacity = 1;
		this.appendChild($copyElem);
		

		return false;
	},

	dragEnter: function(e) {

	}


};

var pGame = {

	p: null,
	dude: null,
	anim: null,
	isMoving: false,

	init: function() {
		pGame.p = new Phaser.Game(
			WIDTH, 
			HEIGHT, 
			Phaser.AUTO, 
			$content, {
				preload: pGame.preload, 
				create: pGame.create,
				update: pGame.update
			}
		)
	}
};

pGame.animationStopped = function (sprite, animation) {

	animation.stop();
	sprite.frame = 4;
	this.isMoving = false;
	console.log('end move');
	Game.nextInstruction();

}


pGame.preload = function() {
	
	this.load.spritesheet('dude', 'js/phaser/assets/dude.png', 32, 48);

};

pGame.create = function() {
	
	pGame.dude = this.add.sprite(200, 200, 'dude', 4);
	this.stage.backgroundColor = 0xffffff;

	pGame.dude.animations.add('stand', 4, 60);
	pGame.dude.animations.add('mLeft', [0,1,2,3], 60);
	pGame.dude.animations.add('mRight', [5,6,7,8], 60);


};

pGame.moveLeft = function() {
	console.log('moveLeft');
	while(!this.isMoving) {
		this.isMoving = true;	
		pGame.anim = this.dude.animations.play('mLeft', 4);
		pGame.anim.onComplete.add(pGame.animationStopped, this);
	}
	
}

pGame.moveRight = function() {
	console.log('move right');
	while(!this.isMoving) {
		this.isMoving = true;	
		pGame.anim = this.dude.animations.play('mRight', 4);
		pGame.anim.onComplete.add(pGame.animationStopped, this);
	}
}

pGame.update = function() {
	if(pGame.anim === null) {
		return;
	}
	if(pGame.isMoving) {

		if(pGame.anim.name === 'mLeft') {
			pGame.dude.x -= 1;
		}

		if(pGame.anim.name === 'mRight') {
			pGame.dude.x += 1;
		}
	}
	
}

var Game = {

	run: function() {
		blocks.init();
		code.init();

		WIDTH = $content.offsetWidth;

		pGame.init();

		$play.addEventListener('click', Game.play, false);

	},

	play: function(e) {
		var $codeChildren = $code.children;
		instructions = [];
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

		}
	},

	nextInstruction: function() {
		instructionIndex++;
		Game.execute(instructionIndex);
	}


}

Game.run();







