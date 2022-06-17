import React, { useLayoutEffect } from "react";
import styles from "../waiterPanel/StyleWaiterPanelScreen";
import { ImageBackground, TouchableOpacity, View, Image, Text } from "react-native";
import { userIcon, backgroundImage, logoutIcon, chatIcon, orderIcon, menuIcon, qrMenuIcon, surveyIcon, surveyResultIcon } from "../waiterPanel/AssetsWaiterPanelScreen";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { auth } from "../../../App";


const WaiterPanel = () => {

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
    const handleChat= () => {
      navigation.replace("Chat")
    }  

    const handleOrder= () => {
      navigation.replace("WaiterOrder")
    }    
    
    const handleMenu= () => {
      navigation.replace("Menu")
    } 

    const handleQrMenu= () => {
      navigation.replace("QrMenu")
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
            <Text style={styles.headerText}>MOZO</Text>
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

                  <TouchableOpacity onPress={handleChat} style={styles.buttonLayout}>
                    <View style={styles.RowContainerButtonLayout}>
                      <Image source={chatIcon} style={styles.buttonImage} />
                      <Text style={styles.buttonText}>RESPONDER CONSULTAS</Text>              
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleOrder} style={styles.buttonLayout}>
                    <View style={styles.RowContainerButtonLayout}>
                      <Image source={orderIcon} style={styles.buttonImage} />
                      <Text style={styles.buttonText}>VER ESTADO DE LAS MESAS</Text>              
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleMenu} style={styles.buttonLayout}>
                  <View style={styles.RowContainerButtonLayout}>
                    <Image source={menuIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>MENU</Text>              
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleQrMenu} style={styles.buttonLayout}>
                  <View style={styles.RowContainerButtonLayout}>
                    <Image source={qrMenuIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>MENU (QR)</Text>              
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSurvey} style={styles.buttonLayout}>
                  <View style={styles.RowContainerButtonLayout}>
                    <Image source={surveyIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>RELEVAMIENTO LUGAR DE TRABAJO</Text>              
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleOldEmployeeSurvey} style={styles.buttonLayout}>
                  <View style={styles.RowContainerButtonLayout}>
                    <Image source={surveyResultIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>VER ENCUESTAS DE OTROS EMPLEADOS</Text>              
                  </View>
                </TouchableOpacity>
                
                </View>                
            </ImageBackground>           
        </View>
    );
};

export default WaiterPanel;