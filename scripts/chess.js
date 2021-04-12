const canvas = document.getElementById('chesscanvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'red';

var mousePos = {x: 0, y: 0};

// Track mouse position
function getMousePos(canvas, evt)
{
	var rect = canvas.getBoundingClientRect();
	
	mousePos.x = evt.clientX - rect.left,
	mousePos.y = evt.clientY - rect.top
}

canvas.addEventListener('mousemove',
	function(evt)
	{
		getMousePos(canvas, evt);
	}, false);

function rgbString(r, g, b)
{
  return "rgb(" + r + "," + g + "," + b + ")";
}

function load_piece(filename)
{
  image = new Image();
  image.src = "res/chesspieces/" + filename;
  
  return image;
}


const kb = load_piece("king_black.svg");
const kw = load_piece("king_white.svg");
const rb = load_piece("rook_black.svg");
const rw = load_piece("rook_white.svg");
const nb = load_piece("knight_black.svg");
const nw = load_piece("knight_white.svg");
const bb = load_piece("bishop_black.svg");
const bw = load_piece("bishop_white.svg");
const pb = load_piece("pawn_black.svg");
const pw = load_piece("pawn_white.svg");
const qb = load_piece("queen_black.svg");
const qw = load_piece("queen_white.svg");

const audio_move = new Audio("res/sounds/move2.wav");
const audio_capture = new Audio("res/sounds/bite.mp3");
var boardstate = 
  [[ rb, nb, bb, qb, kb, bb, nb, rb],
   [ pb, pb, pb, pb, pb, pb, pb, pb],
   [  0,  0,  0,  0,  0,  0,  0,  0],
   [  0,  0,  0,  0,  0,  0,  0,  0],
   [  0,  0,  0,  0,  0,  0,  0,  0],
   [  0,  0,  0,  0,  0,  0,  0,  0],
   [ pw, pw, pw, pw, pw, pw, pw, pw],
   [ rw, nw, bw, qw, kw, bw, nw, rw]];

var held_piece = 0;

const cellsize = Math.round(canvas.width / 8);
 
function pickup_piece(i, j)
{
  var index = { i : 0, j : 0 };
  
  index.i = Math.floor(mousePos.x / cellsize);
  index.j = Math.floor(mousePos.y / cellsize);
  
  held_piece = boardstate[index.j][index.i];
  
  boardstate[index.j][index.i] = 0;
}

function putdown_piece(i, j)
{
  var index = { i: 0, j : 0 };
  
  index.i = Math.floor(mousePos.x / cellsize);
  index.j = Math.floor(mousePos.y / cellsize);


  
  if( held_piece != 0 )
  {
	if( boardstate[index.j][index.i] == 0)
	{
		audio_move.play();
	}
	else
	{
		audio_move.play();
	}

    boardstate[index.j][index.i] = held_piece;
  }

  
	held_piece = 0;
}   

function drawBoard()
{
  ctx.fillStyle = rgbString(100, 100, 100);
  
  for(var i = 0; i < 8; i++)
  {
    for(var j = 0; j < 8; j++)
    {
      if( (i+j) % 2 == 0 )
      {
		ctx.fillStyle = rgbString(240,218,181);
      }
      else
      {
        ctx.fillStyle = rgbString(181,135,99);
      }
      
      ctx.fillRect(i * cellsize, j * cellsize, cellsize, cellsize);
      
      if( typeof(boardstate[j][i]) == typeof(new Image()) )
      {
        ctx.drawImage(boardstate[j][i], i * cellsize, j * cellsize, cellsize, cellsize);
      }
    }
  }
}

canvas.addEventListener('mousedown',
	function(evt)
	{
		pickup_piece();
		drawBoard();
	}, false);
	
canvas.addEventListener('mouseup',
	function(evt)
	{
		putdown_piece();

		drawBoard();

	}, false);
	
setInterval(function()
  {
    {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawBoard();
      
		if(held_piece != 0)
		{
			ctx.drawImage(held_piece, mousePos.x - cellsize * 0.5, mousePos.y - cellsize * 0.5, cellsize, cellsize);
		}
    }
  }, 20);

