import React from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage as Msg } from 'react-intl';
import scroll from 'scroll';

import ImporterTableHead from './ImporterTableHead';
import ImporterTableBody from './ImporterTableBody';
import {
    updateImportColumn,
    useImportTableFirstRowAsHeader,
} from '../../../actions/importer';


export default class ImporterTable extends React.Component {
    static propTypes = {
        table: React.PropTypes.object.isRequired,
        dispatch: React.PropTypes.func.isRequired,
        maxRows: React.PropTypes.number.isRequired,
        onEditColumn: React.PropTypes.func,
    };

    componentWillReceiveProps(nextProps) {
        nextProps.table.columnList.items.forEach((item, idx) => {
            let next = item.data;
            let prev = this.props.table.columnList.items[idx].data;

            if (next.type != prev.type) {
                let tableNode = ReactDOM.findDOMNode(this.refs.table);
                let tableRect = tableNode.getBoundingClientRect();

                let colWidth = document.querySelector('.ImporterColumnHead')
                    .getBoundingClientRect()
                    .width;

                let right = (idx + 1.5) * colWidth;
                let dx = right - (tableRect.width - colWidth);

                if (dx > 0) {
                    scroll.left(tableNode, dx);
                }
            }
        });
    }

    componentDidMount() {
        this.onKeyUp = ev => {
            let tableNode = ReactDOM.findDOMNode(this.refs.table);
            let tableRect = tableNode.getBoundingClientRect();
            let colWidth = document.querySelector('.ImporterColumnHead')
                .getBoundingClientRect()
                .width;

            let colIdx = Math.ceil(tableNode.scrollLeft / colWidth);

            if (ev.keyCode == 37) {
                colIdx = Math.max(colIdx - 1, 0);
            }
            else if (ev.keyCode == 39) {
                colIdx = Math.min(colIdx + 1, this.props.table.columnList.items.length - 1);
            }

            let scrollLeft = colIdx * colWidth;
            scroll.left(tableNode, scrollLeft);
        };

        window.addEventListener('keyup', this.onKeyUp);
    }

    componentWillUnmount() {
        window.removeEventListener('keyup', this.onKeyUp);
    }

    render() {
        let table = this.props.table;

        let removedInfo = null;
        if (table.numEmptyColumnsRemoved > 0) {

            removedInfo = (
                <div className="ImporterTable-report">
                    <Msg tagName="p" id="panes.import.table.emptyColumnsRemoved"
                        values={{ numRemoved: table.numEmptyColumnsRemoved }}/>
                </div>
            );
        }

        return (
            <div className="ImporterTable">
                <div className="ImporterTable-info">
                <h1>{ table.name }</h1>
                    { removedInfo }
                </div>
                <div className="ImporterTable-settings">
                    <input type="checkbox" checked={ table.useFirstRowAsHeader }
                        onChange={ this.onChangeFirstRow.bind(this) }/>
                    <Msg id="panes.import.table.firstRowAsHeader"/>
                </div>
                <div className="ImporterTable-container" ref="table">
                    <ImporterTableHead
                        columnList={ table.columnList }
                        onChangeColumn={ this.onChangeColumn.bind(this) }
                        onEditColumn={ this.onEditColumn.bind(this) }/>
                    <ImporterTableBody table={ table }
                        maxRows={ this.props.maxRows }
                        />
                </div>
            </div>
        );
    }

    onChangeColumn(columnId, props) {
        let tableId = this.props.table.id;
        this.props.dispatch(
            updateImportColumn(tableId, columnId, props));
    }

    onEditColumn(column) {
        // TODO: After pane refactor, dispatch open action here
        if (this.props.onEditColumn) {
            this.props.onEditColumn(this.props.table, column);
        }
    }

    onChangeFirstRow(ev) {
        let tableId = this.props.table.id;
        let val = !this.props.table.useFirstRowAsHeader;
        this.props.dispatch(useImportTableFirstRowAsHeader(tableId, val));
    }
}
