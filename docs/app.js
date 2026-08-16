import { COUNTDOWN_BUTTON_ID, presets } from './constants.js';
import { global_state } from './state.js';
import { addPlayerButtonClick, addPresetPlayer } from './playerManager.js';
import { setCountdowns, refreshCountdowns } from './timer.js';
import { refreshTables } from './tables.js';
// Event Listeners and Initialization
function countdownButtonClick() {
    if (global_state.activePlayers.size === 0) {
        alert("Error: no players!");
        return;
    }
    if (global_state.countdown_started && global_state.confirm_stop) {
        const confirmation = confirm("Are you sure you want to stop the countdown?");
        if (!confirmation) {
            return; // If the user cancels, do nothing
        }
    }
    global_state.countdown_started = !global_state.countdown_started;
    const button = document.getElementById(COUNTDOWN_BUTTON_ID);
    button.textContent = global_state.countdown_started ? "Stop" : "Start";
    if (global_state.countdown_started) {
        global_state.start_time = Date.now();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const presetList = document.getElementById('preset-list');
    presets.forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.name;
        option.textContent = `${preset.name} (${preset.time})`;
        presetList.appendChild(option);
    });
    presetList.addEventListener('change', () => {
        const selectedPlayer = presets.find(p => p.name === presetList.value);
        if (selectedPlayer) {
            addPresetPlayer(selectedPlayer.name, selectedPlayer.time);
        }
    });
    const addAllButton = document.getElementById('add-all-button');
    addAllButton.addEventListener('click', () => {
        for (const player of presets) {
            if (global_state.inactivePlayers.has(player.name) || global_state.activePlayers.has(player.name)) {
                alert(`Error: Player "${player.name}" already exists! Aborting add all`);
                break;
            }
            addPresetPlayer(player.name, player.time);
        }
    });
    const form = document.getElementById('add-player');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        addPlayerButtonClick();
    });
    const countdownButton = document.getElementById(COUNTDOWN_BUTTON_ID);
    countdownButton.addEventListener('click', countdownButtonClick);
    const safeModeCheckbox = document.getElementById('confirm-stop');
    safeModeCheckbox.checked = global_state.confirm_stop; // Set the checkbox state based on global_state
    safeModeCheckbox.addEventListener('change', (event) => {
        global_state.confirm_stop = event.target.checked;
        global_state.saveToSessionStorage(); // Save state when checkbox is toggled
    });
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
