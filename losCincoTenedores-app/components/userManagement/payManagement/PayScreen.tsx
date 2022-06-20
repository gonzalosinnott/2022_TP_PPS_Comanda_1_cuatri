import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "./StylePayScreen";
import { Image, ImageBackground, Text, TouchableOpacity, View, ScrollView, StyleSheet } from "react-native";
import { returnIcon, backgroundImage, cancelIcon, qrIcon } from "./AssetsPayScreen";
import Modal from "react-native-modal";
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import RotatingLogo from "../../rotatingLogo/RotatingLogo";
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "../../../App";
import { Camera } from "expo-camera";
import { BarCodeScanner } from "expo-barcode-scanner";
import Toast from 'react-native-simple-toast';
import { splitUserFromEmail } from "../../../utils/utils";

const Pay = () => {

  //CONSTANTES
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [tableId, setTableId] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [tableLCient, setTableClient] = useState("");
  const [dataOrder, setDataOrder] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState(0);
  const [total, setTotal] = useState(0);
  const [scanned, setScanned] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const [subtotal, setSubtotal] = useState(0);


  //RETURN
  const handleReturn = () => {
    navigation.replace("TableControlPanel")
  }

  //REFRESH DE LA DATA
  useFocusEffect(
    useCallback(() => {
      getOrders();
      checkClientStatus();
      toggleSpinnerAlert();
    }, [])
  );

   //PERMISOS CAMARA
   useEffect(() => {
    (async () => {
        await Camera.requestCameraPermissionsAsync();
        await BarCodeScanner.requestPermissionsAsync();
    })();
  }, [])

  //COMPLETADO DEL FORM A PARTIR DEL QR
  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setOpenQR(false);
    const dataSplit = data.split('@');
    const qrType = dataSplit[0];
    const tip = dataSplit[1];
    console.log(qrType);
    console.log(tip);
    if(qrType === 'propina'){
      handleTip(tip);
    }
    else {
      Toast.showWithGravity(
        "NO ES UN QR DE PROPINA",
        Toast.LONG,
        Toast.CENTER);
    }
  };

  const handleTip = (tip) => {
    setTip(tip * total / 100);
  }

  useFocusEffect(
    useCallback(() => {
      setTotal(0);
      getTotal();
    }, [tip])
  );

  //MANEJADOR DEL QR Y CAMARA
  const handleOpenQR = () => {
    setScanned(false);
    setOpenQR(true);
  }


  //REFRESH DE LA DATA
  useFocusEffect(
    useCallback(() => {
      setTotal(0);
      getTotal();
    }, [dataOrder])
  );

  //SETEO INICIAL DE DATA Y PARA LOS RETURN
  const checkClientStatus = async () => {
    const q = query(
      collection(db, "tableInfo"),
      where("assignedClient", "==", auth.currentUser?.email)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      setTableNumber(doc.data().tableNumber);
      setTableId(doc.id);
      setTableClient(doc.data().assignedClient);
    });
  };

  const getOrders = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    let priceArray: any = [];
    {dataOrder.map(
      (item: { name: any; price: any; amount: any; id: string }) => (
        priceArray.push(item.price * item.amount)
      )      
    )}
    setSubtotal(priceArray.reduce((a, b) => a + b, 0));
    setTotal(priceArray.reduce((a, b) => a + b, 0)+tip);
  }

  //TOOGLE SPINNER
  const toggleSpinnerAlert = () => {
    setModalSpinnerVisible(true);
    setTimeout(() => {
      setModalSpinnerVisible(false);
    }, 3000);
  }; 

  const handlePay = async () => {
    await addDoc(collection(db, "invoice"), {
      table:tableNumber,
      client:tableLCient,
      subtotal:subtotal,
      tip:tip,
      total:total,
      products: dataOrder,              
    }); 
    
    changeTableStatus();    
    deleteOrders();
    handleReturn();
  }

  const deleteOrders = async () => {
    try {
      dataOrder.map(
        async (item: { id: any; client: any }) => {
          if (item.client === tableLCient) {
            const ref = doc(db, "orders", item.id);
            await deleteDoc(ref);            
          }
        }
      );
    } catch (error: any) {
      Toast.showWithGravity(error.code, Toast.LONG, Toast.CENTER);
    } 
  }
  
  const changeTableStatus = async () => {
    try {      
      const ref = doc(db, "tableInfo", tableId);
      const orderStatus : any = "orderPaid";
      const status: any = "cleaning";
      await updateDoc(ref, { orderStatus: orderStatus });  
      await updateDoc(ref, { status: status });    
    } catch (error: any) {
      Toast.showWithGravity(error.code, Toast.LONG, Toast.CENTER);
    } 
  }

  //HEADER
  useLayoutEffect(() => {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity onPress={handleReturn}>
              <Image source={returnIcon} style={styles.headerIcon}/>
          </TouchableOpacity>
        ),
        headerTitle: () => (
          <Text style={styles.headerText}>CUENTA</Text>
        ),
        headerTintColor: "transparent",
        headerBackButtonMenuEnabled: false,
        headerStyle: {
          backgroundColor: 'rgba(61, 69, 68, 0.4);',
        },         
      });
    }, []);

  return (
    !openQR ?
    <View style={styles.container}>
      {loading }
      <ImageBackground
        source={backgroundImage}
        resizeMode="cover"
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.5 }}
      >
        <View style={styles.body}>
          <View style={styles.rowContainer}>
            <View style={styles.buttonLayout}>
              <Text style={styles.tableHeaderText}>
                CUENTA MESA {tableNumber}
              </Text>
              <Text style={styles.tableCellText}>
                CLIENTE: {splitUserFromEmail(tableLCient)}
              </Text>
            </View>
            <TouchableOpacity onPress={handleOpenQR}>
                <Image 
                    style={styles.qrIcon} resizeMode="cover" source={qrIcon}
                />
              </TouchableOpacity>
          </View>
          <ScrollView>
            <View style={styles.cardStyle}>
              {dataOrder.map(
                (item: { name: any; price: any; amount: any; id: string }) => (
                  <View>
                    <Text style={styles.lineText}>
                      -------------------------------------------------
                    </Text>
                    <View style={styles.infoContainer}>
                      <Text style={styles.tableCellText}>
                        {item.amount} u. x $ {item.price}
                      </Text>
                    </View>
                    <View style={styles.infoContainer}>
                      <Text style={styles.tableHeaderText}>{item.name}</Text>
                      <Text style={styles.tableHeaderText}>
                        $ {item.price * item.amount}
                      </Text>
                    </View>
                  </View>
                )
              )}
            </View>

            <View style={styles.cardStyle}>
              <View style={styles.infoContainer}>
                <Text style={styles.tableHeaderText}>SUBTOTAL</Text>
                <Text style={styles.tableHeaderText}>$ {subtotal}</Text>
              </View>
            </View>

            <View style={styles.cardStyle}>
              <View style={styles.infoContainer}>
                <Text style={styles.tableHeaderText}>PROPINA</Text>
                <Text style={styles.tableHeaderText}>$ {tip}</Text>
              </View>
            </View>

            <View style={styles.cardStyle}>
              <View style={styles.infoContainer}>
                <Text style={styles.tableHeaderText}>TOTAL</Text>
                <Text style={styles.tableHeaderText}>$ {total}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handlePay}>
              <View style={styles.payButtonLayout}>
                <Text style={styles.tableHeaderText}>
                  PAGAR
                </Text>             
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View>
          <Modal
            backdropOpacity={0.5}
            animationIn="rotate"
            animationOut="rotate"
            isVisible={isModalSpinnerVisible}
          >
            <RotatingLogo></RotatingLogo>
          </Modal>
        </View>
      </ImageBackground>
    </View> : <BarCodeScanner
                  onBarCodeScanned={scanned && openQR ? undefined : handleBarCodeScanned}
                  style={StyleSheet.absoluteFillObject} />
  );
};

export default Pay;