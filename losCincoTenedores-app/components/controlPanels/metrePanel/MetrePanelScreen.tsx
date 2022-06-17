import React, { useLayoutEffect } from "react";
import styles from "../metrePanel/StyleMetrePanelScreen";
import { ImageBackground, TouchableOpacity, View, Image, Text } from "react-native";
import { userIcon, backgroundImage, logoutIcon, clientIcon, waitingListIcon, surveyIcon, surveyResultIcon } from "../metrePanel/AssetsMetrePanelScreen";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { auth } from "../../../App";


const MetrePanel = () => {

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
    const handleClientRegister = () => {
      navigation.replace("ClientRegistration")
    }
    
    const handleClientEntry = () => {
      navigation.replace("WaitingListManagment")
    }

    //NAVIGATION
    const handleSurvey= () => {
      navigation.replace("EmployeeSurvey")
    }

    //NAVIGATION
    const handleOldEmployeeSurvey= () => {
      navigation.replace("OldEmployeeSurvey")
      }  
    
    //HEADER
    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <Image source={userIcon} style={styles.headerIcon} />
             ),
          headerTitle: () => (
            <Text style={styles.headerText}>METRE</Text>
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

                <TouchableOpacity onPress = { handleClientRegister } style={styles.buttonLayout}>
                    <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start', }}>
                      <Image source={clientIcon} style={styles.buttonImage} />
                      <Text style={styles.buttonText}>ALTA DE CLIENTE</Text>              
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress = { handleClientEntry } style={styles.buttonLayout}>
                    <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start', }}>
                      <Image source={waitingListIcon} style={styles.buttonImage} />
                      <Text style={styles.buttonText}>LISTA DE ESPERA</Text>              
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleSurvey} style={styles.buttonLayout}>
                  <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start', }}>
                    <Image source={surveyIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>RELEVAMIENTO LUGAR DE TRABAJO</Text>              
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleOldEmployeeSurvey} style={styles.buttonLayout}>
                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start', }}>
                    <Image source={surveyResultIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>VER ENCUESTAS DE OTROS EMPLEADOS</Text>              
                  </View>
                </TouchableOpacity>
                
                </View>                
            </ImageBackground>           
        </View>
    );
};

export default MetrePanel;