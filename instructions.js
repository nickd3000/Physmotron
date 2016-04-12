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
	MOV_R1_AB: 19,		// Move byte at word address to R1
	MOV_R2_AB: 20,
	MOV_R3_AB: 21,

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
	MOV_AB_AB: 47,		// Move next byte address to byte address

	MOV_AW_R1: 48,		// Move word from register to address.
	MOV_AW_R2: 49,
	MOV_AW_R3: 50,

	MOV_R1_AW: 51,		// Move word R1 to word address
	MOV_R2_AW: 52,
	MOV_R3_AW: 53,

	MOV_AR1_AB: 54,		// Move byte at address to address at r1
	MOV_AR2_AB: 55,
	MOV_AR3_AB: 56,
	MOV_AR1_AW: 57,		// Move word at address to address at r1
	MOV_AR2_AW: 58,
	MOV_AR3_AW: 59,

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

	MOV_R1_AR1: 73, // move these up next to other MOV instructions when reordering.
	MOV_R2_AR2: 74,
	MOV_R3_AR3: 75,
	MOV_R1_AR1W: 76, // move these up next to other MOV instructions when reordering.
	MOV_R2_AR2W: 77,
	MOV_R3_AR3W: 78,

	MOV_AW_WO: 79,		// Move next word to qord address
	MOV_AW_AW: 80,		// Move next word address to word address

	MOV_AR1_WR1: 81,	// Move r2 to address r1
	MOV_AR1_WR2: 82,	// Move r2 to address r1
	MOV_AR1_WR3: 83,
	MOV_AR2_WR1: 84,
	MOV_AR2_WR2: 85,
	MOV_AR2_WR3: 86,
	MOV_AR3_WR1: 87,
	MOV_AR3_WR2: 88,
	MOV_AR3_WR3: 89,

	INC_R1: 90,		// Incriment
	INC_R2: 91,
	INC_R3: 92,
	DEC_R1: 93,		// Decriment
	DEC_R2: 94,
	DEC_R3: 95,

/// SPACE - 5

	// Jumps
	JMP: 100,			// Jump to next word.
	JE: 101,			// jump on equals
	JNE: 102,			// not equal
	JL: 103,			// less
	JLE: 104,			// less or equal
	JG: 105,
	JGE: 106,
	JC: 107,
	JCC: 108,

/// SPACE - 12

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

	SUB_R1_R2: 150,		// SUB : R1: R1 + R2
	SUB_R1_R3: 151,
	SUB_R2_R1: 152,
	SUB_R2_R3: 153,
	SUB_R3_R1: 154,
	SUB_R3_R2: 155,
	SUB_R1_WO: 156,		// SUB Reg with word
	SUB_R2_WO: 157,
	SUB_R3_WO: 158,
	SUB_R1_BY: 159,		// SUB Reg with byte
	SUB_R2_BY: 160,
	SUB_R3_BY: 161,

/// SPACE - 9

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

	SHL_R1: 197,
	SHL_R2: 198,
	SHL_R3: 199,
	SHR_R1: 200,
	SHR_R2: 201,
	SHR_R3: 202,

/// SPACE - 18

	CLC: 220,	// clear carry flag
	CLZ: 221, 	// clear zero flag
	CLS: 222, 	// clear sign flag
	CLB: 223, 	// clear break flag

