import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useLayoutEffect, useEffect, useState, useCallback  } from "react";
import styles from "../adminRegistration/StyleAdminRegistrationScreen";
import { Image, ImageBackground, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { returnIcon, backgroundImage, cameraIcon, qrIcon,  } from "../adminRegistration/AssetsAdminRegistrationScreen";
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

type NewUser = {
  apellido:string;
  nombre:string;
  dni:string;
  cuil:string;
  email:string;
  password:string;
  confirmPassword:string
  rol:string;
}

const AdminRegistration = () => {

    //CONSTANTES
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [apellidoForm, setApellido] = useState("Apellido");
    const [nombreForm, setNombre] = useState("Nombre");
    const [dniForm, setDni] = useState("DNI");
    const [cuilForm, setCuil] = useState("CUIL");
    const [emailForm, setEmail] = useState("Correro Electrónico");
    const [passwordForm, setPassword] = useState("Contraseña");
    const [confirmPasswordForm, setConfirmPassword] = useState("Confirmar Contraseña");
    const [scanned, setScanned] = useState(false);
    const [openQR, setOpenQR] = useState(false);
    const {getValues, formState:{}, reset, setValue} = useForm<NewUser>();
    const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);
    const [placeholderColor, setPlaceholderColor] = useState("white");
    const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
    const [checked, setChecked] = React.useState('Dueño');
    //VARIABLE PARA GUARDAR EL USUARIO ORIGINAL
    let originalUser = auth.currentUser;

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
      if(values.cuil.length!==11){
      Toast.showWithGravity(
        "El CUIL debe tener 11 caracteres",
        Toast.LONG,
        Toast.CENTER);
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
        await auth.updateCurrentUser(originalUser);

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
          cuil:values.cuil,
          email:values.email,
          rol:checked,
          image:fileRef.fullPath,
          creationDate:new Date()          
        });        
        Toast.showWithGravity(
          "Usuario creado exitosamente",
          Toast.LONG, 
          Toast.CENTER);      
      reset();
      setImage("");
      //VUELTA AL CONTROL PANEL ( VER DE PONER EL QUE CORRESPONDE EN CADA CASO)
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
      setApellido("Apellido");
      setNombre("Nombre");
      setDni("DNI");
      setCuil("CUIL");
      setEmail('Correo Electrónico');
      setPassword('Contraseña');
      setConfirmPassword('Confirmar Contraseña');
      setValue("dni",'');
      setValue("nombre",'');
      setValue("apellido",'');
      setValue("email",'');
      setValue("password",'');
      setValue("confirmPassword",'');
      setValue("cuil",'');
      setValue("rol",'');
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
            <Text style={styles.headerText}>ALTA DE DUEÑO / SUPERVISOR</Text>
          ),
          headerTintColor: "transparent",
          headerBackButtonMenuEnabled: false,
          headerStyle: {
            backgroundColor: 'rgba(61, 69, 68, 0.4);',
          },         
        });
      }, []);

    //MANEJADORES RADIOBUTTONS
    const pressDueño = () => {
      setChecked('Dueño');
    }

    const pressSupervisor = () => {
      setChecked('Supervisor');
    }

    //CARGA CAMPOS SEGUN SELECCION RADIO BUTTON
    useFocusEffect(
      useCallback(() => {
        console.log(checked);
        if(checked=='Supervisor'){
          setValue("rol",checked);
        }
        if(checked=='Dueño'){
          setValue("rol",checked);
        }
    }, [checked]))

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
                  placeholderTextColor= {placeholderColor}
                  style={styles.inputText}
                  onChangeText={(text) => setValue("apellido",text)}
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
                  placeholderTextColor= {placeholderColor}
                  style={styles.inputText}
                  keyboardType={'numeric'}
                  onChangeText={(text) => setValue("dni",text)}
                />
              </View>

              <View style={styles.inputField}>
                <TextInput
                  placeholder={cuilForm}
                  placeholderTextColor="white"
                  style={styles.inputText}
                  keyboardType={'numeric'}
                  onChangeText={(text) => setValue("cuil",text)}
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
                <Text style={styles.tagText}>TIPO DE ALTA</Text> 
              </View>


              <View style={styles.inputFieldRadioLayout}>
                <View style={styles.inputFieldRadio}>
                  <RadioButton
                    value="Dueño"
                    status={ checked === 'Dueño' ? 'checked' : 'unchecked' }
                    onPress={ pressDueño }
                  />
                  <Text style={styles.inputText}>DUEÑO</Text>               
                </View>

                <View style={styles.inputFieldRadio}>
                  <RadioButton
                    value="Supervisor"
                    status={ checked === 'Supervisor' ? 'checked' : 'unchecked' }
                    onPress={ pressSupervisor }
                  />
                  <Text style={styles.inputText}>SUPERVISOR</Text>
                </View>
              </View>


              <View style={styles.submitContainer}>
                <TouchableOpacity onPress={onSubmit} style={styles.buttonLayout}>
                  <Text style={styles.buttonText}>CARGAR DUEÑO / SUPERVISOR</Text>         
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

export default AdminRegistration;