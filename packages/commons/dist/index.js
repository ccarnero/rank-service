"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopHealthcheckServer = exports.startHealthcheckServer = exports.closeConnectionsAndExit = void 0;
var shutdown_1 = require("./lib/shutdown");
Object.defineProperty(exports, "closeConnectionsAndExit", { enumerable: true, get: function () { return shutdown_1.closeConnectionsAndExit; } });
var healthcheck_1 = require("./lib/healthcheck");
Object.defineProperty(exports, "startHealthcheckServer", { enumerable: true, get: function () { return healthcheck_1.startHealthcheckServer; } });
Object.defineProperty(exports, "stopHealthcheckServer", { enumerable: true, get: function () { return healthcheck_1.stopHealthcheckServer; } });
//# sourceMappingURL=index.js.map