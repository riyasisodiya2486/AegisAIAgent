"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unstakeForSpend = exports.accrueYield = exports.stakeIdleFunds = exports.withdrawAll = exports.updateDailyLimit = exports.revokeAgent = exports.spend = exports.deposit = exports.createVault = exports.subscribeToVault = exports.getProtocolConfig = exports.getVaultStateByAddress = exports.getVaultState = exports.findProtocolConfigPda = exports.findVaultPda = exports.DEVNET_PROGRAM_ID = exports.AegisClient = void 0;
// Main client class
var client_1 = require("./client");
Object.defineProperty(exports, "AegisClient", { enumerable: true, get: function () { return client_1.AegisClient; } });
Object.defineProperty(exports, "DEVNET_PROGRAM_ID", { enumerable: true, get: function () { return client_1.DEVNET_PROGRAM_ID; } });
// PDA helpers
var pda_1 = require("./pda");
Object.defineProperty(exports, "findVaultPda", { enumerable: true, get: function () { return pda_1.findVaultPda; } });
Object.defineProperty(exports, "findProtocolConfigPda", { enumerable: true, get: function () { return pda_1.findProtocolConfigPda; } });
// Account fetchers + types
var accounts_1 = require("./accounts");
Object.defineProperty(exports, "getVaultState", { enumerable: true, get: function () { return accounts_1.getVaultState; } });
Object.defineProperty(exports, "getVaultStateByAddress", { enumerable: true, get: function () { return accounts_1.getVaultStateByAddress; } });
Object.defineProperty(exports, "getProtocolConfig", { enumerable: true, get: function () { return accounts_1.getProtocolConfig; } });
Object.defineProperty(exports, "subscribeToVault", { enumerable: true, get: function () { return accounts_1.subscribeToVault; } });
// Instruction builders
var instructions_1 = require("./instructions");
Object.defineProperty(exports, "createVault", { enumerable: true, get: function () { return instructions_1.createVault; } });
Object.defineProperty(exports, "deposit", { enumerable: true, get: function () { return instructions_1.deposit; } });
Object.defineProperty(exports, "spend", { enumerable: true, get: function () { return instructions_1.spend; } });
Object.defineProperty(exports, "revokeAgent", { enumerable: true, get: function () { return instructions_1.revokeAgent; } });
Object.defineProperty(exports, "updateDailyLimit", { enumerable: true, get: function () { return instructions_1.updateDailyLimit; } });
Object.defineProperty(exports, "withdrawAll", { enumerable: true, get: function () { return instructions_1.withdrawAll; } });
Object.defineProperty(exports, "stakeIdleFunds", { enumerable: true, get: function () { return instructions_1.stakeIdleFunds; } });
Object.defineProperty(exports, "accrueYield", { enumerable: true, get: function () { return instructions_1.accrueYield; } });
Object.defineProperty(exports, "unstakeForSpend", { enumerable: true, get: function () { return instructions_1.unstakeForSpend; } });
//# sourceMappingURL=index.js.map