"use strict";
// Global Constants
const COUNTDOWN_OFFSET = 5000; // Pre-race countdown in ms
// HTML element IDs
const INACTIVE_TABLE_ID = 'inactive-table';
const MASTERS_TABLE_ID = 'masters-table';
const GLOBAL_TIMER_ID = 'global-timer';
const COUNTDOWN_BUTTON_ID = 'countdown-button';
const PLAYER_NAME_INPUT_ID = 'player-name';
const PLAYER_TIME_MINUTES_INPUT_ID = 'player-time-minutes';
const PLAYER_TIME_SECONDS_INPUT_ID = 'player-time-seconds';
const PLAYER_TIME_SUBSECONDS_INPUT_ID = 'player-time-subseconds';
// Classes
class Player {
    constructor(name, time) {
        this.name = name;
        this.time = time;
        this.countdown = 0; // in milliseconds
    }
}
class State {
    constructor() {
        this.activePlayers = new Map();
        this.inactivePlayers = new Map();
        this.countdown_started = false;
        this.start_time = 0; // in milliseconds
    }
    sortedPlayerArray() {
        return Array.from(global_state.activePlayers.values()).sort((a, b) => b.time - a.time);
    }
    saveToSessionStorage() {
        const stateData = {
            activePlayers: Array.from(this.activePlayers.entries()).map(([n, player]) => ({ n, ...player })),
            inactivePlayers: Array.from(this.inactivePlayers.entries()).map(([n, player]) => ({ n, ...player }))
        };
        sessionStorage.setItem('state', JSON.stringify(stateData));
    }
    loadFromSessionStorage() {
        const stateData = sessionStorage.getItem('state');
        if (stateData) {
            const { activePlayers, inactivePlayers } = JSON.parse(stateData);
            this.activePlayers = new Map(activePlayers.map((p) => [p.name, new Player(p.name, p.time)]));
            this.inactivePlayers = new Map(inactivePlayers.map((p) => [p.name, new Player(p.name, p.time)]));
        }
    }
}
const global_state = new State();
// Utility Functions
function timeToString(time) {
    const sign = time < 0 ? '-' : '';
    const absTime = Math.abs(time);
    const minutes = Math.floor(absTime / 60000);
    const seconds = Math.floor((absTime % 60000) / 1000);
    const hundredths = Math.floor((absTime % 1000) / 10);
    return `${sign}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}
function getInt(value) {
    return isNaN(Number(value)) ? 0 : Number(value);
}
// Table Functions
function createTableHeader(table) {
    const header = table.createTHead();
    const headerRow = header.insertRow(0);
    if (table.id === INACTIVE_TABLE_ID) {
        ['+/-', 'Name', 'Time', 'Actions'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
    }
    else if (table.id === MASTERS_TABLE_ID) {
        ['+/-', 'Name', 'Time', 'Countdown'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
    }
}
function addRowToTable(table, player, index) {
    const row = table.insertRow();
    // Action cell
    const actionCell = row.insertCell(0);
    if (table.id === INACTIVE_TABLE_ID) {
        // Inactive Table: Add button to move to active and delete button
        // Add button
        const addButton = document.createElement('button');
        addButton.textContent = "+";
        addButton.onclick = () => movePlayerToActive(player);
        actionCell.appendChild(addButton);
    }
    else if (table.id === MASTERS_TABLE_ID) {
        // Active Table: Remove button to move to inactive and countdown display
        // Remove button
        const removeButton = document.createElement('button');
        removeButton.textContent = "-";
        removeButton.onclick = () => movePlayerToInactive(player);
        actionCell.appendChild(removeButton);
    }
    // Common player details
    row.insertCell(1).textContent = player.name;
    row.insertCell(2).textContent = timeToString(player.time);
    if (table.id === INACTIVE_TABLE_ID) {
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deletePlayerFromInactive(player);
        const deleteCell = row.insertCell(3);
        deleteCell.appendChild(deleteButton);
    }
    else if (table.id === MASTERS_TABLE_ID) {
        // Countdown display
        const countdownCell = row.insertCell(3);
        countdownCell.id = `countdown-${index}`;
        countdownCell.textContent = timeToString(player.countdown);
    }
}
function refreshTables() {
    refreshTable(MASTERS_TABLE_ID, global_state.sortedPlayerArray());
    refreshTable(INACTIVE_TABLE_ID, Array.from(global_state.inactivePlayers.values()));
}
function refreshTable(tableId, players) {
    const table = document.getElementById(tableId);
    table.innerHTML = "";
    createTableHeader(table);
    players.forEach((p, i) => addRowToTable(table, p, i));
}
// Countdown Functions
function setCountdowns() {
    const players = global_state.sortedPlayerArray();
    const [slowest_player] = players;
    players.forEach(p => {
        p.countdown = slowest_player.time - p.time + COUNTDOWN_OFFSET;
    });
}
function refreshCountdowns(players, elapsed_time) {
    const timer = document.getElementById(GLOBAL_TIMER_ID);
    timer.innerHTML = timeToString(elapsed_time - COUNTDOWN_OFFSET);
    players.forEach((p, i) => {
        const countdown = Math.max(0, p.countdown - elapsed_time);
        const cell = document.getElementById(`countdown-${i}`);
        cell.innerHTML = timeToString(countdown);
    });
}
// Player Management Functions
function addPlayerButtonClick() {
    const name = document.getElementById(PLAYER_NAME_INPUT_ID).value.trim();
    // Check if the player already exists
    if (global_state.inactivePlayers.has(name) || global_state.activePlayers.has(name)) {
        alert("Error: A player with this name already exists!");
        return;
    }
    const time_m = document.getElementById(PLAYER_TIME_MINUTES_INPUT_ID).value;
    const time_s = document.getElementById(PLAYER_TIME_SECONDS_INPUT_ID).value;
    const time_ms = document.getElementById(PLAYER_TIME_SUBSECONDS_INPUT_ID).value;
    const time = (getInt(time_m) * 60 * 1000) + (getInt(time_s) * 1000) + getInt(time_ms);
    const player = new Player(name, time);
    global_state.inactivePlayers.set(name, player);
    global_state.saveToSessionStorage();
    refreshTables();
}
function movePlayerToActive(player) {
    global_state.inactivePlayers.delete(player.name);
    global_state.activePlayers.set(player.name, player);
    global_state.saveToSessionStorage();
    setCountdowns();
    refreshTables();
}
function movePlayerToInactive(player) {
    global_state.activePlayers.delete(player.name);
    global_state.inactivePlayers.set(player.name, player);
    global_state.saveToSessionStorage();
    refreshTables();
}
function deletePlayerFromInactive(player) {
    global_state.inactivePlayers.delete(player.name);
    global_state.saveToSessionStorage();
    refreshTables();
}
// Event Listeners and Initialization
function countdownButtonClick() {
    if (global_state.activePlayers.size === 0) {
        alert("Error: no players!");
        return;
    }
    global_state.countdown_started = !global_state.countdown_started;
    const button = document.getElementById(COUNTDOWN_BUTTON_ID);
    button.textContent = global_state.countdown_started ? "Stop" : "Start";
    if (global_state.countdown_started) {
        global_state.start_time = Date.now();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-player');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        addPlayerButtonClick();
    });
    const countdownButton = document.getElementById(COUNTDOWN_BUTTON_ID);
    countdownButton.addEventListener('click', countdownButtonClick);
    global_state.loadFromSessionStorage();
    setCountdowns();
    refreshTables();
});
// Event listener for beforeunload to show a warning when the timer is running
window.addEventListener('beforeunload', function (event) {
    if (global_state.countdown_started) {
        // Save the current state to session storage
        global_state.saveToSessionStorage();
        // Set the warning message
        const message = "You have a countdown running. Are you sure you want to leave?";
        event.returnValue = message; // Required for triggering the confirmation dialog
        return message; // For compatibility with some browsers
    }
});
// Call this every 33 milliseconds
setInterval(() => {
    if (global_state.countdown_started) {
        const elapsed_time = Date.now() - global_state.start_time;
        refreshCountdowns(global_state.sortedPlayerArray(), elapsed_time);
    }
}, 33);
