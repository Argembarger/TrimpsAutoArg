"use strict";
var AutoBoner = /** @class */ (function () {
    function AutoBoner() {
        this.boneFarmRoutine = -1;
        this.lastKnownBoneZone = -1;
        this.lastKnownBoneCount = -1;
        this.boneFarmingMinutes = 45;
        this.boneFarmingExtraMinutes = 0;
        this.boneTraderButtonHTML = document.getElementById("boneBtnText");
        this.boneFarmAlwaysRunMap = false;
        this.boneFarmPresetOrder = [];
        this.boneFarmGoingToChamber = false;
    }
    AutoBoner.prototype.StartBoneFarming = function (runMap, mapPresets, kob2, extraMins) {
        if (kob2 === void 0) { kob2 = false; }
        if (extraMins === void 0) { extraMins = 0.0; }
        if (this.lastKnownBoneCount == -1) {
            this.lastKnownBoneCount = this.CurrentBoneCount();
            if (this.lastKnownBoneCount == null || this.lastKnownBoneCount < 0) {
                return "Bone count was " + this.lastKnownBoneCount + "! Cannot proceed!";
            }
        }
        this.boneFarmAlwaysRunMap = runMap;
        this.boneFarmPresetOrder = [];
        this.boneFarmGoingToChamber = false;
        this.boneFarmingMinutes = (kob2 ? 35 : 45) + extraMins;
        this.boneFarmingExtraMinutes = extraMins;
        if (mapPresets != null) {
            for (var i = 0; i < mapPresets.length; i++) {
                if (mapPresets[i] < 1 || mapPresets[i] > 3) {
                    continue;
                }
                this.boneFarmPresetOrder.push(mapPresets[i]);
            }
        }
        if (this.boneFarmRoutine < 0) {
            this.boneFarmRoutine = setInterval(this.BoneFarmingLogic.bind(this), 100);
        }
        return "Bone farming active! Last bone drop zone: " + this.lastKnownBoneZone +
            ", current bone count: " + this.lastKnownBoneCount + ", last known bone drop time: " + game.global.lastSkeletimp +
            ", running maps: " + this.boneFarmAlwaysRunMap + ", presets: " + this.boneFarmPresetOrder +
            ", farming minutes: " + this.boneFarmingMinutes + ", extra minutes: " + this.boneFarmingExtraMinutes;
    };
    AutoBoner.prototype.StopBoneFarming = function () {
        if (this.boneFarmRoutine < 0) {
            return "Not bone farming! Don't worry!";
        }
        clearInterval(this.boneFarmRoutine);
        this.boneFarmRoutine = -1;
        return "Stopped bone farming!";
    };
    // All the bone farming logic. Checked once per 100 ticks
    AutoBoner.prototype.BoneFarmingLogic = function () {
        var secondsInZone = (getGameTime() - game.global.zoneStarted) / 1000;
        var secondsSinceLastBone = (getGameTime() - game.global.lastSkeletimp) / 1000;
        if (!game.global.preMapsActive && !game.global.mapsActive) {
            // IN WORLD
            var currBoneCount = this.CurrentBoneCount();
            if (currBoneCount > this.lastKnownBoneCount) {
                this.lastKnownBoneCount = currBoneCount;
                this.lastKnownBoneZone = game.global.world;
            }
            if (game.global.world > 5
                && (secondsSinceLastBone <= (this.boneFarmingMinutes * 60) || secondsInZone <= (this.boneFarmingExtraMinutes * 60))) {
                // MUST NOT MOVE ON
                this.boneFarmGoingToChamber = this.GoToMapAtZoneAndCell(game.global.world, 100);
            }
        }
        else if (!game.global.preMapsActive) {
            // IN MAPS. Inverse of conditions used to leave world
            if (!game.global.switchToMaps
                && (secondsSinceLastBone > (this.boneFarmingMinutes * 60) && secondsInZone > (this.boneFarmingExtraMinutes * 60))) {
                // ALLOWED TO GO BACK
                mapsClicked();
            }
        }
        else {
            // IN MAP CHAMBER. Inverse of conditions used to leave world
            if (!game.global.switchToMaps
                && (secondsSinceLastBone > (this.boneFarmingMinutes * 60) && secondsInZone > (this.boneFarmingExtraMinutes * 60))) {
                // ALLOWED TO GO BACK
                mapsClicked();
            }
            else if (this.boneFarmGoingToChamber) {
                // MAPPING. "boneFarmGoingToChamber" prevents accidental spamming of maps.
                if (this.boneFarmAlwaysRunMap) {
                    if (this.boneFarmPresetOrder.length > 0) {
                        // First recycle maps if over 50
                        if (game.global.mapsOwnedArray.length > 50) {
                            var mapHTML = document.getElementById("mapLevelInput");
                            if (mapHTML != null) {
                                mapHTML.value = (game.global.world - 3);
                                recycleBelow(true);
                            }
                        }
                        for (var i = 0; i < this.boneFarmPresetOrder.length; i++) {
                            if (this.RunMapMatchingPreset(this.boneFarmPresetOrder[i])) {
                                this.boneFarmGoingToChamber = false;
                                return;
                            }
                            if (game.global.selectedMapPreset != this.boneFarmPresetOrder[i]) {
                                selectAdvMapsPreset(this.boneFarmPresetOrder[i]);
                            }
                            if (buyMap() >= 0) {
                                break;
                            }
                        }
                    }
                    // Backup -- run last map in list (if the list has any at all...)
                    if (game.global.mapsOwnedArray.length > 0) {
                        selectMap(game.global.mapsOwnedArray[game.global.mapsOwnedArray.length - 1].id); // Select latest map
                        runMap();
                    }
                }
                this.boneFarmGoingToChamber = false;
            }
        }
    };
    AutoBoner.prototype.CurrentBoneCount = function () {
        if (this.boneTraderButtonHTML != null) {
            return parseInt(this.boneTraderButtonHTML.innerText.substring("Trade ".length, this.boneTraderButtonHTML.innerText.indexOf(" Bones", 6)));
        }
        return -1;
    };
    AutoBoner.prototype.GoToMapAtZoneAndCell = function (_zone, _cell) {
        if (game.global.world == _zone && !game.global.preMapsActive && !game.global.mapsActive) {
            if (game.global.lastClearedCell + 2 == _cell) {
                mapsClicked();
                return true;
            }
        }
        return false;
    };
    // Selects and runs a map (and returns true) if one is found matching the preset number.
    // Preset numbers are 1, 2, 3
    // Returns false if no map matching preset is found.
    AutoBoner.prototype.RunMapMatchingPreset = function (preset) {
        if (preset < 1 || preset > 3)
            return false;
        var autoArgPresetInfo;
        if (preset == 1) {
            autoArgPresetInfo = game.global.mapPresets.p1;
        }
        else if (preset == 2) {
            autoArgPresetInfo = game.global.mapPresets.p2;
        }
        else {
            autoArgPresetInfo = game.global.mapPresets.p3;
        }
        var autoArgPresetZone = game.global.world + autoArgPresetInfo.offset;
        var autoArgPresetSpecMod = autoArgPresetInfo.specMod;
        // No check for perfect maps (yet)
        // Certainly no check for general map slider values
        //console.log("preset zone: " + autoArgPresetZone + ", spec mod: " + autoArgPresetSpecMod);
        // Searching from end of list for arguably faster matching
        for (var i = game.global.mapsOwnedArray.length - 1; i >= 0; i--) {
            if (game.global.mapsOwnedArray[i].level == autoArgPresetZone
                && game.global.mapsOwnedArray[i].bonus == autoArgPresetSpecMod) {
                selectMap(game.global.mapsOwnedArray[i].id); // Select latest map
                runMap();
                return true;
            }
            //console.log("checked map " + i + " with level " + game.global.mapsOwnedArray[i].level + " and specmod " + game.global.mapsOwnedArray[i].bonus);
        }
        return false;
    };
    return AutoBoner;
}());
var AutoArgStanceDancer = /** @class */ (function () {
    function AutoArgStanceDancer() {
        this.stanceDanceRoutine = -1;
        this.gatheringDarkEssence = false;
        this.isStanceDancing = false;
        this.stanceDanceHealthThreshold = 0.5;
        this.stanceDanceFormations = [];
        this.currStanceDanceFormationIndex = 0;
        this.resetStanceIfNewSquadIsReady = false;
    }
    AutoArgStanceDancer.prototype.StartStanceDancing = function (healthThreshold, formations, resetForNewSquad) {
        if (resetForNewSquad === void 0) { resetForNewSquad = false; }
        // Interpret being called without formations provided as a "stop"
        if (formations == null || formations == []) {
            return this.StopStanceDancing();
        }
        // Protect from bad input
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
        // Update values
        this.stanceDanceHealthThreshold = healthThreshold;
        this.stanceDanceFormations = newFormations;
        this.currStanceDanceFormationIndex = 0;
        this.isStanceDancing = true;
        this.resetStanceIfNewSquadIsReady = resetForNewSquad;
        // Kick off loop if needed
        if (this.stanceDanceRoutine < 0) {
            this.stanceDanceRoutine = setInterval(this.StanceDanceLogic.bind(this), 100);
        }
        return "Now stance dancing with health threshold set to " + this.stanceDanceHealthThreshold + " and formations to " + this.stanceDanceFormations.toString() + " and " + (this.resetStanceIfNewSquadIsReady ? "KILLING" : "not killing") + " squads when new squad is ready";
    };
    AutoArgStanceDancer.prototype.StopStanceDancing = function () {
        this.isStanceDancing = false;
        if (this.gatheringDarkEssence) {
            return "Not stance-dancing, but still gathering dark essence!";
        }
        return "Not stance-dancing!";
    };
    AutoArgStanceDancer.prototype.SetDarkEssenceGatherMode = function (shouldGather) {
        this.gatheringDarkEssence = shouldGather;
        if (shouldGather) {
            if (this.stanceDanceRoutine < 0) {
                this.stanceDanceRoutine = setInterval(this.StanceDanceLogic.bind(this), 100);
            }
            return "Gathering any available Dark Essence!";
        }
        else {
            if (this.isStanceDancing) {
                return "Not gathering essence, but still stance-dancing!";
            }
            return "Not gathering essence";
        }
    };
    AutoArgStanceDancer.prototype.StanceDanceLogic = function () {
        if (!this.gatheringDarkEssence && !this.isStanceDancing) {
            // Break out if not doing anything
            clearInterval(this.stanceDanceRoutine);
            this.stanceDanceRoutine = -1;
            return;
        }
        if (this.gatheringDarkEssence) {
            if (countRemainingEssenceDrops() > 0
                && (!game.global.mapsActive || game.global.switchToMaps)) {
                // Essence-gathering overrides standard stance-dancing
                // Do it when in-world or switching to/from maps for extra safety.
                setFormation('4');
                return;
            }
        }
        if (this.isStanceDancing) {
            // Squad Ready reset-case
            if (this.resetStanceIfNewSquadIsReady) {
                if (game.resources.trimps.realMax() === game.resources.trimps.owned) {
                    this.currStanceDanceFormationIndex = 0;
                    setFormation("2");
                    return;
                }
            }
            // Full Health reset-case
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
        }
    };
    return AutoArgStanceDancer;
}());
///<reference path="AutoBoner.ts" />
///<reference path="StanceDancer.ts" />
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
        this.m_AutoBoner = new AutoBoner();
        this.m_StanceDancer = new AutoArgStanceDancer();
    }
    AutoArg.prototype.StartBoneFarming = function (runMap, mapPresets, kob2, extraMins) {
        if (kob2 === void 0) { kob2 = false; }
        if (extraMins === void 0) { extraMins = 0.0; }
        return this.m_AutoBoner.StartBoneFarming(runMap, mapPresets, kob2, extraMins);
    };
    AutoArg.prototype.StopBoneFarming = function () {
        return this.m_AutoBoner.StopBoneFarming();
    };
    AutoArg.prototype.StartStanceDancing = function (healthThreshold, formations, resetForNewSquad) {
        if (resetForNewSquad === void 0) { resetForNewSquad = false; }
        return this.m_StanceDancer.StartStanceDancing(healthThreshold, formations, resetForNewSquad);
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
