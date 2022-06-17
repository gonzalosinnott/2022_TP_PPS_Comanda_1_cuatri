import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "./StyleAdminSurveyManagmentScreen";
import { Image, ImageBackground, Text, TouchableOpacity, View, ScrollView, TextInput, Alert } from "react-native";
import { returnIcon, backgroundImage, confirmIcon, cancelIcon } from "./AssetsAdminSurveyManagmentScreen";
import Modal from "react-native-modal";
import React, { useCallback, useLayoutEffect, useState } from 'react'
import RotatingLogo from "../../rotatingLogo/RotatingLogo";
import { db, storage } from "../../../App";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref } from 'firebase/storage'
import { format } from 'date-fns'
import Toast from 'react-native-simple-toast';
import emailjs from '@emailjs/browser';

const AdminSurveyManagment = () => {

  //CONSTANTES
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [isModalCancelVisible, setModalCancelVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  

  //RETURN
  const handleReturn = () => {
    navigation.replace("ControlPanelPropietario")
  }

  //REFRESH DE LA DATA
  useFocusEffect(
    useCallback(() => {
        getDocuments();
        toggleSpinnerAlert();
  }, []))

  //TOOGLE SPINNER
  const toggleSpinnerAlert = () => {
    setModalSpinnerVisible(true);
    setTimeout(() => {
      setModalSpinnerVisible(false);
    }, 3000);
  };

  //TOOGLE CANCEL USER
  const toggleModalCancel = () => {
    setModalCancelVisible(!isModalCancelVisible);
  };

  //GET DATA
  const getDocuments = async () => {
    setLoading(true);    
    setData([]);    
    try {
      const q = query(collection(db, "userInfo"), where("rol", "==", "Empleado"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const res: any = { ...doc.data(), id: doc.id };
        const imageUrl = await getDownloadURL(ref(storage, res.image));
        setData((arr: any) => [...arr, { ...res, id: doc.id, imageUrl: imageUrl}].sort((a, b) => (a.creationDate < b.creationDate ? 1 : a.creationDate > b.creationDate ? -1 : 0)));
      });
    } catch (error) {
        console.log(error)                    
    }finally{
        setLoading(false);
    }
  }

  const survey = async (id: string) => {
    try {
      data.map(
        async (item: { id: any; survey: any; }) => {
          if (item.id === id) {
            const ref = doc(db, "userInfo", item.id);
            const data: any = "yes";
            await updateDoc(ref, { survey: data });
          }
        }
      );
    } catch (error: any) {
      Toast.showWithGravity(error.code, Toast.LONG, Toast.CENTER);
    } finally {
      navigation.replace("NewAdminSurvey")
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
          <Text style={styles.headerText}>EVALUACIÓN DE EMPLEADOS</Text>
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
             {data.map((item: {id: any;
                                name:any;
                              lastName: any;
                              employeeType: any;
                              image: any;
                              survey: any;}) => (               
              <View style={styles.cardStyle}>      
                  <Text style={styles.tableHeaderText}>    {item.name} {item.lastName}</Text>                
                  <View style={styles.imageIconContainer}>
                    <Text style={styles.tableCellText}>CATEGORIA: {item.employeeType}</Text>

                    {item.survey === "yes" ? (
                      <TouchableOpacity
                        style={styles.inputField}
                        disabled={true}
                      >
                        <Text style={styles.tableCellText}>
                          EVALUACIÓN
                        </Text>
                        <Text style={styles.tableCellText}>
                          REALIZADA
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    {item.survey === "no" ? (
                      <TouchableOpacity
                        style={styles.inputField}
                        onPress={() => survey(item.id)}
                      >
                        <Text style={styles.tableCellText}>EVALUAR</Text>
                        <Text style={styles.tableCellText}>EMPLEADO</Text>
                      </TouchableOpacity>
                    ) : null}



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

export default AdminSurveyManagment;