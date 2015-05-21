Server should be a hub that joins users into a room they ask for

Each room is a synchronized state machine:
State is on the server
On client join, send current state and set to recieve updates
On new updates, set server state and forward update on to every client

package.json engine >= v0.12