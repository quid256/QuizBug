// modal.js - contains the Modal React Component and associated stuff

// Require the stuffs
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// Modal - a component that encapsulates the HTML of a generic modal dialog
export class Modal extends React.Component {

  // When it is being rendered to DOM...
  render() {

    // If the modal is currently open...
    if (this.props.isOpen) {
      return (
        <ReactCSSTransitionGroup
          transitionName="modal-anim"
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300}>
          <div className="modalBlurFilter" onClick={ this.props.onClosed }></div>
          <div className="modalContainer">
            { this.props.children }
          </div>
        </ReactCSSTransitionGroup>
      );
    } else {
      return (
        <ReactCSSTransitionGroup transitionName="modal-anim" transitionEnterTimeout={300} transitionLeaveTimeout={300} />
      );
    }
  }
}

Modal.propTypes = {
  "isOpen": React.PropTypes.bool,  // Property that models whether or not this modal is open
  "onClosed": React.PropTypes.func // Event that triggers when this modal is closed.
};

Modal.defaultProps = {
  "isOpen": false,
  "onClosed": function() {}
};

class ModalInputField extends React.Component {
  render() {
    return (
      <tr>
        <td>
          <label>{ this.props.fieldName }: </label>
        </td>
        <td>
          { this.props.children }
        </td>
      </tr>
    );
  }
}

