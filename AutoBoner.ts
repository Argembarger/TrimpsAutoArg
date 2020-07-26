class AutoBoner {
    // either/both/global
    private farmRoutine: number;
    private farmGoingToChamber: boolean;
    private mapRepeatLastStatus: string;
    // either/both/global preferences
    private farmShouldBuyAndOrRunMaps: boolean | null;
    private farmPresetOrder: number[] | null;

    // bones
    private farmingForBones: boolean;
    // bone preferences
    private boneFarmingMinutes: number | null;
    private boneExtraMinutes: number | null;

    // weapons
    private farmingForWeapons: boolean;

    // dependent HTMLs (which are not guaranteed)
    private mapRepeatButtonHTML: Element | null;

    constructor() {
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

    public StartBoneFarming = (farmOnMaps: boolean | null = null, mapPresets: number[] | null = null, kob2: boolean | null = null, extraMins: number | null = null): string => {
        // Set bone-farming dependencies
        const secondsSinceLastBone: number | null | undefined = (getGameTime() - game.global.lastSkeletimp) / 1000;
        if(secondsSinceLastBone == null || secondsSinceLastBone == undefined) {
            return "Bone Farming error: Cannot tell when there last was a bone."; 
        }
        
        // Lazily initialize our various SHARED preference variables if needed.
        if(this.farmShouldBuyAndOrRunMaps == null && farmOnMaps == null) {
            // Assign default value only if it hasn't been asigned already and the user doesn't care.
            this.farmShouldBuyAndOrRunMaps = true;
        } else if(farmOnMaps != null) {
            // The user cares, so assign value regardless of previous value.
            this.farmShouldBuyAndOrRunMaps = farmOnMaps;
        }

        if(this.farmPresetOrder == null && mapPresets == null) {
            // Assign default value only if it hasn't been asigned already and the user doesn't care.
            this.farmPresetOrder = [1, 2, 3];
        } else if(mapPresets != null) {
            // The user cares, so assign value regardless of previous value.
            this.farmPresetOrder = [];
            for(let i: number = 0; i < mapPresets.length; i++) {
                if(mapPresets[i] < 1 || mapPresets[i] > 3) { continue; }
                this.farmPresetOrder.push(mapPresets[i]);
            }
        }

        // Bone-specific preferences.
        this.boneFarmingMinutes = (kob2 ? 35 : 45) + (extraMins ? extraMins : 0);
        this.boneExtraMinutes = (extraMins ? extraMins : 0);

        // Kick off process
        if(this.farmRoutine < 0) {
            this.farmRoutine = setInterval(this.BoneAndOrWeaponFarmingLogic.bind(this), 100);
        }

        this.farmingForBones = true;

        return "Bone farming active! Seconds since last bone: " + secondsSinceLastBone + ", last known bone drop time: " + game.global.lastSkeletimp +
        ", running maps: " + this.farmShouldBuyAndOrRunMaps + ", presets: " + this.farmPresetOrder +
        ", farming base minutes: " + this.boneFarmingMinutes + ", extra minutes: " + this.boneExtraMinutes;
    }

    public StopBoneFarming = (): string => {
        if(!this.farmingForBones) {
            if(this.farmRoutine < 0 && !this.farmingForWeapons) {
                return "Not farming for anything, let alone for bones!"; 
            } else if(this.farmRoutine >= 0 && this.farmingForWeapons) {
                return "Already wasn't farming for bones, but I am farming for weapons."
            }
        }
        this.farmingForBones = false;
        if(this.farmRoutine >= 0 && !this.farmingForWeapons) {
            clearInterval(this.farmRoutine);
            this.farmRoutine = -1;
            return "Stopped bone farming, and since wasn't weapon farming either, shut down the process.";
        }
    
        return "Stopped bone farming, but am still weapon farming!";
    }

    public StartWeaponFarming = (farmOnMaps: boolean | null = null, mapPresets: number[] | null = null): string => {
        // Lazily initialize our various SHARED preference variables if needed.
        if(this.farmShouldBuyAndOrRunMaps == null && farmOnMaps == null) {
            // Assign default value only if it hasn't been asigned already and the user doesn't care.
            this.farmShouldBuyAndOrRunMaps = true;
        } else if(farmOnMaps != null) {
            // The user cares, so assign value regardless of previous value.
            this.farmShouldBuyAndOrRunMaps = farmOnMaps;
        }

        if(this.farmPresetOrder == null && mapPresets == null) {
            // Assign default value only if it hasn't been asigned already and the user doesn't care.
            this.farmPresetOrder = [1, 2, 3];
        } else if(mapPresets != null) {
            // The user cares, so assign value regardless of previous value.
            this.farmPresetOrder = [];
            for(let i: number = 0; i < mapPresets.length; i++) {
                if(mapPresets[i] < 1 || mapPresets[i] > 3) { continue; }
                this.farmPresetOrder.push(mapPresets[i]);
            }
        }

        // Kick off process
        if(this.farmRoutine < 0) {
            this.farmRoutine = setInterval(this.BoneAndOrWeaponFarmingLogic.bind(this), 100);
        }

        this.farmingForWeapons = true;

        return "Weapon farming active! Running maps: " + this.farmShouldBuyAndOrRunMaps + ", presets: " + this.farmPresetOrder;
    }

    public StopWeaponFarming = () => {
        if(!this.farmingForWeapons) {
            if(this.farmRoutine < 0 && !this.farmingForBones) {
                return "Not farming for anything, let alone for weapons!"; 
            } else if(this.farmRoutine >= 0 && this.farmingForBones) {
                return "Already wasn't farming for weapons, but I am farming for bones."
            }
        }
        this.farmingForWeapons = false;
        if(this.farmRoutine >= 0 && !this.farmingForBones) {
            clearInterval(this.farmRoutine);
            this.farmRoutine = -1;
            return "Stopped weapon farming, and since wasn't bone farming either, shut down the process.";
        }
    
        return "Stopped weapon farming, but am still bone farming!";
    }

    // All the bone and or weapon farming logic. Checked once per 100 ticks
    private BoneAndOrWeaponFarmingLogic = () => {
        const gameGlobal = game.global;
        const secondsInZone: number = (getGameTime() - gameGlobal.zoneStarted) / 1000;
        const secondsSinceLastBone: number = (getGameTime() - gameGlobal.lastSkeletimp) / 1000;

        if(!gameGlobal.preMapsActive && !gameGlobal.mapsActive) { // WE ARE IN THE WORLD
            // Decide When To Leave
            // Only applies after world 5.
            if(gameGlobal.world > 5) {
                if(this.farmingForBones && this.boneFarmingMinutes != null && this.boneExtraMinutes != null
                && ((secondsSinceLastBone <= (this.boneFarmingMinutes * 60)) || (secondsInZone <= (this.boneExtraMinutes * 60)))) {
                    // We want to leave the world because not enough time has passed.
                    this.farmGoingToChamber = this.GoToMapOnOrAfterZoneAndCell(gameGlobal.world, 81);
                } else if(this.farmingForWeapons && (document.getElementById("Greatersword") != null || document.getElementById("Harmbalest") != null)) {
                    // We want to leave the world because there are unbought weapons to be had.
                    this.farmGoingToChamber = this.GoToMapOnOrAfterZoneAndCell(gameGlobal.world, 81);
                }
            }
        } else if(!gameGlobal.preMapsActive) {// WE ARE IN MAPS.
            // Status of 'repeat until' state
            const currStatus: string | undefined = (this.mapRepeatButtonHTML ? this.mapRepeatButtonHTML.textContent ? this.mapRepeatButtonHTML.textContent.toLowerCase() : undefined : undefined);

            // No matter what, if you are actively trying to abandon, then we don't want to run logic here.
            if(!gameGlobal.switchToMaps) {
                if(this.WouldLikeToReturnToWorld(secondsSinceLastBone, secondsInZone)) {
                    // WANT TO GO BACK
                    if(currStatus != undefined) {
                        if(currStatus !== "repeat for any" && currStatus !== this.mapRepeatLastStatus) { 
                            this.mapRepeatLastStatus = currStatus; 
                            /*console.log("Toggling at " + currStatus);*/ 
                            toggleSetting('repeatUntil'); 
                        }
                    } else {
                        // We can't use the repeat-for-any method for some reason, so just click abandon.
                        mapsClicked();
                    }
                }
                else {
                    // DO NOT WANT TO GO BACK
                    if(currStatus != undefined) {
                        // Make sure we're on Repeat Forever
                        if(currStatus !== "repeat forever" && currStatus !== this.mapRepeatLastStatus) { 
                            this.mapRepeatLastStatus = currStatus; 
                            /*console.log("Toggling at " + currStatus);*/ 
                            toggleSetting('repeatUntil'); 
                        }
                    }
                }
            }
                
        } else { // WE ARE IN MAP CHAMBER.
            // If the button hasn't already been clicked, and we definitively want to return to world, then click the 'go back' button.
            if(!gameGlobal.switchToMaps 
                && this.WouldLikeToReturnToWorld(secondsSinceLastBone, secondsInZone)) {
                // ALLOWED TO GO BACK
                mapsClicked();
            }
            else if(this.farmGoingToChamber) {
                // WE JUST CAME BACK FROM THE WORLD
                // "farmGoingToChamber" prevents accidental spamming of maps by only being set to true from the world and only being set to false by this process.
                if(this.farmShouldBuyAndOrRunMaps) {
                    this.BuyAndOrRunMaps(gameGlobal);
                }
                this.farmGoingToChamber = false;
            }
        }
    }

    // A bit of a weird function. Tries to buy and/or run a map based on the current desired map presets.
    // If the presets are empty, will assume you don't want to buy a map and just run the most recent non-trimple-of-doom map.
    private BuyAndOrRunMaps = (gameGlobal: any) => {
        // First recycle maps if we have over 50
        if(gameGlobal.mapsOwnedArray.length > 50) {
            let mapHTML: any | null = document.getElementById("mapLevelInput");
            if(mapHTML != null) {
                mapHTML.value = (gameGlobal.world - 3);
                recycleBelow(true);
            }
        }
        // Run preset-checking logic if the user has specified presets.
        if(this.farmPresetOrder != null && this.farmPresetOrder.length > 0) {
            // Check each desired preset
            for(let i: number = 0; i < this.farmPresetOrder.length; i++) {
                if(this.RunMapMatchingPreset(this.farmPresetOrder[i])) {
                    this.farmGoingToChamber = false;
                    return;
                }
                if(gameGlobal.selectedMapPreset != this.farmPresetOrder[i]) {
                    selectAdvMapsPreset(this.farmPresetOrder[i]);
                }
                if(buyMap() >= 0) {
                    // If a purchase was successful, run the latest map and break out.
                    this.RunLatestNonTrimpleMap();
                    this.farmGoingToChamber = false;
                    return;
                }
            }
            // Backup -- run last map in list (if the list has any at all...)
            this.RunLatestNonTrimpleMap();
        } else {
            // We don't want to *purchase* maps if we aren't using a preset array, but that doesn't mean we don't want to run maps.
            this.RunLatestNonTrimpleMap();
        }
    }

    // Checks if current farming conditions are satisfied, whether bone or weapon farming or both.
    private WouldLikeToReturnToWorld = (secondsSinceBone: number, secondsInZone: number): boolean => {
        // We have waited enough time, and also not farming for weapons, or there are no weapons to be farmed for.
        return ((!this.farmingForBones || this.boneFarmingMinutes == null || this.boneExtraMinutes == null || secondsSinceBone > (this.boneFarmingMinutes * 60) && secondsInZone > (this.boneExtraMinutes * 60)) 
            && (!this.farmingForWeapons || (document.getElementById("Greatersword") == null && document.getElementById("Harmbalest") == null)));
    }

    // If on the specified world-zone, and at or beyond the specified world cell, go to the map chamber and return true. Otherwiser return false.
    private GoToMapOnOrAfterZoneAndCell(_zone: number, _cell: number): boolean {
        const gameGlobal = game.global;
        if(gameGlobal.world == _zone 
        && !gameGlobal.preMapsActive 
        && !gameGlobal.mapsActive
        && gameGlobal.lastClearedCell + 2 >= _cell) {
            mapsClicked();
            return true;
        }
        return false;
    }

    // Selects and runs a map (and returns true) if one is found matching the preset number.
    // Preset numbers are 1, 2, 3
    // Returns false if was not able to run a map.
    public RunMapMatchingPreset(preset: number): boolean {
        if(preset < 1 || preset > 3) return false;
        
        const gameGlobal = game.global;
        const autoArgPresetInfo: any = (preset == 1 ? gameGlobal.mapPresets.p1 : (preset == 2 ? gameGlobal.mapPresets.p2 : gameGlobal.mapPresets.p3));

        const autoArgPresetZone: number = gameGlobal.world + autoArgPresetInfo.offset;
        const autoArgPresetSpecMod: string = autoArgPresetInfo.specMod;
        // No check for perfect maps (yet)
        // Certainly no check for general map slider values
        
        //console.log("preset zone: " + autoArgPresetZone + ", spec mod: " + autoArgPresetSpecMod);
        // Searching from end of list for arguably faster matching
        const ownedMaps: any[] = gameGlobal.mapsOwnedArray;
        for(let i: number = ownedMaps.length - 1; i >= 0; i--) {
            if(ownedMaps[i].level == autoArgPresetZone
            && ownedMaps[i].bonus == autoArgPresetSpecMod) {
                selectMap(ownedMaps[i].id); // Select latest map
                runMap();
                return true;
            }
            //console.log("checked map " + i + " with level " + ownedMaps[i].level + " and specmod " + ownedMaps[i].bonus);
        }
        return false;
    }

    // Can run this as a backup to RunMapMatchingPreset.
    // Will run the most recent map that is not Trimple Of Doom. 
    // Returns false if, like, Trimple is your ONLY map which I'm pretty sure is impossible.
    public RunLatestNonTrimpleMap = (): boolean => {
        const ownedMaps: any[] = game.global.mapsOwnedArray;
        // Found nothing matching ideal requirements. Run whatever most recent we find that's not Trimple of Doom.
        for(let i: number = ownedMaps.length - 1; i >= 0; i--) {
            if(ownedMaps[i].name !== "Trimple Of Doom") {
                selectMap(ownedMaps[i].id); // Select non-Trimple map
                runMap();
                return false;
            }
        }
        console.log("Failed to find any non-Trimple Of Doom map, sorry!");
        return false;
    }
}