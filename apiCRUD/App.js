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
  Platform,
} from 'react-native';

export default function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // ID do usuário que está sendo editado
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  // Mensagem que aparece na tela
  const [mensagem, setMensagem] = useState('');

  // =========================
  // CADASTRAR
  // =========================
  const adicionarUsuario = () => {
    if (
      !nome.trim() ||
      !endereco.trim() ||
      !latitude.trim() ||
      !longitude.trim()
    ) {
      setMensagem(
        'Por favor, preencha nome, endereço, latitude e longitude.'
      );
      return;
    }

    const novoUsuario = {
      id: Date.now().toString(),
      name: nome.trim(),
      address: {
        street: endereco.trim(),
        suite: '',
        city: '',
      },
      latitude: latitude.trim(),
      longitude: longitude.trim(),
    };

    setUsuarios((usuariosAtuais) => [
      novoUsuario,
      ...usuariosAtuais,
    ]);

    limparFormulario();

    setMensagem('Usuário cadastrado com sucesso!');
  };

  // =========================
  // LIMPAR FORMULÁRIO
  // =========================
  const limparFormulario = () => {
    setNome('');
    setEndereco('');
    setLatitude('');
    setLongitude('');
    setUsuarioEditando(null);
  };

  // =========================
  // EXCLUIR
  // =========================
  const excluirUsuario = (id) => {
    const usuario = usuarios.find(
      (item) => item.id === id
    );

    if (!usuario) {
      return;
    }

    // EXPO WEB
    if (Platform.OS === 'web') {
      const confirmou = window.confirm(
        `Deseja realmente excluir o usuário "${usuario.name}"?`
      );

      if (confirmou) {
        setUsuarios((listaAtual) =>
          listaAtual.filter(
            (item) => item.id !== id
          )
        );

        setMensagem(
          'Usuário excluído com sucesso!'
        );
      }

      return;
    }

    // ANDROID / IOS
    Alert.alert(
      'Excluir usuário',
      `Deseja realmente excluir "${usuario.name}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setUsuarios((listaAtual) =>
              listaAtual.filter(
                (item) => item.id !== id
              )
            );

            setMensagem(
              'Usuário excluído com sucesso!'
            );
          },
        },
      ]
    );
  };

  // =========================
  // EDITAR
  // =========================
  const editarUsuario = (usuario) => {
    setUsuarioEditando(usuario.id);

    setNome(usuario.name);
    setEndereco(usuario.address.street);

    setLatitude(usuario.latitude || '');
    setLongitude(usuario.longitude || '');

    setMensagem(
      'Editando usuário. Altere os dados e clique em Atualizar.'
    );
  };

  // =========================
  // ATUALIZAR
  // =========================
  const atualizarUsuario = () => {
    if (
      !nome.trim() ||
      !endereco.trim() ||
      !latitude.trim() ||
      !longitude.trim()
    ) {
      setMensagem(
        'Por favor, preencha nome, endereço, latitude e longitude.'
      );
      return;
    }

    setUsuarios((listaAtual) =>
      listaAtual.map((usuario) => {
        if (usuario.id === usuarioEditando) {
          return {
            ...usuario,
            name: nome.trim(),
            address: {
              ...usuario.address,
              street: endereco.trim(),
            },
            latitude: latitude.trim(),
            longitude: longitude.trim(),
          };
        }

        return usuario;
      })
    );

    limparFormulario();

    setMensagem('Usuário atualizado com sucesso!');
  };

  // =========================
  // CANCELAR EDIÇÃO
  // =========================
  const cancelarEdicao = () => {
    limparFormulario();

    setMensagem('Edição cancelada.');
  };

  // =========================
  // MOSTRAR LOCALIZAÇÃO
  // =========================
  const mostrarLocalizacao = (usuario) => {
    const latitude =
      usuario.latitude || 'Não informada';

    const longitude =
      usuario.longitude || 'Não informada';

    const endereco =
      usuario.address?.street || 'Não informado';

    const mensagemLocalizacao =
      `Endereço: ${endereco}\n\n` +
      `Latitude: ${latitude}\n` +
      `Longitude: ${longitude}`;

    // EXPO WEB
    if (Platform.OS === 'web') {
      window.alert(
        `📍 Localização de ${usuario.name}\n\n${mensagemLocalizacao}`
      );

      return;
    }

    // ANDROID / IOS
    Alert.alert(
      `📍 Localização de ${usuario.name}`,
      mensagemLocalizacao,
      [
        {
          text: 'Fechar',
          style: 'cancel',
        },
      ]
    );
  };

  // =========================
  // BUSCAR USUÁRIOS
  // =========================
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((response) => response.json())
      .then((data) => {
        const usuariosComLocalizacao = data.map(
          (usuario) => ({
            ...usuario,
            latitude: '',
            longitude: '',
          })
        );

        setUsuarios(usuariosComLocalizacao);
        setCarregando(false);
      })
      .catch((error) => {
        console.error(
          'Erro ao buscar dados:',
          error
        );

        setCarregando(false);

        setMensagem(
          'Não foi possível carregar os usuários.'
        );
      });
  }, []);

  return (
    <View style={styles.container}>

      {/* TÍTULO */}
      <Text style={styles.titulo}>
        Sistema de Cadastro
      </Text>

      {/* NOME DA DUPLA */}
      <Text style={styles.dupla}>
        Thainá e Nicole - 3DS
      </Text>

      {/* FORMULÁRIO */}
      <View style={styles.form}>

        {/* NOME */}
        <TextInput
          style={styles.input}
          placeholder="Digite o Nome"
          value={nome}
          onChangeText={setNome}
        />

        {/* ENDEREÇO */}
        <TextInput
          style={styles.input}
          placeholder="Digite o Endereço"
          value={endereco}
          onChangeText={setEndereco}
        />

        {/* LATITUDE */}
        <TextInput
          style={styles.input}
          placeholder="Digite a Latitude"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
        />

        {/* LONGITUDE */}
        <TextInput
          style={styles.input}
          placeholder="Digite a Longitude"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
        />

        {/* MODO EDITAR */}
        {usuarioEditando !== null ? (
          <View>

            <TouchableOpacity
              style={styles.botaoAtualizar}
              onPress={atualizarUsuario}
            >
              <Text style={styles.textoBotao}>
                Atualizar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={cancelarEdicao}
            >
              <Text style={styles.textoBotao}>
                Cancelar
              </Text>
            </TouchableOpacity>

          </View>
        ) : (

          /* MODO CADASTRAR */
          <TouchableOpacity
            style={styles.botao}
            onPress={adicionarUsuario}
          >
            <Text style={styles.textoBotao}>
              Cadastrar
            </Text>
          </TouchableOpacity>

        )}

      </View>

      {/* MENSAGEM */}
      {mensagem !== '' && (
        <View style={styles.mensagem}>
          <Text style={styles.textoMensagem}>
            {mensagem}
          </Text>
        </View>
      )}

      {/* LISTA */}
      {carregando ? (

        <ActivityIndicator
          size="large"
          color="#0000ff"
        />

      ) : (

        <FlatList
          data={usuarios}

          keyExtractor={(item) =>
            item.id.toString()
          }

          renderItem={({ item }) => (

            <View style={styles.card}>

              {/* NOME */}
              <Text style={styles.nome}>
                {item.name}
              </Text>

              {/* ENDEREÇO */}
              <Text style={styles.endereco}>
                {item.address.street}

                {item.address.suite
                  ? `, ${item.address.suite}`
                  : ''}

                {item.address.city
                  ? ` - ${item.address.city}`
                  : ''}
              </Text>

              {/* COORDENADAS */}
              <Text style={styles.coordenadas}>
                Latitude:{' '}
                {item.latitude || 'Não informada'}
              </Text>

              <Text style={styles.coordenadas}>
                Longitude:{' '}
                {item.longitude || 'Não informada'}
              </Text>

              {/* BOTÕES */}
              <View style={styles.botoes}>

                {/* EDITAR */}
                <TouchableOpacity
                  style={styles.botaoEditar}
                  onPress={() =>
                    editarUsuario(item)
                  }
                >
                  <Text style={styles.textoBotao}>
                    Editar
                  </Text>
                </TouchableOpacity>

                {/* LOCALIZAÇÃO */}
                <TouchableOpacity
                  style={styles.botaoLocalizacao}
                  onPress={() =>
                    mostrarLocalizacao(item)
                  }
                >
                  <Text style={styles.textoBotao}>
                    Localização
                  </Text>
                </TouchableOpacity>

                {/* EXCLUIR */}
                <TouchableOpacity
                  style={styles.botaoExcluir}
                  onPress={() =>
                    excluirUsuario(item.id)
                  }
                >
                  <Text style={styles.textoBotao}>
                    Excluir
                  </Text>
                </TouchableOpacity>

              </View>

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
    backgroundColor: '#d2e2ff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },

  dupla: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  form: {
    backgroundColor: '#f7f8fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,

    elevation: 3,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 1,
    },

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
    backgroundColor: '#97acd3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },

  botaoAtualizar: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 8,
  },

  botaoCancelar: {
    backgroundColor: '#777',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },

  textoBotao: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  mensagem: {
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#28a745',
  },

  textoMensagem: {
    color: '#155724',
    fontWeight: 'bold',
    textAlign: 'center',
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

  coordenadas: {
    fontSize: 13,
    color: '#555',
    marginTop: 3,
  },

  botoes: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },

  botaoEditar: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },

  botaoLocalizacao: {
    backgroundColor: '#673AB7',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },

  botaoExcluir: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },

});
