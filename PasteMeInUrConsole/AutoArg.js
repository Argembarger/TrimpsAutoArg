"use strict";
var AutoBoner = /** @class */ (function () {
    function AutoBoner() {
        var _this = this;
        this.StartBoneFarming = function (farmOnMaps, mapPresets, kob2, extraMins) {
            if (farmOnMaps === void 0) { farmOnMaps = null; }
            if (mapPresets === void 0) { mapPresets = null; }
            if (kob2 === void 0) { kob2 = null; }
            if (extraMins === void 0) { extraMins = null; }
            // Set bone-farming dependencies
            var secondsSinceLastBone = (getGameTime() - game.global.lastSkeletimp) / 1000;
            if (secondsSinceLastBone == null || secondsSinceLastBone == undefined) {
                return "Bone Farming error: Cannot tell when there last was a bone.";
            }
            // Lazily initialize our various SHARED preference variables if needed.
            if (_this.farmShouldBuyAndOrRunMaps == null && farmOnMaps == null) {
                // Assign default value only if it hasn't been asigned already and the user doesn't care.
                _this.farmShouldBuyAndOrRunMaps = true;
            }
            else if (farmOnMaps != null) {
                // The user cares, so assign value regardless of previous value.
                _this.farmShouldBuyAndOrRunMaps = farmOnMaps;
            }
            if (_this.farmPresetOrder == null && mapPresets == null) {
                // Assign default value only if it hasn't been asigned already and the user doesn't care.
                _this.farmPresetOrder = [1, 2, 3];
            }
            else if (mapPresets != null) {
                // The user cares, so assign value regardless of previous value.
                _this.farmPresetOrder = [];
                for (var i = 0; i < mapPresets.length; i++) {
                    if (mapPresets[i] < 1 || mapPresets[i] > 3) {
                        continue;
                    }
                    _this.farmPresetOrder.push(mapPresets[i]);
                }
            }
            // Bone-specific preferences.
            _this.boneFarmingMinutes = (kob2 ? 35 : 45) + (extraMins ? extraMins : 0);
            _this.boneExtraMinutes = (extraMins ? extraMins : 0);
            // Kick off process
            if (_this.farmRoutine < 0) {
                _this.farmRoutine = setInterval(_this.BoneAndOrWeaponFarmingLogic.bind(_this), 100);
            }
            _this.farmingForBones = true;
            return "Bone farming active! Seconds since last bone: " + secondsSinceLastBone + ", last known bone drop time: " + game.global.lastSkeletimp +
                ", running maps: " + _this.farmShouldBuyAndOrRunMaps + ", presets: " + _this.farmPresetOrder +
                ", farming base minutes: " + _this.boneFarmingMinutes + ", extra minutes: " + _this.boneExtraMinutes;
        };
        this.StopBoneFarming = function () {
            if (!_this.farmingForBones) {
                if (_this.farmRoutine < 0 && !_this.farmingForWeapons) {
                    return "Not farming for anything, let alone for bones!";
                }
                else if (_this.farmRoutine >= 0 && _this.farmingForWeapons) {
                    return "Already wasn't farming for bones, but I am farming for weapons.";
                }
            }
            _this.farmingForBones = false;
            if (_this.farmRoutine >= 0 && !_this.farmingForWeapons) {
                clearInterval(_this.farmRoutine);
                _this.farmRoutine = -1;
                return "Stopped bone farming, and since wasn't weapon farming either, shut down the process.";
            }
            return "Stopped bone farming, but am still weapon farming!";
        };
        this.StartWeaponFarming = function (farmOnMaps, mapPresets) {
            if (farmOnMaps === void 0) { farmOnMaps = null; }
            if (mapPresets === void 0) { mapPresets = null; }
            // Lazily initialize our various SHARED preference variables if needed.
            if (_this.farmShouldBuyAndOrRunMaps == null && farmOnMaps == null) {
                // Assign default value only if it hasn't been asigned already and the user doesn't care.
                _this.farmShouldBuyAndOrRunMaps = true;
            }
            else if (farmOnMaps != null) {
                // The user cares, so assign value regardless of previous value.
                _this.farmShouldBuyAndOrRunMaps = farmOnMaps;
            }
            if (_this.farmPresetOrder == null && mapPresets == null) {
                // Assign default value only if it hasn't been asigned already and the user doesn't care.
                _this.farmPresetOrder = [1, 2, 3];
            }
            else if (mapPresets != null) {
                // The user cares, so assign value regardless of previous value.
                _this.farmPresetOrder = [];
                for (var i = 0; i < mapPresets.length; i++) {
                    if (mapPresets[i] < 1 || mapPresets[i] > 3) {
                        continue;
                    }
                    _this.farmPresetOrder.push(mapPresets[i]);
                }
            }
            // Kick off process
            if (_this.farmRoutine < 0) {
                _this.farmRoutine = setInterval(_this.BoneAndOrWeaponFarmingLogic.bind(_this), 100);
            }
            _this.farmingForWeapons = true;
            return "Weapon farming active! Running maps: " + _this.farmShouldBuyAndOrRunMaps + ", presets: " + _this.farmPresetOrder;
        };
        this.StopWeaponFarming = function () {
            if (!_this.farmingForWeapons) {
                if (_this.farmRoutine < 0 && !_this.farmingForBones) {
                    return "Not farming for anything, let alone for weapons!";
                }
                else if (_this.farmRoutine >= 0 && _this.farmingForBones) {
                    return "Already wasn't farming for weapons, but I am farming for bones.";
                }
            }
            _this.farmingForWeapons = false;
            if (_this.farmRoutine >= 0 && !_this.farmingForBones) {
                clearInterval(_this.farmRoutine);
                _this.farmRoutine = -1;
                return "Stopped weapon farming, and since wasn't bone farming either, shut down the process.";
            }
            return "Stopped weapon farming, but am still bone farming!";
        };
        // All the bone and or weapon farming logic. Checked once per 100 ticks
        this.BoneAndOrWeaponFarmingLogic = function () {
            var gameGlobal = game.global;
            var secondsInZone = (getGameTime() - gameGlobal.zoneStarted) / 1000;
            var secondsSinceLastBone = (getGameTime() - gameGlobal.lastSkeletimp) / 1000;
            if (!gameGlobal.preMapsActive && !gameGlobal.mapsActive) { // WE ARE IN THE WORLD
                // Decide When To Leave
                // Only applies after world 5.
                if (gameGlobal.world > 5) {
                    if (_this.farmingForBones && _this.boneFarmingMinutes != null && _this.boneExtraMinutes != null
                        && ((secondsSinceLastBone <= (_this.boneFarmingMinutes * 60)) || (secondsInZone <= (_this.boneExtraMinutes * 60)))) {
                        // We want to leave the world because not enough time has passed.
                        _this.farmGoingToChamber = _this.GoToMapOnOrAfterZoneAndCell(gameGlobal.world, 81);
                    }
                    else if (_this.farmingForWeapons && (document.getElementById("Greatersword") != null || document.getElementById("Harmbalest") != null)) {
                        // We want to leave the world because there are unbought weapons to be had.
                        _this.farmGoingToChamber = _this.GoToMapOnOrAfterZoneAndCell(gameGlobal.world, 81);
                    }
                }
            }
            else if (!gameGlobal.preMapsActive) { // WE ARE IN MAPS.
                // Status of 'repeat until' state
                var currStatus = (_this.mapRepeatButtonHTML ? _this.mapRepeatButtonHTML.textContent ? _this.mapRepeatButtonHTML.textContent.toLowerCase() : undefined : undefined);
                // No matter what, if you are actively trying to abandon, then we don't want to run logic here.
                if (!gameGlobal.switchToMaps) {
                    if (_this.WouldLikeToReturnToWorld(secondsSinceLastBone, secondsInZone)) {
                        // WANT TO GO BACK
                        if (currStatus != undefined) {
                            if (currStatus !== "repeat for any" && currStatus !== _this.mapRepeatLastStatus) {
                                _this.mapRepeatLastStatus = currStatus;
                                /*console.log("Toggling at " + currStatus);*/
                                toggleSetting('repeatUntil');
                            }
                        }
                        else {
                            // We can't use the repeat-for-any method for some reason, so just click abandon.
                            mapsClicked();
                        }
                    }
                    else {
                        // DO NOT WANT TO GO BACK
                        if (currStatus != undefined) {
                            // Make sure we're on Repeat Forever
                            if (currStatus !== "repeat forever" && currStatus !== _this.mapRepeatLastStatus) {
                                _this.mapRepeatLastStatus = currStatus;
                                /*console.log("Toggling at " + currStatus);*/
                                toggleSetting('repeatUntil');
                            }
                        }
                    }
                }
            }
            else { // WE ARE IN MAP CHAMBER.
                // If the button hasn't already been clicked, and we definitively want to return to world, then click the 'go back' button.
                if (!gameGlobal.switchToMaps
                    && _this.WouldLikeToReturnToWorld(secondsSinceLastBone, secondsInZone)) {
                    // ALLOWED TO GO BACK
                    mapsClicked();
                }
                else if (_this.farmGoingToChamber) {
                    // WE JUST CAME BACK FROM THE WORLD
                    // "farmGoingToChamber" prevents accidental spamming of maps by only being set to true from the world and only being set to false by this process.
                    if (_this.farmShouldBuyAndOrRunMaps) {
                        _this.BuyAndOrRunMaps(gameGlobal);
                    }
                    _this.farmGoingToChamber = false;
                }
            }
        };
        // A bit of a weird function. Tries to buy and/or run a map based on the current desired map presets.
        // If the presets are empty, will assume you don't want to buy a map and just run the most recent non-trimple-of-doom map.
        this.BuyAndOrRunMaps = function (gameGlobal) {
            // First recycle maps if we have over 50
            if (gameGlobal.mapsOwnedArray.length > 50) {
                var mapHTML = document.getElementById("mapLevelInput");
                if (mapHTML != null) {
                    mapHTML.value = (gameGlobal.world - 3);
                    recycleBelow(true);
                }
            }
            // Run preset-checking logic if the user has specified presets.
            if (_this.farmPresetOrder != null && _this.farmPresetOrder.length > 0) {
                // Check each desired preset
                for (var i = 0; i < _this.farmPresetOrder.length; i++) {
                    if (_this.RunMapMatchingPreset(_this.farmPresetOrder[i])) {
                        _this.farmGoingToChamber = false;
                        return;
                    }
                    if (gameGlobal.selectedMapPreset != _this.farmPresetOrder[i]) {
                        selectAdvMapsPreset(_this.farmPresetOrder[i]);
                    }
                    if (buyMap() >= 0) {
                        // If a purchase was successful, run the latest map and break out.
                        _this.RunLatestNonTrimpleMap();
                        _this.farmGoingToChamber = false;
                        return;
                    }
                }
                // Backup -- run last map in list (if the list has any at all...)
                _this.RunLatestNonTrimpleMap();
            }
            else {
                // We don't want to *purchase* maps if we aren't using a preset array, but that doesn't mean we don't want to run maps.
                _this.RunLatestNonTrimpleMap();
            }
        };
        // Checks if current farming conditions are satisfied, whether bone or weapon farming or both.
        this.WouldLikeToReturnToWorld = function (secondsSinceBone, secondsInZone) {
            // We have waited enough time, and also not farming for weapons, or there are no weapons to be farmed for.
            return ((!_this.farmingForBones || _this.boneFarmingMinutes == null || _this.boneExtraMinutes == null || secondsSinceBone > (_this.boneFarmingMinutes * 60) && secondsInZone > (_this.boneExtraMinutes * 60))
                && (!_this.farmingForWeapons || (document.getElementById("Greatersword") == null && document.getElementById("Harmbalest") == null)));
        };
        // Can run this as a backup to RunMapMatchingPreset.
        // Will run the most recent map that is not Trimple Of Doom. 
        // Returns false if, like, Trimple is your ONLY map which I'm pretty sure is impossible.
        this.RunLatestNonTrimpleMap = function () {
            var ownedMaps = game.global.mapsOwnedArray;
            // Found nothing matching ideal requirements. Run whatever most recent we find that's not Trimple of Doom.
            for (var i = ownedMaps.length - 1; i >= 0; i--) {
                if (ownedMaps[i].name !== "Trimple Of Doom") {
                    selectMap(ownedMaps[i].id); // Select non-Trimple map
                    runMap();
                    return false;
                }
            }
            console.log("Failed to find any non-Trimple Of Doom map, sorry!");
            return false;
        };
        // either/both/global
        this.farmRoutine = -1;
        this.farmGoingToChamber = false;
        this.mapRepeatLastStatus = "";
        // either/both/global preferences
        this.farmShouldBuyAndOrRunMaps = null;
        this.farmPresetOrder = null;
        // bones
        this.farmingForBones = false;
        // bone preferences
        this.boneFarmingMinutes = null; // 45;
        this.boneExtraMinutes = null; //0;
        // weapons
        this.farmingForWeapons = false;
        // dependent HTMLs (which are not guaranteed)
        this.mapRepeatButtonHTML = document.getElementsByClassName("btn settingBtn0 fightBtn")[1];
    }
    // If on the specified world-zone, and at or beyond the specified world cell, go to the map chamber and return true. Otherwiser return false.
    AutoBoner.prototype.GoToMapOnOrAfterZoneAndCell = function (_zone, _cell) {
        var gameGlobal = game.global;
        if (gameGlobal.world == _zone
            && !gameGlobal.preMapsActive
            && !gameGlobal.mapsActive
            && gameGlobal.lastClearedCell + 2 >= _cell) {
            mapsClicked();
            return true;
        }
        return false;
    };
    // Selects and runs a map (and returns true) if one is found matching the preset number.
    // Preset numbers are 1, 2, 3
    // Returns false if was not able to run a map.
    AutoBoner.prototype.RunMapMatchingPreset = function (preset) {
        if (preset < 1 || preset > 3)
            return false;
        var gameGlobal = game.global;
        var autoArgPresetInfo = (preset == 1 ? gameGlobal.mapPresets.p1 : (preset == 2 ? gameGlobal.mapPresets.p2 : gameGlobal.mapPresets.p3));
        var autoArgPresetZone = gameGlobal.world + autoArgPresetInfo.offset;
        var autoArgPresetSpecMod = autoArgPresetInfo.specMod;
        // No check for perfect maps (yet)
        // Certainly no check for general map slider values
        //console.log("preset zone: " + autoArgPresetZone + ", spec mod: " + autoArgPresetSpecMod);
        // Searching from end of list for arguably faster matching
        var ownedMaps = gameGlobal.mapsOwnedArray;
        for (var i = ownedMaps.length - 1; i >= 0; i--) {
            if (ownedMaps[i].level == autoArgPresetZone
                && ownedMaps[i].bonus == autoArgPresetSpecMod) {
                selectMap(ownedMaps[i].id); // Select latest map
                runMap();
                return true;
            }
            //console.log("checked map " + i + " with level " + ownedMaps[i].level + " and specmod " + ownedMaps[i].bonus);
        }
        return false;
    };
    return AutoBoner;
}());
var AutoArgStanceDancer = /** @class */ (function () {
    function AutoArgStanceDancer() {
        var _this = this;
        this.StartStanceDancing = function (healthThreshold, formations, resetForNewSquad) {
            if (resetForNewSquad === void 0) { resetForNewSquad = false; }
            // Protect from bad input
            var newFormations = [];
            for (var i = 0; i < formations.length; i++) {
                if (!_this.HasFormation(formations[i])) {
                    continue;
                }
                newFormations.push(formations[i]);
            }
            if (healthThreshold < 0) {
                healthThreshold = 0;
            }
            else if (healthThreshold > 1) {
                healthThreshold = 1;
            }
            // Update values
            _this.stanceDanceHealthThreshold = healthThreshold;
            _this.stanceDanceFormations = newFormations;
            _this.currStanceDanceFormationIndex = 0;
            _this.isStanceDancing = true;
            // Can only 'reset' squads if D is available.
            _this.resetStanceIfNewSquadIsReady = resetForNewSquad && _this.HasFormation(2);
            // Kick off loop if needed
            if (_this.stanceDanceRoutine < 0) {
                _this.stanceDanceRoutine = setInterval(_this.StanceDanceLogic.bind(_this), 100);
            }
            return "Now stance dancing with health threshold set to " + _this.stanceDanceHealthThreshold + " and formations to " + _this.stanceDanceFormations.toString() + " and " + (_this.resetStanceIfNewSquadIsReady ? "KILLING" : "not killing") + " squads when new squad is ready. If you don't have some formations unlocked, you may want to re-call this later when you do!!";
        };
        this.StopStanceDancing = function () {
            _this.isStanceDancing = false;
            if (_this.gatheringDarkEssence) {
                return "Not stance-dancing, but still gathering dark essence!";
            }
            return "Not stance-dancing!";
        };
        this.SetDarkEssenceGatherMode = function (shouldGather) {
            if (!_this.HasFormation(4)) {
                return "Can't gather dark essence if you don't have S!";
            }
            _this.gatheringDarkEssence = shouldGather;
            if (shouldGather) {
                if (_this.stanceDanceRoutine < 0) {
                    _this.stanceDanceRoutine = setInterval(_this.StanceDanceLogic.bind(_this), 100);
                }
                return "Gathering any available Dark Essence!";
            }
            else {
                if (_this.isStanceDancing) {
                    return "Not gathering essence, but still stance-dancing!";
                }
                return "Not gathering essence";
            }
        };
        this.StanceDanceLogic = function () {
            if (!_this.gatheringDarkEssence && !_this.isStanceDancing) {
                // Break out if not doing anything
                clearInterval(_this.stanceDanceRoutine);
                _this.stanceDanceRoutine = -1;
                return;
            }
            var gameGlobal = game.global;
            // Essence-gathering overrides normal stance-dancing.
            // Only applies if we aren't in maps, and are world 180 or above. (180 won't have drops but we want to prepare for 181.)
            var currStatus = (_this.mapRepeatButtonHTML ? _this.mapRepeatButtonHTML.textContent ? _this.mapRepeatButtonHTML.textContent.toLowerCase() : undefined : undefined);
            if (_this.gatheringDarkEssence && gameGlobal.world > 179
                && (!gameGlobal.mapsActive
                    || (gameGlobal.mapsActive && (gameGlobal.switchToMaps || (currStatus != undefined && currStatus !== "repeat forever"))))) {
                // If there are available drops,
                // or if we're fighting an almost-dead boss, so that we can have S enabled the entire time.
                if (countRemainingEssenceDrops() > 0
                    || (game.global.lastClearedCell == 98 && _this.BadGuyCurrentHealthRatio() <= 0.05)) {
                    // Essence-gathering overrides standard stance-dancing
                    setFormation('4');
                    return;
                }
            }
            if (_this.isStanceDancing) {
                // Squad Ready reset-case
                if (_this.resetStanceIfNewSquadIsReady) {
                    if (game.resources.trimps.realMax() === game.resources.trimps.owned) {
                        _this.currStanceDanceFormationIndex = 0;
                        setFormation("2");
                        return;
                    }
                }
                // Full Health reset-case
                if (gameGlobal.soldierHealth == gameGlobal.soldierHealthMax) {
                    _this.currStanceDanceFormationIndex = 0;
                    setFormation(_this.stanceDanceFormations[_this.currStanceDanceFormationIndex].toString());
                }
                // Cycle through remaining formations as health threshold is reached
                else if (_this.currStanceDanceFormationIndex < _this.stanceDanceFormations.length - 1
                    && gameGlobal.soldierHealth <= gameGlobal.soldierHealthMax * _this.stanceDanceHealthThreshold) {
                    _this.currStanceDanceFormationIndex++;
                    setFormation(_this.stanceDanceFormations[_this.currStanceDanceFormationIndex].toString());
                }
            }
        };
        this.BadGuyCurrentHealthRatio = function () {
            if (_this.badGuyHealthHTML == null || _this.badGuyHealthMaxHTML == null) {
                return 1.0;
            }
            return (Number(_this.badGuyHealthHTML.innerHTML) / Number(_this.badGuyHealthMaxHTML.innerHTML));
        };
        this.stanceDanceRoutine = -1;
        this.badGuyHealthHTML = document.getElementById("badGuyHealth");
        this.badGuyHealthMaxHTML = document.getElementById("badGuyHealthMax");
        this.gatheringDarkEssence = false;
        this.mapRepeatButtonHTML = document.getElementsByClassName("btn settingBtn0 fightBtn")[1];
        this.isStanceDancing = false;
        this.stanceDanceHealthThreshold = 0.5;
        this.stanceDanceFormations = [];
        this.currStanceDanceFormationIndex = 0;
        this.resetStanceIfNewSquadIsReady = false;
    }
    // Use this while setting up, not during the interval-function... It's expensive
    AutoArgStanceDancer.prototype.HasFormation = function (formation) {
        var formHTML = document.getElementById("formation" + formation);
        var formDisp = (formHTML != null ? formHTML.style.display : null);
        return (formDisp != null && formDisp != undefined && formDisp !== ""); // formDisp would be "block" if it's available.
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
        var _this = this;
        this.Status = function () {
            console.log("Status: " + _this.HelloText);
            console.log("Farming status: " + JSON.stringify(_this.m_AutoBoner));
            console.log("Stance status: " + JSON.stringify(_this.m_StanceDancer));
        };
        this.StartBoneFarming = function (runMaps, mapPresets, kob2, extraMins) {
            if (runMaps === void 0) { runMaps = null; }
            if (mapPresets === void 0) { mapPresets = null; }
            if (kob2 === void 0) { kob2 = null; }
            if (extraMins === void 0) { extraMins = null; }
            // All of these basic functions just return their output strings, which makes for handy state-logging when called directly in the console.
            return _this.m_AutoBoner.StartBoneFarming(runMaps, mapPresets, kob2, extraMins);
        };
        this.StopBoneFarming = function () {
            return _this.m_AutoBoner.StopBoneFarming();
        };
        this.HelpBoneFarming = function () {
            return "Usages: StartBoneFarming(runMaps, mapPresets, kob2, extraMins); StopBoneFarming();\n"
                + "You can leave everything out and just call autoArg.StartBoneFarming(); It will use default values. It's not polymorphic though so you'll have to declare any variables up to and including the one you want.\n"
                + "All values can also be passed in as null, which will use either a default or a pre-existing value.\n"
                + "Both bone farming and weapon farming share the map and map preset logic, you can always change it with another Start call.\n"
                + "runMaps can be true or false, if true will try to buy/enter maps, if false will just sit on map chamber until bones are ready. Defaults to true.\n"
                + "mapPresets is an array of integers 1 through 3, denoting the order you want your actual presets to be used. [] would only run maps, never try to buy. [1, 3] would try to run/buy your first, followed by your third preset. [1,2,3] is default.\n"
                + "kob2 can be true or false, default is false. Set to true if you have the mastery.\n"
                + "extraMins can be used if you want to farm above and beyond what is needed for your bones. Is just a number, defaults to 0. Can be negative (but why?)\n"
                + "Some examples: autoArg.StartBoneFarming(true, [2], true, 100); autoArg.StartBoneFarming(); autoArg.StartBoneFarming(true, [], false);";
        };
        this.StartWeaponFarming = function (runMaps, mapPresets) {
            if (runMaps === void 0) { runMaps = null; }
            return _this.m_AutoBoner.StartWeaponFarming(runMaps, mapPresets);
        };
        this.StopWeaponFarming = function () {
            return _this.m_AutoBoner.StopWeaponFarming();
        };
        this.HelpWeaponFarming = function () {
            return "Usages: StartWeaponFarming(runmaps, mapPresets); StopWeaponFarming();\n"
                + "This works very similarly to StartBoneFarming but has fewer parameters.\n"
                + "Both bone farming and weapon farming share the map and map preset logic, you can always change it with another Start call.\n"
                + "You can leave everything out and just call autoArg.StartWeaponFarming(); It will use default values. It's not polymorphic though so you'll have to declare any variables up to and including the one you want.\n"
                + "All values can also be passed in as null, which will use either a default or a pre-existing value.\n"
                + "runMaps can be true or false, if true will try to buy/enter maps, if false will just sit on map chamber until the weapons are bought. Pretty useless to disable because it would take forever, and defaults to true.\n"
                + "mapPresets is an array of integers 1 through 3, denoting the order you want your actual presets to be used. [] would only run maps, never try to buy. [1, 3] would try to run/buy your first, followed by your third preset. [1,2,3] is default.\n"
                + "Some examples: autoArg.StartWeaponFarming(true, [2,1,3]); autoArg.StartWeaponFarming(); autoArg.StartWeaponFarming(true, []);";
        };
        this.StartStanceDancing = function (healthThreshold, formations, resetForNewSquad) {
            if (healthThreshold === void 0) { healthThreshold = 0.5; }
            if (formations === void 0) { formations = [2, 0, 1]; }
            if (resetForNewSquad === void 0) { resetForNewSquad = false; }
            return _this.m_StanceDancer.StartStanceDancing(healthThreshold, formations, resetForNewSquad);
        };
        this.StopStanceDancing = function () {
            return _this.m_StanceDancer.StopStanceDancing();
        };
        this.HelpStanceDancing = function () {
            return "Usages: StartStanceDancing(healthThreshold, formations, resetForNewSquad); StopStanceDancing();\n"
                + "Note that autoArg prioritizes Dark Essence gathing over Stance Dancing.\n"
                + "You can leave everything out and just call autoArg.StartStanceDancing(); It will use default values. It's not polymorphic though so you'll have to declare any variables up to and including the one you want.\n"
                + "All values can also be passed in as null, which will use either a default or a pre-existing value.\n"
                + "healthThreshold is a number between 0 and 1 telling it how hurt you want your trimps to be to move to the next stance. Default is 0.5.\n"
                + "formations is an array of numbers relating to your formations. 0 = X, 1 = H, 2 = D, 3 = B, 4 = S, 5 = N, etc. Default is [2,0,1], D, X, H.\n"
                + "resetForNewSquad can be true or false, and if true will switch to D when a new squad is ready.\n"
                + "Some examples: autoArg.StartStanceDancing(0.333, [3,0,1], true); autoArg.StartStanceDancing(); autoArg.StartStanceDancing(0.8, [2,3], true)";
        };
        this.StartGatheringDarkEssence = function () {
            return _this.m_StanceDancer.SetDarkEssenceGatherMode(true);
        };
        this.StopGatheringDarkEssence = function () {
            return _this.m_StanceDancer.SetDarkEssenceGatherMode(false);
        };
        this.HelpGatheringDarkEssence = function () {
            return "Usages: StartGatheringDarkEssence(); StopGatheringDarkEssence();\n"
                + "Note that autoArg prioritizes Dark Essence Gathering over Stance Dancing.\n"
                + "Just call autoArg.StartGatheringDarkEssence(); to use, and autoArg.StopGatheringDarkEssence(); to stop.\n"
                + "Will make sure you are on S if you are on the world when dark essence is available. Tries its best, but may potentially miss cell-1 dess.";
        };
        this.m_AutoBoner = new AutoBoner();
        this.m_StanceDancer = new AutoArgStanceDancer();
        this.HelloText = "AutoArg is now running. Type autoArg.HelpMe() for help.";
    }
    AutoArg.prototype.HelpMe = function () {
        console.log("Until the glorious day when there is UI for this tool, you'll have to interact with it much as you just did, through the autoArg object.");
        console.log("Each basic state has a Start and Stop and Help command.");
        console.log("The states are BoneFarming, WeaponFarming, StanceDancing, and GatheringDarkEssence.");
        console.log("Hopefully, they should auto-fill the parameter names when you start typing them.");
        console.log("For further help, use autoArg.HelpBoneFarming(); autoArg.HelpWeaponFarming(); autoArg.HelpStanceDancing(); autoArg.HelpGatheringDarkEssence();");
        console.log("You can also call autoArg.Status() at any time.");
    };
    return AutoArg;
}());
var autoArg = new AutoArg();
console.log(autoArg.HelloText);
