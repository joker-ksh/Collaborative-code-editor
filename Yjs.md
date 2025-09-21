# Yjs Documentation

## 1. What is Yjs?

Yjs is a CRDT (Conflict-free Replicated Data Type) framework for building real-time collaboration features.

Think Google Docs or Notion:
- Multiple people can edit the same text at the same time
- Even if two people type in the same place, the document stays consistent
- If someone goes offline, makes edits, and then comes back online, their changes automatically merge with everyone else's

## 2. Core Concepts in Yjs

### a) Y.Doc

This is the shared document object.
- It holds your collaborative state
- Each user has a copy of the Y.Doc, and Yjs ensures they all stay in sync

```javascript
const doc = new Y.Doc();
```

### b) Types in Yjs

Inside a Y.Doc, you can store different kinds of collaborative data structures:

- **Y.Text** → shared text buffer (for notepads, rich text, code editors)
- **Y.Array** → shared arrays
- **Y.Map** → key-value map
- **Y.XmlFragment** → structured tree-like data (good for documents, HTML-like content)

**Example:**
```javascript
const ytext = doc.getText("notepad");
ytext.insert(0, "Hello");
```

### c) Providers

Yjs itself is transport-agnostic. It doesn't care how changes are sent across the network. To sync documents, you use a provider.

Some common providers:
- **y-websocket** → syncs Y.Doc over WebSockets
- **y-webrtc** → syncs directly peer-to-peer

**Example:**
```javascript
import { WebsocketProvider } from 'y-websocket';
const provider = new WebsocketProvider("ws://localhost:1234", "room1", doc);
```

### d) CRDT Magic (Why Yjs works offline + real-time)

Yjs is based on CRDTs (Conflict-free Replicated Data Types). CRDTs let multiple replicas of the same data merge automatically without conflicts.

**Example:**
- User A types "Hello"
- User B types "World"
- Yjs merges them → "HelloWorld" (order decided by CRDT rules)
- If A was offline, when they reconnect, their edits merge seamlessly

## Understanding CRDTs at a Low Level

### What normally causes merge conflicts:

In a typical system (like a plain text file in Git or a database):
- Two users edit the same part of a file at the same timestamp in their local files
- When you try to save or sync, the system doesn't know whose change "wins"
- That's why you get a merge conflict — you have to manually resolve it

**Example:**
```
Original: Hello World
User A changes: Hello Mars at timestamp t
User B changes: Hello Venus at timestamp t
```
When syncing, the system can't automatically decide if it should be "Hello Mars" or "Hello Venus". Conflict happens.

### How Yjs avoids conflicts

#### a) Operations are recorded as small atomic steps

- In text, these are insertions and deletions
- Example: typing "Mars" at index 6 is an operation: `insert(6, "Mars")`
- Yjs doesn't rely on wall-clock timestamps; it uses logical clocks and client IDs to order operations
- Each operation is tagged with something like: `(clientID, counter)`
  - **clientID** = unique per client
  - **counter** = incremented for each operation from that client

#### b) Every operation has a unique ID

- Each client generates operations with a unique timestamp/ID
- Even if two clients insert at the same position at same timestamp, Yjs can order them deterministically
- When two inserts happen at the same index and same timestamp:
  - Yjs compares their IDs lexicographically (clientID first, then counter)
  - The operation with the smaller ID goes first, the other goes after

**Example:**
```
Initial: "Hello "
A inserts "Mars" at index 6 → ID = (A,1)
B inserts "Venus" at index 6 → ID = (B,1)

If A < B lexicographically → "Hello MarsVenus"
If B < A → "Hello VenusMars"
```

Both operations are preserved — none are lost. When timestamp and the index got a tie, the UID ranking is the deciding factor.

## 3. Flow of Yjs in Action

Let's take a collaborative notepad as an example:

1. Each client has a Y.Doc
2. Client types → updates Y.Text inside their doc
3. The provider (e.g., y-websocket) sends the update to the server
4. Server forwards that update to other clients
5. Other clients' Y.Docs apply the update → CRDT ensures no conflicts
6. Their UI re-renders to show the latest shared state

---

*This documentation provides a comprehensive overview of Yjs and its CRDT implementation for real-time collaborative applications.*