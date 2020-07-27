# AutoArg for Trimps

A set of automation tools for [Trimps!](trimps.github.io) Not nearly as cool as [zek;s fork](https://github.com/Zorn192/AutoTrimps) or [slivers 400+ fork](https://github.com/slivermasterz/AutoTrimps) or any of the other MANY forks of AutoTrimps. I just think AutoTrimps is kind of... heavy... and coding is fun, so and you're the one here reading this readme so lay off the guff! thanks!

# I wanna use this

cool i guess suit yourself

check out the folder `PasteMeInUrConsole`, I try to keep the javascript file in there updated when I push changes. If you just select all (ctrl-a) and copy (ctrl-c), you can open your Trimps tab and open your browser's developer console (F12) and paste (ctrl-v) all the code in there and then hit Enter and it should work!

Right now you just interact with it throught the same console. Just type in `autoArg.` and your browser will hopefully show you some autofill options to try!

Once you paste the core logic, it should spit out a little hello-text in the console, with instructions for how to use it.
The following is a deeper dive into the functions with some explanations that would be very chonky if delivered in-console.

## Function Details

These console functions use optional parameters, but unfortunately it is not fully polymorphic yet, so if you want to use any of the custom settings, you have to provide all of the variables up to that one as well.

* `autoArg.HelpMe();`
    * Spits out basic instructions, including the additional help commands `autoArg.HelpBoneFarming(); autoArg.HelpWeaponFarming(); autoArg.HelpStanceDancing(); autoArg.HelpGatheringDarkEssence();`
* `autoArg.StartBoneFarming(runMaps: boolean, mapPresets: number[], kob2: boolean, extraFarmingMinutes: number);`
    * This is the meat of the program. BoneFarming forces your trimps to exit to maps and wait out the skeletimp timer before going back to finish the current worldzone.
    * `runMaps` can be `true` or `false`, it defaults to `true`, and decides whether to spend your skeletimp-timer-time in maps, or just sitting in the map chamber.
    * `mapPresets` is an array of numbers, like `[1,2,3]` or `[2,1]`, or even `[3]` or `[]`. It defaults to `[1,2,3]`. This system only buys maps based on your map presets, and this list you provide tells it in what order to try those presets out. If a map at the current preset level exists, it will just run it without buying one. If it doesn't exist, and can't be afforded, it will move on to the next preset in the list and try that. Functionally, you can pass in `[]` to tell it never to buy new maps. Regardless, if everything else fails, it will just run the most recent non-Trimple Of Doom map.
    * `kob2` can be `true` or `false`, it defaults to `false`, and represents whether or not you have unlocked King of Bones II. Someday this system will check for this upgrade automatically.
    * `extraFarmingMinutes` can be any number, and defaults to `0`. Useful for adding extra farming time if you feel bottlenecked above and beyond the bone-timer.
    * Here are some usage examples:
        * `autoArg.StartBoneFarming(false, []);` Don't do anything after leaving world; just wait out timer.
        * `autoArg.StartBoneFarming(true, []);` When leaving world to wait out timer, automap the latest map.
        * `autoArg.StartBoneFarming(true, [2, 1, 3]);` When leaving world to wait out timer, attempt to create a map with preset 2. If we can't afford it, try preset 1. If we can't afford it, try preset 3. Run the latest map regardless of which map (if any) gets created.
        * `autoArg.StartBoneFarming(true, [3, 1], true, 30);` Always farm for at least 30 minutes, wait 35 minutes (kob2) plus 30 minutes per bone.
    * **You can generally do anything you want once you're in the map chamber or a map, but BoneFarming will always force you to immediately leave the world until the designated farming time has elapsed. It won't force you to go back into a map unless you go all the way out to the world... In other words, it only tries to enter a map when it enters the map chamber from the world as a direct result of its timer-check.**
* `autoArg.StopBoneFarming();`
    * ...stops actively bone farming! wow!
* `autoArg.StartWeaponFarming(runMaps: boolean, mapPresets: number[]);`
    * This function forces your trimps to continue farming until you have caught up on your weapons. In an effort to avoid wasting time going after an extra-strong dagger on zone XX1, this function waits until all weapons up to Greatsword/Harmbalest are available before farming for all of them at once. That way, you have an unbroken chain of weapon prestiges available and you aren't farming through too nasty of a gap.
    * `runMaps` and `mapPresets` are used identically to the `BoneFarming` above. These two functions share the map-purchasing logic, so any values you provide will override the shared settings.
    * If both Bone and Weapon Farming are run simultaneously, the system will farm until both conditions are satisfied.
* `autoArg.StopWeaponFarming();`
    * You can probably guess what this one does.
* `autoArg.StartStanceDancing(healthThreshold: number, formations: number[], resetForNewSquad: boolean (optional));`
    * This function maintains a stance-dance routine during combat, where it tries to run through your specified formations and switch at the specified HP-remaining intervals
    * `healthThreshold` should be between `0` and `1`, and will be clamped to these values if you try to be silly and pass anything else in. The default value is `0.5`, or half-health.
    * `formations` is an array of your desired formations, like `[2,0,1]` (which is also the default value), where the first entry is your max-health formation, and it moves down the remaining ones as your health thresholds are hit.
    * `resetForNewSquad` can be `true` or `false`, and defaults to `false`. It only works if the D formation was available at the time you call this function. If true, it will put your trimps in the D formation when the next squad is ready to send, which essentially puts your trimps in Kamikaze mode for max damage.
    * The formations are specified in numbers rather than letters, so here's the conversion.
        * `0` = X, `1` = H, `2` = D, `3` = B, `4` = S, and so on.
    * Usage Examples: 
        * `autoArg.StartStanceDancing(0.25, [2, 0, 1]);` will do a standard D-X-H stancedance and attempt to transition at 25% health.
        * `autoArg.StartStanceDancing(0.125, [2,1], true);` will do a D-H stancedance that transitions at 12.5% health, and automatically kill the squad when the next squad is ready (unless that squad is still in D formation)
        * `autoArg.StartStanceDancing(0.4, [3,0,1], true);` is a max-survivability B-X-H build that falls back to D when the next squad is ready.
    * **NOTE: This logic is superseded by any Dark Essence Gathering logic that may be running.**
* `autoArg.StopStanceDancing();`
    * Does what it says!
* `autoArg.StartGatheringDarkEssence();`
    * Because Dark Essence Gathering is a formation-related task, Stance Dancing and Dark Essence Gathering are handled by the same shared logic. Call this function (there are no parameters) to enable Dark Essence Gathering.
    * Dark Essence Gathering will force your Trimps to be in S formation (if you have it available) when all of the following conditions are true:
        * You are in World Zone 180 or greater.
        * You are in the World, 
            * Or else you are on a Map and are actively returning to the Map Chamber (the Abandon Trimps button is currently visible), 
            * Or else you are on a Map set to any Repeat Until state other than "Repeat Forever"
                * (Basically if anything may cause you to leave the Map soon... These two conditions above are how the Bone/Weapon Farming modules leave maps; it sets you to Repeat For Any and uses the M key as a fallback if necessary)
        * There is Dark Essence available on the current zone,
            * Or you are currently fighting an Improbability which is at less than 5% health (to make sure S is enabled before the first frame of the next World Zone)
    * All of this logic takes priority over typical Stance Dancing.
    * This Dark Essence Gathering logic makes it very unlikely for you to miss out on any Dark Essence, although it is not 100% guaranteed. The following conditions can potentially cause you to miss out on essence.
        * If you manually spam non-S formations very close to the moment when your trimps leave a Map
        * If you manually leave S-formation in general outside of a Map
        * If you get unlucky and your bone farm timer expires just as your Trimps complete a map and they immediately leave the map in a non-S formation before this logic has a chance to switch their formation while still solidly running the Map.
    * Much of this logic is designed to catch your trimps and switch them to S while they are still officially running a Map. While it is possible to manually switch to S while in the map chamber using the game's global `setFormation('4')` function, and this is the function that `autoArg` uses, the game will consider formation-changes in Map Chamber as breaking the continuity of your World Zone's S stance. You have to be solidly in S at the time you leave a Map to go to the Map Chamber.
* `autoArg.StopGatheringDarkEssence();`
    * whoa wonder what it does??


# I wanna mess with this

ok sure 

## ITS TYPESCRIPT

https://www.typescriptlang.org/

Install it locally with `npm install typescript` in a terminal pointed at this root folder. (`npm install -g typescript` if you want it globally)

(Make sure node_modules appears alongside AutoArg.ts)

## COMPILE??

`.\node_modules\.bin\tsc` (unless you install typescript globally, then it's just `tsc` while in the project directory)

The output should appear in a folder called PasteMeInUrConsole, at least based on default compiler options set up for this project.

## USE????

Uh same as in the "I wanna use this" section, did you even read that?

Just paste the contents of PasteMeInUrConsole/AutoArg.js into your browser console while playing Trimps and you should be good to go.
