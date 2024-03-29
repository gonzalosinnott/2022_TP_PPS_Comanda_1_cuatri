import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "./StyleMenuScreen";
import { Image, ImageBackground, Text, TouchableOpacity, View, ScrollView, Dimensions } from "react-native";
import { returnIcon, backgroundImage, cancelIcon } from "./AssetsMenuScreen";
import Modal from "react-native-modal";
import React, { useCallback, useLayoutEffect, useState } from 'react'
import RotatingLogo from "../rotatingLogo/RotatingLogo";
import { auth, db, storage } from "../../App";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from 'firebase/storage'
import Carousel from 'react-native-looped-carousel-improved';

const MenuScreen = () => {  

  //CONSTANTES
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataDrinks, setDataDrinks] = useState<any>([]);
  const [dataFood, setDataFood] = useState<any>([]);
  const { width, height } = Dimensions.get('window');
  const size: { width: number, height: number } = { width, height };

  
  //RETURN
  const handleReturn = () => {
    if(auth.currentUser?.email == "cincotenedoresmozo@gmail.com"){
      navigation.replace("ControlPanelMozo")
    }

    if(auth.currentUser?.email == "cincotenedorescliente@gmail.com"){
      navigation.replace("TableControlPanel")
    }
  }

   //REFRESH DE LA DATA
   useFocusEffect(
    useCallback(() => {
        getDrinks();
        getFood();
        toggleSpinnerAlert();
  }, []))


  //GET DATA
  const getDrinks = async () => {
    setLoading(true);    
    setDataDrinks([]);    
    try {
      const q = query(collection(db, "productInfo"), where("type", "==", "Bebida"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const res: any = { ...doc.data(), id: doc.id };
        const imageUrl1 = await getDownloadURL(ref(storage, res.image1));
        const imageUrl2 = await getDownloadURL(ref(storage, res.image2));
        const imageUrl3 = await getDownloadURL(ref(storage, res.image3));
        setDataDrinks((arr: any) => [...arr, { ...res, id: doc.id, imageUrl1: imageUrl1, imageUrl2: imageUrl2, imageUrl3: imageUrl3}].sort((a, b) => a.name.localeCompare(b.name)));
      });
    } catch (error) {
        console.log(error)                    
    }finally{
        setLoading(false);
    }
  }

  const getFood = async () => {
    setLoading(true);    
    setDataFood([]);    
    try {
      const q = query(collection(db, "productInfo"), where("type", "==", "Comida"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const res: any = { ...doc.data(), id: doc.id };
        const imageUrl1 = await getDownloadURL(ref(storage, res.image1));
        const imageUrl2 = await getDownloadURL(ref(storage, res.image2));
        const imageUrl3 = await getDownloadURL(ref(storage, res.image3));
        setDataFood((arr: any) => [...arr, { ...res, id: doc.id, imageUrl1: imageUrl1, imageUrl2: imageUrl2, imageUrl3: imageUrl3}].sort((a, b) => a.name.localeCompare(b.name)));
      });
    } catch (error) {
        console.log(error)                    
    }finally{
        setLoading(false);
    }
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
          <Text style={styles.headerText}>MENU</Text>
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
        {loading}
        <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.backgroundImage} imageStyle = {{opacity:0.5}}>

        <View style={styles.body}>
        <ScrollView>

            {dataDrinks.map((item: {imageUrl1: any;
                                    imageUrl2: any; 
                                    imageUrl3: any;  
                                    name: any; 
                                    description: any; 
                                    price: any;
                                    id: string;}) => (               
              <View style={styles.cardStyle}>
                <View >
                  <Carousel
                    delay={2000}
                    style={{ height:200, width:200, marginTop:10, marginBottom:10 }}
                    autoplay={false}
                    pageInfo
                    currentPage={0}
                    onAnimateNextPage={p => console.log(p)}>
                    <View style={{ height:200, width:200,}} >
                      <Image resizeMode='cover' style={styles.cardImage} source={{ uri: item.imageUrl1 }} />
                    </View>
                    <View style={{ height:200, width:200,}} >
                      <Image resizeMode='cover' style={styles.cardImage} source={{ uri: item.imageUrl2 }} />
                    </View>
                    <View style={{ height:200, width:200,}}>
                      <Image resizeMode='cover' style={styles.cardImage} source={{ uri: item.imageUrl3 }} />
                    </View>
                  </Carousel>
                </View>                  
                <View style={{ height:300}}>      
                <Text style={styles.tableHeaderText}>---------------------------------</Text>                      
                  <View style={styles.infoContainer}>
                    <Text style={styles.tableHeaderText}>{item.name}</Text>
                    <Text style={styles.tableHeaderText}>$ {item.price}  </Text>
                  </View>
                  <Text style={styles.tableCellText}>{item.description}</Text>                  
                  <Text style={styles.tableHeaderText}>---------------------------------</Text>                      
                </View>
              </View>              
            ))}

            {dataFood.map((item: {imageUrl1: any;
                                    imageUrl2: any; 
                                    imageUrl3: any;  
                                    name: any; 
                                    description: any; 
                                    price: any;
                                    id: string;}) => (               
              <View style={styles.cardStyle}>
                <View >
                  <Carousel
                    delay={2000}
                    style={{ height:200, width:200, marginTop:10, marginBottom:10 }}
                    autoplay={false}
                    pageInfo
                    currentPage={0}
                    onAnimateNextPage={p => console.log(p)}>
                    <View style={{ height:200, width:200,}} >
                      <Image resizeMode='cover' style={styles.cardImage} source={{ uri: item.imageUrl1 }} />
                    </View>
                    <View style={{ height:200, width:200,}} >
                      <Image resizeMode='cover' style={styles.cardImage} source={{ uri: item.imageUrl2 }} />
                    </View>
                    <View style={{ height:200, width:200,}}>
                      <Image resizeMode='cover' style={styles.cardImage} source={{ uri: item.imageUrl3 }} />
                    </View>
                  </Carousel>
                </View>                  
                <View style={{ height:300}}>      
                <Text style={styles.tableHeaderText}>---------------------------------</Text>                      
                  <View style={styles.infoContainer}>
                    <Text style={styles.tableHeaderText}>{item.name}</Text>
                    <Text style={styles.tableHeaderText}>$ {item.price}  </Text>
                  </View>
                  <Text style={styles.tableCellText}>{item.description}</Text>                  
                  <Text style={styles.tableHeaderText}>---------------------------------</Text>                      
                </View>
              </View>              
            ))}
        </ScrollView> 
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

export default MenuScreen;