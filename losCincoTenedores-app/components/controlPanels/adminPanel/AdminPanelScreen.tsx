import React, { useLayoutEffect } from "react";
import styles from "../adminPanel/StyleAdminPanelScreen";
import { ImageBackground, TouchableOpacity, View, Image, Text } from "react-native";
import { userIcon, backgroundImage, logoutIcon, adminIcon, employeeIcon, tableIcon, clientManagmentIcon, surveyResultIcon, surveyIcon } from "../adminPanel/AssetsAdminPanelScreen";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { auth } from "../../../App";


const AdminPanel = () => {

    //CONSTANTES
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    //LOGOUT
    const handleLogout = () => {
        auth
          .signOut()
          .then(() => {
            navigation.replace("Login")
          })
          .catch(error => alert(error.message))
    }

    //NAVIGATION
     const handleAdminRegister = () => {
      navigation.replace("AdminRegistration")
    }  
    
    const handleEmployeeRegister = () => {
      navigation.replace("EmployeeRegistration")
    } 

    const handleTableRegister = () => {
      navigation.replace("TableRegistration")
    } 

    const handleClientManagment = () => {
      navigation.replace("ClientManagment")
    } 

    const handleEmployeesList = () => {
      navigation.replace("AdminSurveyManagment")
    } 

    const handleSurveyResults = () => {
      navigation.replace("OldAdminSurvey")
    } 
    
    //HEADER
    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <Image source={userIcon} style={styles.headerIcon} />
             ),
          headerTitle: () => (
            <Text style={styles.headerText}>DUEÑO / SUPERVISOR</Text>
          ),
          headerTintColor: "transparent",
          headerBackButtonMenuEnabled: false,
          headerStyle: {
            backgroundColor: 'rgba(61, 69, 68, 0.4);',
          },
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout}>
                <Image source={logoutIcon} style={styles.headerIcon}/>
            </TouchableOpacity>
         )
        });
      }, []);
    
    return (
        <View style={styles.container}>
            <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.backgroundImage} imageStyle = {{opacity:0.5}}>
                <View style={styles.body}>

                  <TouchableOpacity onPress = { handleAdminRegister } style={styles.buttonLayout}>
                    <View style={styles.registerButtonLayout}>
                      <Image source={adminIcon} style={styles.buttonImage} />
                      <Text style={styles.buttonText}>ALTA DE DUEÑO / SUPERVISOR</Text>              
                    </View>
                  </TouchableOpacity> 

                  <TouchableOpacity onPress = { handleEmployeeRegister } style={styles.buttonLayout}>
                  <View style={styles.registerButtonLayout}>
                      <Image source={employeeIcon} style={styles.buttonImage} />
                      <Text style={styles.buttonText}>ALTA DE EMPLEADO</Text>              
                    </View>
                  </TouchableOpacity> 

                  <TouchableOpacity onPress = { handleTableRegister } style={styles.buttonLayout}>
                  <View style={styles.registerButtonLayout}>
                      <Image source={tableIcon} style={styles.buttonImage} />
                      <Text style={styles.buttonText}>ALTA DE MESA</Text>              
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress = { handleClientManagment } style={styles.buttonLayout}>
                  <View style={styles.registerButtonLayout}>
                      <Image source={clientManagmentIcon} style={styles.buttonImage} />
                      <Text style={styles.buttonText}>APROBACIÓN DE NUEVOS CLIENTES</Text>              
                    </View>
                  </TouchableOpacity>  

                  <TouchableOpacity onPress={handleEmployeesList} style={styles.buttonLayout}>
                  <View style={styles.registerButtonLayout}>
                    <Image source={surveyIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>EVALUACIÓN DE EMPLEADOS</Text>              
                  </View>
                </TouchableOpacity>   

                <TouchableOpacity onPress={handleSurveyResults} style={styles.buttonLayout}>
                  <View style={styles.registerButtonLayout}>
                    <Image source={surveyResultIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>VER VALUACIONES PREVIAS</Text>              
                  </View>
                </TouchableOpacity>

                </View>                
            </ImageBackground>           
        </View>
    );
};

export default AdminPanel;