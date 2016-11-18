import React from 'react';
import async from 'async';
import $ from 'jquery';

import {Modal, ChangeBankModal, LoadingModal, HelpModal} from "./modal";

function choose(l) {
	return l[Math.floor(Math.random() * l.length)];
}

function range(l) {
	return Array.apply(null, Array(l)).map(function (_, i) {return i;});
}

function shuffle(l) {
  for (let i = 0; i < l.length; i++) {
    let otherF = Math.floor(Math.random() * l.length);
    temp = l[i];
    l[i] = l[otherF + i];
    l[otherF + i] = temp;
  }
  return l;
}

class QuestionContainer extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			readTimer: -1,
			wordIndex: 0,
			readSpeed: 200,
			curQuestionWords: {
				question: "",
				meta: []
			},
			curAnswer: ""
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			curQuestionWords: (nextProps.questionData.textList[nextProps.questionData.curInd] || {
				question: "",
				meta: []
			})
		});

		if (nextProps.questionData.curInd != this.props.questionData.curInd && nextProps.questionData.curInd !== null) {
			this.setState({wordIndex: 0});
		}

		if (nextProps.setID != this.props.setID) {
			this.setState({wordIndex: 0});
		}

		if (nextProps.readerState == "READING") {

			if (this.state.readTimer > -1) {
				clearInterval(this.state.readTimer);
			}

			this.setState({
				readTimer: setInterval(function() {
					if (this.state.wordIndex < this.state.curQuestionWords.question.split(" ").length) {
						this.setState({wordIndex: this.state.wordIndex + 1});
					} else {
						clearInterval(this.state.readTimer);
						this.setState({readTimer: -1});
						this.props.onReadingFinished();
					}
					this.scrollToBottom();
				}.bind(this), this.props.readSpeed)
			});

			if (nextProps.readerState != this.props.readerState) {
				this.setState({wordIndex: 0});
			}

		}

    if (nextProps.readerState != this.props.readerState) {

			if (this.props.readerState == "READING") {
				clearInterval(this.state.readTimer);
				this.setState({readTimer: -1});
			}
			setTimeout(this.scrollToBottom.bind(this), 300);
    }
  }

	scrollToBottom() {
		this.refs.qtextcont.scrollTop = this.refs.qtextcont.scrollHeight;
	}

  render() {
		let qMeta = this.state.curQuestionWords.meta;

		let wordArray = this.state.curQuestionWords.question.split(" ");
		let beforeWords = wordArray.slice(0, this.state.wordIndex).join(" ");
		let afterWords = wordArray.slice(this.state.wordIndex).join(" ");

		let visibleText;

		if (this.props.readerState == "READING") {
			visibleText = beforeWords;
		} else if (this.props.readerState == "WAITING") {
			visibleText = beforeWords + " (#)";
		} else if (this.props.readerState == "SHOWING") {
			visibleText = beforeWords + " (#) " + afterWords;
		}

    return (
      <div className={"questiontext" + (this.props.isMobile ? " full" : "")}>
  			<div id="qtextcont" ref="qtextcont">
					<p>
						<b>{ qMeta.length > 0 ? `${qMeta[2]} ${qMeta[1]} | ${qMeta[5]} - ${qMeta[6]}` : "" }</b>
						<span style={{float: "right"}}>{
							qMeta.length > 0 ?
							`(Question ${this.props.questionData.textList.length - this.props.questionData.indList.length + 1} of ${this.props.questionData.textList.length})`
							: ""
							}
						</span>
					</p>
					<p> { visibleText } </p>
					{
						(this.props.readerState == "SHOWING") ? (<p>
							<em><strong>Answer: </strong></em>
							{ this.state.curQuestionWords.answer }
						</p>) : null
					}
				</div>
				{
					this.props.isMobile ? (
						<table className="buttongroup" style={{"width": "100%"}}><tbody><tr>
							<td style={{width: "25%"}}><button ref="nextBttn" onClick={this.props.onNext}><i className="fa fa-caret-square-o-right fa-lg"></i></button></td>
							<td style={{width: "50%"}}><button ref="buzzBttn" onClick={this.props.onBuzz}>{
								{
									"READING": "BUZZ",
									"WAITING": "SHOW",
									"SHOWING": "NEXT"
								}[this.props.readerState]
							}</button></td>
		  				<td style={{width: "25%"}}><button ref="questionsBttn" onClick={this.props.onQuestions}><i className="fa fa-refresh fa-lg"></i> Q'S</button></td>
		  			</tr></tbody></table>
					) : (
						<span id="msg"><em>Press [Space] {
							{
								"READING": "to buzz",
								"WAITING": "to see the answer",
								"SHOWING": "for the next question"
							}[this.props.readerState]
						}</em></span>
					)
				}


  		</div>
    );
  }
}

