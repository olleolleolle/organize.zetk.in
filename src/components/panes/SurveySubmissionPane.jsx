import React from 'react';
import { injectIntl, FormattedMessage as Msg } from 'react-intl';
import { connect } from 'react-redux';
import cx from 'classnames';

import PaneBase from './PaneBase';
import Avatar from '../misc/Avatar';
import Button from '../misc/Button';
import LoadingIndicator from '../misc/LoadingIndicator';
import { getListItemById } from '../../utils/store';
import { retrieveSurvey } from '../../actions/survey';
import { retrieveSurveySubmission } from '../../actions/surveySubmission';


const mapStateToProps = (state, props) => {
    let submissionItem = getListItemById(
        state.surveySubmissions.submissionList,
        props.paneData.params[0]);

    let surveyItem = null;
    if (submissionItem && submissionItem.data && submissionItem.data.survey) {
        surveyItem = getListItemById(
            state.surveys.surveyList, submissionItem.data.survey.id);
    }

    return { submissionItem, surveyItem };
};


@connect(mapStateToProps)
@injectIntl
export default class SurveySubmissionPane extends PaneBase {
    componentDidMount() {
        super.componentDidMount();

        let subItem = this.props.submissionItem;

        this.props.dispatch(retrieveSurveySubmission(this.getParam(0)));

        if (subItem && subItem.data && subItem.data.survey) {
            this.props.dispatch(retrieveSurvey(subItem.data.survey.id));
        }
    }

    getRenderData() {
        return {
            submissionItem: this.props.submissionItem,
            surveyItem: this.props.surveyItem,
        };
    }

    getPaneTitle(data) {
        const formatMessage = this.props.intl.formatMessage;
        if (data.submissionItem && !data.submissionItem.isPending) {
            return formatMessage({ id: 'panes.surveySubmission.title' });
        }
        else {
            return null;
        }
    }

    componentWillReceiveProps(nextProps) {
        let subItem = nextProps.submissionItem;
        if (!nextProps.surveyItem && subItem && subItem.data && subItem.data.survey) {
            this.props.dispatch(retrieveSurvey(subItem.data.survey.id));
        }
    }

    renderPaneContent(data) {
        if (data.submissionItem && !data.submissionItem.isPending) {
            let sub = data.submissionItem.data;
            let survey = data.surveyItem? data.surveyItem.data : null;

            let responses = <LoadingIndicator />;
            if (survey && survey.elements) {
                responses = survey.elements
                    .filter(element => element.type == 'question')
                    .map(element => {
                        let response = null;

                        if (this.props.submissionItem.data.responses) {
                            response = this.props.submissionItem.data.responses
                                .find(r => r.question_id == element.id);
                        }

                        return (
                            <SubmissionResponse key={ element.id }
                                question={ element.question }
                                response={ response }
                                />
                        );
                    });
            }

            return [
                <div key="info" className="SurveySubmissionPane-info">
                    <h3>{ sub.survey.title }</h3>
                    <SubmissionRespondent submission={ sub }/>
                </div>,
                <div key="responses" className="SurveySubmissionPane-responses">
                    <Msg tagName="h3" id="panes.surveySubmission.responses.h"/>
                    { responses }
                </div>
            ];
        }
        else {
            return <LoadingIndicator/>;
        }
    }
}

let SubmissionRespondent = props => {
    let sub = props.submission;

    let name = <Msg id="panes.surveySubmission.info.anonymous"/>;
    let avatar = (
        <figure className="SurveySubmissionPane-anonymousAvatar">
            ?
        </figure>
    );

    if (sub.respondent) {
        name = (
            <span>
                { sub.respondent.first_name + ' ' + sub.respondent.last_name }
            </span>
        );

        if (sub.respondent.id) {
            avatar = <Avatar person={ sub.respondent }/>;
        }
    }

    let classes = cx('SurveySubmissionPane-respondent', {
        anonymous: !sub.respondent,
    });

    return (
        <div className={ classes }>
            { avatar }
            { name }
        </div>
    );
};

let SubmissionResponse = props => {
    let responseContent;

    if (props.response) {
        responseContent = [];

        if (props.response.options && props.response.options.length) {
            let optionItems = (props.response.options || []).map(oid => {
                let qo = props.question.options.find(o => o.id == oid);

                return (
                    <li key={ oid }>{ qo.text }</li>
                );
            });

            responseContent.push(
                <ul key="options"
                    className="SurveySubmissionPane-responseOptions">
                    { optionItems }
                </ul>
            );
        }

        if (props.response.response && props.response.response.length) {
            responseContent.push(
                <span key="text"
                    className="SurveySubmissionPane-responseText">
                    { props.response.response }
                </span>
            );
        }
    }
    else {
        responseContent = (
            <div className="SurveySubmissionPane-responseEmpty">
                <Msg id="panes.surveySubmission.responses.emptyResponse"/>
            </div>
        );
    }

    return (
        <div className="SurveySubmissionPane-response">
            <h4>{ props.question.question }</h4>
            { responseContent }
        </div>
    );
}