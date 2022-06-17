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
        marginTop: 20,
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
    cardStyle: {
        backgroundColor: '#DCDCE1',
        borderColor: '#DCDCE1',
        margin: 10,
        borderRadius: 10,
        borderWidth: 2,
        width: win.width * 0.9,
        padding: 10,
    },
    infoContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignContent: 'center',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 5
    },
    cardImage: {
        flex: 1, 
        borderRadius: 10,
        height:120, 
        width:120,
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
        fontSize: 14,
        fontFamily: 'Oswald_500Medium',
    },
    tableCellText: {
        color: 'black',
        fontSize: 25,
        fontFamily: 'Oswald_500Medium',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    modalBody: {
        backgroundColor: '#DCDCE1',
        borderColor: '#DCDCE1',
        borderWidth: 2,
        padding: 15,
        borderRadius: 25,
    },
    modalIconContainer: {
        backgroundColor: '#DCDCE1',
        borderColor: '#DCDCE1',
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