class UIContainer extends React.Component {

	constructor(props) {
		super(props);
    this.state = {
      downloadData: ""
    };
	}

	cardSelection() {
		var selectedTextObj = window.getSelection().getRangeAt(0);
		var selectedText = selectedTextObj.startContainer.data;
		var startWordSel = selectedTextObj.startOffset;
		while (selectedText.slice(startWordSel, startWordSel + 1) != " " && startWordSel > -1) {
			startWordSel--;
		}
		startWordSel++;
		var endWordSel = selectedTextObj.endOffset;
		while (" ,.!?".indexOf(selectedText.slice(endWordSel, endWordSel + 1)) == -1 && endWordSel < selectedText.length) {
			endWordSel++;
		}

		var modSelectedText = selectedText.slice(startWordSel, endWordSel);
		if (window.getSelection().toString().length > 0) {
			var answerLine = this.props.getAnswer();
			this.refs.cardarea.value += modSelectedText + "\t" + answerLine + "\n";
		}
	}

	onKeyPress(e) {
		if (e.keyCode == 99) {
			this.cardSelection();
		}
	}

	componentDidMount() {
		window.addEventListener('keypress', this.onKeyPress.bind(this));
	}

	componentWillUnmount() {
		window.removeEventListener('keypress', this.onKeyPress.bind(this));
	}

	saveCardData() {
    this.setState({
      downloadData: this.refs.cardarea.value
    });
		this.refs.dl.click();
	}

	pressBttn(name) {

		this.refs[name + "Bttn"].blur();

		this.props.buttons[name]();
	}

	slider() {
		// console.log("speed", 50 + (100 - this.refs.speedInput.value) * 3);
		this.props.slider(50 + (100 - this.refs.speedInput.value) * 3);
	}

	preventExtraneousKeys(ev) {
		ev.stopPropagation();
	}

  render() {
		if (this.props.isMobile) {
			return null;
		}
    return (
      <div className="ui">
  			<table className="buttongroup"><tbody><tr>
  				<td><button ref="nextBttn" onClick={ this.pressBttn.bind(this, "next") }><i className="fa fa-caret-square-o-right fa-lg"></i><span className="descr-inv"> NEXT</span> [N]</button></td>
  				<td><button ref="questionsBttn" onClick={ this.pressBttn.bind(this, "questions") }><i className="fa fa-refresh fa-lg"></i><span className="descr-inv"> QUESTIONS</span></button></td>
  				<td><button ref="cardBttn" onClick={ this.cardSelection.bind(this) }><i className="fa fa-file fa-lg"></i><span className="descr-inv"> NOTECARD</span> [C]</button></td>
  				<td><button ref="saveBttn" onClick={ this.saveCardData.bind(this) }><i className="fa fa-download fa-lg"></i><span className="descr-inv"> DOWNLOAD</span></button></td>
  				<td><button ref="helpBttn" onClick={ this.pressBttn.bind(this, "help") }><i className="fa fa-info-circle fa-lg"></i></button></td>
  			</tr></tbody></table>

  			<div className="textcontainer">
  				<textarea ref="cardarea" onKeyPress={ this.preventExtraneousKeys.bind(this) }></textarea>
  			</div>

  			<span className="speedlabel">Question Speed: [slow]</span>
  			<input type="range" ref="speedInput" defaultValue="50" onChange={ this.slider.bind(this) }/>
  			<span className="endspeedlabel">[fast]</span>
        <a style={{display: "none"}} ref="dl" download="cards.txt" href={"data:text/plain;base64," + btoa(unescape(encodeURIComponent(this.state.downloadData)))}></a>
  		</div>
    );
  }
}

