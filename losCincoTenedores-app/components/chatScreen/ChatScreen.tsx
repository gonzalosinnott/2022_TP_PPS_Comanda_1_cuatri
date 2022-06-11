import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "./StyleChatScreen";
import { Image, ImageBackground, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { returnIcon, backgroundImage, cancelIcon, sendIcon } from "./AssetsChatScreen";
import Modal from "react-native-modal";
import React, { useCallback, useLayoutEffect, useState } from 'react'
import RotatingLogo from "../rotatingLogo/RotatingLogo";
import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { auth, db } from "../../App";
import { GiftedChat, Send } from 'react-native-gifted-chat';
import { splitUserFromEmail } from "../../utils/utils";


const ChatScreen = () => {

  //CONSTANTES
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isModalSpinnerVisible, setModalSpinnerVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const user = auth?.currentUser?.email || '';


  useLayoutEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, "chat"), orderBy("createdAt", "desc")), (snapshot =>
        setMessages(snapshot.docs.map(doc => ({
            _id: doc.data()._id,
            text: doc.data().text,
            createdAt: doc.data().createdAt.toDate(),
            user: doc.data().user
        })))
    ))
    return unsubscribe;
  }, [])

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages =>
        GiftedChat.append(previousMessages, messages))
    const {
        _id,
        createdAt,
        text,
        user } = messages[0]
    addDoc(collection(db, "chat"), {
        _id,
        createdAt,
        text,
        user
    });
  }, []);

  //RETURN
  const handleReturn = () => {
    if(auth.currentUser?.email == "cincotenedoresmozo@gmail.com"){
      navigation.replace("ControlPanelMozo")
    }else{
      navigation.replace("TableControlPanel")
    }  }

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
          <Text style={styles.headerText}>CONSULTAS</Text>
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
      
      <View style={styles.body}>
        <GiftedChat  
          messagesContainerStyle={{ backgroundColor: 'rgba(220, 220, 225, 0.5)', borderColor: 'rgba(220, 220, 225, 0.5)', shadowColor: 'rgba(220, 220, 225, 0.5)' }}
          optionTintColor='rgba(220, 220, 225, 0.5)'
          messages={messages}
          onSend={messages => onSend(messages)}
          renderUsernameOnMessage={true}
          renderAvatarOnTop={true}
          alwaysShowSend = {true}
          user={{
              _id: auth?.currentUser?.email || 1,
              name: splitUserFromEmail(user) || '',
          }}
          textInputProps={{                      
              borderColor: '#222', 
              placeholder:"Mensaje...",                    
              
          }}
          renderSend={props => (
              <Send {...props} >
                <View style={{marginRight: 10, marginBottom: 5}}>
                      <Image style = {{height:35, width:35}} source={sendIcon} resizeMode={'center'}/>
                  </View>
          </Send> )}
        />   
      </View> 

      </ImageBackground>           
    </View> 
  );
};

export default ChatScreen;