// display.js

// Basic C64 palette.
var palette = [
	0x00, 0x00, 0x00,	// 0 Black
	0xFF, 0xFF, 0xFF,	// 1 White
	0x68, 0x37, 0x2B,	// 2 Red
	0x70, 0xA4, 0xB2,	// 3 cyan
	0x6F, 0x3D, 0x86,	// 4 violet
	0x58, 0x8D, 0x43,	// 5 green
	0x35, 0x28, 0x79,	// 6 blue
	0xB8, 0xC7, 0x6F,	// 7 yellow
	0x6F, 0x4F, 0x25,	// 8 orange
	0x43, 0x39, 0x00,	// 9 brown
	0x9A, 0x67, 0x59,	// 10 pink
	0x44, 0x44, 0x44,	// 11 grey dark
	0x6C, 0x6C, 0x6C,	// 12 grey mid
	0x9A, 0xD2, 0x84,	// 13 light green
	0x6C, 0x5E, 0xB5,	// 14 light blue
	0x95, 0x95, 0x95];	// 15 grey light

var canvas;// = document.getElementById('canvas');
var ctx;// = canvas.getContext('2d');
var cw;// = canvas.width;
var ch;// = canvas.height;
var id;// = ctx.getImageData(0, 0, 1, 1);
var scanLine=0;
var rowData;
var toggle=255;
var onePixel = null;
var initDisplay = function ()
{
	"use strict";
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
    cw = canvas.width;
    ch = canvas.height;
    id = ctx.getImageData(0, 0, 1, 1);
	rowData  = ctx.createImageData(256,1);
	onePixel  = ctx.createImageData(1,1);

	onePixel.data[0] = 0xff;
	onePixel.data[1] = 0xff;
	onePixel.data[2] = 0xff;
	onePixel.data[3] = 0xff;

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
function renderScanlineGraphicsMode()
{
	"use strict";

	var pixel=0, x4=0;
	for (var x=0;x<256;x++) {
		x4 = x*4;
		pixel = mem[1024+x+(256*scanLine)];
		rowData.data[x4] = (pixel&3)*85;
		rowData.data[x4+1] = ((pixel>>2)&7)*36;
		rowData.data[x4+2] = ((pixel>>5)&7)*36;
		rowData.data[x4+3] = 0xff;
	}
	ctx.putImageData(rowData,0,scanLine);
	scanLine++;

}



function redrawScreen(amount)
{
	"use strict";
	var mode = mem[500];

	for (var i=0;i<amount;i++) {
		scanLine=scanLine%0xff;
		mem[hw_scanLine] = scanLine;
		if (mode===0) renderScanlineTextMode();
		else renderScanlineGraphicsMode();
	}
	scanLine=scanLine%0xff;
	 /*
	if (mem[500]===0) {
		scanLine = 0;
		while (scanLine<255)
		{
			renderScanlineTextMode();
		}
		return;
	}

	scanLine = 0;
	while (scanLine<255)
	{
		renderScanlineGraphicsMode();
	}
*/
}


function redrawTextMode(){
	//ctx.font = "9px monospace";
	//ctx.fillStyle="white";
	var char = "n", cc=0;

	for (var i=0;i<32*32;i++) {
		char = String.fromCharCode(mem[hw_screenTextLocation+i]);
		cc = mem[hw_screenTextLocation+i];
		//ctx.fillText(char,(i%32)*8,((i/32)*8)+8);
		if (cc>0) renderChar((i%32),(i/32)|0, cc-32);
	}

	//renderChar(5,5, 5);
}

function renderChar(col, row, c) {

	// -32
	var bit=0;
	var line=0;
	for (var y=0;y<8;y++) {
		line = mem[hw_fontLocation+(c*8)+y]
		bit = 128;
		for (var x=0;x<8;x++) {
			if ((line&bit)>0) {
				ctx.putImageData(onePixel,(col*8)+x,(row*8)+y);
			}
			bit = bit>>1;
		}
	}

}


function renderScanlineTextMode()
{
	"use strict";
	var row=(scanLine>>3)|0;
	var col=0;
	var pixCount=0;
	var bitPos=128;
	var pixel=0, x4=0;
	var charYOffset=(scanLine%8)|0;
	var char=mem[hw_screenTextLocation+(row<<5)]-32;
	var charPixels=mem[hw_fontLocation+(char<<3)+charYOffset];
	var charCount=0;
	for (var x=0;x<256;x++) {

		if (pixCount==8) {
			charCount++;
			//char=mem[hw_screenTextLocation+(row*32)+charCount]-32;
			char=mem[hw_screenTextLocation+(row<<5)+charCount]-32;
			charPixels=mem[hw_fontLocation+(char<<3)+charYOffset];
			pixCount=0; bitPos=128;
		}

		//x4 = x*4;
		x4 = x<<2;
		if((charPixels&bitPos)>0) setRowDataPixel2(x4,1); // 14
		else setRowDataPixel2(x4,mem[hw_colBG]); // 6

		pixCount++;
		bitPos=bitPos>>1;
	}
	ctx.putImageData(rowData,0,scanLine);

	scanLine++;
	scanLine=scanLine%0xff;

}

// .@....@.
// ...@@...
// ..@@@@..
// .@@..@@.
// @@....@@
// ........


function setRowDataPixel(pos,r,g,b,a) {
	rowData.data[pos] = r;
	rowData.data[pos+1] = g;
	rowData.data[pos+2] = b;
	rowData.data[pos+3] = a;
}

function setRowDataPixel2(pos,colIndex) {
	var c=(colIndex&0x0f)*3;
	rowData.data[pos] = palette[c];
	rowData.data[pos+1] = palette[c+1];
	rowData.data[pos+2] = palette[c+2];
	rowData.data[pos+3] = 0xff;
}
