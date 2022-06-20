import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "./StyleClientSurveyScreen";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
} from "react-native";
import {
  returnIcon,
  backgroundImage,
  cancelIcon,
} from "./AssetsClientSurveyScreen";
import Modal from "react-native-modal";
import React, { useCallback, useLayoutEffect, useState } from "react";
import RotatingLogo from "../../rotatingLogo/RotatingLogo";
import { useForm } from "react-hook-form";
import Toast from "react-native-simple-toast";
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "../../../App";

//IMPORTS DEL FORM
import Slider from "@react-native-community/slider";
import { RadioButton } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import Checkbox from "expo-checkbox";


type NewSurvey = {
  waiterEvaluation: number;
  payMethod: string;
  foodQuality: any;
  clean: boolean;
  dirty: boolean;
  quickDelivery: boolean;
  slowDelivery: boolean;
  happy: boolean;
  sad: boolean;
  personalComments: string;
};

const NewClientSurvey = () => {
  //CONSTANTES
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const {
    getValues,
    formState: {},
    reset,
    setValue,
  } = useForm<NewSurvey>();
  const [loading, setLoading] = useState(false);
  const [clean, setClean] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [quickDelivery, setQuickDelivery] = useState(false);
  const [slowDelivery, setSlowDelivery] = useState(false);
  const [happy, setHappy] = useState(false);
  const [sad, setSad] = useState(false);
  const [clientData, setClientData] = useState<any>([]);


  //RETURN
  const handleReturn = () => {
    navigation.replace("TableControlPanel");
  };

  useFocusEffect(
    useCallback(() => {
      checkClientStatus();
  }, []))

  const checkClientStatus = async () => {
    const q = query(collection(db, "tableInfo"), where("assignedClient", "==", auth.currentUser?.email), where("survey", "==", "no"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      const res: any = { ...doc.data(), id: doc.id };
      setClientData((arr: any) => [...arr, { ...res, id: doc.id}].sort((a, b) => a.name.localeCompare(b.name)));
    });

  }

  //TOOGLE SPINNER
  const toggleSpinnerAlert = () => {
    setModalSpinnerVisible(true);
    setTimeout(() => {
      setModalSpinnerVisible(false);
    }, 3000);
  };

  //SUBMIT DEL FORM
  const onSubmit = async () => {
    const values = getValues();
    console.log(values);
    let error = false;

    //VALIDACION CAMPOS
    Object.values(values).map((value) => {
      if (!value) {
        error = true;
        return;
      }
    });
    setLoading(true);
    toggleSpinnerAlert();
    try {
      //UPLOAD DATA
      await addDoc(collection(db, "clientSurvey"), {
        //COMPLETAR DATOS DEL FORM
        waiterEvaluation: Math.round(values.waiterEvaluation * 100),
        payMethod: values.payMethod,
        foodQuality: values.foodQuality,
        clean: values.clean,
        dirty: values.dirty,
        quickDelivery: values.quickDelivery,
        slowDelivery: values.slowDelivery,
        happy: values.happy,
        sad: values.sad,
        personalComments: values.personalComments,
        creationDate: new Date(),
      });
      Toast.showWithGravity(
        "ENCUESTA CARGADA EXITOSAMENTE",
        Toast.LONG,
        Toast.CENTER
      );
      clientData.map(
        async (item: { id: any; assignedClient: any }) => {
          if (item.assignedClient === auth.currentUser?.email) {
            const ref = doc(db, "tableInfo", item.id);
            const survey : any = "yes";
            await updateDoc(ref, { survey: survey });    
          }
        }
      );
      reset();
      handleReturn();
    } catch (error: any) {
      Toast.showWithGravity(error.code, Toast.LONG, Toast.CENTER);
    } finally {
      setLoading(false);
    }
  };

  //MANEJADORES DE INPUTS

  //SLIDER
  const [sliderState, setSliderState] = useState(0);

  const handleSliderChange = (value: number) => {
    setSliderState(value);
    setValue("waiterEvaluation", value);
  };

  //RADIO BUTTONS
  const [payMethod, setPayMethod] = React.useState("Efectivo");

  const pressEfectivo = () => {
    setPayMethod("Efectivo");
  };

  const pressDebito = () => {
    setPayMethod("Debito");
  };

  const pressCredito = () => {
    setPayMethod("Crédito");
  };

  useFocusEffect(
    useCallback(() => {
      if (payMethod == "Efectivo") {
        setValue("payMethod", payMethod);
      }
      if (payMethod == "Debito") {
        setValue("payMethod", payMethod);
      }
      if (payMethod == "Crédito") {
        setValue("payMethod", payMethod);
      }
    }, [payMethod])
  );

  //SELECT
  const [foodQuality, setFoodQuality] = useState("Bueno");

  const handlePickerChange = (value, index) => {
    console.log(value, index);
    setFoodQuality(value);
    setValue("foodQuality", value);
  };

  //CHECKBOX

  useFocusEffect(
    useCallback(() => {
      setValue("clean", clean);
    }, [clean])
  );

  useFocusEffect(
    useCallback(() => {
      setValue("dirty", dirty);
    }, [dirty])
  );

  useFocusEffect(
    useCallback(() => {
      setValue("quickDelivery", quickDelivery);
    }, [quickDelivery])
  );

  useFocusEffect(
    useCallback(() => {
      setValue("slowDelivery", slowDelivery);
    }, [slowDelivery])
  );

  useFocusEffect(
    useCallback(() => {
      setValue("happy", happy);
    }, [happy])
  );

  useFocusEffect(
    useCallback(() => {
      setValue("sad", sad);
    }, [sad])
  );

  //HEADER
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleReturn}>
          <Image source={returnIcon} style={styles.headerIcon} />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <Text style={styles.headerText}>ENCUESTA DE SATISFACCION</Text>
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
        {loading}
          <View style={styles.body}>
          <ScrollView>

            <View style={styles.inputContainer}>
              <View style={styles.sliderButtonLayout}>
                <Text style={styles.inputText}>
                  ATENCION DE LOS MOZOS (0-100) {Math.round(sliderState * 100)}%
                </Text>
                <Slider
                  step={0.1}
                  style={styles.inputText}
                  onValueChange={(value) => handleSliderChange(value)}
                />
              </View>

              <View style={styles.buttonLayout}>
                <Text style={styles.inputText}>METODO DE PAGO PREFERIDO</Text>
              </View>

                <View style={styles.inputFieldRadio}>
                  <RadioButton
                    value="Efectivo"
                    status={payMethod === "Efectivo" ? "checked" : "unchecked"}
                    onPress={pressEfectivo}
                  />
                  <Text style={styles.inputText}>EFECTIVO    </Text>
                </View>

                <View style={styles.inputFieldRadio}>
                  <RadioButton
                    value="Debito"
                    status={payMethod === "Debito" ? "checked" : "unchecked"}
                    onPress={pressDebito}
                  />
                  <Text style={styles.inputText}>DEBITO    </Text>
                </View>

                <View style={styles.inputFieldRadio}>
                  <RadioButton
                    value="Crédito"
                    status={payMethod === "Crédito" ? "checked" : "unchecked"}
                    onPress={pressCredito}
                  />
                  <Text style={styles.inputText}>CRÉDITO    </Text>
                </View>

              <View style={styles.buttonLayout}>
                <Text style={styles.inputText}>
                  PRESENTACION / CALIDAD DE LA COMIDA
                </Text>
              </View>

              <View style={styles.pickerButtonLayout}>
                <Picker
                  style={styles.defaultPicker}
                  selectedValue={foodQuality}
                  onValueChange={(itemValue, itemIndex) =>
                    handlePickerChange(itemValue, itemIndex)
                  }
                  mode="dropdown"
                >
                  <Picker.Item
                    style={styles.inputText}
                    label="Buena"
                    value="buena"
                  />
                  <Picker.Item
                    style={styles.inputText}
                    label="Regular"
                    value="regular"
                  />
                  <Picker.Item
                    style={styles.inputText}
                    label="Mala"
                    value="mala"
                  />
                </Picker>
              </View>

              <View style={styles.buttonLayout}>
                <Text style={styles.inputCheckBoxTitleText}>
                  ELIJA LAS OPCIONES QUE
                </Text>
                <Text style={styles.inputCheckBoxTitleText}>
                  MEJOR REPRESENTEN SU ESTADIA
                </Text>
              </View>

                <View style={styles.buttonCheckBoxLayout}>
                  <View style={styles.inputFieldCheckBoxRowContainer}>
                    <Checkbox
                      style={styles.checkbox}
                      value={clean}
                      onValueChange={setClean}
                    />
                    <Text style={styles.inputTextCheckBox}>LUGAR LIMPIO</Text>
                  </View>
                </View>
                <View style={styles.buttonCheckBoxLayout}>
                  <View style={styles.inputFieldCheckBoxRowContainer}>
                    <Checkbox
                      style={styles.checkbox}
                      value={dirty}
                      onValueChange={setDirty}
                    />
                    <Text style={styles.inputTextCheckBox}>LUGAR SUCIO</Text>
                  </View>
                </View>

                <View style={styles.buttonCheckBoxLayout}>
                  <View style={styles.inputFieldCheckBoxRowContainer}>
                    <Checkbox
                      style={styles.checkbox}
                      value={quickDelivery}
                      onValueChange={setQuickDelivery}
                    />
                      <Text style={styles.inputTextCheckBox}>LA ATENCION FUE RAPIDA</Text>
                  </View>
                </View>
                <View style={styles.buttonCheckBoxLayout}>
                  <View style={styles.inputFieldCheckBoxRowContainer}>
                    <Checkbox
                      style={styles.checkbox}
                      value={slowDelivery}
                      onValueChange={setSlowDelivery}
                    />
                      <Text style={styles.inputTextCheckBox}>LA ATENCION FUE LENTA</Text>
                  </View>
                </View>

                <View style={styles.buttonCheckBoxLayout}>
                  <View style={styles.inputFieldCheckBoxRowContainer}>
                    <Checkbox
                      style={styles.checkbox}
                      value={happy}
                      onValueChange={setHappy}
                    />
                      <Text style={styles.inputTextCheckBox}>LA EXPERIENCA FUE AGRADABLE</Text>
                  </View>
                </View>
                <View style={styles.buttonCheckBoxLayout}>
                  <View style={styles.inputFieldCheckBoxRowContainer}>
                    <Checkbox
                      style={styles.checkbox}
                      value={sad}
                      onValueChange={setSad}
                    />
                      <Text style={styles.inputTextCheckBox}>LA EXPERIENCIA FUE MALA</Text>
                  </View>
                </View>

              <View style={styles.inputField}>
                <TextInput
                  placeholder={"INGRESE SU OPINION PERSONAL"}
                  placeholderTextColor="white"
                  style={styles.inputText}
                  onChangeText={(text) => setValue("personalComments", text)}
                />
              </View>

              <View style={styles.submitContainer}>
                <TouchableOpacity onPress={onSubmit} style={styles.submitButtonLayout}>
                  <Text style={styles.buttonText}>CARGAR ENCUESTA</Text>
                </TouchableOpacity>
              </View>
            </View>
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

    </View>
  );
};

export default NewClientSurvey;
