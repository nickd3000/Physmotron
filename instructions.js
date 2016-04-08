// instructions.js
//'use strict';

// http://www.masswerk.at/6502/6502_instruction_set.html

// Machine instruction definitions.

// TODO: split up mov into byte and word operations?

var opcode = { NO_OP: 0,
	MOV_R1: 1,	// move next byte to register r1
	MOV_R2: 2,
	MOV_R3: 3,
	MOVW_R1: 4,	// move next word to register.
	MOVW_R2: 5,
	MOVW_R3: 6,
	MOV_R1_R2: 10,	// move reg to reg.
	MOV_R1_R3: 11,
	MOV_R2_R1: 12,
	MOV_R2_R3: 13,
	MOV_R3_R1: 14,
	MOV_R3_R2: 15,
	MOV_AB_R1: 16,		// Move r1 to word address
	MOV_AB_R2: 17,
	MOV_AB_R3: 18,
	MOV_R1_AW: 19,		// Move byte at word address to R1
	MOV_R2_AW: 20,
	MOV_R3_AW: 21,

	MOV_AR1_R2: 22,	// Move r2 to address r1
	MOV_AR1_R3: 23,
	MOV_AR2_R1: 24,
	MOV_AR2_R3: 25,
	MOV_AR3_R1: 26,
	MOV_AR3_R2: 27,

	MOV_AR1_BY: 28,	// Move byte to address of R1
	MOV_AR2_BY: 29,
	MOV_AR3_BY: 30,

	MOV_R1_AR2: 40,	// Move data at AR2 into R1
	MOV_R1_AR3: 41,
	MOV_R2_AR1: 42,
	MOV_R2_AR3: 43,
	MOV_R3_AR1: 44,
	MOV_R3_AR2: 45,

	MOV_AB_BY: 46,		// Move next byte to byte address
	MOV_AB_AB: 47,		// Move next byte to byte address

	CMP_R1_R2: 60,		// compare registers
	CMP_R1_R3: 61,
	CMP_R2_R1: 62,
	CMP_R2_R3: 63,
	CMP_R3_R1: 64,
	CMP_R3_R2: 65,
	CMP_R1_WO: 66,		// Compare R1 to next word
	CMP_R2_WO: 67,
	CMP_R3_WO: 68,
	CMP_R1_BY: 69,		// Compare R1 to next byte
	CMP_R2_BY: 70,
	CMP_R3_BY: 71,

	CMP_AB_BY: 72,	// Experimental

	INC_R1: 90,		// Incriment
	INC_R2: 91,
	INC_R3: 92,
	DEC_R1: 93,		// Decriment
	DEC_R2: 94,
	DEC_R3: 95,

	// Jumps
	JMP: 100,			// Jump to next word.
	JE: 101,			// jump on equals
	JNE: 102,			// not equal
	JL: 103,			// less
	JLE: 104,			// less or equal
	JG: 105,
	JGE: 106,

	PUSHB_R1: 120,
	PUSHB_R2: 121,
	PUSHB_R3: 122,
	PUSHW_R1: 123,
	PUSHW_R2: 124,
	PUSHW_R3: 125,
	PUSHB: 130,			// push next byte to stack.
	PUSHW: 131,
	POPB_R1: 140,
	POPB_R2: 141,
	POPB_R3: 142,
	POPW_R1: 143,
	POPW_R2: 144,
	POPW_R3: 145,
	PUSHALL: 146,	// Push R1,R2,R3
	POPALL:	147,		// Push R1,R2,R3
	ADD_R1_R2: 170,		// ADD : R1: R1 + R2
	ADD_R1_R3: 171,
	ADD_R2_R1: 172,
	ADD_R2_R3: 173,
	ADD_R3_R1: 174,
	ADD_R3_R2: 175,
	ADD_R1_WO: 176,		// AND Reg with word
	ADD_R2_WO: 177,
	ADD_R3_WO: 178,
	ADD_R1_BY: 179,		// AND Reg with byte
	ADD_R2_BY: 180,
	ADD_R3_BY: 181,
	// todo - add more adds

	AND_R1_R2: 185,		// AND : R1: R1 & R2
	AND_R1_R3: 186,
	AND_R2_R1: 187,
	AND_R2_R3: 188,
	AND_R3_R1: 189,
	AND_R3_R2: 190,
	AND_R1_WO: 191,		// AND Reg with word
	AND_R2_WO: 192,
	AND_R3_WO: 193,
	AND_R1_BY: 194,		// AND Reg with byte
	AND_R2_BY: 195,
	AND_R3_BY: 196,

	SYSCALL: 200,		// Syscall, next byte specifies what syscall.
	CAL: 201,
	RET: 202,
	BRK: 221,			// Set Break flag
};

