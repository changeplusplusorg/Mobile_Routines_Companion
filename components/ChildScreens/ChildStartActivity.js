import React, { Component } from "react";
import {
  Dimensions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { AppLoading } from "expo";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import Environment from "../../database/sqlEnv";
import UserInfo from "../../state/UserInfo";

Icon.loadFont();

const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");

export default class ChildStartActivity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prevScreenTitle: this.props.navigation.state.params.prevScreenTitle,
      currentRoutine: this.props.navigation.state.params.currentRoutine,
      routineId: this.props.navigation.state.params.routineId,
      rewardId: this.props.navigation.state.params.rewardId,
      requiresApproval: this.props.navigation.state.params.requiresApproval,
      amountOfActivities: this.props.navigation.state.params.amountOfActivities,
    };
    const { navigate } = this.props.navigation;
    this.navigate = navigate;
    ChildStartActivity.navigationOptions.headerBackTitle = this.props.navigation.state.params.currentRoutine;
  }

  //Header titles for routines
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.currentRoutine}`,
  });

  async insertChildNotification(){
    console.log("inserting child notification");

    const parentId = UserInfo.parent_id;
    const childId = UserInfo.child_id;
    const userId = UserInfo.user_id;

    
      var data = {
        child_id: childId,
        routine_id: this.state.routineId,
        parent_id: parentId,
        is_attempted: 1,
        is_approved: 0,
        in_progress: 1,
        is_evaluated: 0,
        requires_approval: this.state.requiresApproval,
        amount_of_activities: this.state.amountOfActivities,
        reward_id: this.state.rewardId,
        activities_complete: 0,
        quick_start_activity_id: 0
      };
      let response = await fetch(
        Environment + "/insertChildRoutineNotifications" ,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      )
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      })
      .then((results) => {
        console.log("inserted a notification!!! " + results.child_notifications_id);
        this.navigate("ChildActivity", {
          prevScreenTitle: "My Routines",
          currentRoutine: this.state.currentRoutine,
          routineId: this.state.routineId,
          rewardId: this.state.rewardId,
          requiresApproval: this.state.requiresApproval,
          childNotificationsId: results.insertId,
          image_path_array: ' ',
        });
      })
      .catch((error) => {
        console.error(error);
      });
    }

  render() {
    return (
      <View style={{ alignItems: "center", flex: 1, justifyContent: "center" }}>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => {
            // Create a notification in db
            if (this.state.amountOfActivities > 0){
              this.insertChildNotification();
            }

            // Leaving this here for testing the badge page, removing later
            else{
              const { navigate } = this.props.navigation;
              this.navigate("ChildActivity", {
                prevScreenTitle: "My Routines",
                currentRoutine: this.state.currentRoutine,
                routineId: this.state.routineId,
                rewardId: this.state.rewardId,
                requiresApproval: this.state.requiresApproval,
              });
            }
          }}
        >
          <Text style={styles.textStyle}>Start Routine</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  activities: {
    backgroundColor: "#FF6978",
    padding: WIDTH * 0.01,
    margin: WIDTH * 0.01,
    borderRadius: 1,
    width: WIDTH * 0.98,
    height: HEIGHT,
  },
  actTitle: {
    fontSize: 25,
    padding: 10,
    marginLeft: 20,
  },
  desc: {
    fontSize: 20,
    padding: 10,
    marginBottom: 10,
  },
  backgroundVideo: {
    position: "relative",
  },
  badgeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#fff",
  },
  buttonStyle: {
    padding: 10,
    marginBottom: 50,
    marginTop: 10,
    backgroundColor: "#FF6978",
    borderRadius: 5,
  },
  textStyle: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
  },
  image: {
    flexDirection: "row",
    flexWrap: "wrap",
    margin: 30,
  },
  section: {
    fontSize: 25,
    alignItems: "center",
    margin: 30,
  },
  buttonStyle: {
    width: 300,
    padding: 10,
    margin: 20,
    backgroundColor: "#B1EDE8",
    borderRadius: 100,
  },
  button: {
    fontSize: 30,
    minWidth: 150,
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    margin: 5,
    padding: 2,
    shadowColor: "grey",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
});
