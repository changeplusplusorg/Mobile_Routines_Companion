import React, { Component } from 'react';

import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack';
import Login from './Login';
import SignUp from './SignUp';
import ForgotPassowrd from './ForgotPassword';
import Pincode from './Pincode';

import ParentNavigation from './ParentSide/ParentNavigation';
import ParentRewards from './ParentSide/ParentScreens/ParentRewards';
import EditReward from './ParentSide/ParentScreens/EditReward';
import ParentProfile from './ParentSide/ParentScreens/ParentProfile';
import EditRoutine from './ParentSide/ParentScreens/EditRoutine';
import ParentRoutines from './ParentSide/ParentScreens/ParentRoutines';
import EditActivity from './ParentSide/ParentScreens/EditActivity';
import Progress from './ParentSide/ParentScreens/Progress';
// import Notifications from './ParentSide/ParentScreens/Notifications';

import ChildRoutines from './ChildScreens/ChildNavigation';
import ChildActivity from './ChildScreens/ChildActivity';
import ChildPincode from './ChildScreens/ChildPincode';
import ChildNotifScreen from './ChildScreens/ChildNotifScreen';
import ChildRewards from './ChildScreens/ChildRewards';
import ChildMap from './ChildScreens/ChildMap';
import ChildStartActivity from './ChildScreens/ChildStartActivity';

import Camera from '../components/ImageRecognition/Camera';
import ChildCamera from '../components/ImageRecognition/ChildCamera';

import TestingHomePage from './TestingHomePage';

const Screens = createStackNavigator({
  TestingHomePage: {screen: TestingHomePage},
  Login: {screen: Login},
  SignUp: {screen: SignUp},
  Pincode: {screen: Pincode},
  ForgotPassword: {screen: ForgotPassowrd},
  Camera: {screen:Camera},
  ChildCamera: {screen: ChildCamera },    

  ParentNavigation: {screen: ParentNavigation},
  ParentRoutines: {screen: ParentRoutines},
  EditActivity: {screen: EditActivity},
  ParentRewards : {screen:ParentRewards},
  EditReward: {screen:EditReward},
  ParentProfile: {screen:ParentProfile},
  EditRoutine: {screen:EditRoutine},
  Progress: {screen: Progress},
  // Notifications: {screen: Notifications},

  ChildPincode: {screen:ChildPincode},
  ChildNotifScreen: {screen:ChildNotifScreen},
  ChildRoutines: {screen: ChildRoutines},
  ChildActivity: {screen:ChildActivity},
  ChildMap: {screen:ChildMap},
  ChildRewards: {screen:ChildRewards},
  ChildStartActivity: {screen:ChildStartActivity}
});

const App = createAppContainer(Screens);
export default App;

