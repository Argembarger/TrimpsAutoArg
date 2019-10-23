# AutoArg for Trimps

A set of automation tools for [Trimps!](trimps.github.io) Not nearly as cool as [zek;s fork](https://github.com/Zorn192/AutoTrimps) or [slivers 400+ fork](https://github.com/slivermasterz/AutoTrimps) or any of the other MANY forks of AutoTrimps. I just think AutoTrimps is kind of... heavy... and coding is fun, so and you're the one here reading this readme so lay off the guff! thanks!

# I wanna use this

cool i guess suit yourself

check out the folder `PasteMeInUrConsole`, I try to keep the javascript file in there updated when I push changes. If you just select all (ctrl-a) and copy (ctrl-c), you can open your Trimps tab and open your browser's developer console (F12) and paste (ctrl-v) all the code in there and then hit Enter and it should work!

Right now you just interact with it throught the same console. Just type in `autoArg.` and your browser will hopefully show you some autofill options to try!

## Functions

* `autoArg.StartBoneFarming(runMap: boolean, mapPresets: number[], kob2: boolean (optional), extraFarmingMinutes: number (optional))`
    * `autoArg.StartBoneFarming(false, []);` Don't do anything after leaving world; just wait out timer.
    * `autoArg.StartBoneFarming(true, []);` When leaving world to wait out timer, automap the latest map.
    * `autoArg.StartBoneFarming(true, [2, 1, 3]);` When leaving world to wait out timer, attempt to create a map with preset 2. If we can't afford it, try preset 1. If we can't afford it, try preset 3. Run the latest map regardless of which map (if any) gets created.
    * `autoArg.StartBoneFarming(true, [3, 1], true, 30);` Always farm for at least 30 minutes, wait 35 minutes (kob2) plus 30 minutes per bone.
    * **REGARDLESS OF WHAT HAPPENS, you can do anything you want in a map or in the map chamber, but BoneFarming will force you out of the world until 45 minutes after the last bone.**
* `autoArg.StopBoneFarming();`
    * ...stops bone farming! wow!
* `autoArg.StartStanceDancing(healthThreshold: number, formations: number[], resetForNewSquad: boolean (optional))`
    * `healthThreshold` should be between 0.01 and 0.99 (otherwise why bother?)
    * `formations` is your list of desired formations, where the first one is your max-health formation, and it moves down to the other ones as your health thresholds are hit.
    * 0 = X, 1 = H, 2 = D, 3 = B, 4 = S
    * Example: `autoArg.StartStanceDancing(0.25, [2, 0, 1]);` will do a standard D-X-H stancedance and attempt to transition at 25% health.
    * Example: `autoArg.StartStanceDancing(0.125, [2,1], true);` will do a D-H stancedance and automatically kill the squad when the next squad is ready (unless that squad is still in D formation)
* `autoArg.StopStanceDancing();`
    * Does what it says!
    * Calling again with different parameters will update the active parameters and keep going.
    * Calling `StartStanceDancing` with no formations listed would be equivalent to `Stop`
* `autoArg.SetDarkEssenceGatherMode(shouldGather: boolean)`
    * pass in `true` to force AutoArg to always run S if there is ungathered essence and we're in the world. `false` to disable this check.
    * This will override StanceDancing


# I wanna mess with this

ok sure 

## ITS TYPESCRIPT

https://www.typescriptlang.org/

Install it locally with `npm install typescript` in a terminal pointed at this root folder. (`npm install -g typescript` if you want it globally)

(Make sure node_modules appears alongside AutoArg.ts)

## COMPILE??

`.\node_modules\.bin\tsc` (unless you install typescript globally, then it's just `tsc` while in the project directory)

It should appear in a folder called PasteMeInUrConsole

## USE????

Uh same as in the "I wanna use this" section, did you even read that?

Just paste the contents of AutoArg.js into your browser console while playing Trimps and you should be good to go.
