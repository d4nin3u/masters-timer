import {
    PLAYER_NAME_INPUT_ID,
    PLAYER_TIME_MINUTES_INPUT_ID,
    PLAYER_TIME_SECONDS_INPUT_ID,
    PLAYER_TIME_SUBSECONDS_INPUT_ID
} from './constants.js';
import { Player, global_state } from './state.js';
import { getInt } from './utils/time.js';
import { setCountdowns } from './timer.js';
import { refreshTables } from './tables.js';

// Player Management Functions
export function addPlayerButtonClick(): void {
    const name = (document.getElementById(PLAYER_NAME_INPUT_ID) as HTMLInputElement).value.trim();

    // Check if the player already exists
    if (global_state.inactivePlayers.has(name) || global_state.activePlayers.has(name)) {
        alert("Error: A player with this name already exists!");
        return;
    }

    const time_m = (document.getElementById(PLAYER_TIME_MINUTES_INPUT_ID) as HTMLInputElement).value;
    const time_s = (document.getElementById(PLAYER_TIME_SECONDS_INPUT_ID) as HTMLInputElement).value;
    const time_ms = (document.getElementById(PLAYER_TIME_SUBSECONDS_INPUT_ID) as HTMLInputElement).value;

    const time = (getInt(time_m) * 60 * 1000) + (getInt(time_s) * 1000) + getInt(time_ms);
    const player = new Player(name, time);

    global_state.inactivePlayers.set(name, player);
    global_state.saveToSessionStorage();
    refreshTables();
}

export function timeStringToMilliseconds(time: string): number {
    const [minutes, seconds, hundredths] = time.split(':').map(Number);
    return (minutes * 60 * 1000) + (seconds * 1000) + (hundredths * 10);
}


export function addPresetPlayer(name: string, timeString: string): void {
    const time = timeStringToMilliseconds(timeString);

    // Check if the player already exists
    if (global_state.inactivePlayers.has(name) || global_state.activePlayers.has(name)) {
        alert("Error: A player with this name already exists!");
        return;
    }

    const player = new Player(name, time);
    global_state.inactivePlayers.set(name, player);
    global_state.saveToSessionStorage();
    refreshTables();
}


export function movePlayerToActive(player: Player) {
    global_state.inactivePlayers.delete(player.name);
    global_state.activePlayers.set(player.name, player);


    global_state.saveToSessionStorage();
    setCountdowns();
    refreshTables();
}

export function movePlayerToInactive(player: Player): void {
    global_state.activePlayers.delete(player.name);
    global_state.inactivePlayers.set(player.name, player);

    global_state.saveToSessionStorage();
    setCountdowns();
    refreshTables()
}

export function deletePlayerFromInactive(player: Player): void {
    global_state.inactivePlayers.delete(player.name);
    global_state.saveToSessionStorage();
    setCountdowns();
    refreshTables()
}
