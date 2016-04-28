import React from 'react';

import FluxComponent from '../../FluxComponent';
import ActionListItem from './ActionListItem';


export default class ActionList extends FluxComponent {
    componentDidMount() {
        this.listenTo('participant', this.forceUpdate);
    }

    render() {
        var actions = this.props.actions;
        return (
            <div className="ActionList">
                <ul className="ActionList-columns">
                    <li>Time</li>
                    <li>Activity / Location</li>
                    <li>Contact</li>
                    <li>Participants</li>
                </ul>
                <ul className="ActionList-items">
                    {actions.map(function(action) {
                        const onOperation = this.onOperation.bind(this, action);
                        const onSetContact = this.onSetContact.bind(this, action);
                        const onAddParticipant =
                            this.onAddParticipant.bind(this, action);
                        const onMoveParticipant =
                            this.onMoveParticipant.bind(this, action);

                        var participantStore = this.getStore('participant');
                        var participants = participantStore.getParticipants(action.id);

                        return (
                            <ActionListItem key={ action.id }
                                onSetContact={ onSetContact }
                                onAddParticipant={ onAddParticipant }
                                onMoveParticipant={ onMoveParticipant }
                                onOperation={ onOperation }
                                participants={ participants }
                                action={ action }/>
                        );
                    }, this)}
                </ul>
            </div>
        );
    }

    onOperation(action, operation) {
        if (this.props.onActionOperation) {
            this.props.onActionOperation(action, operation);
        }
    }

    onSetContact(action, person, oldAction) {
        this.getActions('action').updateAction(action.id, {
            contact_id: person.id
        });

        if (action.id != oldAction.id) {
            // TODO: Remove from old action
        }
    }

    onAddParticipant(action, person) {
        this.getActions('participant').addParticipant(
            person.id, action.id);
    }

    onMoveParticipant(action, person, oldAction) {
        if (this.props.onMoveParticipant) {
            this.props.onMoveParticipant(action, person, oldAction);
        }
    }
}

ActionList.propTypes = {
    actions: React.PropTypes.array.isRequired,
    onMoveParticipant: React.PropTypes.func,
    onActionOperation: React.PropTypes.func
};