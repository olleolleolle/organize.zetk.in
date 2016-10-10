import ActionDistributionPane from './campaign/ActionDistributionPane';
import AllActionsPane from './campaign/AllActionsPane';
import AllCallAssignmentsPane from './dialog/AllCallAssignmentsPane';
import CallAssignmentTemplatePane from './dialog/CallAssignmentTemplatePane';
import CallLogPane from './dialog/CallLogPane';
import CampaignPlaybackPane from './campaign/CampaignPlaybackPane';
import InvitePane from './people/InvitePane';
import ImportPane from './people/ImportPane';
import LocationsPane from './maps/LocationsPane';
import OfficialsPane from './settings/OfficialsPane';
import PeopleListPane from './people/PeopleListPane';


export const SECTIONS = {
    people: {
        subSections: [
            { path: 'list',
                startPane: PeopleListPane },
            { path: 'invite',
                startPane: InvitePane },
            { path: 'import',
                startPane: ImportPane },
        ],
    },
    campaign: {
        subSections: [
            { path: 'actions',
                startPane: AllActionsPane },
            { path: 'distribution',
                startPane: ActionDistributionPane },
            { path: 'playback',
                startPane: CampaignPlaybackPane }
        ],
    },
    dialog: {
        subSections: [
            { path: 'assignments',
                startPane: AllCallAssignmentsPane },
            { path: 'calls',
                startPane: CallLogPane },
            { path: 'startassignment',
                startPane: CallAssignmentTemplatePane },
        ],
    },
    maps: {
        subSections: [
            { path: 'locations',
                startPane: LocationsPane }
        ],
    },
    settings: {
        subSections: [
            { path: 'officials',
                startPane: OfficialsPane },
        ],
    },
};


