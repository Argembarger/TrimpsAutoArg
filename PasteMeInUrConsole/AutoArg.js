"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var AutoArgBoneFarmer = /** @class */ (function () {
    function AutoArgBoneFarmer() {
        this.boneFarmRoutine = -1;
        this.lastKnownBoneZone = -1;
        this.lastKnownBoneCount = -1;
        this.lastKnownBoneTime = -1;
        this.boneTraderButtonHTML = document.getElementById("boneBtnText");
        this.boneFarmAlwaysRunMap = false;
        this.boneFarmPresetOrder = [];
        this.boneFarmGoingToMap = false;
    }
    AutoArgBoneFarmer.prototype.StartBoneFarming = function (runMap) {
        var mapPresets = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            mapPresets[_i - 1] = arguments[_i];
        }
        if (this.boneFarmRoutine >= 0) {
            return "Already bone farming!";
        }
        // DO NOT ATTEMPT IF LESS THAN ZONE 5
        if (game.global.world < 6) {
            return "Cannot (yet) bone farm less than World 6, since you cannot map yet!";
        }
        if (this.boneTraderButtonHTML == null) {
            return "Couldn't find bone trader button! Cannot proceed!";
        }
        var bone_trade_btn_text = this.boneTraderButtonHTML.innerText;
        if (bone_trade_btn_text.indexOf("Trade ") == -1 || bone_trade_btn_text.indexOf(" Bones", 6) == -1) {
            return "Bone trader button seems weird! Cannot proceed!";
        }
        this.lastKnownBoneCount = -1;
        if (this.boneTraderButtonHTML != null) {
            this.lastKnownBoneCount = parseInt(this.boneTraderButtonHTML.innerText.substring("Trade ".length, this.boneTraderButtonHTML.innerText.indexOf(" Bones", 6)));
        }
        if (this.lastKnownBoneCount == null || this.lastKnownBoneCount < 0) {
            return "Bone count was " + this.lastKnownBoneCount + "! Cannot proceed!";
        }
        this.boneFarmAlwaysRunMap = runMap;
        this.boneFarmPresetOrder = [];
        this.boneFarmGoingToMap = false;
        if (mapPresets != null) {
            for (var i = 0; i < mapPresets.length; i++) {
                if (mapPresets[i] < 1 || mapPresets[i] > 3) {
                    continue;
                }
                this.boneFarmPresetOrder.push(mapPresets[i]);
            }
        }
        this.boneFarmRoutine = setInterval(this.BoneFarmingLogic, 100);
        return "Now bone farming! Last bone drop zone: " + this.lastKnownBoneZone + ", current bone count: " + this.lastKnownBoneCount + ", last known bone drop time: " + this.lastKnownBoneTime;
    };
    AutoArgBoneFarmer.prototype.StopBoneFarming = function () {
        if (this.boneFarmRoutine < 0) {
            return "Not bone farming! Don't worry!";
        }
        clearInterval(this.boneFarmRoutine);
        this.boneFarmRoutine = -1;
        return "Stopped bone farming!";
    };
    // All the bone farming logic. Checked once per 100 ticks
    AutoArgBoneFarmer.prototype.BoneFarmingLogic = function () {
        var secondsSinceLastBone = (getGameTime() - this.lastKnownBoneTime) / 1000;
        // BASE CASE: It has been more than 45 minutes since the last bone,
        // or else the last bone was found in a previous zone.
        // Go back to world.
        if (this.lastKnownBoneZone < game.global.world
            || secondsSinceLastBone > (45 * 60)) {
            this.boneFarmGoingToMap = false;
            // If in map and not switching to map chamber, do so
            if (game.global.mapsActive && !game.global.switchToMaps) {
                mapsClicked();
            }
            // If on map screen and not switching to world, do so
            if (game.global.preMapsActive && !game.global.switchToMaps) {
                mapsClicked();
            }
        }
        // Case where we're fighting in the world
        else if (!game.global.preMapsActive && !game.global.mapsActive && game.global.fighting) {
            // Subcase where we already know we have found a bone in this zone less than 45 minutes ago
            if (this.lastKnownBoneZone == game.global.world) {
                if (secondsSinceLastBone <= (45 * 60)) {
                    // Only have to really worry about mapping on cell 100
                    this.boneFarmGoingToMap = this.GoToMapAtZoneAndCell(game.global.world, 100);
                }
            }
            else { // Haven't found a bone yet.
                // Try to detect a bone??
                var currBoneCount = -1;
                if (this.boneTraderButtonHTML != null) {
                    currBoneCount = parseInt(this.boneTraderButtonHTML.innerText.substring("Trade ".length, this.boneTraderButtonHTML.innerText.indexOf(" Bones", 6)));
                }
                if (currBoneCount > this.lastKnownBoneCount) {
                    this.lastKnownBoneCount = currBoneCount;
                    this.lastKnownBoneZone = game.global.world;
                    this.lastKnownBoneTime = getGameTime();
                }
            }
        }
        // Case where we're returning to map in order to farm, and have arrived at the chamber.
        // TODO: Would be great if it detected appropriate maps that already existed, and just ran those.
        else if (this.boneFarmGoingToMap && game.global.preMapsActive && !game.global.mapsActive && !game.global.fighting) {
            this.boneFarmGoingToMap = false;
            if (this.boneFarmAlwaysRunMap) {
                for (var i = 0; i < this.boneFarmPresetOrder.length; i++) {
                    if (game.global.selectedMapPreset != this.boneFarmPresetOrder[i]) {
                        selectAdvMapsPreset(this.boneFarmPresetOrder[i]);
                    }
                    if (buyMap() >= 0) {
                        break;
                    }
                }
                selectMap(game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id); // Select latest map
                runMap();
            }
        }
    };
    AutoArgBoneFarmer.prototype.GoToMapAtZoneAndCell = function (_zone, _cell) {
        if (game.global.world == _zone && !game.global.preMapsActive && !game.global.mapsActive) {
            if (game.global.lastClearedCell + 2 == _cell) {
                mapsClicked();
                return true;
            }
        }
        return false;
    };
    return AutoArgBoneFarmer;
}());
var AutoArgStanceDancer = /** @class */ (function () {
    function AutoArgStanceDancer() {
        this.stanceDanceRoutine = -1;
        this.gatheringDarkEssence = false;
        this.essenceSensed = false;
        this.isStanceDancing = false;
        this.stanceDanceHealthThreshold = 0.5;
        this.stanceDanceFormations = [];
        this.currStanceDanceFormationIndex = 0;
    }
    AutoArgStanceDancer.prototype.StartStanceDancing = function (healthThreshold) {
        var formations = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            formations[_i - 1] = arguments[_i];
        }
        if (formations == null || formations == []) {
            return this.StopStanceDancing();
        }
        var newFormations = [];
        for (var i = 0; i < formations.length; i++) {
            if (formations[i] < 0 || formations[i] > 4) {
                continue;
            }
            newFormations.push(formations[i]);
        }
        if (healthThreshold < 0.01) {
            healthThreshold = 0.01;
        }
        else if (healthThreshold > 0.99) {
            healthThreshold = 0.99;
        }
        this.stanceDanceHealthThreshold = healthThreshold;
        this.stanceDanceFormations = newFormations;
        this.currStanceDanceFormationIndex = 0;
        this.isStanceDancing = true;
        if (this.stanceDanceRoutine >= 0) {
            return "Already stance-dancing! Updated health threshold to " + this.stanceDanceHealthThreshold + " and formations to " + this.stanceDanceFormations.toString();
        }
        else {
            this.stanceDanceRoutine = setInterval(this.StanceDanceLogic, 100);
            return "Now stance dancing with health threshold set to " + this.stanceDanceHealthThreshold + " and formations to " + this.stanceDanceFormations.toString();
        }
    };
    AutoArgStanceDancer.prototype.StopStanceDancing = function () {
        if (this.stanceDanceRoutine < 0 || !this.isStanceDancing) {
            return "Wasn't stance-dancing!";
        }
        else {
            this.isStanceDancing = false;
            if (!this.gatheringDarkEssence) {
                clearInterval(this.stanceDanceRoutine);
                this.stanceDanceRoutine = -1;
                return "Stopped stance-dancing.";
            }
            return "Stopped stance-dancing, but still gathering essence";
        }
    };
    AutoArgStanceDancer.prototype.SetDarkEssenceGatherMode = function (shouldGather) {
        if (this.gatheringDarkEssence && shouldGather) {
            return "Already gathering Dark Essence!";
        }
        else if (!this.gatheringDarkEssence && !shouldGather) {
            return "Wasn't gathering Dark Essence!";
        }
        this.gatheringDarkEssence = shouldGather;
        this.essenceSensed = shouldGather;
        if (shouldGather) {
            if (this.stanceDanceRoutine >= 0) {
                return "Now gathering Dark Essence in addition to stance-dancing!";
            }
            else {
                this.stanceDanceRoutine = setInterval(this.StanceDanceLogic, 100);
                return "Gathering any available Dark Essence!";
            }
        }
        else {
            if (this.stanceDanceRoutine < 0) {
                return "Not gathering Dark Essence! No worries!";
            }
            else if (!this.isStanceDancing) {
                clearInterval(this.stanceDanceRoutine);
                this.stanceDanceRoutine = -1;
                return "No longer (deliberately) gathering Dark Essence!";
            }
            return "No longer gathering essence, but still stance-dancing!";
        }
    };
    AutoArgStanceDancer.prototype.StanceDanceLogic = function () {
        if (this.gatheringDarkEssence) {
            this.essenceSensed = !game.global.mapsActive && countRemainingEssenceDrops() > 0;
            if (this.essenceSensed) {
                setFormation('4');
                return;
            }
        }
        // Full Health case
        if (game.global.soldierHealth == game.global.soldierHealthMax) {
            this.currStanceDanceFormationIndex = 0;
            setFormation(this.stanceDanceFormations[this.currStanceDanceFormationIndex].toString());
        }
        // Cycle through remaining formations as health threshold is reached
        else if (this.currStanceDanceFormationIndex < this.stanceDanceFormations.length - 1
            && game.global.soldierHealth <= game.global.soldierHealthMax * this.stanceDanceHealthThreshold) {
            this.currStanceDanceFormationIndex++;
            setFormation(this.stanceDanceFormations[this.currStanceDanceFormationIndex].toString());
        }
    };
    return AutoArgStanceDancer;
}());
///<reference path="AutoArgBoneFarmer.ts" />
///<reference path="AutoArgStanceDancer.ts" />
// USEFUL VARIABLES AND FUNCTIONS
// Current zone number: game.global.world
// Current world cell: (game.global.lastClearedCell + 2)
// Current map cell: (game.global.lastClearedMapCell + 2)
// On map menu but not in map: game.global.preMapsActive
// Time since zone in seconds: (getGameTime() - game.global.zoneStarted) / 1000
// Click "m": mapsClicked();
// setFormation('x'); where 0 = X, 1 = H, 2 = D, 3 = B, 4 = S
// game.global.formation
// game.global.soldierHealthMax // Matches current formation
// game.global.soldierHealth
// Print to console: console.log("string");
// AutoArg -- manually injected action triggering
// After loading Trimps, paste the following code into your console:
// (SetInterval is at the bottom and controls what actually happens)
var AutoArg = /** @class */ (function () {
    function AutoArg() {
        this.m_BoneFarmer = new AutoArgBoneFarmer();
        this.m_StanceDancer = new AutoArgStanceDancer();
    }
    AutoArg.prototype.StartBoneFarming = function (runMap) {
        var _a;
        var mapPresets = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            mapPresets[_i - 1] = arguments[_i];
        }
        return (_a = this.m_BoneFarmer).StartBoneFarming.apply(_a, __spreadArrays([runMap], mapPresets));
    };
    AutoArg.prototype.StopBoneFarming = function () {
        return this.m_BoneFarmer.StopBoneFarming();
    };
    AutoArg.prototype.StartStanceDancing = function (healthThreshold) {
        var _a;
        var formations = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            formations[_i - 1] = arguments[_i];
        }
        return (_a = this.m_StanceDancer).StartStanceDancing.apply(_a, __spreadArrays([healthThreshold], formations));
    };
    AutoArg.prototype.StopStanceDancing = function () {
        return this.m_StanceDancer.StopStanceDancing();
    };
    AutoArg.prototype.SetDarkEssenceGatherMode = function (shouldGather) {
        return this.m_StanceDancer.SetDarkEssenceGatherMode(shouldGather);
    };
    return AutoArg;
}());
var autoArg = new AutoArg();
