import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import styles from "../tablePanel/StyleTablePanelScreen";
import { StyleSheet, ImageBackground, TouchableOpacity, View, Image, Text, ScrollView } from "react-native";
import { backgroundImage, cancelIcon, chatIcon, logoutIcon, menuIcon, orderIcon, payIcon, qrIcon, surveyIcon, surveyResultIcon, tableIcon } from "../tablePanel/AssetsTablePanelScreen";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { auth, db } from "../../../App";
import { Camera } from "expo-camera";
import { BarCodeScanner } from "expo-barcode-scanner";
import Toast from 'react-native-simple-toast';
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import Modal from "react-native-modal";
import RotatingLogo from "../../rotatingLogo/RotatingLogo";
import { confirmIcon } from "../../chatScreen/AssetsChatScreen";

const TablePanel = () => {
    //CONSTANTES
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
    const [isModalClientActionsVisible, setModalClientActionsVisible] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [openQR, setOpenQR] = useState(false);
    const [tableNumber, setTableNumber] = useState('');
    const [assignedTable, setAssignedTable] = useState(false);
    const [orderStatus, setOrderStatus] = useState('');  
    const [isModalConfirmOrderVisible, setModalConfirmOrderVisible] = useState(false);
    const [dataOrder, setDataOrder] = useState<any>([]);
    const [survey, setSurvey] = useState(false);

    //REFRESH DE LA DATA
    useFocusEffect(
      useCallback(() => {
        toggleSpinnerAlert();
        checkClientStatus();
        getOrders();
    }, []))

    useLayoutEffect(() => {
      const unsubscribe = onSnapshot(query(collection(db, "tableinfo")), (snapshot =>
        checkOrderStatus(tableNumber)      ))
      return unsubscribe;
    }, [])

    //TOOGLE SPINNER
    const toggleSpinnerAlert = () => {
      setModalSpinnerVisible(true);
      setTimeout(() => {
        setModalSpinnerVisible(false);
      }, 3000);
    }; 

    const toggleModalClientActions = () => {
      setModalClientActionsVisible(true);
      setModalConfirmOrderVisible(false);
    }

    const closeModalClientActions = () => {
      setModalClientActionsVisible(false);
    }

    const closeModalOrderActions = () => {
      setModalConfirmOrderVisible(false);
    }

    const getOrders = async () => {
      setDataOrder([]);
      try {
        const q = query(
          collection(db, "orders"),
          where("client", "==", auth.currentUser?.email),
          where("status", "==", "prepared")
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          const res: any = { ...doc.data(), id: doc.id };       
          setDataOrder((arr: any) =>
            [
              ...arr,
              {
                ...res,
                id: doc.id,              
              },
            ].sort((a, b) => a.name.localeCompare(b.name))
          );
        });
      } catch (error) {
        console.log(error);
      }
    };

    //SETEO INICIAL DE DATA Y PARA LOS RETURN
    const checkClientStatus = async () => {
      
      const query1 = query(collection(db, "waitingList"), where("user", "==", auth.currentUser?.email), where("status", "==", "assigned"));
      const querySnapshot1 = await getDocs(query1);
      if(querySnapshot1.size > 0){        
        const query2 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("status", "==", "assigned"));
        const querySnapshot2= await getDocs(query2);
        querySnapshot2.forEach(async (doc) => {
          setAssignedTable(true);
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

      const query1 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR), where("survey", "==", "yes"));
      const querySnapshot1 = await getDocs(query1);
      if(querySnapshot1.size > 0){        
        setSurvey(true);
      }
      else{
        setSurvey(false);
      }

      if(!assignedTable) {     
        const query1 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR));
        const querySnapshot1 = await getDocs(query1);
        if(querySnapshot1.size > 0){        
          setTableNumber(tableNumberQR);
          setAssignedTable(true);
        }
        else {
          Toast.showWithGravity(
            "NO ESTA ASIGNADO A ESA MESA",
            Toast.LONG,
            Toast.CENTER);
        }  
      }
      else {
        const query1 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR));
        const querySnapshot1 = await getDocs(query1);
        if(querySnapshot1.size > 0){        
          setTableNumber(tableNumberQR);
          setAssignedTable(true);
          checkTableStatus(tableNumberQR);
        }
        else {
          Toast.showWithGravity(
            "NO ESTA ASIGNADO A ESA MESA",
            Toast.LONG,
            Toast.CENTER);
        }        
      }
    }
        
    //MANEJADOR ESTADOS DE LA MESA
    const checkTableStatus = async (tableNumberQR) => {
      const query1 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR), where("orderStatus", "==", "waitingOrder"));
      const querySnapshot1 = await getDocs(query1);
      if(querySnapshot1.size > 0){
       setOrderStatus( "TODAVIA NO REALIZO SU PEDIDO");
       toggleModalClientActions();
      }

      const query2 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR), where("orderStatus", "==", "ordered"));
      const querySnapshot2 = await getDocs(query2);
      if(querySnapshot2.size > 0){
        setOrderStatus( "EN BREVE EL MOZO PASARA A TOMAR SU PEDIDO");  
        toggleModalClientActions();      
      }

      const query3 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR), where("orderStatus", "==", "orderTaken"));
      const querySnapshot3 = await getDocs(query3);
      if(querySnapshot3.size > 0){
        setOrderStatus("EL MOZO YA TOMO SU PEDIDO");
        toggleModalClientActions();
      }

      const query4 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR), where("orderStatus", "==", "orderInProgress"));
      const querySnapshot4 = await getDocs(query4);
      if(querySnapshot4.size > 0){
        setOrderStatus("SU PEDIDO FUE INGRESADO A ELABORACIÓN");
        toggleModalClientActions();
      }

      const query5 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR), where("orderStatus", "==", "orderReady"));
      const querySnapshot5 = await getDocs(query5);
      if(querySnapshot5.size > 0){
        setOrderStatus("SU PEDIDO HA SIDO ELABORADO");
        toggleModalClientActions();
      }

      const query6 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR), where("orderStatus", "==", "orderDelivered"));
      const querySnapshot6 = await getDocs(query6);
      if(querySnapshot6.size > 0){
        setModalConfirmOrderVisible(true);
        setOrderStatus("SU PEDIDO FUE ENTREGADO");
      }      
    }

     //MANEJADOR ESTADOS DE LA MESA
     const checkOrderStatus = async (tableNumberQR) => {
      const query1 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR), where("orderStatus", "==", "waitingOrder"));
      const querySnapshot1 = await getDocs(query1);
      if(querySnapshot1.size > 0){
       setOrderStatus( "TODAVIA NO REALIZO SU PEDIDO");
      }

      const query2 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR), where("orderStatus", "==", "ordered"));
      const querySnapshot2 = await getDocs(query2);
      if(querySnapshot2.size > 0){
        setOrderStatus( "EN BREVE EL MOZO PASARA A TOMAR SU PEDIDO");        
      }

      const query3 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR), where("orderStatus", "==", "orderTaken"));
      const querySnapshot3 = await getDocs(query3);
      if(querySnapshot3.size > 0){
        setOrderStatus("EL MOZO YA TOMO SU PEDIDO");
      }

      const query4 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR), where("orderStatus", "==", "orderInProgress"));
      const querySnapshot4 = await getDocs(query4);
      if(querySnapshot4.size > 0){
        setOrderStatus("SU PEDIDO FUE INGRESADO A ELABORACIÓN");
      }

      const query5 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR), where("orderStatus", "==", "orderReady"));
      const querySnapshot5 = await getDocs(query5);
      if(querySnapshot5.size > 0){
        setOrderStatus("SU PEDIDO HA SIDO ELABORADO");
      }

      const query6 = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("tableNumber", "==", tableNumberQR), where("orderStatus", "==", "orderDelivered"));
      const querySnapshot6 = await getDocs(query6);
      if(querySnapshot6.size > 0){

        setOrderStatus("SU PEDIDO FUE ENTREGADO");
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
    
    //NAVIGATION
    const handlePay= () => {
      navigation.replace("Pay")
    } 
    
    return !openQR ? (
      <View style={styles.container}>
        <ImageBackground
          source={backgroundImage}
          resizeMode="cover"
          style={styles.backgroundImage}
          imageStyle={{ opacity: 0.5 }}
        >
          <View style={styles.body}>
            <View style={styles.rowContainer}>
              {!assignedTable ? (
                <View style={styles.buttonLayoutHeader}>
                  <Text style={styles.buttonText}>ESCANEE EL CODIGO QR</Text>
                  <Text style={styles.buttonText}>PARA INGRESAR A SU MESA</Text>
                </View>
              ) : (
                <View> 
                  <View style={styles.buttonLayoutHeader}>
                    <Text style={styles.buttonText}>
                      MESA NUMERO {tableNumber}
                    </Text>
                    <Text style={styles.buttonText}>
                      ESCANEE EL CODIGO QR DE SU MESA
                    </Text>
                    <Text style={styles.buttonText}>
                      PARA CONTINUAR
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity onPress={handleOpenQR}>
                <Image
                  style={styles.qrIcon}
                  resizeMode="cover"
                  source={qrIcon}
                />
              </TouchableOpacity>
            </View>     

            <Modal
              backdropOpacity={0.5}
              animationIn="rotate"
              animationOut="rotate"
              isVisible={isModalSpinnerVisible}
            >
              <RotatingLogo></RotatingLogo>
            </Modal>

            <Modal backdropOpacity={0.5} isVisible={isModalClientActionsVisible} >
              <View style={styles.modalContainer}>
                <View style={styles.modalBody}>
                  <Text style={styles.buttonText}>
                    ESTADO DE SU PEDIDO:  
                  </Text>
                  <Text style={styles.buttonText}>
                    {orderStatus}  
                  </Text>

                  <TouchableOpacity
                    onPress={handleOldClientSurvey}
                    style={styles.buttonLayout}
                  >
                    <View style={styles.tableButtonLayout}>
                      <Image source={surveyResultIcon} style={styles.buttonImage} />
                      <Text style={styles.buttonText}>
                        VER ENCUESTAS DE OTROS CLIENTES
                      </Text>
                    </View>
                  </TouchableOpacity>

                  { survey  === false ? (
                  <TouchableOpacity
                  onPress={handleNewClientSurvey}
                  style={styles.buttonLayout}
                >
                  <View style={styles.tableButtonLayout}>
                    <Image source={surveyIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>REALIZAR ENCUESTA</Text>
                  </View>
                </TouchableOpacity>) : null }

                <TouchableOpacity
                  onPress={handleChat}
                  style={styles.buttonLayout}
                >
                  <View style={styles.tableButtonLayout}>
                    <Image source={chatIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>CONSULTAR AL MOZO</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleOrder}
                  style={styles.buttonLayout}
                >
                  <View style={styles.tableButtonLayout}>
                    <Image source={orderIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>REALIZAR PEDIDO</Text>
                  </View>
                </TouchableOpacity>
               

                { orderStatus ==="SU PEDIDO FUE ENTREGADO" ? (
                <TouchableOpacity
                  onPress={handlePay}
                  style={styles.buttonLayout}
                >
                  <View style={styles.tableButtonLayout}>
                    <Image source={payIcon} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>PAGAR</Text>
                  </View>
                </TouchableOpacity> )
                : null }

                <TouchableOpacity onPress={closeModalClientActions}>
                    <Image source={cancelIcon} style={styles.cardIcon} />
                </TouchableOpacity>                  
                </View>
              </View>
            </Modal>

            <Modal backdropOpacity={0.5} isVisible={isModalConfirmOrderVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalBody}>
              <Text style={styles.tableHeaderText}>PEDIDO RECIBIDO</Text>                

              <ScrollView>
                {dataOrder.map((item: { id: any; name: any; amount:any }) => (
                    <Text style={styles.tableCellText}>
                      {item.name} x {item.amount}
                    </Text>                    
                ))}
              </ScrollView>
              <View style={styles.rowContainer}>
                <TouchableOpacity onPress={toggleModalClientActions} >
                        <Image source={confirmIcon} style={styles.cardIcon} />
                </TouchableOpacity>  

                <TouchableOpacity onPress={closeModalOrderActions}>
                    <Image source={cancelIcon} style={styles.cardIcon} />
                </TouchableOpacity>               
              </View>
            </View>
          </View>
        </Modal>

          </View>
        </ImageBackground>
      </View>
    ) : (
      <BarCodeScanner
        onBarCodeScanned={scanned && openQR ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
    );
};

export default TablePanel;