import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useEffect, useState } from 'react';

export default function App() {

  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((response) => response.json())
      .then((json) => {
        setUsuarios(json);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);


  function renderUsuario({ item }) {
    return (
      <View style={styles.usuario}>

        <Text style={styles.nome}>
          {item.name}
        </Text>

        <Text style={styles.texto}>
          {item.email}
        </Text>

        <Text style={styles.texto}>
          {item.address.city}
        </Text>

      </View>
    );
  }


  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>
        SISTEMA DE CADASTRO DE USUÁRIOS
      </Text>


      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUsuario}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
    paddingTop: 50,
    paddingHorizontal: 20,
  },


  titulo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 25,
    letterSpacing: 1,
  },


  lista: {
    paddingBottom: 30,
  },


  usuario: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    marginBottom: 15,
    borderRadius: 16,

    borderLeftWidth: 5,
    borderLeftColor: '#2563EB',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },


  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },


  texto: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },

});