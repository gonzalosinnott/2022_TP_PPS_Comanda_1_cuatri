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
    cardStyle: {
        backgroundColor: '#DCDCE1',
        borderColor: '#DCDCE1',
        margin: 10,
        borderRadius: 10,
        borderWidth: 2,
    },
    imageIconContainer: {
        flexDirection: 'row', 
        alignContent: 'center', 
        justifyContent: 'center',
        alignItems: 'center',
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
        height: 100,
        width: 100,
        resizeMode: 'contain',
    },
    tableHeaderText: {
        color: '#3D4544',
        fontSize: 20,
        fontFamily: 'Oswald_500Medium',
    },
    tableCellText: {
    color: '#3D4544',
    fontSize: 15,
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
        width: '100%',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    modalIconContainer: {
        flexDirection: 'row', 
        alignContent: 'center', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 10
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
});