class QuestionFilter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      subcategories: [{techName: "", visName: "None"}],
      tournaments: ["All"]
    };

    $.get("/php/loadSubcategories.php", {
      category: this.props.values.category
    }, function(data) {
      this.setState({
        subcategories: (data.match(/<option.+?>.+?<\/option>/g) || []).map(s => {
          let regexMatch = s.match(/<option.+?value=["'](.+?)["'].*?>(.+?)<\/option>/);
          return {techName: regexMatch[1], visName: regexMatch[2]};
        })
      });
    }.bind(this));

    $.get("/php/loadTournaments.php", {
      qtype: "Tossups",
      difficulty: this.props.values.difficulty
    }, function(data) {
      this.setState({
        tournaments: data.match(/<option.+?>.+?<\/option>/g).map(s => {
          let regexMatch = s.match(/<option.+?value=["'](.+?)["'].*?>(.+?)<\/option>/);
          return {techName: regexMatch[1], visName: regexMatch[2]};
        })
      });
    }.bind(this));

  }

  onCategoryChange() {
    this.updateParent();
    $.get("/php/loadSubcategories.php", {
      category: this.refs.category.value
    }, function(data) {
      this.setState({
        subcategories: data.match(/<option.*?>.+?<\/option>/g).map(s => {
          let regexMatch = s.match(/<option(.+?value=["'](.+?)["'])?.*?>(.+?)<\/option>/);
          return {techName: regexMatch[2], visName: regexMatch[3]};
        })
      });
      this.updateParent();
    }.bind(this));
  }

  onDifficultyChange() {
    this.updateParent();
    $.get("/php/loadTournaments.php", {
      qtype: "Tossups",
      difficulty: this.refs.difficulty.value
    }, function(data) {
      this.setState({
        tournaments: data.match(/<option.+?>.+?<\/option>/g).map(s => {
          let regexMatch = s.match(/<option.+?value=["'](.+?)["'].*?>(.+?)<\/option>/);
          return {techName: regexMatch[1], visName: regexMatch[2]};
        })
      });
      this.updateParent();
    }.bind(this));
  }

  updateParent() {
    var data = {};
    for (let name of ["query", "category", "subCategory", "searchType", "difficulty", "tournament"]) {
      data[name] = this.refs[name].value;
    }
    data.key = this.props.values.key;
    this.props.onUpdated(data);
  }

  render() {
    return (
      <table className="filter">
        <tbody>
          <ModalInputField fieldName="Search">
            <input type="text" className="questionquery" ref="query" defaultValue={ this.props.values.query } onChange={ this.updateParent.bind(this) }/>
          </ModalInputField>

          <ModalInputField fieldName="Category">
            <select className="optionCategory" ref="category" value={ this.props.values.category } onChange={ this.onCategoryChange.bind(this) }>
              {
                ["All", "Literature", "History", "Science",
                "Fine Arts", "Religion", "Mythology", "Philosophy",
                "Social Science", "Geography", "Current Events", "Trash"].map(n => (
                  <option key={ n } value={ n }>{ n }</option>
                ))
              }
            </select>
          </ModalInputField>

          <ModalInputField fieldName="Subcategory">
            <select className="optionSubcategory" ref="subCategory" value={ this.props.values.subCategory } onChange={ this.updateParent.bind(this) }>
              {
                (l => l.length > 0 ? l : (<option>None</option>))(
                  this.state.subcategories.map((n, i) => (
                    <option key={ i } value={ n.techName }>{ n.visName }</option>
                  ))
                )
              }
            </select>
          </ModalInputField>

          <ModalInputField fieldName="Search Type">
            <select className="optionSType" ref="searchType" value={ this.props.values.searchType } onChange={ this.updateParent.bind(this) }>
              <option value="Answer">Answer</option>
              <option value="AnswerQuestion">Question &amp; Answer</option>
            </select>
          </ModalInputField>

          <ModalInputField fieldName="Difficulty">
            <select className="optionDifficulty" ref="difficulty" value={ this.props.values.difficulty } onChange={ this.onDifficultyChange.bind(this) }>
              <option value="All">All</option>
              <option value="MS">Middle School</option>
              <option value="HS">High School</option>
              <option value="College">College</option>
              <option value="Open">Open</option>
            </select>
          </ModalInputField>

          <ModalInputField fieldName="Tournament">
            <select className="optionTournament" ref="tournament" value={ this.props.values.tournament } onChange={ this.updateParent.bind(this) }>
              {
                this.state.tournaments.map(n => (
                  <option key={ n.techName } value={ n.techName }>{ n.visName }</option>
                ))
              }
            </select>
          </ModalInputField>

          <tr>
            <td colSpan="2">
              <button className={"delete" + (this.props.hasDelete ? "" : " single")} disabled={!this.props.hasDelete} onClick={ this.props.onDelete }><i className="fa fa-trash-o fa-lg"></i></button>
            </td>
          </tr>

        </tbody>
      </table>
    );
  }
}

export class ChangeBankModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      questionFilters: [{
        search: "",
        category: "Mythology",
        subCategory: "None",
        searchType: "Answer",
        difficulty: "HS",
        tournament: "All",
        key: 0
      }],
      curFilterKey: 1,
      formerFilters: []
    };
  }

  addQuestionFilter() {
    this.setState({
      questionFilters: this.state.questionFilters.concat([{
        query: "",
        category: "Mythology",
        subCategory: "None",
        searchType: "Answer",
        difficulty: "HS",
        tournament: "All",
        key: this.state.curFilterKey // TODO: keep the value of "key" from the QuestionFilter components
      }]),
      curFilterKey: this.state.curFilterKey + 1
    });
  }

  removeQuestionFilter(ind) {
    this.setState({questionFilters: this.state.questionFilters.slice(0, ind).concat(this.state.questionFilters.slice(ind+1))});
  }

  updateQuestionFilter(ind, data) {
    // let newQuestionFilters = Object.create(this.state.questionFilters);
    this.state.questionFilters[ind] = data;
    this.setState({questionFilters: this.state.questionFilters});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isOpen != this.props.isOpen) {
      if (nextProps.isOpen) {
        this.setState({formerFilters: this.state.questionFilters});
      } else {
        this.setState({formerFilters: []});
      }
    }
  }

  closeModal() {
    this.setState({questionFilters: this.state.formerFilters});
    this.props.onFinished(this.state.questionFilters, false);
  }

  updateFilters() {
    this.props.onFinished(this.state.questionFilters, true);
  }

  // When it is being rendered to DOM...
  render() {
    return (
      <Modal isOpen={ this.props.isOpen } onClosed={ this.closeModal.bind(this) }>
        <ReactCSSTransitionGroup
          transitionName="emptyMsg-anim"
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300}>
          {
            this.props.hasError ? (
              <div className="emptyMsg" key="emptyMsg">There are no questions that match these criteria in Quinterest!</div>
            ) : null
          }
        </ReactCSSTransitionGroup>
        <div className="filterareaContainer">
          <table className="filterarea">
            <tbody>
              <ReactCSSTransitionGroup
                transitionName="filter-anim"
                transitionEnterTimeout={500}
                transitionLeaveTimeout={500}
                component="tr">
                { this.state.questionFilters.map((n, i) => (
                  <td key={ n.key } className="question-filter-cell">
                    <QuestionFilter
                      values={ n }
                      hasDelete={ this.state.questionFilters.length > 1 }
                      onDelete={ this.removeQuestionFilter.bind(this, i) }
                      onUpdated={ this.updateQuestionFilter.bind(this, i) } />
                  </td>
                )) }
              </ReactCSSTransitionGroup>
            </tbody>
          </table>
        </div>
        <table className="buttongroup bank-buttongroup"><tbody><tr>
          <td><button id="dialog_cancel" onClick={ this.closeModal.bind(this) }><i className="fa fa-ban fa-lg"></i> CANCEL</button></td>
          <td><button id="dialog_addsearch" onClick={ this.addQuestionFilter.bind(this) }><i className="fa fa-plus fa-lg"></i> ADD CATEGORY</button></td>
          <td><button id="dialog_changebank" onClick={ this.updateFilters.bind(this) }>UPDATE</button></td>
        </tr></tbody></table>

      </Modal>
    );
  }
}

ChangeBankModal.propTypes ={
  "isOpen": React.PropTypes.bool,               // Property that models whether or not this modal is open
};

ChangeBankModal.defaultProps = {
  "isOpen": false
};

export class LoadingModal extends React.Component {

  // When it is being rendered to DOM...
  render() {
    return (
      <Modal isOpen={ this.props.isOpen }>
        <span id="loadingtext"></span>
        <div className="spinner">
          <div className="rect1"></div>
          <div className="rect2"></div>
          <div className="rect3"></div>
          <div className="rect4"></div>
          <div className="rect5"></div>
        </div>
      </Modal>
    );
  }

}

LoadingModal.propTypes ={
  "isOpen": React.PropTypes.bool,             // Property that models whether or not this modal is open
};

LoadingModal.defaultProps = {
  "isOpen": false,
};

export class HelpModal extends React.Component {

  // When it is being rendered to DOM...
  render() {
    return (
      <Modal isOpen={ this.props.isOpen } onClosed={ this.props.onClosing }>
        <div className="help-modal-text">
          <h1>QuizBug Help</h1>
          <div>
            QuizBug is a tool designed to help you study for quizbowl. It reads questions from the Quinterest database word by word and allows you to buzz in when you think you know the answer. QuizBug also has several other features to help you study including:
            <ul>
              <li>The ability to change which parts of the Quinterest database you want to practice by clicking the [Questions] button</li>
              <li>The ability to create notecards from parts of the question by selecting a part of the question and either pressing [C] or clicking the [Notecard] button</li>
              <li>The ability to download the flashcards you have created as a Tab-separated text file usable with flashcard programs like Mnemosyne by clicking the [Download] button</li>
            </ul>
            Questions/comments/new ideas? Contact <a href="mailto:quidnovum@gmail.com" target="_blank">quidnovum@gmail.com</a>
          </div><br/>
          <table className="buttongroup"><tbody><tr><td>
            <button id="helpform-close" onClick={ this.props.onClosing }><i className="fa fa-close fa-lg"></i>CLOSE</button>
          </td></tr></tbody></table>
        </div>
      </Modal>
    );
  }

}

HelpModal.propTypes ={
  "isOpen": React.PropTypes.bool,             // Property that models whether or not this modal is open
};

HelpModal.defaultProps = {
  "isOpen": false
};
