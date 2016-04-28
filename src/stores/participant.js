import { Store } from 'flummox';


export default class ParticipantStore extends Store {
    constructor(flux) {
        super();

        this.flux = flux;
        this.setState({
            participants: {},
            moves: []
        });

        const participantActions = this.flux.getActions('participant');
        const reminderActions = this.flux.getActions('reminder');

        this.registerAsync(participantActions.retrieveParticipants,
            this.onRetrieveParticipantsBegin,
            this.onRetrieveParticipantsComplete);

        this.register(participantActions.addParticipant,
            this.onAddParticipantComplete);
        this.register(participantActions.moveParticipant,
            this.onMoveParticipant);
        this.register(participantActions.undoMoves,
            this.onUndoMoves);
        this.register(participantActions.executeMoves,
            this.onExecuteMovesComplete);
        this.register(participantActions.clearMoves,
            this.onClearMoves);

        this.register(reminderActions.sendAllActionReminders,
            this.onSendAllActionRemindersComplete);
    }

    getParticipants(actionId) {
        if (actionId in this.state.participants) {
            return this.state.participants[actionId];
        }
        else {
            return null;
        }
    }

    getMoves() {
        return this.state.moves;
    }

    onRetrieveParticipantsBegin(actionId) {
        this.state.participants[actionId] = [];

        this.setState({
            participants: this.state.participants
        });
    }

    onRetrieveParticipantsComplete(res) {
        var actionId = res.meta.actionId;
        this.state.participants[actionId] = res.data.data;

        this.setState({
            participants: this.state.participants
        });
    }

    onAddParticipantComplete(res) {
        const person = res.data.data;
        const actionId = res.meta.actionId;
        const allParticipants = this.state.participants;
        const actionParticipants = allParticipants[actionId] || [];

        allParticipants[actionId] = actionParticipants.concat([ person ]);

        this.setState({
            participants: allParticipants
        });
    }

    onSendAllActionRemindersComplete(res) {
        const actionId = res.meta.actionId;
        const reminders = res.data.data;
        const participants = this.state.participants[actionId];

        for (let i = 0; i < participants.length; i++) {
            let participant = participants[i];
            let reminder = reminders.find(r => r.person.id == participant.id);

            if (reminder) {
                participant.reminder_sent = reminder.sent;
            }
        }

        this.setState({
            participants: this.state.participants
        })
    }

    onMoveParticipant(payload) {
        var oldArray = this.state.participants[payload.oldActionId];
        var newArray = this.state.participants[payload.newActionId];

        this.moveBetweenArrays(payload.personId, oldArray, newArray);

        // TODO: This is just faking immutable data
        this.state.participants[payload.oldActionId] = oldArray.concat();
        this.state.participants[payload.newActionId] = newArray.concat();

        this.setState({
            participants: this.state.participants,
            moves: this.addMove({
                person: payload.personId,
                from: payload.oldActionId,
                to: payload.newActionId
            })
        });
    }

    onExecuteMovesComplete(res) {
        // Keep every other result (two requests per move) and
        // make a list of the move data from the request meta.
        const moves = res
            .filter((r, i) => (i%2 == 0))
            .map(r => r.meta.move);

        this.setState({
            // Only keep moves that were not executed
            moves: this.state.moves.filter(m => moves.indexOf(m) < 0)
        });
    }

    onUndoMoves(moves) {
        for (let i = 0; i < moves.length; i++) {
            let move = moves[i];
            let originalArray = this.state.participants[move.from];
            let postMoveArray = this.state.participants[move.to];

            this.moveBetweenArrays(move.person, postMoveArray, originalArray);

            // TODO: This is just faking immutable data
            this.state.participants[move.from] = originalArray.concat();
            this.state.participants[move.to] = postMoveArray.concat();
        }

        this.setState({
            // Only keep moves that were not undone
            moves: this.state.moves.filter(m => moves.indexOf(m) < 0),
            participants: this.state.participants
        });
    }

    onClearMoves() {
        this.setState({
            moves: []
        });
    }

    moveBetweenArrays(personId, arr0, arr1) {
        var i, person;

        for (i = 0; i < arr0.length; i++) {
            if (arr0[i].id == personId) {
                person = arr0[i];
                arr0.splice(i, 1);
                break;
            }
        }

        if (person) {
            arr1.push(person);
        }
    }

    addMove(move) {
        var i;
        var oldMove;
        var updated = false;
        var moves = this.state.moves;

        // Search for inverses
        for (i = 0; i < moves.length; i++) {
            oldMove = moves[i];
            if (oldMove.person == move.person
                && oldMove.from == move.to && oldMove.to == move.from) {
                // This is an inverse of a previous move, i.e. it undos it,
                // and can thus just be removed since the result is no move.
                moves.splice(i, 1);
                updated = true;
                break;
            }
        }

        // Search for chain
        oldMove = moves.find(m =>
            (m.to == move.from && m.person == move.person));

        if (oldMove) {
            // This extends a chain of moves for this person. Just update the
            // previous move to avoid storing the entire chain.
            oldMove.to = move.to;
            updated = true;
        }

        // Search for replace
        oldMove = moves.find(m =>
            (m.from == move.to && m.person == move.person));

        if (oldMove) {
            // This moves the person to an action from which it was previously
            // moved away, i.e. A > B, C > A. In effect, there has only really
            // been one move made, C > B.
            oldMove.from = move.from;
            updated = true;
        }

        if (!updated) {
            // If no old move was updated this is a new move
            moves.push(move);
        }

        return moves;
    }

    static serialize(state) {
        return JSON.stringify(state);
    }

    static deserialize(stateStr) {
        return JSON.parse(stateStr);
    }
}