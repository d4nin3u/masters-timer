"use strict";

/* Types */
class State {
    activePlayers: Map<string, Player> = new Map();
    inactivePlayers: Map<string, Player> = new Map();
    countdown_started: boolean = false;
    start_time: number = 0; // in milliseconds
}

class Player {
    countdown: number = 0; // in seconds

    constructor(public name: string, public time: number) {}
}

const MASTERS_TABLE_NAME = "masters-table";
const INACTIVE_TABLE_NAME = "inactive-table";

/* Globals */
const global_state = new State();

/* Functions */
function addPlayerButtonClick(): void {
    const name = (document.getElementById("player-name") as HTMLInputElement).value;
    const time_m = (document.getElementById("player-time-minutes") as HTMLInputElement).value;
    const time_s = (document.getElementById("player-time-seconds") as HTMLInputElement).value;

    const time = getInt(time_m) * 60 + getInt(time_s);
    const player = new Player(name, time);

    global_state.inactivePlayers.set(name, player);

    refreshTable(INACTIVE_TABLE_NAME, Array.from(global_state.inactivePlayers.values()));
}

function getInt(value: string): number {
    return isNaN(Number(value)) ? 0 : Number(value);
}

function setCountdowns(players: Player[]): void {
    const [slowest_player] = players; // Get the slowest player (first in the sorted list)
    players.forEach(p => {
        p.countdown = slowest_player.time - p.time + 5;
    });
}

function refreshCountdowns(players: Player[], elapsed_time: number) {
    const timer = document.getElementById("global-timer") as HTMLLabelElement;
    timer.innerHTML = timeToString(elapsed_time);

    players.forEach((p, i) => {
        const countdown = Math.max(0, p.countdown - elapsed_time);
        const cell = document.getElementById(`countdown-${i}`) as HTMLElement;
        cell.innerHTML = timeToString(countdown);
    });
}

function refreshTable(tableId: string, players: Player[]) {
    const table = document.getElementById(tableId) as HTMLTableElement;
    table.innerHTML = "";

    createTableHeader(table);

    players.forEach((p, i) => addRowToTable(table, p, i));
}

function timeToString(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function addRowToTable(table: HTMLTableElement, player: Player, index: number) {
    const row = table.insertRow();

    // Create a cell for the button and add it to the row
    const actionCell = row.insertCell(0);

    // Add + button for inactive table
    if (table.id === INACTIVE_TABLE_NAME) {
        const addButton = document.createElement('button');
        addButton.textContent = "+";
        addButton.onclick = () => movePlayerToActive(player);
        actionCell.appendChild(addButton);
    }

    // Add - button for active table
    if (table.id === MASTERS_TABLE_NAME) {
        const removeButton = document.createElement('button');
        removeButton.textContent = "-";
        removeButton.onclick = () => movePlayerToInactive(player);
        actionCell.appendChild(removeButton);
    }

    // Create a cell for the player's name and add it to the row
    const nameCell = row.insertCell(1);
    nameCell.textContent = player.name;

    // Create a cell for the time and add it to the row
    row.insertCell(2).textContent = timeToString(player.time);

    // Create a cell for the countdown and add it to the row
    const countdownCell = row.insertCell(3);
    countdownCell.id = `countdown-${index}`;
    countdownCell.textContent = timeToString(player.countdown);
}


function movePlayerToActive(player: Player) {
    global_state.inactivePlayers.delete(player.name);
    global_state.activePlayers.set(player.name, player);

    // Sort active players
    const sortedPlayers = Array.from(global_state.activePlayers.values()).sort((a, b) => b.time - a.time);
    setCountdowns(sortedPlayers);

    refreshTable(MASTERS_TABLE_NAME, sortedPlayers);
    refreshTable(INACTIVE_TABLE_NAME, Array.from(global_state.inactivePlayers.values()));
}

function movePlayerToInactive(player: Player): void {
    global_state.activePlayers.delete(player.name);
    global_state.inactivePlayers.set(player.name, player);

    refreshTable(MASTERS_TABLE_NAME, Array.from(global_state.activePlayers.values()));
    refreshTable(INACTIVE_TABLE_NAME, Array.from(global_state.inactivePlayers.values()));
}

function createTableHeader(table: HTMLTableElement): void {
    const header = table.createTHead();
    const headerRow = header.insertRow(0);

    const headers = ['+/-', 'Name', 'Time', 'Countdown'];

    headers.forEach((headerText, index) => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
}

function countdownButtonClick()  {
    const players = Array.from(global_state.activePlayers.values());
    if (players.length === 0) {
        alert("Error: no players!");
        return;
    }

    global_state.countdown_started = !global_state.countdown_started;

    const button = document.getElementById("countdown-button") as HTMLElement;
    button.textContent = global_state.countdown_started ? "Stop" : "Start";

    if (global_state.countdown_started) {
        global_state.start_time = Date.now();
    }
}

// Call this every 1 second
setInterval(() => {
    if (global_state.countdown_started) {
        const elapsed_time = Math.round((Date.now() - global_state.start_time) / 1000);
        refreshCountdowns(Array.from(global_state.activePlayers.values()), elapsed_time);
    }
}, 1000);

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-player') as HTMLFormElement;
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        addPlayerButtonClick();
    });

    const countdownButton = document.getElementById('countdown-button') as HTMLButtonElement;
    countdownButton.addEventListener('click', countdownButtonClick);
});
