import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3D4544',
        justifyContent: 'space-around',
    },
    backgroundImage: {
        flex: 1,
        justifyContent: "center"
    },
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',    
    },
    headerIcon: {
        height: 45,
        width: 45,
        resizeMode: 'contain',
        marginRight: 10,
    },
    headerText: {
        color: 'white',
        fontSize: 15,
        fontFamily: 'Oswald_500Medium',
        textAlign: 'center',
        alignContent: 'center',
    },
    cameraQrContainer: {
        flexDirection: 'row', 
        alignContent: 'center', 
        justifyContent: 'center', 
        marginBottom: 5
    },
    cameraIcon: {
        height:120, 
        width:120, 
        borderRadius:20, 
        margin:10
    },
    cameraImage: {
        height:120, 
        width:120, 
        borderRadius:20, 
        margin:10
    },
    qrIcon: {
        height:120, 
        width:120, 
        borderRadius:20, 
        margin:10,
        backgroundColor: 'white',
    },
    inputContainer: {
        width: '80%',              
    },
    inputField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ' rgba(220, 220, 225, 0.5);',
        borderBottomColor: '#F7AD3B',
        borderBottomWidth: 0,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginTop: 5,
        borderRadius: 10,
    },
    inputText: {
        color: 'black',
        fontFamily: 'Oswald_300Light',
        fontSize: 16,
        width: '100%',
    },
    tagText: {
        color: 'white',
        fontFamily: 'Oswald_300Light',
        fontSize: 16,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    inputFieldRadioLayout: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputFieldRadio: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ' rgba(220, 220, 225, 0.5);',
        borderBottomColor: '#F7AD3B',
        width: '48%',
        borderBottomWidth: 0,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginTop: 5,
        borderRadius: 10,
    },
    submitContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonLayout: {
        backgroundColor: '#A4C3B2',
        borderColor: '#A4C3B2',
        marginTop: 20,
        margin: 5,
        width: "80%",
        height: 60,
        padding: 15,
        borderRadius: 30,
        borderWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
    }, 
    buttonText: {
        color: '#545454',
        fontSize: 16,
        fontFamily: 'Oswald_500Medium',
    },
});
