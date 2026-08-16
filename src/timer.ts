import { COUNTDOWN_OFFSET, GLOBAL_TIMER_ID } from './constants.js';
import { Player, global_state } from './state.js';
import { timeToString } from './utils/time.js';

// Countdown Functions
export function setCountdowns(): void {
    const players = global_state.sortedPlayerArray()
    const [slowest_player] = players;
    players.forEach(p => {
        p.countdown = slowest_player.time - p.time + COUNTDOWN_OFFSET;
    });
}

export function refreshCountdowns(players: Player[], elapsed_time: number) {
    const timer = document.getElementById(GLOBAL_TIMER_ID) as HTMLLabelElement;
    timer.innerHTML = timeToString(elapsed_time - COUNTDOWN_OFFSET);

    players.forEach((p, i) => {
        const countdown = Math.max(0, p.countdown - elapsed_time);
        const cell = document.getElementById(`countdown-${i}`) as HTMLElement;
        cell.innerHTML = timeToString(countdown);
    });
}
