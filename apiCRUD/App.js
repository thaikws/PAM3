import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');

  const adicionarUsuario = () => {
    // Validação dos campos
    if (!nome.trim() || !endereco.trim()) {
      Alert.alert(
        'Atenção',
        'Por favor, preencha o nome e o endereço.'
      );
      return;
    }

    // Cria o novo usuário
    const novoUsuario = {
      id: Date.now().toString(),
      name: nome.trim(),
      address: {
        street: endereco.trim(),
        suite: '',
        city: '',
      },
    };

    // Adiciona o usuário no início da lista
    setUsuarios((usuariosAtuais) => [
      novoUsuario,
      ...usuariosAtuais,
    ]);

    // Limpa os campos
    setNome('');
    setEndereco('');
  };

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((response) => response.json())
      .then((data) => {
        setUsuarios(data);
        setCarregando(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar dados:', error);
        setCarregando(false);
        Alert.alert(
          'Erro',
          'Não foi possível carregar os usuários.'
        );
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Sistema de Cadastro
      </Text>

      {/* Formulário de Cadastro */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Digite o Nome"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Digite o Endereço"
          value={endereco}
          onChangeText={setEndereco}
        />

        <TouchableOpacity
          style={styles.botao}
          onPress={adicionarUsuario}
        >
          <Text style={styles.textoBotao}>
            Cadastrar
          </Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
        />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nome}>
                {item.name}
              </Text>

              <Text style={styles.endereco}>
                {item.address.street}
                {item.address.suite
                  ? `, ${item.address.suite}`
                  : ''}
                {item.address.city
                  ? ` - ${item.address.city}`
                  : ''}
              </Text>
            </View>
          )}
          style={styles.lista}
        />
      )}

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d2e900',
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  form: {
  backgroundColor: '#ffffff',
  padding: 15,
  borderRadius: 8,
  marginBottom: 20,
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,
},
input: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 6,
  padding: 10,
  marginBottom: 10,
  backgroundColor: '#f9f9f9',
},
botao: {
  backgroundColor: '#333333',
  padding: 12,
  borderRadius: 6,
  alignItems: 'center',
},
textoBotao: {
  color: '#ffffff',
  fontWeight: 'bold',
  fontSize: 16,
},
  lista: {
    width: '100%',
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },

  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  endereco: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});