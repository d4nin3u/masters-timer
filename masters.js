"use strict";

/* Types */
class State {
    constructor() {
        this.players = []
        this.countdown_started = false;
        this.start_time = 0; // in milliseconds
    }
}

class Player {
    constructor(name, time) {
        this.name = name;
        this.time = time; // in seconds
        this.countdown = 0; // in seconds
    }
}

/* Globals */
var global_state = new State();

/* Functions */
function addPlayerButtonClick() {
    let players = global_state.players;

    let name = document.getElementById("player-name").value;
    let time_m = document.getElementById("player-time-minutes").value;
    let time_s = document.getElementById("player-time-seconds").value;

    let time = (getInt(time_m) * 60) + getInt(time_s);

    players.push(new Player(name, time));

    players.sort((a, b) => b.time - a.time);

    setCountdowns(players);

    refreshTable(players);
}

function getInt(value) {
    const num = parseInt(value, 10);
    return isNaN(num) ? 0 : num; // Because some moron decided that an empty string can't be parsed as 0...
}

function setCountdowns(players) {
    let slowest_player = players[0];

    players.forEach(p => {
        p.countdown = slowest_player.time - p.time + 5;
    });
}

function refreshCountdowns(players, elapsed_time) {
    let timer = document.getElementById("global-timer");
    timer.innerHTML = timeToString(elapsed_time);

    players.forEach((p, i) => {
        let countdown = Math.max(0, p.countdown - elapsed_time);

        let cell = document.getElementById("countdown-" + i);
        cell.innerHTML = timeToString(countdown);
    });
}

function refreshTable(players) {
    let table = document.getElementById("masters-table");

    // Clear table
    table.innerHTML = "";

    createTableHeader(table);

    players.forEach((p, i) => addRowToTable(table, p, i));
}

function timeToString(time) {
    const seconds = time % 60;
    const minutes = Math.floor(time / 60);

    return minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
}

function addRowToTable(table, player, index) {
    let row = table.insertRow();

    let name_cell = row.insertCell(0);
    name_cell.innerHTML = player.name;

    let time_cell = row.insertCell(1);
    time_cell.innerHTML = timeToString(player.time);

    let countdown_cell = row.insertCell(2);
    countdown_cell.id = "countdown-" + index;
    countdown_cell.innerHTML = timeToString(player.countdown);
}

function createTableHeader(table) {
    let header = table.createTHead();
    let header_row = header.insertRow(0);

    header_row.innerHTML = "<th>Name</th><th>Time</th><th>Countdown</th>"
}

function countdownButtonClick() {
    let players = global_state.players;
    if (players.length === 0) {
        alert("Error: no players!");
        return;
    }

    global_state.countdown_started = !global_state.countdown_started;

    let button = document.getElementById("countdown-button");
    button.innerHTML = global_state.countdown_started ? "Stop" : "Start";

    if (global_state.countdown_started) {
        global_state.start_time = Date.now();
    }
}

// Call this every 1 sec
setInterval(function() {
    if (global_state.countdown_started) {
        let elapsed_time = Math.round((Date.now() - global_state.start_time) / 1000);
        refreshCountdowns(global_state.players, elapsed_time);
    }
}, 1000);
