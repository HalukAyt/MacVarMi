import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start", // yukarı hizalama
    alignItems: "center",         // yatayda ortalama
    backgroundColor: "#eff5d2",
    
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },

  button: {
    borderRadius: 20,
    backgroundColor: "#403e3eff",
    width: 100,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    color:"#fff"
  },

  text: {
    fontSize: 16,
    color: "#fff",
  },

  textMacOlustur: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
    alignSelf: "flex-start", // başlık sola
    paddingHorizontal: 20,
  },

  textinput: {
    borderRadius: 20,
    borderColor: "#403e3eff",
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 50,
    color: "#000",
    width: 300,
    marginTop: 20,
    backgroundColor:"#fff"
  },

  macDetay: {
    backgroundColor: "#A8BBA3",
    width: "90%",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    flexDirection: "row",          // yan yana
    justifyContent: "space-between", // yazılar solda, resim sağda
    alignItems: "center",     // dikeyde hizalı
    
  },

  macDetayText: {
    flexDirection: "column",       // yazıları dikey tut
  },

  sahafoto: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },

  ortaresim: {
    height: 400,
    width: 400,
    borderRadius: 10,
    borderColor: "#000",
    borderWidth: 2,
  },
});

export default styles;
