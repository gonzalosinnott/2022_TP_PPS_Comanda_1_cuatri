import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "./StyleProductOrderScreen";
import { Image, ImageBackground, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { returnIcon, backgroundImage, cancelIcon } from "./AssetsProductOrderScreen";
import Modal from "react-native-modal";
import React, { useCallback, useLayoutEffect, useState } from 'react'
import RotatingLogo from "../../rotatingLogo/RotatingLogo";
import { auth, db } from "../../../App";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import Toast from "react-native-simple-toast";


const AdminSurvey = () => {
  //CONSTANTES
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderData, setOrderData] = useState<any>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [tableData, setTableData] = useState<any>([]);


  

  //RETURN
  const handleReturn = () => {
    if (auth.currentUser?.email == "cincotenedorescocina@gmail.com") {
      navigation.replace("ControlPanelCocina");
    }
    if (auth.currentUser?.email == "cincotenedoresbar@gmail.com") {
      navigation.replace("ControlPanelBar");
    }
  };

  //TOOGLE SPINNER
  const toggleSpinnerAlert = () => {
    setModalSpinnerVisible(true);
    setTimeout(() => {
      setModalSpinnerVisible(false);
    }, 3000);
  };

  //REFRESH DE LA DATA
  useFocusEffect(
    useCallback(() => {
      getOrders();
      getTables();
      toggleSpinnerAlert();
    }, [])
  );

   //GET DATA MESAS
   const getTables = async () => {
    setLoadingTables(true);
    setTableData([]);
    try {
      const q = query(collection(db, "tableInfo"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const res: any = { ...doc.data(), id: doc.id };
        setTableData((arr: any) => [...arr, { ...res, id: doc.id }]);
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingTables(false);
    }
  };

  //OBTENER ORDENES PENDIENTES DE ELABORACION
  const getOrders = async () => {
    setLoadingOrders(true);
    setOrderData([]);
    let filter;
    if (auth.currentUser?.email == "cincotenedorescocina@gmail.com") {
      filter = "Comida"
    }
    if (auth.currentUser?.email == "cincotenedoresbar@gmail.com") {
      filter = "Bebida"
    }
    try {
      const q = query(
        collection(db, "orders"),
        where("status", "==", "ordered"), where("type", "==", filter)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const res: any = { ...doc.data(), id: doc.id };
        setOrderData((arr: any) =>
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
      setLoadingOrders(false);
    }
  };

  //MANEJADOR PREPARAR ORDEN
  const prepareDish = async (id: any, client: any) => {
    try {
      const ref = doc(db, "orders", id);
      const data: any = "prepared";
      await updateDoc(ref, { status: data });
      Toast.showWithGravity("Pedido Realizado", Toast.LONG, Toast.CENTER);
      checkAllOrders(client);      
    } catch (error) {
      console.log(error);
    } finally {
      toggleSpinnerAlert();
      getOrders();
    }
  }

  const checkAllOrders = async (client: any) => {
    try {
      const q = query(
        collection(db, "orders"),
        where("status", "==", "ordered"), where("client", "==", client)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        changeTableStatus(client);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const changeTableStatus = async (client: any) => {
    try {
      tableData.map(
        async (item: { id: any; orderStatus: any; assignedClient: any; tableNumber: any }) => {
          if (item.assignedClient === client) {
            const ref = doc(db, "tableInfo", item.id);
            const data: any = "orderReady";
            await updateDoc(ref, { orderStatus: data });
            Toast.showWithGravity(
              "PEDIDO DE LA MESA" + item.tableNumber + " REALIZADO",
              Toast.LONG,
              Toast.CENTER
            );
          }
        }
      );
    } catch (error: any) {
      Toast.showWithGravity(error.code, Toast.LONG, Toast.CENTER);
    } finally {
      getTables();
      getOrders();
      toggleSpinnerAlert();
    }
  }



  //HEADER
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleReturn}>
          <Image source={returnIcon} style={styles.headerIcon} />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <Text style={styles.headerText}>PEDIDOS PENDIENTES DE ELABORACIÓN</Text>
      ),
      headerTintColor: "transparent",
      headerBackButtonMenuEnabled: false,
      headerStyle: {
        backgroundColor: "rgba(61, 69, 68, 0.4);",
      },
    });
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImage}
        resizeMode="cover"
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.5 }}
      >
        {loadingOrders}
        <View style={styles.body}>
          <ScrollView>
            {orderData.map(
              (item: {
                id: any;
                name: any;
                amount: any;
                price: any;
                client: any;
                type: any;
                tableNumber: any;
              }) => (
                <View style={styles.cardStyle}>
                  <View style={styles.infoContainer}>
                    <Text style={styles.tableCellText}>
                      MESA: {item.tableNumber}
                    </Text>

                    <TouchableOpacity
                      style={styles.tableStatusButtonLayout}
                      onPress={() => prepareDish(item.id, item.client)}
                    >
                      <Text style={styles.buttonText}>PREPARAR</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.tableCellText}>
                    {item.name} x {item.amount}
                  </Text>
                </View>
              )
            )}
          </ScrollView>
        </View>

        <Modal
          backdropOpacity={0.5}
          animationIn="rotate"
          animationOut="rotate"
          isVisible={isModalSpinnerVisible}
        >
          <RotatingLogo></RotatingLogo>
        </Modal>
      </ImageBackground>
    </View>
  );
};

export default AdminSurvey;