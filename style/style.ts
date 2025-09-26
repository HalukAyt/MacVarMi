// constants/styles.ts
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
    },
    button: {
        borderRadius: 20,
        backgroundColor: "#403e3eff",
        color: "#fff",
        width: 100,
        height: 75,
        justifyContent: "center",
        alignItems: "center"
    },

    text: {
        fontSize: 20,
        alignItems: "flex-start",
        color:"#fff",
        
        

    },
    textMacOlustur: {
        fontSize: 20,
        justifyContent:"flex-start",
    },

    textinput: {
        borderRadius: 20,
        borderColor: "#403e3eff",
        borderWidth: 1,        // eklemen lazım
        paddingHorizontal: 10, // yazı kutunun içine girmesin diye
        height: 70,            // yüksekliği de ayarla
        color: "#000",
        width: 400

    },

    macDetay:{
        backgroundColor:"#504747ff",
        width:380,
        borderRadius:10,
        padding:10,
        margin:30,
        alignSelf:"flex-start",
        justifyContent: "space-between",
        marginVertical: 10,
  paddingHorizontal: 20, 
   flexDirection: "row",
        
    },

    sahafoto:{
        width: 60,
  height: 60,
  borderRadius: 10,
        
        
    }
});

export default styles;