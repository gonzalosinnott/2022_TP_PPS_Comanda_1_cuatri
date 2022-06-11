import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import styles from "../tablePanel/StyleTablePanelScreen";
import { StyleSheet, ImageBackground, TouchableOpacity, View, Image, Text } from "react-native";
import { backgroundImage, chatIcon, logoutIcon, menuIcon, orderIcon, payIcon, qrIcon, surveyIcon, surveyResultIcon, tableIcon } from "../tablePanel/AssetsTablePanelScreen";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { auth, db } from "../../../App";
import { Camera } from "expo-camera";
import { BarCodeScanner } from "expo-barcode-scanner";
import Toast from 'react-native-simple-toast';
import { collection, getDocs, query, where } from "firebase/firestore";
import Modal from "react-native-modal";
import RotatingLogo from "../../rotatingLogo/RotatingLogo";

const TablePanel = () => {

    //CONSTANTES
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [openQR, setOpenQR] = useState(false);
    const [tableNumber, setTableNumber] = useState('');
    const [assignedTable, setAssignedTable] = useState(false);
    

    //REFRESH DE LA DATA
    useFocusEffect(
      useCallback(() => {
        toggleSpinnerAlert();
        checkClientStatus();
    }, []))

    //TOOGLE SPINNER
    const toggleSpinnerAlert = () => {
      setModalSpinnerVisible(true);
      setTimeout(() => {
        setModalSpinnerVisible(false);
      }, 3000);
    }; 

    //SETEO INICIAL DE DATA Y PARA LOS RETURN
    const checkClientStatus = async () => {
      const query1 = query(collection(db, "waitingList"), where("user", "==", auth.currentUser?.email), where("status", "==", "assigned"));
      const querySnapshot1 = await getDocs(query1);
      if(querySnapshot1.size > 0){
        setAssignedTable(true);
        const query2 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email));
        const querySnapshot2= await getDocs(query2);
        querySnapshot2.forEach(async (doc) => {
          setTableNumber(doc.data().tableNumber);
        });
      }
    }

    //LOGOUT
    const handleLogout = () => {
        auth
          .signOut()
          .then(() => {
            navigation.replace("Login")
          })
          .catch(error => alert(error.message))
    }

     //PERMISOS CAMARA
     useEffect(() => {
      (async () => {
          await Camera.requestCameraPermissionsAsync();
          await BarCodeScanner.requestPermissionsAsync();
      })();
    }, [])

    //COMPLETADO DEL FORM A PARTIR DEL QR
    const handleBarCodeScanned = async ({ data }) => {
      setScanned(true);
      setOpenQR(false);
      const dataSplit = data.split('@');
      const qrType = dataSplit[0];
      const tableNumberQR = dataSplit[1];
      console.log(qrType);
      console.log(tableNumberQR);
      //MANEJO QR MESA
      if(qrType === 'mesa'){
        handleTable(tableNumberQR);
      }
      else {
        Toast.showWithGravity(
          "NO ES UN QR DE MESA",
          Toast.LONG,
          Toast.CENTER);
      }
    };

    //MANEJADOR MESA
    const handleTable = async (tableNumberQR) => {
      if(assignedTable){
        //CHEQUEAR ACA SI TIENE PEDIDO EN CURSO
        //Y SINO MOSTAR ESTE MENSAJE
        Toast.showWithGravity(
          "YA TIENE UNA MESA ASIGNADA",
          Toast.LONG,
          Toast.CENTER);
          return;
      }
      const query1 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR));
      const querySnapshot1 = await getDocs(query1);
      if(querySnapshot1.size > 0){
        setTableNumber(tableNumberQR);
        setAssignedTable(true);
      }
      else {
        Toast.showWithGravity(
          "TODAVIA NO SE LE ASIGNO MESA O ESCANEO UN QR DE OTRA MESA",
          Toast.LONG,
          Toast.CENTER);
      } 
    }

    //MANEJADOR DEL QR Y CAMARA
    const handleOpenQR = () => {
      setScanned(false);
      setOpenQR(true);
    }         
    
    //HEADER
    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <Image source={tableIcon} style={styles.headerIcon} />
             ),
          headerTitle: () => (
            <Text style={styles.headerText}>MESA</Text>
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
      
    //NAVIGATION
    const handleNewClientSurvey= () => {
      navigation.replace("NewClientSurvey")
    }
    
    //NAVIGATION
    const handleOldClientSurvey= () => {
      navigation.replace("OldClientSurvey")
    }  

    //NAVIGATION
    const handleOrder= () => {
      navigation.replace("ClientOrder")
    } 

    //NAVIGATION
    const handleChat= () => {
      navigation.replace("Chat")
    }  

    //NAVIGATION
    const handleMenu= () => {
      navigation.replace("Menu")
    }  
    
    return (
      !openQR ?
      <View style={styles.container}>
          <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.backgroundImage} imageStyle = {{opacity:0.5}}>
              <View style={styles.body}>

                <View style={styles.rowContainer}>
                  
                    {!assignedTable ?
                    (
                      <View style={styles.buttonLayoutHeader}>
                        <Text style={styles.buttonText}>ESCANEE EL CODIGO QR</Text>
                        <Text style={styles.buttonText}>PARA INGRESAR A SU MESA</Text>
                      </View>)
                    :
                    (<View style={styles.buttonLayoutHeader}>
                      <Text style={styles.buttonText}>MESA NUMERO {tableNumber}</Text>
                      <Text style={styles.buttonText}>ESCANEE EL CODIGO QR PARA</Text>
                      <Text style={styles.buttonText}>VER EL ESTADO DE SU PEDIDO</Text>
                    </View>)}

                  <TouchableOpacity onPress={handleOpenQR}>
                    <Image style={styles.qrIcon} resizeMode="cover" source={qrIcon} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleOldClientSurvey} style={styles.buttonLayout}>
                  <View style={styles.tableButtonLayout}>
                    <Image source={surveyResultIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>VER ENCUESTAS DE OTROS CLIENTES</Text>              
                  </View>
                </TouchableOpacity>
                {!assignedTable ?
                ( <View style={styles.noTableSelected}>
                    <Text></Text>
                  </View> ) : (
                <View style={styles.hiddenOptions}>  
                <TouchableOpacity onPress={handleNewClientSurvey} style={styles.buttonLayout}>
                  <View style={styles.tableButtonLayout}>
                    <Image source={surveyIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>REALIZAR ENCUESTA</Text>              
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleMenu} style={styles.buttonLayout}>
                  <View style={styles.tableButtonLayout}>
                    <Image source={menuIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>VER MENU</Text>              
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleOrder} style={styles.buttonLayout}>
                  <View style={styles.tableButtonLayout}>
                    <Image source={orderIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>REALIZAR PEDIDO</Text>              
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleChat} style={styles.buttonLayout}>
                  <View style={styles.tableButtonLayout}>
                    <Image source={chatIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>CONSULTAR AL MOZO</Text>              
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonLayout}>
                  <View style={styles.tableButtonLayout}>
                    <Image source={payIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>PAGAR</Text>              
                  </View>
                </TouchableOpacity>
                </View>
                )}

                <Modal backdropOpacity={0.5} animationIn="rotate" animationOut="rotate" isVisible={isModalSpinnerVisible}>
                  <RotatingLogo></RotatingLogo>
                </Modal>
                
              </View>                
          </ImageBackground>           
      </View> : <BarCodeScanner
                  onBarCodeScanned={scanned && openQR ? undefined : handleBarCodeScanned}
                  style={StyleSheet.absoluteFillObject} />
    );
};

export default TablePanel;