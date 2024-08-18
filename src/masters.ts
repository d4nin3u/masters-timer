"use strict";

/* Types */
class State {
    activePlayers: Player[] = [];
    countdown_started: boolean = false;
    start_time: number = 0; // in milliseconds
}

class Player {
    name: string;
    time: number; // in seconds
    countdown: number = 0; // in seconds

    constructor(name: string, time: number) {
        this.name = name;
        this.time = time;
    }
}

/* Globals */
let global_state = new State();

/* Functions */
function addPlayerButtonClick(): void {
    let activePlayers = global_state.activePlayers;

    let name = (document.getElementById("player-name") as HTMLInputElement).value;
    let time_m = (document.getElementById("player-time-minutes") as HTMLInputElement).value;
    let time_s = (document.getElementById("player-time-seconds") as HTMLInputElement).value;

    let time = (getInt(time_m) * 60) + getInt(time_s);

    activePlayers.push(new Player(name, time));

    activePlayers.sort((a, b) => b.time - a.time);

    setCountdowns(activePlayers);

    refreshTable(activePlayers);
}

function getInt(value: string): number {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
}


function setCountdowns(players: Player[]): void {
    let slowest_player = players[0];

    players.forEach(p => {
        p.countdown = slowest_player.time - p.time + 5;
    });
}

function refreshCountdowns(players: Player[], elapsed_time: number): void {
    let timer = document.getElementById("global-timer") as HTMLLabelElement;
    timer.innerHTML = timeToString(elapsed_time);

    players.forEach((p, i) => {
        let countdown = Math.max(0, p.countdown - elapsed_time);

        let cell = document.getElementById("countdown-" + i) as HTMLElement;
        cell.innerHTML = timeToString(countdown);
    });
}

function refreshTable(players: Player[]): void {
    let table = document.getElementById("masters-table") as HTMLTableElement;

    // Clear table
    table.innerHTML = "";

    createTableHeader(table);

    players.forEach((p, i) => addRowToTable(table, p, i));
}

function timeToString(time: number): string {
    const seconds = time % 60;
    const minutes = Math.floor(time / 60);

    return minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
}

function addRowToTable(table: HTMLTableElement, player: Player, index: number): void {
    let row = table.insertRow();

    let name_cell = row.insertCell(0);
    name_cell.innerHTML = player.name;

    let time_cell = row.insertCell(1);
    time_cell.innerHTML = timeToString(player.time);

    let countdown_cell = row.insertCell(2);
    countdown_cell.id = "countdown-" + index;
    countdown_cell.innerHTML = timeToString(player.countdown);
}

function createTableHeader(table: HTMLTableElement): void {
    let header = table.createTHead();
    let header_row = header.insertRow(0);

    header_row.innerHTML = "<th>Name</th><th>Time</th><th>Countdown</th>";
}

function countdownButtonClick(): void {
    let players = global_state.activePlayers;
    if (players.length === 0) {
        alert("Error: no players!");
        return;
    }

    global_state.countdown_started = !global_state.countdown_started;

    let button = document.getElementById("countdown-button") as HTMLElement;
    button.innerHTML = global_state.countdown_started ? "Stop" : "Start";

    if (global_state.countdown_started) {
        global_state.start_time = Date.now();
    }
}

// Call this every 1 sec
setInterval(function() {
    if (global_state.countdown_started) {
        let elapsed_time = Math.round((Date.now() - global_state.start_time) / 1000);
        refreshCountdowns(global_state.activePlayers, elapsed_time);
    }
}, 1000);