/// SPACE - 27


	SYSCALL: 250,		// Syscall, next byte specifies what syscall.
	CAL: 251,
	RET: 252,
	BRK: 254,			// Set Break flag
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
	JC: 13,		// Jump if carry is set.
	JCC: 14,		// Jump if carry is clear.
	PUB: 20,		// Push byte
	PUW: 21,		// Push word (4 bytes)
	POB: 22,		// Pop byte
	POW: 23,		// Pop word.
	PUA: 24,		// Push all regs
	POA: 25,		// Pop all regs
	ADD: 26,
	SUB: 27,
	SYS: 28,
	CAL: 29,
	RET: 30,
	BRK: 31,
	AND: 32,
	SHL: 33,
	SHR: 34,
	CLC: 35,	// clear carry flag
	CLZ: 36, 	// clear zero flag
	CLS: 37, 	// clear sign flag
	CLB: 38, 	// clear break flag
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
	[itype.JE, 'je','jeq','be'],
	[itype.JNE, 'jne','bne'],
	[itype.JL, 'jl','bl'],
	[itype.JLE, 'jle','ble'],
	[itype.JG, 'jg','bg'],
	[itype.JGE, 'jge','bge'],
	[itype.JC, 'jc','bc'],
	[itype.JCC, 'jcc','bcc'],
	[itype.PUB, 'pushb'],
	[itype.PUW, 'pushw'],
	[itype.POB, 'popb'],
	[itype.POW, 'popw'],
	[itype.PUA, 'pua','pusha','pushall'],
	[itype.POA, 'poa','popa','popall'],
	[itype.ADD, 'add'],
	[itype.SUB, 'sub'],
	[itype.SYS, 'sys', 'syscall'],
	[itype.CAL, 'cal', 'call'],
	[itype.RET, 'ret', 'return'],
	[itype.BRK, 'brk', 'break'],
	[itype.AND, 'and'],
	[itype.SHL, 'shl'],
	[itype.SHR, 'shr'],
	[itype.CLC, 'clc'],
	[itype.CLZ, 'clz'],
	[itype.CLS, 'cls'],
	[itype.CLB, 'clb'],
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
	[opcode.MOV_R1_AB,		itype.MOV,	op.R1,	op.AB],	// Move byte at address to r1.
	[opcode.MOV_R2_AB,		itype.MOV,	op.R2,	op.AB],
	[opcode.MOV_R3_AB,		itype.MOV,	op.R3,	op.AB],
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

	[opcode.MOV_AW_R1,		itype.MOV,	op.AW,	op.R1], // Move word from register to address.
	[opcode.MOV_AW_R2,		itype.MOV,	op.AW,	op.R2],
	[opcode.MOV_AW_R3,		itype.MOV,	op.AW,	op.R3],

	[opcode.MOV_R1_AW,		itype.MOV,	op.R1,	op.AW], // Move word R1 to word address
	[opcode.MOV_R2_AW,		itype.MOV,	op.R2,	op.AW],
	[opcode.MOV_R3_AW,		itype.MOV,	op.R3,	op.AW],


	[opcode.MOV_AR1_AB,		itype.MOV,	op.AR1B,op.AB],	// Move byte at address to address at r1
	[opcode.MOV_AR2_AB,		itype.MOV,	op.AR2B,op.AB],
	[opcode.MOV_AR3_AB,		itype.MOV,	op.AR3B,op.AB],
	[opcode.MOV_AR1_AW,		itype.MOV,	op.AR1B,op.AW],	// Move word at address to address at r1
	[opcode.MOV_AR2_AW,		itype.MOV,	op.AR2B,op.AW],
	[opcode.MOV_AR3_AW,		itype.MOV,	op.AR3B,op.AW],

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

	[opcode.MOV_R1_AR1,	itype.MOV,	op.R1,	op.AR1B],
	[opcode.MOV_R2_AR2,	itype.MOV,	op.R2,	op.AR2B],
	[opcode.MOV_R3_AR3,	itype.MOV,	op.R3,	op.AR3B],
	[opcode.MOV_R1_AR1W,	itype.MOV,	op.R1,	op.AR1W],
	[opcode.MOV_R2_AR2W,	itype.MOV,	op.R2,	op.AR2W],
	[opcode.MOV_R3_AR3W,	itype.MOV,	op.R3,	op.AR3W],


	[opcode.MOV_AW_WO,	itype.MOV,	op.AW,	op.WO],
	[opcode.MOV_AW_AW,	itype.MOV,	op.AW,	op.AW],

	[opcode.MOV_AR1_WR1,	itype.MOV,	op.AR1W,op.R1],
	[opcode.MOV_AR1_WR2,	itype.MOV,	op.AR1W,op.R2],
	[opcode.MOV_AR1_WR3,	itype.MOV,	op.AR1W,op.R3],
	[opcode.MOV_AR2_WR1,	itype.MOV,	op.AR2W,op.R1],
	[opcode.MOV_AR2_WR2,	itype.MOV,	op.AR2W,op.R2],
	[opcode.MOV_AR2_WR3,	itype.MOV,	op.AR2W,op.R3],
	[opcode.MOV_AR3_WR1,	itype.MOV,	op.AR3W,op.R1],
	[opcode.MOV_AR3_WR2,	itype.MOV,	op.AR3W,op.R2],
	[opcode.MOV_AR3_WR3,	itype.MOV,	op.AR3W,op.R3],

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
	[opcode.JC,				itype.JC,	op.WO,	null],
	[opcode.JCC,			itype.JCC,	op.WO,	null],
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

	[opcode.SUB_R1_R2,		itype.SUB,	op.R1,	op.R2],	// ADD : R1 = R1 + R2
	[opcode.SUB_R1_R3,		itype.SUB,	op.R1,	op.R3],
	[opcode.SUB_R2_R1,		itype.SUB,	op.R2,	op.R1],
	[opcode.SUB_R2_R3,		itype.SUB,	op.R2,	op.R3],
	[opcode.SUB_R3_R1,		itype.SUB,	op.R3,	op.R1],
	[opcode.SUB_R3_R2,		itype.SUB,	op.R3,	op.R2],
	[opcode.SUB_R1_WO,		itype.SUB,	op.R1,	op.WO],
	[opcode.SUB_R2_WO,		itype.SUB,	op.R2,	op.WO],
	[opcode.SUB_R3_WO,		itype.SUB,	op.R3,	op.WO],
	[opcode.SUB_R1_BY,		itype.SUB,	op.R1,	op.BY],
	[opcode.SUB_R2_BY,		itype.SUB,	op.R2,	op.BY],
	[opcode.SUB_R3_BY,		itype.SUB,	op.R3,	op.BY],


	[opcode.ADD_R1_R2,		itype.ADD,	op.R1,	op.R2],	// ADD : R1 = R1 + R2
	[opcode.ADD_R1_R3,		itype.ADD,	op.R1,	op.R3],
	[opcode.ADD_R2_R1,		itype.ADD,	op.R2,	op.R1],
	[opcode.ADD_R2_R3,		itype.ADD,	op.R2,	op.R3],
	[opcode.ADD_R3_R1,		itype.ADD,	op.R3,	op.R1],
	[opcode.ADD_R3_R2,		itype.ADD,	op.R3,	op.R2],
	[opcode.ADD_R1_WO,		itype.ADD,	op.R1,	op.WO],
	[opcode.ADD_R2_WO,		itype.ADD,	op.R2,	op.WO],
	[opcode.ADD_R3_WO,		itype.ADD,	op.R3,	op.WO],
	[opcode.ADD_R1_BY,		itype.ADD,	op.R1,	op.BY],
	[opcode.ADD_R2_BY,		itype.ADD,	op.R2,	op.BY],
	[opcode.ADD_R3_BY,		itype.ADD,	op.R3,	op.BY],

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

	[opcode.SHL_R1,		itype.SHL,	op.R1,	null],		// Shift left
	[opcode.SHL_R2,		itype.SHL,	op.R2,	null],
	[opcode.SHL_R3,		itype.SHL,	op.R3,	null],
	[opcode.SHR_R1,		itype.SHR,	op.R1,	null],		// Shift right
	[opcode.SHR_R2,		itype.SHR,	op.R2,	null],
	[opcode.SHR_R3,		itype.SHR,	op.R3,	null],

	[opcode.CLC,			itype.CLC,	null,	null],	// clear carry
	[opcode.CLZ,			itype.CLZ,	null,	null],	// clear zero
	[opcode.CLS,			itype.CLS,	null,	null],	// clear sign
	[opcode.CLB,			itype.CLB,	null,	null],	// clear break

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
