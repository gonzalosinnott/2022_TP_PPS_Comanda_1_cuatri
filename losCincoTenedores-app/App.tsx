import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import Splash from './components/splashScreen/SplashScreen';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Oswald_200ExtraLight, Oswald_300Light, Oswald_400Regular, Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald';
import AppLoading from 'expo-app-loading';
const Stack = createNativeStackNavigator();

import { firebaseConfig } from './firebase';
import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import LoginScreen from './components/loginScreen/LoginScreen';
import AdminPanel from './components/controlPanels/adminPanel/AdminPanelScreen';
import BarPanel from './components/controlPanels/barPanel/BarPanelScreen';
import MetrePanel from './components/controlPanels/metrePanel/MetrePanelScreen';
import ChefPanel from './components/controlPanels/chefPanel/ChefPanelScreen';
import ClientPanel from './components/controlPanels/clientPanel/ClientPanelScreen';
import WaiterPanel from './components/controlPanels/waiterPanel/WaiterPanelScreen';
import AdminRegistration from './components/userRegistration/adminRegistration/AdminRegistrationScreen';
import ClientRegistration from './components/userRegistration/clientRegistration/ClientRegistrationScreen';
import EmployeeRegistration from './components/userRegistration/employeeRegistration/EmployeeRegistrationScreen';
import TableRegistration from './components/userRegistration/tableRegistration/TableRegistrationScreen';
import ProductRegistration from './components/userRegistration/productRegistration/ProductRegistrationScreen';

import TablePanel from './components/controlPanels/tablePanel/TablePanelScreen';
import NewClientSurvey from './components/surveys/clientSurvey/ClientSurveyScreen';
import AdminSurvey from './components/surveys/adminSurvey/AdminSurveyScreen';
import EmployeeSurvey from './components/surveys/employeeSurvey/EmployeeSurveyScreen';
import OldClientSurvey from './components/surveys/oldClientSurvey/OldClientSurveyScreen';
import ChatScreen from './components/chatScreen/ChatScreen';
import MenuScreen from './components/menuScreen/MenuScreen';
import ClientOrder from './components/userManagement/clientOrderManagement/ClientOrderScreen';
import WaiterOrder from './components/userManagement/waiterOrderManagement/WaiterOrderScreen';
import ClientManagment from './components/userManagement/clientManagement/ClientManagmentScreen';
import WaitingListManagment from './components/userManagement/waitingListManagement/WaitingListManagmentScreen';
import ProductOrder from './components/userManagement/productOrderManagement/ProductOrderScreen';
import Pay from './components/userManagement/payManagement/PayScreen';
import { notificationsConfiguration } from './components/pushNotification/PushNotification';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

SplashScreen.preventAutoHideAsync()
  .catch(console.warn);

export default () => { 

  console.disableYellowBox = true;

  let [fontsLoaded] = useFonts({
    Oswald_200ExtraLight,
    Oswald_300Light,
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_600SemiBold,
    Oswald_700Bold,
  });

  useEffect(() => {
    notificationsConfiguration();
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 500);
  }, [])

  if (!fontsLoaded) {
    return (
      <AppLoading />
    )
  } else {
  return  (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen options =  {{ headerShown: false }}  name="SplashScreen" component={Splash} />
        <Stack.Screen options =  {{ headerShown: false }}  name="Login" component={LoginScreen} />
        <Stack.Screen options =  {{ headerShown: true }}  name="ControlPanelPropietario" component={AdminPanel} />
        <Stack.Screen options =  {{ headerShown: true }}  name="ControlPanelBar" component={BarPanel} />
        <Stack.Screen options =  {{ headerShown: true }}  name="ControlPanelMetre" component={MetrePanel} />
        <Stack.Screen options =  {{ headerShown: true }}  name="ControlPanelMozo" component={WaiterPanel} />
        <Stack.Screen options =  {{ headerShown: true }}  name="ControlPanelCocina" component={ChefPanel} />
        <Stack.Screen options =  {{ headerShown: true }}  name="ControlPanelCliente" component={ClientPanel} />
        <Stack.Screen options =  {{ headerShown: true }}  name="TableControlPanel" component={TablePanel} />
        <Stack.Screen options =  {{ headerShown: true }}  name="AdminRegistration" component={AdminRegistration} />
        <Stack.Screen options =  {{ headerShown: true }}  name="ClientRegistration" component={ClientRegistration} />
        <Stack.Screen options =  {{ headerShown: true }}  name="EmployeeRegistration" component={EmployeeRegistration} />
        <Stack.Screen options =  {{ headerShown: true }}  name="TableRegistration" component={TableRegistration} />
        <Stack.Screen options =  {{ headerShown: true }}  name="ProductRegistration" component={ProductRegistration} />
        <Stack.Screen options =  {{ headerShown: true }}  name="ClientManagment" component={ClientManagment} />
        <Stack.Screen options =  {{ headerShown: true }}  name="WaitingListManagment" component={WaitingListManagment} />
        <Stack.Screen options =  {{ headerShown: true }}  name="NewClientSurvey" component={NewClientSurvey} />
        <Stack.Screen options =  {{ headerShown: true }}  name="OldClientSurvey" component={OldClientSurvey} />
        <Stack.Screen options =  {{ headerShown: true }}  name="AdminSurvey" component={AdminSurvey} />
        <Stack.Screen options =  {{ headerShown: true }}  name="EmployeeSurvey" component={EmployeeSurvey} />
        <Stack.Screen options =  {{ headerShown: true }}  name="Chat" component={ChatScreen} />
        <Stack.Screen options =  {{ headerShown: true }}  name="Menu" component={MenuScreen} />
        <Stack.Screen options =  {{ headerShown: true }}  name="ClientOrder" component={ClientOrder} />
        <Stack.Screen options =  {{ headerShown: true }}  name="WaiterOrder" component={WaiterOrder} />
        <Stack.Screen options =  {{ headerShown: true }}  name="ProductOrder" component={ProductOrder} />
        <Stack.Screen options =  {{ headerShown: true }}  name="Pay" component={Pay} />
      </Stack.Navigator>
    </NavigationContainer> );
      }      
}