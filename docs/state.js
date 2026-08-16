import { COUNTDOWN_BUTTON_ID } from './constants.js';
// Classes
export class Player {
    constructor(name, time) {
        this.name = name;
        this.time = time;
        this.countdown = 0; // in milliseconds
    }
}
export class State {
    constructor() {
        this.activePlayers = new Map();
        this.inactivePlayers = new Map();
        this.countdown_started = false;
        this.start_time = 0; // in milliseconds
        this.confirm_stop = false; // Safe mode flag
    }
    sortedPlayerArray() {
        return Array.from(global_state.activePlayers.values()).sort((a, b) => b.time - a.time);
    }
    saveToSessionStorage() {
        const stateData = {
            activePlayers: Array.from(this.activePlayers.entries()).map(([n, player]) => ({ n, ...player })),
            inactivePlayers: Array.from(this.inactivePlayers.entries()).map(([n, player]) => ({ n, ...player })),
            confirm_stop: this.confirm_stop, // Save safe mode state
            countdown_started: this.countdown_started,
            start_time: this.start_time
        };
        sessionStorage.setItem('state', JSON.stringify(stateData));
    }
    loadFromSessionStorage() {
        const stateData = sessionStorage.getItem('state');
        if (stateData) {
            const { activePlayers, inactivePlayers, confirm_stop, countdown_started, start_time } = JSON.parse(stateData);
            this.activePlayers = new Map(activePlayers.map((p) => [p.name, new Player(p.name, p.time)]));
            this.inactivePlayers = new Map(inactivePlayers.map((p) => [p.name, new Player(p.name, p.time)]));
            this.confirm_stop = confirm_stop || false; // Load confirm_stop
            this.countdown_started = countdown_started || false;
            this.start_time = start_time || 0;
            // Visually update confirm stop checkbox
            const safeModeCheckbox = document.getElementById('confirm-stop');
            safeModeCheckbox.checked = this.confirm_stop;
            // Visually update countdown button label to match restored running state
            if (this.countdown_started) {
                const button = document.getElementById(COUNTDOWN_BUTTON_ID);
                button.textContent = "Stop";
            }
        }
    }
}
export const global_state = new State();
