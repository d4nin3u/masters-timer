import { COUNTDOWN_BUTTON_ID } from './constants.js';

// Classes
export class Player {
    countdown: number = 0; // in milliseconds
    constructor(public name: string, public time: number) { }
}

export class State {
    activePlayers: Map<string, Player> = new Map();
    inactivePlayers: Map<string, Player> = new Map();
    countdown_started: boolean = false;
    start_time: number = 0; // in milliseconds
    confirm_stop: boolean = false; // Safe mode flag

    sortedPlayerArray(): Array<Player> {
        return Array.from(global_state.activePlayers.values()).sort((a, b) => b.time - a.time)
    }

    saveToSessionStorage(): void {
        const stateData = {
            activePlayers: Array.from(this.activePlayers.entries()).map(([n, player]) => ({ n, ...player })),
            inactivePlayers: Array.from(this.inactivePlayers.entries()).map(([n, player]) => ({ n, ...player })),
            confirm_stop: this.confirm_stop, // Save safe mode state
            countdown_started: this.countdown_started,
            start_time: this.start_time
        };
        sessionStorage.setItem('state', JSON.stringify(stateData));
    }

    loadFromSessionStorage(): void {
        const stateData = sessionStorage.getItem('state');
        if (stateData) {
            const { activePlayers, inactivePlayers, confirm_stop, countdown_started, start_time } = JSON.parse(stateData);
            this.activePlayers = new Map(activePlayers.map((p: any) => [p.name, new Player(p.name, p.time)]));
            this.inactivePlayers = new Map(inactivePlayers.map((p: any) => [p.name, new Player(p.name, p.time)]));
            this.confirm_stop = confirm_stop || false; // Load confirm_stop
            this.countdown_started = countdown_started || false;
            this.start_time = start_time || 0;


            // Visually update confirm stop checkbox
            const safeModeCheckbox = document.getElementById('confirm-stop') as HTMLInputElement;
            safeModeCheckbox.checked = this.confirm_stop;

            // Visually update countdown button label to match restored running state
            if (this.countdown_started) {
                const button = document.getElementById(COUNTDOWN_BUTTON_ID) as HTMLButtonElement;
                button.textContent = "Stop";
            }
        }
    }
}


export const global_state = new State();
