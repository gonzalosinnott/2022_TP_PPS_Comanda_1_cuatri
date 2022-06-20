import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "./StyleOldEmployeeSurveyScreen";
import { Image, ImageBackground, Text, TouchableOpacity, View, ScrollView, Dimensions } from "react-native";
import { returnIcon, backgroundImage, cancelIcon } from "./AssetsOldEmployeeSurveyScreen";
import Modal from "react-native-modal";
import React, { useCallback, useLayoutEffect, useState } from 'react'
import RotatingLogo from "../../rotatingLogo/RotatingLogo";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../../App";
import { Badge } from "react-native-paper";


const OldEmployeeSurvey = () => {

  //CONSTANTES
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [data, setData] = useState<any>([]);
  const [clean, setClean] = useState(0);
  const [dirty, setDirty] = useState(0);
  const [happy, setHappy] = useState(0);
  const [sad, setSad] = useState(0);
  const [quickDelivery, setQuickDelivery] = useState(0);
  const [slowDelivery, setSlowDelivery] = useState(0);
  const [averageWaiterEvaluation, setAverageWaiterEvaluation] = useState(0);
  const [foodQualityBuena, setFoodQualityBuena] = useState(0);
  const [foodQualityMala, setFoodQualityMala] = useState(0);
  const [foodQualityRegular, setFoodQualityRegular] = useState(0);
  const [paymentMethodEfectivo, setPaymentMethodEfectivo] = useState(0);
  const [paymentMethodDebito, setPaymentMethodDebito] = useState(0);
  const [paymentMethodCredito, setPaymentMethodCredito] = useState(0);
  const win = Dimensions.get("window");

  //CONFIG DE GRAFICOS

  const fill = 'rgb(134, 65, 244)'
  const barData = [paymentMethodEfectivo, paymentMethodDebito, paymentMethodCredito]
  

  const paymentMethodsBarChartData = {
    labels: ["Agradable", "Regular", "Malo"],
    datasets: [
      {
        data: [paymentMethodEfectivo, paymentMethodDebito, paymentMethodCredito]
      }
    ]    
  };

  const foodQualityPieChartData = [
    {
      name: "Limpio",
      amount: foodQualityBuena,
      color: "green",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "Normal",
      amount: foodQualityRegular,
      color: "yellow",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "Sucio",
      amount: foodQualityMala,
      color: "red",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
  ]

  const clientsOpinionsProggressRingData = [
    {
      name: "Elementos necesarios de trabajo",
      amount: clean,
      color: "green",
      legendFontColor: "#7F7F7F",
      legendFontSize: 13
    },
    {
      name: "Faltan elementos de trabajo",
      amount: dirty,
      color: "yellow",
      legendFontColor: "#7F7F7F",
      legendFontSize: 13
    },
    {
      name: "Lugar en condiciones",
      amount: quickDelivery,
      color: "red",
      legendFontColor: "#7F7F7F",
      legendFontSize: 13
    },
    {
      name: "El lugar no esta en condiciones",
      amount: slowDelivery,
      color: "blue",
      legendFontColor: "#7F7F7F",
      legendFontSize: 13
    },
    {
      name: "Hay materia prima",
      amount: happy,
      color: "brown",
      legendFontColor: "#7F7F7F",
      legendFontSize: 13
    },
    {
      name: "Falta materia prima",
      amount: sad,
      color: "orange",
      legendFontColor: "#7F7F7F",
      legendFontSize: 13
    }
  ]

  //RETURN
  const handleReturn = () => {
    if(auth.currentUser?.email === "cincotenedoresmetre@gmail.com")
    {
      navigation.replace("ControlPanelMetre");
    }
    if(auth.currentUser?.email === "cincotenedoresmozo@gmail.com")
    {
      navigation.replace("ControlPanelMozo");
    }
    if(auth.currentUser?.email === "cincotenedorescocina@gmail.com")
    {
      navigation.replace("ControlPanelCocina");
    }
    if(auth.currentUser?.email === "cincotenedoresbar@gmail.com")
    {
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
        getData();
        toggleSpinnerAlert();
  }, []))

  useFocusEffect(
    useCallback(() => {
        getGraphsData();
        toggleSpinnerAlert();
  }, [data]))

  //GET DATA USUARIOS
  const getData = async () => {
    setData([]);    
    try {
      const q = query(collection(db, "employeeSurvey"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        const res: any = { ...doc.data(), id: doc.id };
        setData((arr: any) => [...arr, { ...res, id: doc.id}]);
      });
    } catch (error) {
        console.log(error)                    
    }
  }

  //GET DATA GRAFICOS
  const getGraphsData = async () => {

    let countWaiterEvaulations = 0;
    let sumWaiterEvaluations = 0;

    data.map((item: any) => {
      if(item.yesWorkAssets == true)
        setClean(clean + item.yesWorkAssets);
      
      if(item.noWorkAssets == true)
        setDirty(dirty + item.noWorkAssets);
      
      if(item.yesPlaceConditions == true)
        setHappy(happy + item.yesPlaceConditions);

      if(item.noPlaceConditions == true)
        setSad(sad + item.noPlaceConditions);
      
      if(item.yesStock == true)
        setQuickDelivery(quickDelivery + item.yesStock);
      
      if(item.noStock == true)
        setSlowDelivery(slowDelivery + item.noStock);

      countWaiterEvaulations++;
      sumWaiterEvaluations += item.workSatisfaction;

      if(item.placeCondition == "Limpio"){
        setFoodQualityBuena(foodQualityBuena + 1);
      }
      if(item.placeCondition == "Normal"){
        setFoodQualityMala(foodQualityMala + 1);
      }
      if(item.placeCondition == "Sucio"){
        setFoodQualityRegular(foodQualityRegular + 1);
      }
      if(item.workEnviroment == "Agradable"){
        setPaymentMethodEfectivo(paymentMethodEfectivo + 1);
      }
      if(item.workEnviroment == "Regular"){
        setPaymentMethodDebito(paymentMethodDebito + 1);
      }
      if(item.workEnviroment == "Malo"){
        setPaymentMethodCredito(paymentMethodCredito + 1);
      }     
    })
    setAverageWaiterEvaluation(sumWaiterEvaluations / countWaiterEvaulations);
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
          <Text style={styles.headerText}>RESULTADOS DE ENCUESTAS</Text>
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
      <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.backgroundImage} imageStyle = {{opacity:0.5}}>
      <ScrollView>
      <View style={styles.body}>
        
        <View style={styles.buttonLayout}>
          <Text style={styles.inputText}>CONDICIONES EDILICIAS</Text>
        </View>

        <PieChart
          data={foodQualityPieChartData}
          width={win.width * 0.8}
          height={win.width / 2}
          chartConfig={styles.chartConfig}
          accessor={"amount"}
          backgroundColor={"#A4C3B2"}
          paddingLeft={"0"}
          center={[10, 0]}
          absolute
        />

        <View style={styles.buttonLayout}>
          <Text style={styles.inputText}>CLIMA LABORAL</Text>
        </View>

        <BarChart
          data={paymentMethodsBarChartData}
          yAxisLabel=""
          yAxisSuffix=""
          width={win.width * 0.8}
          height={win.width / 2}
          chartConfig={styles.chartConfig}
        />


        <View style={styles.buttonLayout}>
          <Text style={styles.inputText}>PROMEDIO SATISFACCION LABORAL</Text>
          <Text style={styles.inputText}>{Math.round(averageWaiterEvaluation)} %</Text>
        </View>

        <View style={styles.buttonLayout}>
        <Text style={styles.inputText}>OPINIONES VARIAS</Text>
        </View>

        <PieChart
          data={clientsOpinionsProggressRingData}
          width={win.width * 0.9}
          height={win.width / 2}
          chartConfig={styles.chartConfig}
          accessor={"amount"}
          backgroundColor={"#A4C3B2"}
          paddingLeft={"0"}
          center={[10, 0]}
          absolute
        />          
      </View> 
      </ScrollView>


      <View>
        <Modal backdropOpacity={0.5} animationIn="rotate" animationOut="rotate" isVisible={isModalSpinnerVisible}>
          <RotatingLogo></RotatingLogo>
        </Modal>
      </View>
      
      </ImageBackground>           
    </View> 
  );
};

export default OldEmployeeSurvey;