// Id's used for source and dest for instructions.
var op = {
	R1: 1,		// Target R1
	R2: 2,
	R3: 3,
	AR1B: 4,	// Byte Address at R1
	AR2B: 5,
	AR3B: 6,
	AR1W: 7,	// Word Address at R1 (words are going to be 4 bytes)
	AR2W: 8,
	AR3W: 9,
	PC: 10,		// Program counter.
	SP: 11,		// Stack pointer
	FL: 12,		// Flags
	AB: 13,		// Byte at address
	AW: 14,		// Word at address
	BY: 15,		// Next byte
	WO: 16		// Next word
};

// Instruction types.
var itype = {
	MOV: 1,
	CMP: 3,
	INC: 4,
	DEC: 5,
	JMP: 6,		// Jump
	JE: 7,		// Jump if equal.
	JNE: 8,		// Jump if equal.
	JL: 9,		// Jump if equal.
	JLE: 10,		// Jump if equal.
	JG: 11,		// Jump if equal.
	JGE: 12,		// Jump if equal.
	PUB: 20,		// Push byte
	PUW: 21,		// Push word (4 bytes)
	POB: 22,		// Pop byte
	POW: 23,		// Pop word.
	PUA: 24,		// Push all regs
	POA: 25,		// Pop all regs
	ADD: 26,
	SYS: 27,
	CAL: 28,
	RET: 29,
	BRK: 30,
	AND: 31,
};

// NOTE: the above instruction types should represent groups of instructions
// that perform a similar action and only differ by their operands.

// map instruction types to names used by the assembly language.
var instNames = [
	[itype.MOV,	'mov', 'move', 'load'],
	[itype.CMP, 'cmp','compare'],
	[itype.INC, 'inc'],
	[itype.DEC, 'dec'],
	[itype.JMP, 'jmp', 'jump'],
	[itype.JE, 'je'],
	[itype.JNE, 'jne'],
	[itype.JL, 'jl'],
	[itype.JLE, 'jle'],
	[itype.JG, 'jg'],
	[itype.JGE, 'jge'],
	[itype.PUB, 'pushb'],
	[itype.PUW, 'pushw'],
	[itype.POB, 'popb'],
	[itype.POW, 'popw'],
	[itype.PUA, 'pua','pusha','pushall'],
	[itype.POA, 'poa','popa','popall'],
	[itype.ADD, 'add'],
	[itype.SYS, 'sys', 'syscall'],
	[itype.CAL, 'cal', 'call'],
	[itype.RET, 'ret', 'return'],
	[itype.BRK, 'brk', 'break'],
	[itype.AND, 'and'],
];


