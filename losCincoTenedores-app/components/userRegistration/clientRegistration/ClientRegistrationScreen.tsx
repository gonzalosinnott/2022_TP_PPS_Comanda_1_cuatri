import styles from "../clientRegistration/StyleClientRegistrationScreen";
import { returnIcon, backgroundImage,  } from "../adminRegistration/AssetsAdminRegistrationScreen";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image, ImageBackground, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useForm } from 'react-hook-form';
import Toast from 'react-native-simple-toast';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection } from "firebase/firestore";
import { auth, db, storage } from "../../../App";
import { getBlob } from "../../../utils/utils";
import * as ImagePicker from "expo-image-picker";
import { RadioButton } from 'react-native-paper';
import RotatingLogo from "../../rotatingLogo/RotatingLogo";
import { cameraIcon, qrIcon } from "./AssetsClientRegistrationScreen";
import { sendPushNotification } from "../../pushNotification/PushNotification";

type NewUser = {
  apellido:string;
  nombre:string;
  dni:string;
  email:string;
  password:string;
  confirmPassword:string
  rol:string;
  clientType:string;
  clientStatus:string;
  rejectedReason:string;
}

const ClientRegistration = () => {

    //CONSTANTES
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [apellidoForm, setApellido] = useState("Apellido");
    const [nombreForm, setNombre] = useState("Nombre");
    const [dniForm, setDni] = useState("DNI");
    const [emailForm, setEmail] = useState("Correro Electrónico");
    const [passwordForm, setPassword] = useState("Contraseña");
    const [confirmPasswordForm, setConfirmPassword] = useState("Confirmar Contraseña");
    const [scanned, setScanned] = useState(false);
    const [openQR, setOpenQR] = useState(false);
    const {getValues, formState:{}, reset, setValue} = useForm<NewUser>();
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [placeholderColor, setPlaceholderColor] = useState("white");
    const [placeholderColorEditable, setPlaceholderColorEditable] = useState("white");
    const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
    const [checked, setChecked] = React.useState('Registrado');
    const [editableField, setEditableField] = useState(true);
    //VARIABLE PARA GUARDAR EL USUARIO ORIGINAL
    let originalUser = auth.currentUser;
    //SETEO CAMPOS QUE TIENEN UN VALOR DEFAULT
    setValue("rol",'Cliente');
    setValue("rejectedReason",'-');

    //RETURN
    const handleReturn = () => {
      console.log(auth.currentUser);
      
      if(auth.currentUser == undefined){
        navigation.replace("Login")
      }else{
        navigation.replace("ControlPanelMetre")
      }
    }

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
      const dni = dataSplit[4].trim();
      const nombre = dataSplit[2].trim();
      const apellido = dataSplit[1].trim();
      setValue("dni",dni);
      setValue("nombre",nombre);
      setValue("apellido",apellido);
      setApellido(apellido);
      setNombre(nombre);
      setDni(dni);
      setPlaceholderColor("black");
      setPlaceholderColorEditable("black");

    };
  
    //MANEJADOR DEL QR Y CAMARA
    const handleOpenQR = () => {
      setScanned(false);
      setOpenQR(true);
    }

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

    //CARGA CAMPOS SEGUN SELECCION RADIO BUTTON
    useFocusEffect(
      useCallback(() => {
        console.log(checked);
        if(checked=='Anonimo'){
          setValue("clientType",'Anónimo');
          setValue("clientStatus",'Accepted');
        }
        if(checked=='Registrado'){
          setValue("clientType",'Registrado');
          setValue("clientStatus",'Pending');
        }
    }, [checked]))

    //SUBMIT DEL FORM
    const onSubmit = async () => {
      const values=getValues();
      let error=false;

      console.log(values);

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
      if(values.password!==values.confirmPassword){
        Toast.showWithGravity(
          "Las contraseñas no coinciden",
          Toast.LONG, 
          Toast.CENTER);
        return;
      }
      if(values.password.length<6){
        Toast.showWithGravity(
          "La contraseña debe tener al menos 6 caracteres",
          Toast.LONG,
          Toast.CENTER);
        return;
      }
      if(values.dni.length!==8){
        Toast.showWithGravity(
          "El DNI debe tener 8 caracteres",
          Toast.LONG,
          Toast.CENTER);
        return;
      }      
      if(!values.email.includes("@")){
        Toast.showWithGravity(
          "El correo electrónico no es válido",
          Toast.LONG,
          Toast.CENTER);
        return;
      }
      if(!values.email.includes(".")){
        Toast.showWithGravity(
          "El correo electrónico no es válido",
          Toast.LONG,
          Toast.CENTER);
        return;
      }
      
      setLoading(true)
      toggleSpinnerAlert();
      try {
        console.log(auth.currentUser?.email);
        //CREACION DE USUARIO
        await createUserWithEmailAndPassword(auth,values.email,values.password);
        console.log(auth.currentUser?.email);

        //DESLOGUEO DEL USUARIO CREADO Y REESTABLECIMIENTO DEL USUARIO ORIGINAL
        await auth.signOut();
        if(originalUser){
          await auth.updateCurrentUser(originalUser);
        }

        //UPLOAD IMAGEN
        const blob:any = await getBlob(image);
        const fileName = image.substring(image.lastIndexOf("/") + 1);
        const fileRef = ref(storage, "userInfo/" + fileName);
        await uploadBytes(fileRef, blob);
        //UPLOAD DATA
        await addDoc(collection(db, "userInfo"), {
          lastName:values.apellido,
          name:values.nombre,
          dni:values.dni,
          email:values.email,
          rol:values.rol,
          clientType:values.clientType,
          clientStatus:values.clientStatus,
          rejectedReason:values.rejectedReason,
          image:fileRef.fullPath,
          creationDate:new Date()          
        });
        Toast.showWithGravity(
          "Usuario creado exitosamente",
          Toast.LONG, 
          Toast.CENTER);
        reset();
        setImage("");
        sendPushNotification( {title:"NUEVO CLIENTE REGISTRADO", description: "Hay un nuevo cliente esperando ser aprobado"} );
        //VUELTA AL CONTROL PANEL O AL LOGIN
        handleReturn();
      } catch (error:any) {
        Toast.showWithGravity(
          error.code,
          Toast.LONG, 
          Toast.CENTER);
      }finally{
        setLoading(false);
        resetForm();  
        console.log(auth.currentUser?.email);
      }
      
    }

    //RESET DEL FORM
    const resetForm = () => {
      setPlaceholderColor("white");
      setPlaceholderColorEditable("white");
      setApellido("Apellido");
      setNombre("Nombre");
      setDni("DNI");
      setEmail('Correo Electrónico');
      setPassword('Contraseña');
      setConfirmPassword('Confirmar Contraseña');
      setValue("dni",'');
      setValue("nombre",'');
      setValue("apellido",'');
      setValue("email",'');
      setValue("password",'');
      setValue("confirmPassword",'');
      setValue("rol",'');
      setValue("clientType",'');
      setValue("clientStatus",'');
      setValue("rejectedReason",'');
      setImage("");
    }

    //MANEJADORES RADIOBUTTONS

    const pressRegistrado =  () => {
      setChecked('Registrado');
      setPlaceholderColorEditable("white");
      setEditableField(true);
    }
    
    const pressAnonimo = () => {
      setChecked('Anonimo');      
      setApellido("Apellido");
      setDni("DNI");
      setValue("apellido",'-');
      setValue("dni",'-');
      setPlaceholderColorEditable("grey");
      setEditableField(false);      
    }

    //SPINNER
    const toggleSpinnerAlert = () => {
      setModalSpinnerVisible(true);
      setTimeout(() => {
        setModalSpinnerVisible(false);          
      }, 6000);
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
            <Text style={styles.headerText}>ALTA DE CLIENTE</Text>
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

              <TouchableOpacity onPress={handleOpenQR}>
                <Image 
                    style={styles.qrIcon} resizeMode="cover" source={qrIcon}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputField}>
                <TextInput
                  placeholder= {apellidoForm}
                  placeholderTextColor= {placeholderColorEditable}
                  style={styles.inputText}
                  onChangeText={(text) => setValue("apellido",text)}
                  //SE DESHABILITA EN CASO DE ANONIMO
                  editable={editableField}
                  selectTextOnFocus={editableField}
                />
              </View>

              <View style={styles.inputField}>
                <TextInput
                  placeholder={nombreForm}
                  placeholderTextColor= {placeholderColor}
                  style={styles.inputText}
                  onChangeText={(text) => setValue("nombre",text)}
                />
              </View>

              <View style={styles.inputField}>
                <TextInput
                  placeholder={dniForm}
                  placeholderTextColor= {placeholderColorEditable}
                  style={styles.inputText}
                  keyboardType={'numeric'}
                  onChangeText={(text) => setValue("dni",text)}
                  //SE DESHABILITA EN CASO DE ANONIMO
                  editable={editableField}
                  selectTextOnFocus={editableField}
                />
              </View>

              <View style={styles.inputField}>
                <TextInput
                  placeholder= {emailForm}
                  placeholderTextColor="white"
                  style={styles.inputText}
                  onChangeText={(text) => setValue("email",text)}
                />
              </View>

              <View style={styles.inputField}>
                <TextInput
                  placeholder= {passwordForm}
                  placeholderTextColor="white"
                  style={styles.inputText}
                  onChangeText={(text) => setValue("password",text)}
                  secureTextEntry = {true}
                />
              </View>

              <View style={styles.inputField}>
                <TextInput
                  placeholder= {confirmPasswordForm}
                  placeholderTextColor="white"
                  style={styles.inputText}
                  onChangeText={(text) => setValue("confirmPassword",text)}
                  secureTextEntry = {true}
                />
              </View>

              <View style={styles.inputField}>
                <Text style={styles.tagText}>TIPO DE CLIENTE</Text> 
              </View>

              <View style={styles.inputFieldRadioLayout}>
                <View style={styles.inputFieldRadio}>
                  <RadioButton
                    value="Registrado"
                    status={ checked === 'Registrado' ? 'checked' : 'unchecked' }
                    onPress={ pressRegistrado }
                  />
                  <Text style={styles.inputText}>REGISTRADO</Text>               
                </View>

                <View style={styles.inputFieldRadio}>
                  <RadioButton
                    value="Anonimo"
                    status={ checked === 'Anonimo' ? 'checked' : 'unchecked' }
                    onPress={ pressAnonimo }
                  />
                  <Text style={styles.inputText}>ANÓNIMO</Text>
                </View>
              </View>


              <View style={styles.submitContainer}>
                <TouchableOpacity onPress={onSubmit} style={styles.buttonLayout}>
                  <Text style={styles.buttonText}>CARGAR CLIENTE </Text>         
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
      </View> : <BarCodeScanner
                  onBarCodeScanned={scanned && openQR ? undefined : handleBarCodeScanned}
                  style={StyleSheet.absoluteFillObject} />
    );
};

export default ClientRegistration;