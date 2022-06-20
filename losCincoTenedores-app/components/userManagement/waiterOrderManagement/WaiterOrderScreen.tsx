import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "./StyleWaiterOrderScreen";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import {
  returnIcon,
  backgroundImage,
  cancelIcon,
  confirmIcon,
  refreshIcon,
} from "./AssetsWaiterOrderScreen";
import Modal from "react-native-modal";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import RotatingLogo from "../../rotatingLogo/RotatingLogo";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../App";
import Toast from "react-native-simple-toast";
import { sendPushNotification } from "../../pushNotification/PushNotification";

const WaiterOrder = () => {
  //CONSTANTES
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [isModalConfirmOrderVisible, setModalConfirmOrderVisible] =
    useState(false);
  const [
    isModalSendOrderToElaborationOrderVisible,
    setModalSendOrderToElaborationOrderVisible,
  ] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [tableData, setTableData] = useState<any>([]);
  const [orderData, setOrderData] = useState<any>([]);
  const [waitingListData, setWaitingListData] = useState<any>([]);
  const [client, setClient] = useState("");
  const [isModalInvoiceVisible, setModalInvoiceVisible] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>([]);


  //RETURN
  const handleReturn = () => {
    navigation.replace("ControlPanelMozo");
  };

  //REFRESH
  const handleRefresh = () => {
    getTables();
    getWaitingListData();
    toggleSpinnerAlert();
  };

  useLayoutEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, "tableinfo")), (snapshot =>
      setTableData(snapshot.docs.map(doc => ({
        id: doc.data().id,
        tableNumber: doc.data().tableNumber,
        assignedClient: doc.data().assignedClient,
        status: doc.data().status,
        orderStatus: doc.data().orderStatus
        })))
    ))
    return unsubscribe;
  }, [])

  //REFRESH DE LA DATA
  useFocusEffect(
    useCallback(() => {
      getTables();
      getWaitingListData();
      toggleSpinnerAlert();
    }, [])
  );

  //TOOGLE SPINNER
  const toggleSpinnerAlert = () => {
    setModalSpinnerVisible(true);
    setTimeout(() => {
      setModalSpinnerVisible(false);
    }, 3000);
  };

  //GET DATA USUARIOS
  const getWaitingListData = async () => {
    setWaitingListData([]);
    try {
      const q = query(collection(db, "waitingList"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const res: any = { ...doc.data(), id: doc.id };
        setWaitingListData((arr: any) => [...arr, { ...res, id: doc.id }]);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getInvoicetData = async (client) => {
    setInvoiceData([]);
    try {
      const q = query(collection(db, "invoice"),where("client", "==", client));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const res: any = { ...doc.data(), id: doc.id };
        setInvoiceData((arr: any) => [...arr, { ...res, id: doc.id }]);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getTables = async () => {
    setLoadingTables(true);
    setTableData([]);
    try {
      const q = query(collection(db, "tableInfo"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const res: any = { ...doc.data(), id: doc.id };
        setTableData((arr: any) => [...arr, { ...res, id: doc.id }].sort((a, b) => a.tableNumber.localeCompare(b.tableNumber)));
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingTables(false);
    }
  };
  //OBTENER ORDENES POR USUARIO
  const getOrders = async (user) => {
    setLoadingOrders(true);
    setOrderData([]);
    try {
      const q = query(collection(db, "orders"), 
                where("client", "==", user),
                where("status", "==", "ordered"));
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

  //MANEJADORES ESTADOS DE LOS PEDIDOS
  const takeOrder = (id: string) => {
    setClient(id);
    getOrders(id);
    toggleSpinnerAlert();
    setModalConfirmOrderVisible(!isModalConfirmOrderVisible);
  };

  const sendOrderToElaboration = (id: string) => {
    setClient(id);
    getOrders(id);
    toggleSpinnerAlert();
    setModalSendOrderToElaborationOrderVisible(
      !isModalSendOrderToElaborationOrderVisible
    );
  };

  const deliverOrder = (id: string) => {
    setClient(id);
    deliverOrderToTable(id);    
  };

  const closeTable = async (id: any, client, status: any) => {
    if(status === "orderDelivered"){
      Toast.showWithGravity(
        "EL CLIENTE AUN NO PAGO",
        Toast.LONG,
        Toast.CENTER
      );
    }

    if(status === "orderPaid"){
      toggleSpinnerAlert();
      getInvoicetData(client);
      setModalInvoiceVisible(true);

      try {      
        const ref = doc(db, "tableInfo", id);
        const orderStatus: any = "";
        const status : any = "free";
        const assignedClient: any = "";
        await updateDoc(ref, { status: status });
        await updateDoc(ref, { orderStatus: orderStatus });
        await updateDoc(ref, { assignedClient: assignedClient });      
      } catch (error: any) {
        Toast.showWithGravity(error.code, Toast.LONG, Toast.CENTER);
      } 
      try {
        waitingListData.map(
          async (item: { id: any; user: any }) => {
            if (item.user === client) {
              const ref = doc(db, "waitingList", item.id);
              await deleteDoc(ref);            
            }
          }
        );
      } catch (error: any) {
        Toast.showWithGravity(error.code, Toast.LONG, Toast.CENTER);
      }
      getTables(); 
    }    
  }

  //SACAR PEDIDO DE LA ORDEN
  const deleteOrderItem = async (id: any, client: any) => {
    try {
      const ref = doc(db, "orders", id);
      await deleteDoc(ref);
      Toast.showWithGravity(
        "Pedido eliminado de la orden",
        Toast.LONG,
        Toast.CENTER
      );
    } catch (error: any) {
      Toast.showWithGravity(error.code, Toast.LONG, Toast.CENTER);
    }
    toggleSpinnerAlert();
    getOrders(client);
  };

  //COMFIRMAR ORDEN
  const confirmOrder = async (client: any) => {
    try {
      tableData.map(
        async (item: { id: any; orderStatus: any; assignedClient: any }) => {
          if (item.assignedClient === client) {
            const ref = doc(db, "tableInfo", item.id);
            const data: any = "orderTaken";
            await updateDoc(ref, { orderStatus: data });
            Toast.showWithGravity("Pedido Tomado", Toast.LONG, Toast.CENTER);
          }
        }
      );
    } catch (error: any) {
      Toast.showWithGravity(error.code, Toast.LONG, Toast.CENTER);
    } finally {
      getTables();
      toggleSpinnerAlert();
      setModalConfirmOrderVisible(!isModalConfirmOrderVisible);
    }
  };

  //CONFIRMAR ELABORACION
  const confirmElaboration = async (client: any) => {
    try {
      tableData.map(
        async (item: { id: any; orderStatus: any; assignedClient: any }) => {
          if (item.assignedClient === client) {
            const ref = doc(db, "tableInfo", item.id);
            const data: any = "orderInProgress";
            await updateDoc(ref, { orderStatus: data });
            sendPushNotification( {title:"PEDIDO PENDIENTE DE ELABORACIÓN", description: "Hay pedidos pendientes de elaboración"} );
            Toast.showWithGravity(
              "Pedido Enviado a Elaboración",
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
      toggleSpinnerAlert();
      setModalSendOrderToElaborationOrderVisible(!isModalSendOrderToElaborationOrderVisible);
    }
  };

  //ENTREGAR PEDIDO
  const deliverOrderToTable = async (client: any) => {
    try {
      tableData.map(
        async (item: { id: any; orderStatus: any; assignedClient: any }) => {
          if (item.assignedClient === client) {
            const ref = doc(db, "tableInfo", item.id);
            const data: any = "orderDelivered";
            await updateDoc(ref, { orderStatus: data });
            Toast.showWithGravity(
              "Pedido Entregado a la Mesa",
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
      toggleSpinnerAlert();
    }
  };

  const toggleModalOrderConfirmation = () => {
    setOrderData([]);
    toggleSpinnerAlert();
    setModalConfirmOrderVisible(!isModalConfirmOrderVisible);
  };

  const toggleModalOrderElaboration = () => {
    setOrderData([]);
    toggleSpinnerAlert();
    setModalSendOrderToElaborationOrderVisible(
      !isModalSendOrderToElaborationOrderVisible
    );
  };

  const toggleModalInvoice = () => {
    setModalInvoiceVisible(!isModalInvoiceVisible);
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
        <Text style={styles.headerText}>ESTADO DE LAS MESAS</Text>
      ),
      headerTintColor: "transparent",
      headerBackButtonMenuEnabled: false,
      headerStyle: {
        backgroundColor: "rgba(61, 69, 68, 0.4);",
      },
      headerRight: () => (
        <TouchableOpacity onPress={handleRefresh}>
          <Image source={refreshIcon} style={styles.headerIcon} />
        </TouchableOpacity>
      ),
    });
  }, []);

  return (
    <View style={styles.container}>
      {loadingTables}
      <ImageBackground
        source={backgroundImage}
        resizeMode="cover"
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.5 }}
      >
        <View style={styles.body}>
          <ScrollView>
            {tableData.map(
              (item: {
                id: any;
                tableNumber: any;
                assignedClient: any;
                status: any;
                orderStatus: any;
              }) => (
                <View style={styles.cardStyle}>
                  <View style={styles.infoContainer}>
                    <Text style={styles.tableCellText}>
                      MESA: {item.tableNumber}
                    </Text>

                    {item.status === "free" ? (
                      <TouchableOpacity
                        style={styles.tableStatusButtonLayout}
                        disabled={true}
                      >
                        <Text style={styles.buttonText}>MESA LIBRE</Text>
                      </TouchableOpacity>
                    ) : null}

                    {item.orderStatus === "waitingOrder" ? (
                      <TouchableOpacity
                        style={styles.tableStatusButtonLayout}
                        disabled={true}
                      >
                        <Text style={styles.buttonText}>
                          ESPERANDO PEDIDO DEL CLIENTE
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {item.orderStatus === "ordered" ? (
                      <TouchableOpacity
                        style={styles.tableStatusButtonLayout}
                        onPress={() => takeOrder(item.assignedClient)}
                      >
                        <Text style={styles.buttonText}>TOMAR PEDIDO</Text>
                      </TouchableOpacity>
                    ) : null}

                    {item.orderStatus === "orderTaken" ? (
                      <TouchableOpacity
                        style={styles.tableStatusButtonLayout}
                        onPress={() =>
                          sendOrderToElaboration(item.assignedClient)
                        }
                      >
                        <Text style={styles.buttonText}>
                          ENVIAR PEDIDO A ELABORACIÓN
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {item.orderStatus === "orderInProgress" ? (
                      <TouchableOpacity
                        style={styles.tableStatusButtonLayout}
                        disabled={true}
                      >
                        <Text style={styles.buttonText}>
                          PEDIDO EN PREPARACIÓN
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {item.orderStatus === "orderReady" ? (
                      <TouchableOpacity
                        style={styles.tableStatusButtonLayout}
                        onPress={() => deliverOrder(item.assignedClient)}
                      >
                        <Text style={styles.buttonText}>ENTREGAR PEDIDO</Text>
                      </TouchableOpacity>
                    ) : null}

                    {item.orderStatus === "orderDelivered" || item.orderStatus === "orderPaid" ? (
                      <TouchableOpacity
                        style={styles.tableStatusButtonLayout}
                        onPress={() => closeTable(item.id, item.assignedClient, item.orderStatus)}
                      >
                        <Text style={styles.buttonText}>CERRAR MESA</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
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

        <Modal backdropOpacity={0.5} isVisible={isModalConfirmOrderVisible}>
          <View style={styles.modalContainer}>
            {loadingOrders}
            <View style={styles.modalBody}>
              <Text style={styles.tableHeaderText}>ORDEN</Text>
              {orderData.map(
                (item: { id: any; name: any; amount: any; client: any }) => (
                  <ScrollView>
                    <View style={styles.modalIconContainer}>
                      <Text style={styles.tableCellText}>
                        {item.name} x {item.amount}
                      </Text>
                      <TouchableOpacity
                        onPress={() => deleteOrderItem(item.id, item.client)}
                      >
                        <Image source={cancelIcon} style={styles.cardIcon} />
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                )
              )}
              <View style={styles.rowContainer}>
                <TouchableOpacity onPress={() => confirmOrder(client)}>
                  <Image source={confirmIcon} style={styles.cardIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleModalOrderConfirmation}>
                  <Image source={cancelIcon} style={styles.cardIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          backdropOpacity={0.5}
          isVisible={isModalSendOrderToElaborationOrderVisible}
        >
          <View style={styles.modalContainer}>
            {loadingOrders}
            <View style={styles.modalBody}>
              <Text style={styles.tableHeaderText}>
                ¿ENVIAR ORDEN A ELABORACIÓN?
              </Text>
              {orderData.map(
                (item: { id: any; name: any; amount: any; client: any }) => (
                  <ScrollView>
                    <View style={styles.modalIconContainer}>
                      <Text style={styles.tableCellText}>
                        {item.name} x {item.amount}
                      </Text>
                    </View>
                  </ScrollView>
                )
              )}
              <View style={styles.rowContainer}>
                <TouchableOpacity onPress={() => confirmElaboration(client)}>
                  <Image source={confirmIcon} style={styles.cardIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleModalOrderElaboration}>
                  <Image source={cancelIcon} style={styles.cardIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          backdropOpacity={0.5}
          isVisible={isModalInvoiceVisible}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalBody}>
              <Text style={styles.tableHeaderText}>
                  RESUMEN DEL PAGO
              </Text>
              {invoiceData.map(
                (item: { table: any; client: any; subtotal: any; tip: any; total: any; products: any; }) => (
                   <View>    
                      <Text style={styles.tableCellText}>
                        MESA NUMERO: {item.table}
                      </Text>
                      <Text style={styles.tableCellText}>
                        CLIENTE: {item.client}
                      </Text>
                      <Text style={styles.tableCellText}>
                        SUBTOTAL: {item.subtotal}
                      </Text>
                      <Text style={styles.tableCellText}>
                        PROPINA: {item.tip}
                      </Text>
                      <Text style={styles.tableCellText}>
                        TOTAL: {item.total}
                      </Text>
                    </View>
                )                
              )}
              <View style={styles.rowContainer}>
                <TouchableOpacity onPress={() => confirmElaboration(client)}>
                  <Image source={confirmIcon} style={styles.cardIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleModalOrderElaboration}>
                  <Image source={cancelIcon} style={styles.cardIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

export default WaiterOrder;
