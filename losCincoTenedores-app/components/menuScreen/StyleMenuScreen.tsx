import { Dimensions, StyleSheet } from 'react-native';

const win = Dimensions.get("window");

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
        width: '100%',
    },
    headerIcon: {
        height: 45,
        width: 45,
        resizeMode: 'contain',
        marginRight: 10,
    },
    headerText: {
        color: 'white',
        fontSize: 25,
        fontFamily: 'Oswald_500Medium',
        textAlign: 'center',
        alignContent: 'center',
    },    
    cardStyle: {
        backgroundColor: '#DCDCE1',
        borderColor: '#DCDCE1',
        margin: 10,
        borderRadius: 10,
        borderWidth: 2,
        width: win.width * 0.9,
        justifyContent: 'space-between',
        alignContent: 'center',
        alignItems: 'center',
        height:410, 

    },
    imageContainer: {
        flexDirection: 'row', 
        alignContent: 'center', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5
    },
    infoContainer: {
        flexDirection: 'row', 
        marginBottom: 5,
        justifyContent: 'space-between',
        alignContent: 'center',
        alignItems: 'center',

    },
    cardImage: {
        flex: 1, 
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardIcon: {
        padding: 10,
        margin: 5,
        height: 50,
        width: 50,
        resizeMode: 'contain',
    },
    tableHeaderText: {
        color: '#3D4544',
        fontSize: 25,
        fontFamily: 'Oswald_500Medium',
    },
    tableCellText: {
        color: 'black',
        fontSize: 18,
        fontFamily: 'Oswald_500Medium',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    modalBody: {
        borderColor: 'white',
        backgroundColor: '#3D4544',
        borderWidth: 2,
        padding: 15,
        borderRadius: 25,
    },
    modalIconContainer: {
        flexDirection: 'row', 
        marginBottom: 5,
        justifyContent: 'space-between',
        alignContent: 'center',
        alignItems: 'center',
    },
    inputField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(220, 220, 225, 0.5);',
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
    buttonLayout: {
        backgroundColor: '#A4C3B2',
        borderColor: '#A4C3B2',
        marginTop: 20,
        margin: 5,
        width: "35%",
        height: 60,
        padding: 15,
        borderRadius: 30,
        borderWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
      buttonText: {
        color: 'black',
        fontSize: 15,
        fontFamily: 'Oswald_500Medium',
    },
});
