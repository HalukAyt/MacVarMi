import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import style from "../style/style";





export default function Index() {
  return (
    <SafeAreaView style={style.container}>
    
      <Text style={style.textMacOlustur}>Maç Oluştur</Text>
    <View style={style.macDetay}>
      <Text style={style.text}>FerhatPaşa</Text>
      <Text style={style.text}>Halısaha 23.00</Text>
      <Image style={style.sahafoto} source={require("../assets/images/sahafoto.jpeg")}/>
      </View>
    <View style={style.container}>

      <SafeAreaView>
        <Image style={style.ortaresim} source={require("../assets/images/halısaha pixel.png")}/>
      </SafeAreaView>
      
      
       <FontAwesome name="download" size={30} color="#900" />



      <TextInput placeholder="yorum yaz" style={style.textinput}></TextInput>
      <TouchableOpacity style={style.button} >İstek At</TouchableOpacity>
    </View>
    </SafeAreaView>


  );
}
