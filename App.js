import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Modal } from 'react-native';
import { Button, Radio, Spinner, ListItem, Toast } from 'native-base';
import axios from 'axios';
import moment from 'moment'

const initialState = {
  questions: [],
  isQuizStarted: false,
  isQuizFinished: false,
  answersExtras: [],
  quizStartTime: '',
  quizEndTime: '',
  totalScore: 0,
}
export default class App extends Component {
  constructor() {
    super();
    this.state = { ...initialState }
  }

  componentDidMount() {
    this.getQuestions();
  }

  getQuestions = () => {
    axios.get('https://opentdb.com/api.php?amount=10&category=18&difficulty=easy')
      .then((response) => {
        let { results } = response.data;
        results = results.map((question) => {
          const allAnswer = [...question.incorrect_answers];
          allAnswer.splice(Math.floor((Math.random() * allAnswer.length) + 1), 0, question.correct_answer);
          question['allAnswer'] = allAnswer;
          return question;
        })
        this.setState({ questions: results })
      })
      .catch((error) => {
        console.log(error);
      });
  }

  submitQuiz = () => {
    const endTime = new Date();
    let isCompleted = true;
    let totalScore = 0;
    const { questions } = this.state;
    questions.forEach(element => {
      if (!element.hasOwnProperty('userSelectedAnswer')) {
        isCompleted = false;
        Toast.show({
          text: 'Please Answer all questions',
          buttonText: 'Okay'
        })

      } else if (element.userSelectedAnswer == element.correct_answer) {
        ++totalScore;
      }
    });
    if (isCompleted) {
      this.setState({
        quizEndTime: endTime,
        totalScore,
        isQuizFinished: true
      });
    }
  }

  startQuiz = () => {
    const startTime = new Date();
    this.setState({
      isQuizStarted: true,
      quizStartTime: startTime
    });
  }

  checkedCheckbox = (answer, ind) => {
    const { questions } = this.state;
    let answers = { ...questions };
    answers[ind].userSelectedAnswer = answer;
    this.setState({ answersExtras: answers });
  }

  openModal = () => {
    const { totalScore, quizEndTime, quizStartTime, questions } = this.state;
    return (
      <Modal
        animationType="slide"
        transparent={false}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1.4, justifyContent: "center", alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: 'center' }}>
            <Text style={{ fontSize: 25 }}>Test Result</Text>
          </View>
          <View style={{ flex: 1.2, justifyContent: "center", alignItems: 'center' }}>
            <Text style={{ fontSize: 20 }}>Start Time: {moment(quizStartTime).format("HH:mm:ss")}</Text>
            <Text style={{ fontSize: 20 }}>End Time: {moment(quizEndTime).format("HH:mm:ss")}</Text>
            <Text style={{ fontSize: 20 }}>Total Score: {totalScore} out of {questions.length}</Text>
          </View>
          <View stye={{ flex: 2, justifyContent: "center", alignItems: 'center', paddingBottom: 10 }}>
            <Button full style={styles.SubmitButton} onPress={this.resetQuiz}>
              <Text style={{ letterSpacing: 2 }}>Play Again</Text>
            </Button>
            <Button full style={styles.SubmitButton} onPress={this.cancelQuiz}>
              <Text style={{ letterSpacing: 2 }}>Close</Text>
            </Button>

          </View>

        </View>
      </Modal>
    )
  }
  resetQuiz = () => {
    this.setState({
      ...initialState,
      isQuizStarted: true,
      isQuizFinished: false

    })
    this.getQuestions()
  }
  cancelQuiz = () => {
    this.setState({
      ...initialState,
    })
    this.getQuestions()
  }
  render() {
    const { questions, isQuizStarted, answersExtras, totalScore, isQuizFinished } = this.state;
    if (!isQuizStarted) {
      return (
        <View style={styles.container}>
          <View style={styles.QuizHeader}>
          <Text style={styles.QuizHeaderText}> Trivia Quiz App</Text>
          </View>
          <View style={styles.QuizHeader}>
            <Button full style={styles.Button} onPress={this.startQuiz}><Text style={styles.letterSpacing}>Play Quiz</Text></Button>
          </View>
        </View>
      )
    }
    if (questions && questions.length) {
      return (
        <ScrollView>
          {isQuizFinished ? this.openModal() : null}
          {questions.map((question, ind) => {
            return (
              <View key={ind} style={styles.QuizHeader}>
                <ListItem>
                  <View style={styles.QuestionView}>

                    <View style={styles.QuestionParent}>
                      <View style={styles.FirstText}><Text>Q {ind + 1}</Text></View>
                      <View style={styles.QuestionText}><Text>{question.question}</Text></View>
                    </View>
                    <View>
                      {question.allAnswer.map((answer, index) => {

                        return (
                          <View style={styles.SelectionParent} key={index}>
                            <View style={styles.FirstText}>
                              <Radio
                                onPress={() => this.checkedCheckbox(answer, ind)}
                                color={"#f0ad4e"}
                                selectedColor={"#5cb85c"}
                                selected={question.userSelectedAnswer && question.userSelectedAnswer == answer ? true : false}
                              />
                            </View>
                            <View><Text>{answer}</Text></View>
                          </View>)
                      })}
                    </View>
                  </View>
                </ListItem>
              </View>
            )
          })
          }
          <View style={styles.ButtonSubmit}>
            <Button full style={styles.SubmitButton} onPress={this.submitQuiz}><Text style={{ letterSpacing: 2 }}>Submit</Text></Button>
          </View>
        </ScrollView >
      )
    }
    return (
      <View style={styles.container}>
        <Spinner color="white" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#80CBC4',
  },
  Button: {
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: "white",
    height: 60,
    width: 350,
    borderRadius: 10,
  },
  QuizHeader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  FirstText:{ width: "10%" },
  QuizHeaderText: {
    letterSpacing: 2, fontSize: 25
  },
  SelectionParent:{ flexDirection: 'row', padding: 10 },
  ButtonSubmit:{ paddingVertical: 10 },
  QustionText:{ justifyContent: 'space-evenly' },
  QuestionView:{ paddingVertical: 5, width: "98%", paddingRight: 5 },
  letterSpacing:{
    letterSpacing: 2,
  },
  QuestionParent:{ flexDirection: "row" },
  SubmitButton: {
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: "white",
    height: 60,
    backgroundColor: '#80CBC4',
    width: 350,
    borderRadius: 10,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
