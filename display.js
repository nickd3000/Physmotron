// display.js

var canvas;// = document.getElementById('canvas');
var ctx;// = canvas.getContext('2d');
var cw;// = canvas.width;
var ch;// = canvas.height;
var id;// = ctx.getImageData(0, 0, 1, 1);
var scanLine=0;
var rowData;
var toggle=255;
var initDisplay = function ()
{
	"use strict";
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
    cw = canvas.width;
    ch = canvas.height;
    id = ctx.getImageData(0, 0, 1, 1);
	rowData  = ctx.createImageData(256,1);

	ctx.imageSmoothingEnabled=false;

	ctx.clearRect(0,0,250,250);
	ctx.fillStyle="green";
	ctx.fillRect(0, 0, cw, ch);

	//ctx.font = "8px monospace";
	//ctx.fillStyle="white";
	//ctx.fillText("100 Bytes free",0,8);

	scanLine = 0;
};

// screen memory
// screen modes: text / pallete / hicolor[3/3/2]
// palette memory 256*8*8*8

// Draw a full scanline to the display.
function tickDisplay()
{
	"use strict";

	var pixel=0, x4=0;
	for (var x=0;x<256;x++) {
		x4 = x*4;
		pixel = mem[1024+x+(256*scanLine)];
		rowData.data[x4] = (pixel&3)*85;
		rowData.data[x4+1] = ((pixel>>2)&7)*36;
		rowData.data[x4+2] = ((pixel>>5)&7)*36;
		rowData.data[x4+3] = toggle;//255;
	}
	//ctx.putImageData(rowData,0,scanLine);
	scanLine++;
	if (scanLine>=256)
	{
		scanLine=0;
		if (toggle==255) toggle=240;
		else toggle=255;
	}

	//.redraw();
}



function redrawScreen()
{
	"use strict";
	// Text mode.
	if (mem[500]===0) {
		//scanline++;
		//if (scanLine>=255) {
			 redrawTextMode();
		//	 scanline=0;
		// }
		return;
	}

	scanLine = 0;
	while (scanLine<255)
	{
		tickDisplay();
	}
	if (toggle==255) toggle=250;
	else toggle=255;
}


function redrawTextMode(){
	ctx.font = "9px monospace";
	ctx.fillStyle="white";
	var char = "n";
	for (var i=0;i<32*32;i++) {
		char = String.fromCharCode(mem[600+i]);
		ctx.fillText(char,(i%32)*8,((i/32)*8)+8);
	}
}
