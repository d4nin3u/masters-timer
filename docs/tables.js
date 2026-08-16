import { INACTIVE_TABLE_ID, MASTERS_TABLE_ID } from './constants.js';
import { global_state } from './state.js';
import { timeToString } from './utils/time.js';
import { movePlayerToActive, movePlayerToInactive, deletePlayerFromInactive } from './playerManager.js';
// Table Functions
export function createTableHeader(table) {
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
export function addRowToTable(table, player, index) {
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
export function refreshTables() {
    refreshTable(MASTERS_TABLE_ID, global_state.sortedPlayerArray());
    refreshTable(INACTIVE_TABLE_ID, Array.from(global_state.inactivePlayers.values()));
}
export function refreshTable(tableId, players) {
    const table = document.getElementById(tableId);
    table.innerHTML = "";
    createTableHeader(table);
    players.forEach((p, i) => addRowToTable(table, p, i));
}
