import React, { useEffect, useState } from "react";
import { ImageBackground, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "../splashScreen/StyleSplashScreen";


const SplashScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    


    setTimeout(() => {
        navigation.replace("Login");
    }, 2800);

    return (
        <View style={{ flex: 1, backgroundColor: "#3D4544" }}>
            <ImageBackground
                source={require("../../assets/splash.gif")}
                resizeMode="cover"
                style={styles.image}
            ></ImageBackground>
        </View>
    );
};

export default SplashScreen;