export class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
			"isMobileReq": window.matchMedia("only screen and (max-width: 760px)"),
      "isMobile": window.matchMedia("only screen and (max-width: 760px)").matches,
      "visibleModal": "none",
			"bankModalError": false,
			"readingState": "PAUSED",
			"questions": {
				textList: [],
				indList: [],
				curInd: -1
			},
			"readSpeed": 200,
			"setID": 0,
			"cardContent": ""
    };
		setTimeout(this.onBankChanged.bind(this, [{
			query: "",
			category: "Mythology",
			subCategory: "None",
			searchType: "Answer",
			difficulty: "HS",
			tournament: "All",
		}], true), 0);
  }

  openBankModal() { this.setState({"visibleModal": "changeBank"}); }
  openLoadingModal() { this.setState({"visibleModal": "loading"}); }
  openHelpModal() { this.setState({"visibleModal": "help"}); }

  closeModal() { this.setState({"visibleModal": "none"}); }

	onBankChanged(newFilters, updated) {
		if (updated) {
			this.openLoadingModal();
			this.retrieveQuestionSet(newFilters, function() {
				this.closeModal();
			}.bind(this));
		} else {
			this.closeModal();
		}
	}

	retrieveDatabase(formdata, callback) {
		var questionArray = [];
		async.each(["yes", "no"], function(isLimit, asyncCB) {
			$.ajax({
				url: "/php/searchDatabase.php",
				data: {
					limit: isLimit,
					info: formdata.query,
					categ: formdata.category,
					sub: formdata.subCategory,
					stype: formdata.searchType,
					qtype: "Tossups",
					difficulty: formdata.difficulty,
					tournamentyear: formdata.tournament
				},
				success: function(data) {
					var sliceI = (isLimit == "yes") ? [1, -2] : [0, -1];
					var qArray = data.replace(/\s+/g, " ").split("<hr>").slice(sliceI[0], sliceI[1]).map(function(s) {
						var parts = s.match(/<p>.+?<\/p>/g);
						let meta = parts[0].replace("ID: ", " | ID: ").replace(/<.+?>/g, "").split(" | ");
						if (meta[6] === "") {
							meta[6] = "None";
						}
						return {
							meta: meta,
							question: parts[1].replace(/<.+?>/g, "").replace(/^Question: /, ""),
							answer: parts[2].replace(/<.+?>/g, "").replace(/^Answer: /i, "")
						};
					});
					questionArray = questionArray.concat(qArray);
					asyncCB();
				}
			});
		}, function(err) {
			if (err) throw err;
			callback(questionArray);
		});
	}

	retrieveQuestionSet(questionFilters, callback) {
		var fullQuestionArray = [];
		// TODO: add some sort of system to remove duplicates from question bank
		async.each(questionFilters, function(questionFilter, asyncCB) {

			this.retrieveDatabase(questionFilter, function(qArray) {
				fullQuestionArray = fullQuestionArray.concat(qArray);
				asyncCB();
			});
		}.bind(this), function(err) {
			if (err) throw err;

			if (fullQuestionArray.length < 1) {
				// No valid questions
				this.setState({bankModalError: true});
				this.openBankModal();

				setTimeout(function() {
					this.setState({bankModalError: false});
				}.bind(this), 2000);

				return;
			}

			var indList = range(fullQuestionArray.length);

			this.setState({
				questions: {
					textList: fullQuestionArray,
					indList: indList,
					curInd: choose(indList)
				},
				setID: this.state.setID + 1,
				readerState: "READING"
			});


			callback();
		}.bind(this));
	}


	onKeyPress(ev) {
		if (ev.keyCode == 32) { // Space
			if (this.state.visibleModal == "none") {
				if (this.state.readerState == "READING") {
					this.setState({readerState: "WAITING"});
				} else if (this.state.readerState == "WAITING") {
					this.setState({readerState: "SHOWING"});
				} else if (this.state.readerState == "SHOWING") {
					this.nextQuestion();
				}
			}
		} else if (ev.keyCode == 110) { // N
			this.nextQuestion();
		}
	}

	nextQuestion() {
    if (this.state.questions.indList.length <= 1) {
			let indList = range(this.state.questions.textList.length);
			this.setState({
				questions: {
					textList: this.state.questions.textList,
					indList: indList,
					curInd: choose(indList)
				},
				setID: this.state.setID + 1,
				readerState: "READING"
			});
    } else {
			let qIndex = this.state.questions.indList.indexOf(this.state.questions.curInd);
			let newIndList = this.state.questions.indList.slice(0, qIndex)
				.concat(this.state.questions.indList.slice(qIndex + 1));

			this.setState({
				questions: {
					textList: this.state.questions.textList,
					indList: newIndList,
					curInd: choose(newIndList)
				},
				readerState: "READING"
			});
		}


	}

	onRSZ() {
		var isNowMobile = this.state.isMobileReq.matches;
		if (this.state.isMobile != isNowMobile) {
			this.setState({
				"isMobile": isNowMobile
			});
		}
	}

	componentDidMount() {
		window.addEventListener('keypress', this.onKeyPress.bind(this));
		window.addEventListener('resize', this.onRSZ.bind(this));
	}

	componentWillUnmount() {
		window.removeEventListener('keypress', this.onResize.bind(this));
		window.removeEventListener('resize', this.onRSZ.bind(this));
	}

	getQuestionAnswer() {
		if (this.state.readerState == "SHOWING") {
			return this.refs.QCont.state.curQuestionWords.answer;
		} else {
			return "";
		}
	}

	setQuestionSpeed(spd) {
		this.setState({
			readSpeed: spd
		});
	}

  render() {
		// console.log("render", this.state.isMobile, this.state.isMobileReq.matches);

    return (
      <div>
				<div className="appContent">
	        <QuestionContainer ref="QCont"
						questionData={this.state.questions}
						readerState={this.state.readerState}
						onReadingFinished={ function() {this.setState({readerState: "WAITING"});}.bind(this)}
						setID={this.state.setID}
						isMobile={this.state.isMobile}
						onQuestions={this.openBankModal.bind(this)}
						onBuzz={this.onKeyPress.bind(this, {keyCode: 32})}
						onNext={this.nextQuestion.bind(this)}
						readSpeed={this.state.readSpeed}/>
	        <UIContainer buttons={
	          {
	            "next": this.nextQuestion.bind(this),
	            "questions": this.openBankModal.bind(this),
	            "card": function() {}.bind(this),
	            "download": function() {}.bind(this),
	            "help": this.openHelpModal.bind(this)
	          }}

						slider={ this.setQuestionSpeed.bind(this) }
						getAnswer={this.getQuestionAnswer.bind(this)}
						isMobile={this.state.isMobile}

	        />
					<div className="pullover">
						<h1>QuizBug <i className="fa fa-bug fa-lg"></i></h1>
						<span className="attribution">
						A Quinterest Add-On<br/>
						Created by Chris Winkler<br/>
						v2.1<br/>
						Questions/comments? Contact <a href="mailto:quidnovum@gmail.com" target="_blank">quidnovum@gmail.com</a><br/>
						</span>
						<span className="pullover-bars"><i className="fa fa-bars"></i></span>
					</div>
				</div>

				<ChangeBankModal
					isOpen={ this.state.visibleModal == "changeBank" }
          onFinished={this.onBankChanged.bind(this)}
					hasError={this.state.bankModalError}/>
        <LoadingModal isOpen={ this.state.visibleModal == "loading" } />
        <HelpModal isOpen={ this.state.visibleModal == "help" }
          onClosing={this.closeModal.bind(this)}/>

      </div>
    );
  }
}
