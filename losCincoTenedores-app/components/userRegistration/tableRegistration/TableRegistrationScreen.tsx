import React, { useLayoutEffect, useEffect, useState, useCallback  } from "react";
import styles from "../tableRegistration/StyleTableRegistrationScreen";
import { ImageBackground, TouchableOpacity, View, Image, Text, TextInput, StyleSheet } from "react-native";
import { returnIcon, backgroundImage, cameraIcon } from "../tableRegistration/AssetsTableRegistrationScreen";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Modal from "react-native-modal";
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useForm } from 'react-hook-form';
import Toast from 'react-native-simple-toast';
import { ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db, storage } from "../../../App";
import { getBlob } from "../../../utils/utils";
import * as ImagePicker from "expo-image-picker";
import { RadioButton } from 'react-native-paper';
import RotatingLogo from "../../rotatingLogo/RotatingLogo";

type NewUser = {
  number:string;
  capacity:string;
  type:string;
}

const TableRegistration = () => {

    //CONSTANTES
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [numberForm, setNumber] = useState("Numero de Mesa");
    const [capacityForm, setCapacity] = useState("Cantidad de Comensales");
    const {getValues, formState:{}, reset, setValue} = useForm<NewUser>();
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [placeholderColor, setPlaceholderColor] = useState("white");
    const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
    const [checked, setChecked] = React.useState('Estandar');

    //RETURN
    const handleReturn = () => {
      navigation.replace("ControlPanelPropietario")
    }

    //PERMISOS CAMARA
    useEffect(() => {
      (async () => {
          await Camera.requestCameraPermissionsAsync();
          await BarCodeScanner.requestPermissionsAsync();
      })();
    }, [])      

    //MANEJADOR DE LA CAMARA
    const handleCamera = async (type) => {
      let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          aspect: [4, 3],
          quality: 1,
      });
      if (!result.cancelled) {
        setImage(result["uri"]);
      }
    };

    //SUBMIT DEL FORM
    const onSubmit = async () => {
      const values=getValues();
      console.log(values);
      let error=false;

      //VALIDACION CAMPOS
      Object.values(values).map(value=>{
        if(!value){
          error=true;
          return;
        }
      })
      if(error){
        Toast.showWithGravity(
          "Todos los campos son requeridos",
          Toast.LONG, 
          Toast.CENTER);
        return;
      }
      if(!image){
        Toast.showWithGravity(
          "Debe tomar una foto",
          Toast.LONG, 
          Toast.CENTER);
        return;
      }
      setLoading(true)
      toggleSpinnerAlert();
      try {

        //VERIFICACION SI EL NUMERO DE MESA YA EXISTE
        const q = query(collection(db, "tableInfo"), where("tableNumber", "==", values.number));
        const querySnapshot = await getDocs(q);

        if(querySnapshot.size > 0){
          Toast.showWithGravity(
            "El numero de mesa ya existe",
            Toast.LONG, 
            Toast.CENTER);
          toggleSpinnerAlert();
          setLoading(false);
          resetForm();  
          return;        
        } 

        //UPLOAD IMAGEN
        const blob:any = await getBlob(image);
        const fileName = image.substring(image.lastIndexOf("/") + 1);
        const fileRef = ref(storage, "tableInfo/" + fileName);
        await uploadBytes(fileRef, blob);
        
        //UPLOAD DATA
        await addDoc(collection(db, "tableInfo"), {
          tableNumber:values.number,
          tableCapacity:values.capacity,
          tableType:checked,
          image:fileRef.fullPath,
          status: "free",
          assignedClient: "",
          orderStatus: "",
          creationDate:new Date()          
        });        
        Toast.showWithGravity(
          "Mesa creada exitosamente",
          Toast.LONG, 
          Toast.CENTER);      
      reset();
      setImage("");
      handleReturn();
      } catch (error:any) {
        Toast.showWithGravity(
          error.code,
          Toast.LONG, 
          Toast.CENTER); 
      }finally{
        setLoading(false);
        resetForm();  
      }
    }

    //RESET DEL FORM
    const resetForm = () => {
      setPlaceholderColor("white");
      setCapacity("Numero de Comensales");
      setNumber("Numero de Mesa");
      setValue("number","");
      setValue("capacity",'');
      setValue("type",'');
      setImage("");
    }

    //SPINNER
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
            <Text style={styles.headerText}>ALTA DE MESA</Text>
          ),
          headerTintColor: "transparent",
          headerBackButtonMenuEnabled: false,
          headerStyle: {
            backgroundColor: 'rgba(61, 69, 68, 0.4);',
          },         
        });
      }, []);

          //MANEJADORES RADIOBUTTONS

    const pressDiscapacitados = () => {
      setChecked('Discapacitados');
    }

    const pressVip = () => {
      setChecked('VIP');
    }

    const pressEstandar = () => {
      setChecked('Estandar');
    }

    //CARGA CAMPOS SEGUN SELECCION RADIO BUTTON
    useFocusEffect(
      useCallback(() => {
        console.log(checked);
        if(checked=='Discapacitados'){
          setValue("type",checked);
        }
        if(checked=='VIP'){
          setValue("type",checked);
        }
        if(checked=='Estandar'){
          setValue("type",checked);
        }
    }, [checked]))    

