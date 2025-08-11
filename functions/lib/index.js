"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserRole = exports.getPolicies = exports.getDirectory = exports.getUserProfile = exports.createUserProfile = exports.createUser = void 0;
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// This is the "central nervous system" for all our Firebase Functions.
// By exporting them from this single file, we ensure they are all
// deployed and managed consistently.
// The following functions are still part of the application, but
// we can consolidate them in the future if it makes sense.
var create_user_1 = require("./create-user");
Object.defineProperty(exports, "createUser", { enumerable: true, get: function () { return create_user_1.createUser; } });
var create_user_profile_1 = require("./create-user-profile");
Object.defineProperty(exports, "createUserProfile", { enumerable: true, get: function () { return create_user_profile_1.createUserProfile; } });
var get_user_profile_1 = require("./get-user-profile");
Object.defineProperty(exports, "getUserProfile", { enumerable: true, get: function () { return get_user_profile_1.getUserProfile; } });
var get_directory_data_1 = require("./get-directory-data");
Object.defineProperty(exports, "getDirectory", { enumerable: true, get: function () { return get_directory_data_1.getDirectory; } });
var get_policies_data_1 = require("./get-policies-data");
Object.defineProperty(exports, "getPolicies", { enumerable: true, get: function () { return get_policies_data_1.getPolicies; } });
var set_user_role_1 = require("./set-user-role");
Object.defineProperty(exports, "setUserRole", { enumerable: true, get: function () { return set_user_role_1.setUserRole; } });
//# sourceMappingURL=index.js.map