// Instruction map.
var imap = [
	[opcode.NO_OP,			null,	null,	null],
	[opcode.MOV_R1,		itype.MOV,	op.R1,	op.BY],	// Move next byte into register.
	[opcode.MOV_R2,		itype.MOV,	op.R2,	op.BY],
	[opcode.MOV_R3,		itype.MOV,	op.R3,	op.BY],
	[opcode.MOVW_R1,		itype.MOV,	op.R1,	op.WO],	// Move next word into register.
	[opcode.MOVW_R2,		itype.MOV,	op.R2,	op.WO],
	[opcode.MOVW_R3,		itype.MOV,	op.R3,	op.WO],
	//
	[opcode.MOV_R1_R2,		itype.MOV,	op.R1,	op.R2],	// Move reg to reg.
	[opcode.MOV_R1_R3,		itype.MOV,	op.R1,	op.R3],
	[opcode.MOV_R2_R1,		itype.MOV,	op.R2,	op.R1],
	[opcode.MOV_R2_R3,		itype.MOV,	op.R2,	op.R3],
	[opcode.MOV_R3_R1,		itype.MOV,	op.R3,	op.R1],
	[opcode.MOV_R3_R2,		itype.MOV,	op.R3,	op.R2],
	//
	[opcode.MOV_AB_R1,		itype.MOV,	op.AB,	op.R1],	// Move byte r1 to address
	[opcode.MOV_AB_R2,		itype.MOV,	op.AB,	op.R2],
	[opcode.MOV_AB_R3,		itype.MOV,	op.AB,	op.R3],
	//
	[opcode.MOV_R1_AW,		itype.MOV,	op.R1,	op.AB],	// Move byte at address to r1.
	[opcode.MOV_R2_AW,		itype.MOV,	op.R2,	op.AB],
	[opcode.MOV_R3_AW,		itype.MOV,	op.R3,	op.AB],
	//
	[opcode.MOV_AR1_R2,	itype.MOV,	op.AR1B,	op.R2],	// Move r2 to address in r1
	[opcode.MOV_AR1_R3,	itype.MOV,	op.AR1B,	op.R3],
	[opcode.MOV_AR2_R1,	itype.MOV,	op.AR2B,	op.R1],
	[opcode.MOV_AR2_R3,	itype.MOV,	op.AR2B,	op.R3],
	[opcode.MOV_AR3_R1,	itype.MOV,	op.AR3B,	op.R1],
	[opcode.MOV_AR3_R2,	itype.MOV,	op.AR3B,	op.R2],

	[opcode.MOV_AR1_BY,	itype.MOV,	op.AR1B,	op.BY],	// Move byte to address of register
	[opcode.MOV_AR2_BY,	itype.MOV,	op.AR2B,	op.BY],
	[opcode.MOV_AR3_BY,	itype.MOV,	op.AR3B,	op.BY],

	[opcode.MOV_R1_AR2,	itype.MOV,	op.R1,	op.AR2B],	// Move data at AR1 into R2
	[opcode.MOV_R1_AR3,	itype.MOV,	op.R1,	op.AR3B],
	[opcode.MOV_R2_AR1,	itype.MOV,	op.R2,	op.AR1B],
	[opcode.MOV_R2_AR3,	itype.MOV,	op.R2,	op.AR3B],
	[opcode.MOV_R3_AR1,	itype.MOV,	op.R3,	op.AR1B],
	[opcode.MOV_R3_AR2,	itype.MOV,	op.R3,	op.AR2B],

	[opcode.MOV_AB_BY,		itype.MOV,	op.AB,	op.BY], // Move next byte to word address
	[opcode.MOV_AB_AB,		itype.MOV,	op.AB,	op.AB], // Move byte at address to byte at address

	//
	[opcode.CMP_R1_R2,		itype.CMP,	op.R1,	op.R2],	// Compare registers.
	[opcode.CMP_R1_R3,		itype.CMP,	op.R1,	op.R3],
	[opcode.CMP_R2_R1,		itype.CMP,	op.R2,	op.R1],
	[opcode.CMP_R2_R3,		itype.CMP,	op.R2,	op.R3],
	[opcode.CMP_R3_R1,		itype.CMP,	op.R3,	op.R1],
	[opcode.CMP_R3_R2,		itype.CMP,	op.R3,	op.R2],
	[opcode.CMP_R1_WO,		itype.CMP,	op.R1,	op.WO], // Compare R1 to next word.
	[opcode.CMP_R2_WO,		itype.CMP,	op.R2,	op.WO],
	[opcode.CMP_R3_WO,		itype.CMP,	op.R3,	op.WO],
	[opcode.CMP_R1_BY,		itype.CMP,	op.R1,	op.BY], // Compare R1 to next byte.
	[opcode.CMP_R2_BY,		itype.CMP,	op.R2,	op.BY],
	[opcode.CMP_R3_BY,		itype.CMP,	op.R3,	op.BY],

	[opcode.CMP_AB_BY,		itype.CMP,	op.AB,	op.BY], // Experimental.


	//
	[opcode.INC_R1,			itype.INC,	op.R1,	null],	// Incriment
	[opcode.INC_R2,			itype.INC,	op.R2,	null],
	[opcode.INC_R3,			itype.INC,	op.R3,	null],
	[opcode.DEC_R1,			itype.DEC,	op.R1,	null],	// Decriment
	[opcode.DEC_R2,			itype.DEC,	op.R2,	null],
	[opcode.DEC_R3,			itype.DEC,	op.R3,	null],
	//
	[opcode.JMP,			itype.JMP,	op.WO,	null],
	[opcode.JE,				itype.JE,	op.WO,	null],
	[opcode.JNE,			itype.JNE,	op.WO,	null],
	[opcode.JL,				itype.JL,	op.WO,	null],
	[opcode.JLE,			itype.JLE,	op.WO,	null],
	[opcode.JG,				itype.JG,	op.WO,	null],
	[opcode.JGE,			itype.JGE,	op.WO,	null],
	//
	[opcode.PUSHB_R1,		itype.PUB,	op.R1,	null],	// Push register Byte to stack
	[opcode.PUSHB_R2,		itype.PUB,	op.R2,	null],
	[opcode.PUSHB_R3,		itype.PUB,	op.R3,	null],
	[opcode.PUSHW_R1,		itype.PUW,	op.R1,	null],	// Push register Word to stack
	[opcode.PUSHW_R2,		itype.PUW,	op.R2,	null],
	[opcode.PUSHW_R3,		itype.PUW,	op.R3,	null],
	[opcode.PUSHB,			itype.PUB,	op.BY,	null],	// Push next byte to stack
	[opcode.PUSHW,			itype.PUW,	op.WO,	null],	// Push next byte to stack
	[opcode.POPB_R1,		itype.POB,	op.R1,	null],
	[opcode.POPB_R2,		itype.POB,	op.R2,	null],
	[opcode.POPB_R3,		itype.POB,	op.R3,	null],
	[opcode.POPW_R1,		itype.POW,	op.R1,	null],
	[opcode.POPW_R2,		itype.POW,	op.R2,	null],
	[opcode.POPW_R3,		itype.POW,	op.R3,	null],

	[opcode.PUSHALL,			itype.PUA,	null,	null],
	[opcode.POPALL,			itype.POA,	null,	null],

	[opcode.ADD_R1_R2,		itype.ADD,	op.R1,	op.R2],	// ADD : R1 = R1 + R2
	[opcode.ADD_R1_R3,		itype.ADD,	op.R1,	op.R3],
	[opcode.ADD_R2_R1,		itype.ADD,	op.R2,	op.R1],
	[opcode.ADD_R2_R3,		itype.ADD,	op.R2,	op.R3],
	[opcode.ADD_R3_R1,		itype.ADD,	op.R3,	op.R1],
	[opcode.ADD_R3_R2,		itype.ADD,	op.R3,	op.R2],
	[opcode.ADD_R1_WO,		itype.AND,	op.R1,	op.WO],
	[opcode.ADD_R2_WO,		itype.AND,	op.R2,	op.WO],
	[opcode.ADD_R3_WO,		itype.AND,	op.R3,	op.WO],
	[opcode.ADD_R1_BY,		itype.AND,	op.R1,	op.BY],
	[opcode.ADD_R2_BY,		itype.AND,	op.R2,	op.BY],
	[opcode.ADD_R3_BY,		itype.AND,	op.R3,	op.BY],

	// NEW
	[opcode.AND_R1_R2,		itype.AND,	op.R1,	op.R2],	// AND : R1: R1 & R2
	[opcode.AND_R1_R3,		itype.AND,	op.R1,	op.R3],
	[opcode.AND_R2_R1,		itype.AND,	op.R2,	op.R1],
	[opcode.AND_R2_R3,		itype.AND,	op.R2,	op.R3],
	[opcode.AND_R3_R1,		itype.AND,	op.R3,	op.R1],
	[opcode.AND_R3_R2,		itype.AND,	op.R3,	op.R2],
	[opcode.AND_R1_WO,		itype.AND,	op.R1,	op.WO],
	[opcode.AND_R2_WO,		itype.AND,	op.R2,	op.WO],
	[opcode.AND_R3_WO,		itype.AND,	op.R3,	op.WO],
	[opcode.AND_R1_BY,		itype.AND,	op.R1,	op.BY],
	[opcode.AND_R2_BY,		itype.AND,	op.R2,	op.BY],
	[opcode.AND_R3_BY,		itype.AND,	op.R3,	op.BY],


	//
	[opcode.SYSCALL,		itype.SYS,	op.BY,	null],
	[opcode.CAL,			itype.CAL,	op.WO,	null],
	[opcode.RET,			itype.RET,	null,	null],
	[opcode.BRK,			itype.BRK,	null,	null],
];


// Creat a table to quickly find instruction rows in the instruction map.
var instructionMapLength = imap.length;
var instructionQuickLookup = [];
for (var ql = 0; ql<imap.length;ql++) {
	instructionQuickLookup[imap[ql][0]]=ql;
}


// test
//console.log("Test data: " + TVMLang.imap[1]);
//console.log("Test data: " + imap[2][0] + "  "+ imap[2][1] + "  "+ imap[2][2] + "  "+ imap[2][3] + "  ");
