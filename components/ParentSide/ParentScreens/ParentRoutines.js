// TODO: move activitites page and tab over to allActivitiesDictionary
// rather than allActivities
import React, { Component } from "react";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RaisedTextButton } from "react-native-material-buttons";
import {
  MenuProvider,
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import MaterialTabs from "react-native-material-tabs";
import Dialog, { DialogContent } from "react-native-popup-dialog";
import SearchableDropdown from "react-native-searchable-dropdown";
import { AppLoading } from "expo";

import Environment from "../../../database/sqlEnv";
import UserInfo from "../../../state/UserInfo";

const { width: WIDTH } = Dimensions.get("window");
const parentId = UserInfo.parent_id;
const childId = UserInfo.child_id;
const userId = UserInfo.user_id;
const pincode = UserInfo.pincode;

Icon.loadFont();

export default class ParentRoutines extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: "Routines",
    prevScreenTitle: "Routines",
    activeTab: 2,
  });

  constructor() {
    super();
    this.state = {
      routinesLoaded: false,
      activitiesLoaded: false,
      routines: null,
      allActivities: null,
      index: 0,
      selectedTab: 0,
      routes: [{ key: "1", title: "First" }, { key: "2", title: "Second" }],
      visible1: true,
      allRewardsByIdDictionary: null,
      allActivitiesDictionary: null,
    };
  }

  _renderScene = ({ route }) => {
    switch (route.key) {
      case "1":
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: "#ff4081",
            }}
          />
        );
      case "2":
        return (
          <View
            style={{
              flex: 1,
              backgroundColor: "#673ab7",
            }}
          />
        );
      default:
        return null;
    }
  };

  _renderPage = (props) => (
    <TabViewPage {...props} renderScene={this._renderScene} />
  );

  // This allows this page to refresh when you come back from
  // edit routines, which allows it to display any changes made
  async componentDidMount() {
    await this.props.navigation.addListener("didFocus", (payload) => {
      console.log("reloading items")
      this.setState({ routinesLoaded: false });
      this.setState({ activitiesLoaded: false });
      this.getRoutines();
      this.getAllActivitiesForUser();
      this.getAllRewardsForUser();
      if (this.state.activitiesLoaded){
        console.log("activities loaded again");
        this.displayActivities();
      }
      if (this.state.routinesLoaded){
        console.log("routines loaded again");
        this.displayRoutines();
      }
    });
  }

  getRoutines() {
    fetch(Environment + "/getRoutinesByUser/" + userId, {
      headers: {
        "Cache-Control": "no-cache",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      })
      .then((routineResults) => {
        this.setState({ routines: routineResults });
        this.setState({ routinesLoaded: true });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  checkActivityAmount(routineId, amountOfActivities){
    console.log("routine id is " + routineId);
    fetch(Environment + "/getAmountOfActivitiesInRoutine/" + routineId, {
      headers: {
        "Cache-Control": "no-cache",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      })
      .then((activities) => {
        console.log(activities)
        if (activities === []){
          console.log("returning 0");
          return 0;
        }
        console.log("LENGTH IS " + Object.keys(activities).length)
        if (activities.length !== amountOfActivities){
          this.updateAmountOfActivities(routineId, activities.length);
          console.log("returning activities.length " + activities.length);
          return activities.length;
        }
        else{
          console.log("returning amount of activities " + amountOfActivities);
          return amountOfActivities;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // Having issues with this. might move to on login.
  confirmAmountOfActivities(routineId, amountOfActivities) {
    return this.checkActivityAmount(routineId, amountOfActivities);
  }


  updateAmountOfActivities(routineId, value) {
    console.log("updating amount of activities in " + routineId + " to " + value);
    var data = {
      amount_of_activities: value,
    };
    try {
      let response = fetch(
        Environment + "/updateRoutine/" + routineId,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (response.status >= 200 && response.status < 300) {
        console.log("SUCCESS: updated amount of activities");
        return value;
      }
    } catch (errors) {
      console.log(errors);
    }
  }


  // TODO: get each activity, sum the reward_id != null
  getTotalRewardsInRoutine(routineId) {
    fetch(Environment + "/getActivitiesWithRewardsPerRoutine/" + routineId)
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      })
      .then((rewards) => {
        console.log("RETURNED REWARDS ");
        console.log("LENGTH IS " + rewards.length);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  getAllRewardsForUser() {
    fetch(Environment + "/getAllRewards/" + userId, {
      headers: {
        "Cache-Control": "no-cache",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      })
      .then((rewardsResults) => {
        this.createRewardDictionary(rewardsResults);
      })
      .catch((error) => {
        console.error(error);
      });
     
  }

  createRewardDictionary(rewardsResults) {
    var tempDict = {};
    rewardsResults.map((item) => {
      tempDict[item.reward_id] = item;
    });

    this.setState({ allRewardsByIdDictionary: tempDict });
    console.log(this.state.allRewardsByIdDictionary);
  }

  createActivityDictionary() {
    var tempDict = {};
    this.state.allActivities.map((item) => {
      tempDict[item.activity_id] = item;
    });
    this.setState({ allActivitiesDictionary: tempDict });
    this.setState({ activitiesLoaded: true });
  }

  getAllActivitiesForUser() {
    fetch(Environment + "/getActivities/" + userId, {
      headers: {
        "Cache-Control": "no-cache",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        return responseJson;
      })
      .then((activitiesResults) => {
        this.setState({ allActivities: activitiesResults });
        this.createActivityDictionary();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // This is how you update a column in the routines table
  async changeActiveStatus(routineId, tag, value) {
    if (value === 1) {
      value = 0;
    } else {
      value = 1;
    }
    var data = {
      [tag]: value,
    };
    try {
      let response = await fetch(Environment + "/updateRoutine/" + routineId, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.status >= 200 && response.status < 300) {
        this.getRoutines();
        this.displayRoutines();
      }
    } catch (errors) {
      console.log(errors);
    }
  }

  tabIsRoutines() {
    if (this.state.selectedTab === 0) {
      return true;
    }
    return false;
  }

  // This changes the menu text to active or inactive
  setActiveText(activeStatus, currentRoutineId) {
    if (activeStatus === 1) {
      return "Set Inactive";
    }
    return "Set Active";
  }

  displayLibraryContainer() {
    let ripple = { id: "addButton" };
    return (
      <View style={styles.routineContainer}>
        <RaisedTextButton
          style={styles.roundAddButton}
          title="+"
          color="#FF6978"
          onSelect={() =>
            this.props.navigation.navigate("PublicActivities", {
              prevScreenTitle: "Routines",
            })
          }
          ripple={ripple}
        />

        <Text style={styles.routineTitle}>Add a Public Activity</Text>
      </View>
    );
  }

  displayNewActivityContainer() {
    let ripple = { id: "addButton" };

    return (
      <View style={styles.routineContainer}>
        <RaisedTextButton
          style={styles.roundAddButton}
          title="+"
          color="#FF6978"
          onPress={
            (this._onPress,
            () =>
              this.props.navigation.navigate("EditActivity", {
                prevScreenTitle: "Routines",
                activityName: null,
                activityId: null,
                activityImagePath: null,
                activityDescription: null,
                activityAudioPath: null,
                activityVideoPath: null,
                rewardId: null,
                activityTags: [],
                isPublic: 0,
                allRewardsByIdDictionary: this.state.allRewardsByIdDictionary,
              }))
          }
          ripple={ripple}
        />
        <Text style={styles.routineTitle}>Create a New Activity</Text>
      </View>
    );
  }

  displayNewRoutineContainer() {
    let ripple = { id: "addButton" };

    return (
      <View style={styles.routineContainer}>
        <RaisedTextButton
          style={styles.roundAddButton}
          title="+"
          color="#FF6978"
          onPress={
            (this._onPress,
            () =>
              this.props.navigation.navigate("EditRoutine", {
                prevScreenTitle: "Routines",
                routineId: null,
                routineName: null,
                startTime: "00:00",
                endTime: "00:00",
                requiresApproval: 0,
                amount_of_activities: 0,
                amount_of_rewards: 0,
                monday: 0,
                tuesday: 0,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0,
                sunday: 0,
                rewardId: 0,
                allActivities: this.state.allActivities,
                allActivitiesDictionary: this.state.allActivitiesDictionary,
                allRewardsByIdDictionary: this.state.allRewardsByIdDictionary,
              }))
          }
          ripple={ripple}
        />

        <Text style={styles.routineTitle}>New Routine</Text>
      </View>
    );
  }

  displayActivities() {
    let ripple = { id: "addButton" };

    return this.state.allActivities.map((item) => {
      return (
        <View style={styles.routineContainer}>
          <View style={styles.routineTitleAndMenu}>
            <Text style={styles.routineTitle}> {item.activity_name}</Text>
            <MenuProvider>
              <View style={styles.routineTitleAndMenu}>
                <Text style={styles.routineTitle}> {item.routine_name}</Text>
                <Menu style={styles.routineMenuStyling}>
                  <MenuTrigger style={styles.ellipsis} text="..." />
                  <MenuOptions>
                    <MenuOption
                      onSelect={() =>
                        this.props.navigation.navigate("EditActivity", {
                          prevScreenTitle: "Routines",
                          activityName: item.activity_name,
                          activityId: item.activity_id,
                          activityTags: item.tags.split(","),
                          activityImagePath: item.image_path,
                          activityDescription: item.activity_description,
                          activityAudioPath: item.audio_path,
                          activityVideoPath: item.video_path,
                          activityIsPublic: item.is_public,
                          rewardId: item.reward_id,
                          allRewardsByIdDictionary: this.state
                            .allRewardsByIdDictionary,
                        })
                      }
                      ripple={ripple}
                    >
                      <Text style={{ color: "black" }}>Edit</Text>
                    </MenuOption>
                    <MenuOption
                      onSelect={() => alert("QuickStart")}
                      text="Quick Start"
                    />
                      <MenuOption
                      onSelect={() => alert("Duplicate")}
                      text="Duplicate"
                    />
                    {/* TODO: set up delete activity method */}
                    <MenuOption onSelect={() => alert("Delete")}>
                      <Text style={{ color: "red" }}>Delete</Text>
                    </MenuOption>
                  </MenuOptions>
                </Menu>
              </View>
            </MenuProvider>
          </View>
        </View>
      );
    });
  }

  displayRoutines() {
    var containerName;

    console.log("Rewards in display routines");
    console.log(this.state.allRewards);
    // parse out the db objects returned from the routines call
    return this.state.routines.routines.map((item) => {

      if (item.is_active === 0) {
        containerName = "inactiveRoutineContainer";
      } else {
        containerName = "routineContainer";
      }

      return (
        <View style={styles[containerName]}>
          <MenuProvider>
            <View style={styles.routineTitleAndMenu}>
              <Text style={styles.routineTitle}> {item.routine_name}</Text>
              <Menu style={styles.routineMenuStyling}>
                <MenuTrigger style={styles.ellipsis} text="..." />
                <MenuOptions>
                  <MenuOption
                    onSelect={() =>
                      this.props.navigation.navigate("EditRoutine", {
                        prevScreenTitle: "Routines",
                        routineName: item.routine_name,
                        routineId: item.routine_id,
                        startTime: item.start_time,
                        endTime: item.end_time,
                        requiresApproval: item.requires_approval,
                        monday: item.monday,
                        tuesday: item.tuesday,
                        wednesday: item.wednesday,
                        thursday: item.thursday,
                        friday: item.friday,
                        saturday: item.saturday,
                        sunday: item.sunday,
                        amount_of_activities: item.amount_of_activities,
                        amount_of_rewards: item.amount_of_rewards,
                        allActivities: this.state.allActivities,
                        rewardId: item.reward_id,
                        allRewardsByIdDictionary: this.state
                          .allRewardsByIdDictionary,
                        allActivitiesDictionary: this.state
                          .allActivitiesDictionary,
                      })
                    }
                  >
                    <Text style={{ color: "black" }}>Edit</Text>
                  </MenuOption>
                  <MenuOption
                    onSelect={() =>
                      this.changeActiveStatus(
                        item.routine_id,
                        "is_active",
                        item.is_active
                      )
                    }
                    text={this.setActiveText(item.is_active, item.routine_id)}
                  />
                  <MenuOption
                    onSelect={() => alert("Duplicate")}
                    text="Duplicate"
                  />
                  <MenuOption
                    onSelect={() => alert("QuickStart")}
                    text="Quick Start"
                  />
                  <MenuOption
                    onSelect={() => alert("Add Tag")}
                    text="Add Tag"
                  />
                  {/* TODO: set up delete routine method */}
                  <MenuOption onSelect={() => alert("Delete")}>
                    <Text style={{ color: "red" }}>Delete</Text>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>

            <View style={styles.routineDetailsPreview}>
              <Text style={styles.routineDetails}>
                <Icon name="playlist-check" style={styles.routineDetailsIcon} />{" "}
                
                {/* TODO: move the routines activity amount check somewhere else */}
                {/* {console.log("ITS " + this.confirmAmountOfActivities(item.routine_id, item.amount_of_activities))} */}
                {/* Activities:{" "}{this.confirmAmountOfActivities(item.routine_id, item.amount_of_activities)}{" "} */}
                Activities:{" "}{item.amount_of_activities}{" "}
              </Text>
              <Text style={styles.routineDetails}>
                <Icon name="gift" style={styles.routineDetailsIcon} /> Rewards:{" "}
                {item.amount_of_rewards}{" "}
              </Text>
            </View>
          </MenuProvider>
        </View>
      );
    });
  }

  render() {
    if (this.state.routines !== null) {
    } else {
      console.log("this.state.routines is null :( ");
    }

    let ripple = { id: "addButton" };

    return (
      <View>
        {/* Routines and Activities tabs */}
        <SafeAreaView>
          <MaterialTabs
            items={["Routines", "Activities"]}
            selectedIndex={this.state.selectedTab}
            barColor="white"
            // barColor="#D7CBD2"
            indicatorColor="#B1EDE8"
            activeTextColor="black"
            inactiveTextColor="grey"
            onChange={(index) =>
              this.setState({
                selectedTab: index,
              })
            }
          />
        </SafeAreaView>

        {/* TESTING CONTAINER
        {!this.state.routinesLoaded && (
          <View style={{ marginTop: 100 }}>
            <Text style={{ marginLeft: 50 }}>:( this.stateroutinesLoaded is not true</Text>
          </View>
        )} */}
        <ScrollView>
          {this.state.routinesLoaded && (
            <View>
              {this.tabIsRoutines() && (
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  {this.displayRoutines()}
                  {this.displayNewRoutineContainer()}
                </View>
              )}
            </View>
          )}

          {this.state.activitiesLoaded && (
            <View>
              <ScrollView>
                {!this.tabIsRoutines() && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                  >
                    {this.displayActivities()}
                    {this.displayNewActivityContainer()}
                    {this.displayLibraryContainer()}
                  </View>
                )}
              </ScrollView>
            </View>
          )}
          <View>
            <View style={{ marginTop: 100 }} />
            {/* first dialog - yes/cancel */}
            {/* <Dialog
                           visible={this.state.visible1}
                           onTouchOutside={() => {
                             this.setState({
                               visible1: false,
                             });
                           }}>
                           <DialogContent style={styles.dialog}>
                             <Text style={styles.text}>
                               Check Off Routine
                             </Text>
                             <Text style={styles.subtext}>
                               Alex has marked his 'Before School' routine complete. 
                               Would you like to approve the routine to let Alex claim his reward?
                             </Text>
                             {/* <Text>This will log you out of the child mode. If you wish to switch from child to parent mode, you will need to enter your 4 digit passcode. Do you wish to continue the switch to parent mode of the app?</Text> */}

            {/* <Button
                               onPress={() => {
                                 this.props.navigation.navigate(
                                   'Task1',
                                   {
                                     prevScreenTitle:
                                       'ParentRoutines',
                                   },
                                 );
                                 this.setState( {visible1: false,},
                                 );
                               }}
                               title="Review Tasks"
                               color="#841584"
                               accessibilityLabel="Yes Button"
                             />
                             <Button
                               onPress={() => {
                                 Alert.alert('Task Approved!');
                               }}
                               title="Approve Task"
                               
                               color="#841584"
                               accessibilityLabel="Cancel Button"
                             />
                             <Button
                               onPress={() => {
                                 this.setState({
                                   visible1: false,
                                 });
                               }}
                               title="Cancel"
                               color="#841584"
                               accessibilityLabel="Cancel Button"
                             />
                           </DialogContent>
                         </Dialog> */}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  // RoutinesPage
  topContainer: {
    zIndex: 999,
  },
  text: {
    marginTop: 7,
    fontSize: 24,
    textAlign: "center",
    height: 100,
  },
  subtext: {
    marginTop: -40,
    fontSize: 20,
    textAlign: "center",
    textAlignVertical: "auto",
    width: 220,
    marginBottom: 25,
  },
  dialog: {
    backgroundColor: "#e1d8ff",
  },
  routineTitleAndMenu: {
    flexDirection: "row",
    flex: 1,
    overflow: "visible",
  },
  ellipsis: {
    flexDirection: "row",
    alignSelf: "flex-end",
    fontSize: 30,
    marginRight: 10,
    overflow: "visible",
  },
  routineTitle: {
    marginLeft: 4,
    marginTop: 2,
    fontSize: 14,
    textAlign: "center",
    flex: 1,
  },
  routineMenuStyling: {
    overflow: "visible",
    zIndex: 999,
  },
  routineDetailsIcon: {
    color: "#355C7D",
    fontSize: 14,
  },
  routineDetails: {
    fontSize: 12,
    zIndex: 2,
  },
  routineDetailsPreview: {
    zIndex: 2,
    marginBottom: 10,
    marginLeft: 5,
  },
  routineContainer: {
    width: WIDTH * 0.3,
    height: 150,
    marginTop: 20,
    marginBottom: 5,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    shadowOffset: { width: 5, height: 5 },
    shadowColor: "black",
    shadowOpacity: 0.1,
    borderWidth: 0,
    paddingTop: 10,
    overflow: "visible",
    marginLeft: 10,
    marginRight: 10,
  },
  inactiveRoutineContainer: {
    width: WIDTH * 0.3,
    height: 150,
    marginTop: 20,
    marginBottom: 5,
    justifyContent: "space-around",
    borderRadius: 10,
    backgroundColor: "#d3d3d3",
    shadowOffset: { width: 5, height: 5 },
    shadowColor: "black",
    shadowOpacity: 0.1,
    borderWidth: 0,
    paddingTop: 10,
    overflow: "visible",
    marginLeft: 10,
    marginRight: 10,
  },
  roundAddButton: {
    marginLeft: 6,
    fontSize: 30,
    height: 50,
    minWidth: 50,
    width: 50,
    borderRadius: 50,
    color: "#FFFFFF",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
