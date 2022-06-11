import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "./StyleClientOrderScreen";
import { Image, ImageBackground, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { returnIcon, backgroundImage, cancelIcon } from "./AssetsClientOrderScreen";
import Modal from "react-native-modal";
import React, { useCallback, useLayoutEffect, useState } from 'react'
import RotatingLogo from "../../rotatingLogo/RotatingLogo";

const ClientOrder = () => {

  //CONSTANTES
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);

  //RETURN
  const handleReturn = () => {
    navigation.replace("TableControlPanel")
  }

  //TOOGLE SPINNER
  const toggleSpinnerAlert = () => {
    setModalSpinnerVisible(true);
    setTimeout(() => {
      setModalSpinnerVisible(false);
    }, 3000);
  }; 

  //HEADER
  useLayoutEffect(() => {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity onPress={handleReturn}>
              <Image source={returnIcon} style={styles.headerIcon}/>
          </TouchableOpacity>
        ),
        headerTitle: () => (
          <Text style={styles.headerText}>EVALUACION DE DESEMPEÑO LABORAL</Text>
        ),
        headerTintColor: "transparent",
        headerBackButtonMenuEnabled: false,
        headerStyle: {
          backgroundColor: 'rgba(61, 69, 68, 0.4);',
        },         
      });
    }, []);

  return (
    <View style={styles.container}>
      <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.backgroundImage} imageStyle = {{opacity:0.5}}>
      
      <View style={styles.body}>
      

      </View> 

      <View>
        <Modal backdropOpacity={0.5} animationIn="rotate" animationOut="rotate" isVisible={isModalSpinnerVisible}>
          <RotatingLogo></RotatingLogo>
        </Modal>
      </View>
      
      </ImageBackground>           
    </View> 
  );
};

export default ClientOrder;