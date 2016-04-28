import { Store } from 'flummox';

import StoreUtils from '../utils/StoreUtils';


export default class PersonStore extends Store {
    constructor(flux) {
        super();

        this.setState({
            people: []
        });

        var personActions = flux.getActions('person');
        this.register(personActions.retrievePeople,
            this.onRetrievePeopleComplete);
        this.register(personActions.retrievePerson,
            this.onRetrievePersonComplete);
        this.registerAsync(personActions.updatePerson,
            this.onUpdatePersonBegin, this.onUpdatePersonComplete);
        this.register(personActions.createPerson,
            this.onCreatePersonComplete);
        this.registerAsync(personActions.deletePerson,
            this.onDeletePersonBegin, null);

        var participantActions = flux.getActions('participant');
        this.register(participantActions.retrieveParticipants,
            this.onRetrieveParticipantsComplete);
    }

    getPeople() {
        return this.state.people;
    }

    getPerson(id) {
        return this.state.people.find(p => p.id == id);
    }

    onRetrievePeopleComplete(res) {
        this.setState({
            people: res.data.data
        });
    }

    onUpdatePersonBegin(personId, data) {
        var people = this.state.people;

        StoreUtils.updateOrAdd(people, personId, data);

        this.setState({
            people: people
        });
    }

    onUpdatePersonComplete(res) {
        var people = this.state.people;
        var person = res.data.data;

        StoreUtils.updateOrAdd(people, person.id, person);

        this.setState({
            people: people.concat()
        });
    }

    onCreatePersonComplete(res) {
        this.state.people.push(res.data.data);
        this.setState({
            people: this.state.people.concat()
        });
    }

    onRetrievePersonComplete(res) {
        var people = this.state.people;
        var person = res.data.data;

        StoreUtils.updateOrAdd(people, person.id, person);

        this.setState({
            people: people.concat()
        });
    }

    onDeletePersonBegin(personId) {
        StoreUtils.remove(this.state.people, personId);
        this.setState({
            people: this.state.people.concat()
        });
    }

    onRetrieveParticipantsComplete(res) {
        var i;
        const participants = res.data.data;

        for (i = 0; i < participants.length; i++) {
            var person = participants[i];
            StoreUtils.updateOrAdd(this.state.people, person.id, person);
        }

        this.setState({
            people: this.state.people
        });
    }

    static serialize(state) {
        return JSON.stringify(state)
    }

    static deserialize(stateStr) {
        return JSON.parse(stateStr);
    }
}