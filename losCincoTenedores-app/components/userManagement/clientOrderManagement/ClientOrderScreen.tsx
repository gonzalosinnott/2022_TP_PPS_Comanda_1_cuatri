import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "./StyleClientOrderScreen";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import {
  returnIcon,
  backgroundImage,
  cancelIcon,
  minusIcon,
  plusIcon,
  confirmIcon,
  qrIcon,
} from "./AssetsClientOrderScreen";
import Modal from "react-native-modal";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import RotatingLogo from "../../rotatingLogo/RotatingLogo";
import { auth, db, storage } from "../../../App";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  deleteDoc,
  CollectionReference,
  DocumentData,
  DocumentReference,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import Carousel from "react-native-looped-carousel-improved";
import Toast from "react-native-simple-toast";
import { Camera } from "expo-camera";
import { BarCodeScanner } from "expo-barcode-scanner";

const ClientOrder = () => {
  //CONSTANTES
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataDrinks, setDataDrinks] = useState<any>([]);
  const [dataFood, setDataFood] = useState<any>([]);
  const [dataOrder, setDataOrder] = useState<any>([]);
  const { width, height } = Dimensions.get("window");
  const size: { width: number; height: number } = { width, height };
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [tableNumber, setTableNumber] = useState("");
  const win = Dimensions.get("window");
  const [isModalConfirmOrderVisible, setModalConfirmOrderVisible] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [tableId, setTableId] = useState("");
  const [scanned, setScanned] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const [qrName, setQrName] = useState("");
  const [qrDescription, setQrDescription] = useState("");
  const [qrElaborationTime, setQrElaborationTime] = useState(0);
  const [qrPrice, setQrPrice] = useState(0);
  const [qrType, setQrType] = useState("");
  const [qrImage1, setQrImage1] = useState("");
  const [qrImage2, setQrImage2] = useState("");
  const [qrImage3, setQrImage3] = useState("");
  const [qrAmount, setQrAmount] = useState(0);
  const [isModalQRVisible, setModalQRVisible] = useState(false);

  //RETURN
  const handleReturn = () => {
    navigation.replace("TableControlPanel");
  };

  //REFRESH DE LA DATA
  useFocusEffect(
    useCallback(() => {
      getDrinks();
      getFood();
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
  }, []);

  //MANEJADOR DEL QR Y CAMARA
  const handleOpenQR = () => {
    setScanned(false);
    setOpenQR(true);
  };

  //COMPLETADO DEL FORM A PARTIR DEL QR
  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setOpenQR(false);
    const dataSplit = data.split("@");
    const qrType = dataSplit[0];
    const qrName = dataSplit[1];
    const qrDescription = dataSplit[2];
    const qrElaborationTime = dataSplit[3];
    const qrPrice = dataSplit[4];
    const qrProductType = dataSplit[5];
    const qrImage1 = dataSplit[6];
    const qrImage2 = dataSplit[7];
    const qrImage3 = dataSplit[8];

     


    if (qrType === "producto") {
      setQrName(qrName);
      setQrDescription(qrDescription);
      setQrElaborationTime(qrElaborationTime);
      setQrPrice(qrPrice);
      setQrType(qrProductType);
      setQrImage1(qrImage1);
      setQrImage2(qrImage2);
      setQrImage3(qrImage3);

      toogleQRModal();


    } else {
      Toast.showWithGravity(
        "NO ES UN QR DE PLATO / BEBIDA",
        Toast.LONG,
        Toast.CENTER
      );
    }
  };

 
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
    });
  };

  //GET DATA
  const getDrinks = async () => {
    setLoading(true);
    setDataDrinks([]);
    try {
      const q = query(
        collection(db, "productInfo"),
        where("type", "==", "Bebida")
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const res: any = { ...doc.data(), id: doc.id };
        const imageUrl1 = await getDownloadURL(ref(storage, res.image1));
        const imageUrl2 = await getDownloadURL(ref(storage, res.image2));
        const imageUrl3 = await getDownloadURL(ref(storage, res.image3));
        const amount = 0;
        setDataDrinks((arr: any) =>
          [
            ...arr,
            {
              ...res,
              id: doc.id,
              imageUrl1: imageUrl1,
              imageUrl2: imageUrl2,
              imageUrl3: imageUrl3,
              amount: amount,
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

  const getFood = async () => {
    setLoading(true);
    setDataFood([]);
    try {
      const q = query(
        collection(db, "productInfo"),
        where("type", "==", "Comida")
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const res: any = { ...doc.data(), id: doc.id };
        const imageUrl1 = await getDownloadURL(ref(storage, res.image1));
        const imageUrl2 = await getDownloadURL(ref(storage, res.image2));
        const imageUrl3 = await getDownloadURL(ref(storage, res.image3));
        const amount = 0;
        setDataFood((arr: any) =>
          [
            ...arr,
            {
              ...res,
              id: doc.id,
              imageUrl1: imageUrl1,
              imageUrl2: imageUrl2,
              imageUrl3: imageUrl3,
              amount: amount,
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

  const getOrders = async () => {
    setLoading(true);
    setDataOrder([]);
    try {
      const q = query(
        collection(db, "orders"),
        where("client", "==", auth.currentUser?.email),
        where("status", "==", "ordered")
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

  //TOOGLE SPINNER
  const toggleSpinnerAlert = () => {
    setModalSpinnerVisible(true);
    setTimeout(() => {
      setModalSpinnerVisible(false);
    }, 3000);
  };

  //MANJEADORES SUMAR RESTAR ITEMS
  const addAmountDrink = (id: any) => {
    setDataDrinks((arr: any) => {
      const newArr = arr.map((item: any) => {
        if (item.id === id) {
          item.amount++;
        }
        return item;
      });
      return newArr;
    });
  };

  const addAmountFood = (id: any) => {
    setDataFood((arr: any) => {
      const newArr = arr.map((item: any) => {
        if (item.id === id) {
          item.amount++;
        }
        return item;
      });
      return newArr;
    });
  };

  const addAmountQR = () => {
    setQrAmount(qrAmount+1);
  };

  const removeAmountDrink = (id: any) => {
    setDataDrinks((arr: any) => {
      const newArr = arr.map((item: any) => {
        if (item.id === id) {
          item.amount--;
        }
        if (item.amount < 0) {
          item.amount = 0;
        }
        return item;
      });
      return newArr;
    });
  };

  const removeAmountFood = (id: any) => {
    setDataFood((arr: any) => {
      const newArr = arr.map((item: any) => {
        if (item.id === id) {
          item.amount--;
        }
        if (item.amount < 0) {
          item.amount = 0;
        }
        return item;
      });
      return newArr;
    });
  };

  const removeAmountQR = () => {
    setQrAmount(qrAmount-1);
  }

  //MANEJADOR PEDIDO
  const addFoodOrder = async (
    name,
    amount,
    description,
    price,
    elaborationTime,
    type
  ) => {
    try {
      //UPLOAD DATA
      await addDoc(collection(db, "orders"), {
        client: auth.currentUser?.email,
        tableNumber: tableNumber,
        name: name,
        amount: amount,
        description: description,
        price: price,
        elaborationTime: elaborationTime,
        type: type,
        status: "ordered",
        creationDate: new Date(),
      });
      Toast.showWithGravity(
        "Pedido agregado a la orden",
        Toast.LONG,
        Toast.CENTER
      );
    } catch (error: any) {
      Toast.showWithGravity(error.code, Toast.LONG, Toast.CENTER);
    } finally {
      setLoading(false);
      resetAmount();
      totalAmount(price, amount, elaborationTime);
    }
  };

  const resetAmount = () => {
    setDataDrinks((arr: any) => {
      const newArr = arr.map((item: any) => {
        item.amount = 0;
        return item;
      });
      return newArr;
    });
    setDataFood((arr: any) => {
      const newArr = arr.map((item: any) => {
        item.amount = 0;
        return item;
      });
      return newArr;
    });
  };

  const totalAmount = async (
    itemPrice: any,
    amount: any,
    elaborationTime: any
  ) => {
    setTotalPrice((total: any) => {
      return totalPrice + itemPrice * amount;
    });

    try {
      const timeArray: number[] = [];
      timeArray.push(elaborationTime);
      const q = query(
        collection(db, "orders"),
        where("client", "==", auth.currentUser?.email)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        timeArray.push(doc.data().elaborationTime);
      });

      setTotalTime((total: any) => {
        return Math.max(...timeArray);
      });
    } catch (error) {
      console.log(error);
    }
  };

  //ABRIR / CERRAR MODAL
  const toggleModalOrder = () => {
    getOrders();
    toggleSpinnerAlert();
    setModalConfirmOrderVisible(!isModalConfirmOrderVisible);
  };

  const toogleQRModal = () => {
    getDrinks();
    getFood();
    checkClientStatus();
    toggleSpinnerAlert();
    setModalQRVisible(!isModalQRVisible);
  }

  
  //SACAR PEDIDO DE LA ORDEN
  const deleteOrder = async (id: any) => {
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
    getOrders();
  }

 
  //CONFIRMAR ORDEN
  const confirmOrder = async () => {
    try {
      const ref = doc(db, "tableInfo", tableId);
      const data =  'ordered';
      await updateDoc(ref, {orderStatus:data});     
      Toast.showWithGravity(
        "Orden confirmada",
        Toast.LONG,
        Toast.CENTER
      );
    } catch (error: any) {
      Toast.showWithGravity(error.code, Toast.LONG, Toast.CENTER);
    } finally {
      handleReturn();
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
      headerTitle: () => <Text style={styles.headerText}>MENU</Text>,
      headerTintColor: "transparent",
      headerBackButtonMenuEnabled: false,
      headerStyle: {
        backgroundColor: "rgba(61, 69, 68, 0.4);",
      },
    });
  }, []);

  return !openQR ? (
    <View style={styles.container}>
      {loading}
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
                IMPORTE TOTAL: $ {totalPrice}
              </Text>
              <Text style={styles.tableCellText}>
                DEMORA: {totalTime} MINUTOS
              </Text>
            </View>
            <TouchableOpacity onPress={() => toggleModalOrder()}>
              <Image source={confirmIcon} style={styles.confirmIcon} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.qrButtonLayout}>
            <TouchableOpacity onPress={handleOpenQR}>
                <Image source={qrIcon} style={styles.qrIcon} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {dataDrinks.map(
              (item: {
                imageUrl1: any;
                imageUrl2: any;
                imageUrl3: any;
                name: any;
                description: any;
                price: any;
                amount: any;
                elaborationTime: any;
                type: any;
                id: string;
              }) => (
                <View style={styles.cardStyle}>
                  <View>
                    <Carousel
                      delay={2000}
                      style={{
                        height: 200,
                        width: 200,
                        marginTop: 10,
                        marginBottom: 10,
                      }}
                      autoplay={false}
                      pageInfo
                      currentPage={0}
                      onAnimateNextPage={(p) => console.log(p)}
                    >
                      <View style={{ height: 200, width: 200 }}>
                        <Image
                          resizeMode="cover"
                          style={styles.cardImage}
                          source={{ uri: item.imageUrl1 }}
                        />
                      </View>
                      <View style={{ height: 200, width: 200 }}>
                        <Image
                          resizeMode="cover"
                          style={styles.cardImage}
                          source={{ uri: item.imageUrl2 }}
                        />
                      </View>
                      <View style={{ height: 200, width: 200 }}>
                        <Image
                          resizeMode="cover"
                          style={styles.cardImage}
                          source={{ uri: item.imageUrl3 }}
                        />
                      </View>
                    </Carousel>
                  </View>

                  <View style={{ height: 300 }}>
                    <Text style={styles.tableHeaderText}>
                      ---------------------------------------
                    </Text>
                    <View style={styles.infoContainer}>
                      <Text style={styles.tableHeaderText}>{item.name}</Text>
                      <Text style={styles.tableHeaderText}>
                        $ {item.price}{" "}
                      </Text>
                    </View>
                    <Text style={styles.tableCellText}>{item.description}</Text>
                    <Text style={styles.tableHeaderText}>
                      ---------------------------------------
                    </Text>
                    <View style={styles.rowContainer}>
                      <TouchableOpacity
                        onPress={() => removeAmountDrink(item.id)}
                      >
                        <Image source={minusIcon} style={styles.headerIcon} />
                      </TouchableOpacity>
                      <Text style={styles.amountText}>{item.amount}</Text>
                      <TouchableOpacity onPress={() => addAmountDrink(item.id)}>
                        <Image source={plusIcon} style={styles.headerIcon} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          addFoodOrder(
                            item.name,
                            item.amount,
                            item.description,
                            item.price,
                            item.elaborationTime,
                            item.type
                          )
                        }
                      >
                        <View style={styles.orderButtonLayout}>
                          <Text style={styles.amountText}>
                            AGREGAR AL PEDIDO
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            )}

            {dataFood.map(
              (item: {
                imageUrl1: any;
                imageUrl2: any;
                imageUrl3: any;
                name: any;
                description: any;
                price: any;
                elaborationTime: any;
                amount: any;
                type: any;
                id: string;
              }) => (
                <View style={styles.cardStyle}>
                  <View>
                    <Carousel
                      delay={2000}
                      style={{
                        height: 200,
                        width: 200,
                        marginTop: 10,
                        marginBottom: 10,
                      }}
                      autoplay={false}
                      pageInfo
                      currentPage={0}
                      onAnimateNextPage={(p) => console.log(p)}
                    >
                      <View style={{ height: 200, width: 200 }}>
                        <Image
                          resizeMode="cover"
                          style={styles.cardImage}
                          source={{ uri: item.imageUrl1 }}
                        />
                      </View>
                      <View style={{ height: 200, width: 200 }}>
                        <Image
                          resizeMode="cover"
                          style={styles.cardImage}
                          source={{ uri: item.imageUrl2 }}
                        />
                      </View>
                      <View style={{ height: 200, width: 200 }}>
                        <Image
                          resizeMode="cover"
                          style={styles.cardImage}
                          source={{ uri: item.imageUrl3 }}
                        />
                      </View>
                    </Carousel>
                  </View>
                  <View style={{ height: 300 }}>
                    <Text style={styles.tableHeaderText}>
                      ---------------------------------------
                    </Text>
                    <View style={styles.infoContainer}>
                      <Text style={styles.tableHeaderText}>{item.name}</Text>
                      <Text style={styles.tableHeaderText}>
                        $ {item.price}{" "}
                      </Text>
                    </View>
                    <Text style={styles.tableCellText}>{item.description}</Text>
                    <Text style={styles.tableHeaderText}>
                      ---------------------------------------
                    </Text>
                    <View style={styles.rowContainer}>
                      <TouchableOpacity
                        onPress={() => removeAmountFood(item.id)}
                      >
                        <Image source={minusIcon} style={styles.headerIcon} />
                      </TouchableOpacity>
                      <Text style={styles.amountText}>{item.amount}</Text>
                      <TouchableOpacity onPress={() => addAmountFood(item.id)}>
                        <Image source={plusIcon} style={styles.headerIcon} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          addFoodOrder(
                            item.name,
                            item.amount,
                            item.description,
                            item.price,
                            item.elaborationTime,
                            item.type
                          )
                        }
                      >
                        <View style={styles.orderButtonLayout}>
                          <Text style={styles.amountText}>
                            AGREGAR AL PEDIDO
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            )}
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

        <Modal backdropOpacity={0.5} isVisible={isModalConfirmOrderVisible}>
          <View style={styles.modalContainer}>
            {loadingOrders}
            <View style={styles.modalBody}>
              <Text style={styles.tableHeaderText}>ORDEN</Text>                

              <ScrollView>
                {dataOrder.map((item: { id: any; name: any; amount:any }) => (
                  <View style={styles.modalIconContainer}>
                    <Text style={styles.tableCellText}>
                      {item.name} x {item.amount}
                    </Text>
                    <TouchableOpacity
                      onPress={() => deleteOrder(item.id)}                      
                    >
                      <Image source={cancelIcon} style={styles.cardIcon} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.rowContainer}>
                <TouchableOpacity onPress={() => confirmOrder()} >
                        <Image source={confirmIcon} style={styles.cardIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleModalOrder}>
                    <Image source={cancelIcon} style={styles.cardIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal backdropOpacity={0.5} isVisible={isModalQRVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalBody}>
              <View style={styles.rowContainer}>
                <Text style={styles.tableHeaderText}>ITEM</Text> 
                <TouchableOpacity onPress={toogleQRModal}>
                  <Image source={cancelIcon} style={styles.cardIcon} />
                </TouchableOpacity>
              </View>

              <View style={styles.qrCardStyle}>
                  <View>
                    <Carousel
                      delay={2000}
                      style={{
                        height: 200,
                        width: 200,
                        marginTop: 10,
                        marginBottom: 10,
                      }}
                      autoplay={false}
                      pageInfo
                      currentPage={0}
                      onAnimateNextPage={(p) => console.log(p)}
                    >
                      <View style={{ height: 200, width: 200 }}>
                        <Image
                          resizeMode="cover"
                          style={styles.cardImage}
                          source={{ uri: qrImage1 }}
                        />
                      </View>
                      <View style={{ height: 200, width: 200 }}>
                        <Image
                          resizeMode="cover"
                          style={styles.cardImage}
                          source={{ uri: qrImage2 }}
                        />
                      </View>
                      <View style={{ height: 200, width: 200 }}>
                        <Image
                          resizeMode="cover"
                          style={styles.cardImage}
                          source={{ uri: qrImage3 }}
                        />
                      </View>
                    </Carousel>
                  </View>
                  <View style={{ height: 300 }}>
  
                    <View style={styles.infoContainer}>
                      <Text style={styles.tableHeaderText}>{qrName}</Text>
                      <Text style={styles.tableHeaderText}>
                        $ {qrPrice}
                      </Text>
                    </View>
                    <Text style={styles.tableCellText}>{qrDescription}</Text>

                    <View style={styles.rowContainer}>
                      <TouchableOpacity
                        onPress={() => removeAmountQR()}
                      >
                        <Image source={minusIcon} style={styles.headerIcon} />
                      </TouchableOpacity>
                      <Text style={styles.amountText}>{qrAmount}</Text>
                      <TouchableOpacity onPress={() => addAmountQR()}>
                        <Image source={plusIcon} style={styles.headerIcon} />
                      </TouchableOpacity>
                    </View>

                      <TouchableOpacity
                        onPress={() =>
                          addFoodOrder(
                            qrName,
                            qrAmount,
                            qrDescription,
                            qrPrice,
                            qrElaborationTime,
                            qrType
                          )
                        }
                      >

                        <View style={styles.orderButtonLayout}>
                          <Text style={styles.amountText}>
                            AGREGAR AL PEDIDO
                          </Text>
                        </View>
                      </TouchableOpacity>
                  </View>
                </View>          
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  ) : (
    <BarCodeScanner
      onBarCodeScanned={scanned && openQR ? undefined : handleBarCodeScanned}
      style={StyleSheet.absoluteFillObject}
    />
  );
};

export default ClientOrder;
