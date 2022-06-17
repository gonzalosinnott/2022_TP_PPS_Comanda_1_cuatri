import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "./StyleAdminSurveyScreen";
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
} from "./AssetsAdminSurveyScreen";
import Modal from "react-native-modal";
import React, { useCallback, useLayoutEffect, useState } from "react";
import RotatingLogo from "../../rotatingLogo/RotatingLogo";
import { useForm } from "react-hook-form";
import Toast from "react-native-simple-toast";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../../../App";

//IMPORTS DEL FORM
import Slider from "@react-native-community/slider";
import { RadioButton } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import Checkbox from "expo-checkbox";


type NewSurvey = {
  workSatisfaction: number;
  workEnviroment: string;
  placeCondition: any;
  yesWorkAssets: boolean;
  noWorkAssets: boolean;
  yesPlaceConditions: boolean;
  noPlaceConditions: boolean;
  yesStock: boolean;
  noStock: boolean;
  personalComments: string;
};

const NewAdminSurvey = () => {
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
  const [yesWorkAssets, setyesWorkAssets] = useState(false);
  const [noWorkAssets, setnoWorkAssets] = useState(false);
  const [yesPlaceConditions, setyesPlaceConditions] = useState(false);
  const [noPlaceConditions, setnoPlaceConditions] = useState(false);
  const [yesStock, setyesStock] = useState(false);
  const [noStock, setnoStock] = useState(false);

  //RETURN
  const handleReturn = () => {
    navigation.replace("AdminSurveyManagment");   
  };

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
      await addDoc(collection(db, "adminSurvey"), {
        //COMPLETAR DATOS DEL FORM
        workSatisfaction: Math.round(values.workSatisfaction * 100),
        workEnviroment: values.workEnviroment,
        placeCondition: values.placeCondition,
        yesWorkAssets: values.yesWorkAssets,
        noWorkAssets: values.noWorkAssets,
        yesPlaceConditions: values.yesPlaceConditions,
        noPlaceConditions: values.noPlaceConditions,
        yesStock: values.yesStock,
        noStock: values.noStock,
        personalComments: values.personalComments,
        creationDate: new Date(),
      });
      Toast.showWithGravity(
        "ENCUESTA CARGADA EXITOSAMENTE",
        Toast.LONG,
        Toast.CENTER
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
    setValue("workSatisfaction", value);
  };

  //RADIO BUTTONS
  const [workEnviroment, setworkEnviroment] = React.useState("Bueno");

  const pressAgradable = () => {
    setworkEnviroment("Bueno");
  };

  const pressRegular = () => {
    setworkEnviroment("Regular");
  };

  const pressMalo = () => {
    setworkEnviroment("Malo");
  };

  useFocusEffect(
    useCallback(() => {
      if (workEnviroment == "Bueno") {
        setValue("workEnviroment", workEnviroment);
      }
      if (workEnviroment == "Regular") {
        setValue("workEnviroment", workEnviroment);
      }
      if (workEnviroment == "Malo") {
        setValue("workEnviroment", workEnviroment);
      }
    }, [workEnviroment])
  );

  //SELECT
  const [placeCondition, setplaceCondition] = useState("Buena");

  const handlePickerChange = (value, index) => {
    console.log(value, index);
    setplaceCondition(value);
    setValue("placeCondition", value);
  };

  //CHECKBOX

  useFocusEffect(
    useCallback(() => {
      setValue("yesWorkAssets", yesWorkAssets);
    }, [yesWorkAssets])
  );

  useFocusEffect(
    useCallback(() => {
      setValue("noWorkAssets", noWorkAssets);
    }, [noWorkAssets])
  );

  useFocusEffect(
    useCallback(() => {
      setValue("yesPlaceConditions", yesPlaceConditions);
    }, [yesPlaceConditions])
  );

  useFocusEffect(
    useCallback(() => {
      setValue("noPlaceConditions", noPlaceConditions);
    }, [noPlaceConditions])
  );

  useFocusEffect(
    useCallback(() => {
      setValue("yesStock", yesStock);
    }, [yesStock])
  );

  useFocusEffect(
    useCallback(() => {
      setValue("noStock", noStock);
    }, [noStock])
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
        <Text style={styles.headerText}>ENCUESTA DE EVALUACIÓN</Text>
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
                  PRESENTISMO (0-100) {Math.round(sliderState * 100)}%
                </Text>
                <Slider
                  step={0.1}
                  style={styles.inputText}
                  onValueChange={(value) => handleSliderChange(value)}
                />
              </View>

              <View style={styles.buttonLayout}>
                <Text style={styles.inputText}>ACTITUD CON LOS PARES</Text>
              </View>

                <View style={styles.inputFieldRadio}>
                  <RadioButton
                    value="Bueno"
                    status={workEnviroment === "Bueno" ? "checked" : "unchecked"}
                    onPress={pressAgradable}
                  />
                  <Text style={styles.inputText}>BUENA    </Text>
                </View>

                <View style={styles.inputFieldRadio}>
                  <RadioButton
                    value="Regular"
                    status={workEnviroment === "Regular" ? "checked" : "unchecked"}
                    onPress={pressRegular}
                  />
                  <Text style={styles.inputText}>REGULAR    </Text>
                </View>

                <View style={styles.inputFieldRadio}>
                  <RadioButton
                    value="Malo"
                    status={workEnviroment === "Malo" ? "checked" : "unchecked"}
                    onPress={pressMalo}
                  />
                  <Text style={styles.inputText}>MALO    </Text>
                </View>

              <View style={styles.buttonLayout}>
                <Text style={styles.inputText}>
                  PREDISPOSICIÓN
                </Text>
              </View>

              <View style={styles.pickerButtonLayout}>
                <Picker
                  style={styles.defaultPicker}
                  selectedValue={placeCondition}
                  onValueChange={(itemValue, itemIndex) =>
                    handlePickerChange(itemValue, itemIndex)
                  }
                  mode="dropdown"
                >
                  <Picker.Item
                    style={styles.inputText}
                    label="Buena"
                    value="Buena"
                  />
                  <Picker.Item
                    style={styles.inputText}
                    label="Regular"
                    value="Regular"
                  />
                  <Picker.Item
                    style={styles.inputText}
                    label="Mala"
                    value="Mala"
                  />
                </Picker>
              </View>

              <View style={styles.buttonLayout}>
                <Text style={styles.inputCheckBoxTitleText}>
                  ELIJA LAS OPCIONES QUE MEJOR
                </Text>
                <Text style={styles.inputCheckBoxTitleText}>
                  REPRENSENTEN AL EMPLEADO
                </Text>
              </View>

                <View style={styles.buttonCheckBoxLayout}>
                  <View style={styles.inputFieldCheckBoxRowContainer}>
                    <Checkbox
                      style={styles.checkbox}
                      value={yesWorkAssets}
                      onValueChange={setyesWorkAssets}
                    />
                    <Text style={styles.inputTextCheckBox}>FALTA MUCHO</Text>
                  </View>
                </View>
                <View style={styles.buttonCheckBoxLayout}>
                  <View style={styles.inputFieldCheckBoxRowContainer}>
                    <Checkbox
                      style={styles.checkbox}
                      value={noWorkAssets}
                      onValueChange={setnoWorkAssets}
                    />
                    <Text style={styles.inputTextCheckBox}>FALTA POCO</Text>
                  </View>
                </View>

                <View style={styles.buttonCheckBoxLayout}>
                  <View style={styles.inputFieldCheckBoxRowContainer}>
                    <Checkbox
                      style={styles.checkbox}
                      value={yesPlaceConditions}
                      onValueChange={setyesPlaceConditions}
                    />
                      <Text style={styles.inputTextCheckBox}>ES AMABLE CON SUS PARES</Text>
                  </View>
                </View>
                <View style={styles.buttonCheckBoxLayout}>
                  <View style={styles.inputFieldCheckBoxRowContainer}>
                    <Checkbox
                      style={styles.checkbox}
                      value={noPlaceConditions}
                      onValueChange={setnoPlaceConditions}
                    />
                      <Text style={styles.inputTextCheckBox}>NO ES AMABLE CON SUS PARES</Text>
                  </View>
                </View>

                <View style={styles.buttonCheckBoxLayout}>
                  <View style={styles.inputFieldCheckBoxRowContainer}>
                    <Checkbox
                      style={styles.checkbox}
                      value={yesStock}
                      onValueChange={setyesStock}
                    />
                      <Text style={styles.inputTextCheckBox}>CUMPLE CON LAS TAREAS ASIGNADAS</Text>
                  </View>
                </View>
                <View style={styles.buttonCheckBoxLayout}>
                  <View style={styles.inputFieldCheckBoxRowContainer}>
                    <Checkbox
                      style={styles.checkbox}
                      value={noStock}
                      onValueChange={setnoStock}
                    />
                      <Text style={styles.inputTextCheckBox}>NO CUMPLE CON LAS TAREAS ASIGNADAS</Text>
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

export default NewAdminSurvey;
