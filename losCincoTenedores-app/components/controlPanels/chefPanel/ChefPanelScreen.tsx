import React, { useLayoutEffect } from "react";
import styles from "../chefPanel/StyleChefPanelScreen";
import { ImageBackground, TouchableOpacity, View, Image, Text } from "react-native";
import { userIcon, backgroundImage, logoutIcon, productIcon, ordersIcon } from "../chefPanel/AssetsChefPanelScreen";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { auth } from "../../../App";


const ChefPanel = () => {

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
    const handleProductRegister = () => {
      navigation.replace("ProductRegistration")
    } 
    
    const handleOrders = () => {
      navigation.replace("ProductOrder")
    } 
    
    //HEADER
    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <Image source={userIcon} style={styles.headerIcon} />
             ),
          headerTitle: () => (
            <Text style={styles.headerText}>COCINERO</Text>
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

                <TouchableOpacity onPress = { handleProductRegister } style={styles.buttonLayout}>
                  <View style={styles.registerButtonLayout}>
                    <Image source={productIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>ALTA DE PRODUCTO</Text>              
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress = { handleOrders } style={styles.buttonLayout}>
                  <View style={styles.registerButtonLayout}>
                    <Image source={ordersIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>VER PEDIDOS PENDIENTES</Text>              
                  </View>
                </TouchableOpacity>
                
                </View>                
            </ImageBackground>           
        </View>
    );
};

export default ChefPanel;