return (
  <View style={styles.container}>
    <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.backgroundImage} imageStyle = {{opacity:0.5}}>
      {loading}
      <View style={styles.body}>
        <View style={styles.cameraQrContainer}>
          {!image?
            <TouchableOpacity onPress={handleCamera}>
              <Image style={styles.cameraIcon} resizeMode="cover" source={cameraIcon} />
            </TouchableOpacity>:
            <View>
              <Image style={styles.cameraImage} resizeMode="cover" source={{uri:image}}/>
            </View>
          }         
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputField}>
            <TextInput
              placeholder={numberForm}
              placeholderTextColor= {placeholderColor}
              style={styles.inputText}
              keyboardType={'numeric'}
              onChangeText={(text) => setValue("number",text)}
            />
          </View>

          <View style={styles.inputField}>
            <TextInput
              placeholder={capacityForm}
              placeholderTextColor= {placeholderColor}
              style={styles.inputText}
              keyboardType={'numeric'}
              onChangeText={(text) => setValue("capacity",text)}
            />
          </View>          

          <View style={styles.inputField}>
            <Text style={styles.tagText}>TIPO</Text> 
          </View>

          <View style={styles.inputFieldRadioLayout}>

            <View style={styles.inputFieldRadio}>
              <RadioButton
                value="Estandar"
                status={ checked === 'Estandar' ? 'checked' : 'unchecked' }
                onPress={ pressEstandar }
              />
              <Text style={styles.inputText}>ESTÁNDAR</Text>
            </View>

            <View style={styles.inputFieldRadio}>
              <RadioButton
                value="VIP"
                status={ checked === 'VIP' ? 'checked' : 'unchecked' }
                onPress={ pressVip }
              />
              <Text style={styles.inputText}>VIP</Text>               
            </View>

            <View style={styles.inputFieldRadio}>
              <RadioButton
                value="Discapacitados"
                status={ checked === 'Discapacitados' ? 'checked' : 'unchecked' }
                onPress={ pressDiscapacitados }
              />
              <Text style={styles.inputText}>DISCAPACITADOS</Text>
            </View>

                        
          </View>

          <View style={styles.submitContainer}>
            <TouchableOpacity onPress={onSubmit} style={styles.buttonLayout}>
              <Text style={styles.buttonText}>CARGAR MESA</Text>         
            </TouchableOpacity>
          </View>
        </View>          
      </View> 

      <View>
        <Modal backdropOpacity={0.5} animationIn="rotate" animationOut="rotate" isVisible={isModalSpinnerVisible}>
          <RotatingLogo></RotatingLogo>
        </Modal>
      </View> 

    </ImageBackground>           
  </View>);
};

export default TableRegistration;