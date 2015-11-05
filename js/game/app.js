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
	sprite.frame = 0;
	this.isMoving = false;
	Game.nextInstruction();

};

pGame.preload = function() {
	
	this.load.spritesheet('dude', 'assets/characters/1.png', 64/4, 112/7);

};

pGame.create = function() {
	
	pGame.dude = this.add.sprite(200, 200, 'dude', 0);
	pGame.dude.scale.setTo(2, 2);
	this.stage.backgroundColor = 0xffffff;

	pGame.dude.animations.add('stand', 0, 60);
	pGame.dude.animations.add('mLeft', [2,6,10,14], 60);
	pGame.dude.animations.add('mRight', [3,7,11,15], 60);
	pGame.dude.animations.add('mUp', [1,5,9,13], 60);
	pGame.dude.animations.add('mDown', [0,4,8,12], 60);


};

pGame.moveLeft = function() {
	while(!this.isMoving) {
		this.isMoving = true;	
		pGame.anim = this.dude.animations.play('mLeft', 4);
		pGame.anim.onComplete.add(pGame.animationStopped, this);
	}
	
}

pGame.moveRight = function() {
	while(!this.isMoving) {
		this.isMoving = true;	
		pGame.anim = this.dude.animations.play('mRight', 4);
		pGame.anim.onComplete.add(pGame.animationStopped, this);
	}
}

pGame.moveUp = function() {
	while(!this.isMoving) {
		this.isMoving = true;	
		pGame.anim = this.dude.animations.play('mUp', 4);
		pGame.anim.onComplete.add(pGame.animationStopped, this);
	}
}

pGame.moveDown = function() {
	while(!this.isMoving) {
		this.isMoving = true;	
		pGame.anim = this.dude.animations.play('mDown', 4);
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

		if(pGame.anim.name === 'mUp') {
			pGame.dude.y -= 1;
		}

		if(pGame.anim.name === 'mDown') {
			pGame.dude.y += 1;
		}
	}
	
}

var Game = {

	run: function() {
		blocks.init();
		code.init();

		WIDTH = $content.offsetWidth - 20;

		pGame.init();

		$play.addEventListener('click', Game.play, false);

	},

	play: function(e) {
		var $codeChildren = $code.children;

		instructions = [];
		instructionIndex = 0;

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


}

Game.run();